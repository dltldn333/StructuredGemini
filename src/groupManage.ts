import { StructGroup } from "./type";
import { organizeChats } from "./organize";

export const addGroup = () => {
  const titleSection = document.querySelector<HTMLElement>(
    "conversations-list .title-container",
  );
  if (!titleSection || document.getElementById("group-add-btn")) return;

  titleSection.style.display = "flex";
  titleSection.style.justifyContent = "space-between";
  titleSection.style.position = "relative";

  const groupBtn = document.createElement("button");
  groupBtn.id = "group-add-btn";
  groupBtn.innerText = "add group +";
  groupBtn.style.cssText =
    "margin-left:10px; padding:6px 12px; border:1px solid #444; border-radius:6px; color:#e3e3e3; cursor:pointer; background:transparent; font-size:11px; font-weight:500;";

  groupBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    makeGroupPopup();
  };

  titleSection.appendChild(groupBtn);
};

export const makeGroupPopup = async (editingGroupId?: string) => {
  const existing = document.getElementById("group-management-popup");
  if (existing) existing.remove();

  const result = await chrome.storage.local.get(["groups", "chatMapping"]);
  const groups = (result.groups as StructGroup[]) || [];
  const chatMapping = (result.chatMapping as Record<string, string>) || {};

  const editingGroup = editingGroupId
    ? groups.find((g) => g.id === editingGroupId)
    : null;

  const popup = document.createElement("div");
  popup.id = "group-management-popup";

  const renderList = () => {
    // 모든 채팅 링크를 가져옴 (현재 화면에 로드된 것들)
    const chatLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="/app/"]'),
    );
    const listContainer = popup.querySelector(".struct-chat-list");
    if (!listContainer) return;

    if (chatLinks.length === 0) {
      listContainer.innerHTML =
        '<div style="padding:20px; text-align:center; color:#80868b; font-size:13px;">No chats found.</div>';
    } else {
      listContainer.innerHTML = chatLinks
        .map((link, i) => {
          const href = link.getAttribute("href");
          const id = href?.split("/app/")[1] || `chat-${i}`;
          const text = link.textContent?.trim() || "Untitled Chat";

          const isChecked = chatMapping[id] === editingGroupId;
          const assignedGroupId = chatMapping[id];
          const assignedGroup = groups.find((g) => g.id === assignedGroupId);

          // 현재 편집 중인 그룹이 아닌 다른 그룹에 속해있는 경우 표시
          const statusText =
            assignedGroup && assignedGroupId !== editingGroupId
              ? `(in ${assignedGroup.name})`
              : "";

          return `
          <div class="struct-chat-item" data-id="${id}" style="display:flex; align-items:center; padding:10px 12px; border-bottom:1px solid #2a2b2e; cursor:pointer;">
            <input type="checkbox" class="chat-check" value="${id}" ${isChecked ? "checked" : ""} style="margin-right:12px;">
            <div style="flex:1; overflow:hidden;">
              <div style="font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${text}</div>
              ${statusText ? `<div style="font-size:10px; color:#8ab4f8;">${statusText}</div>` : ""}
            </div>
          </div>`;
        })
        .join("");

      listContainer.querySelectorAll(".struct-chat-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          const cb = item.querySelector("input") as HTMLInputElement;
          if (e.target !== cb) cb.checked = !cb.checked;
        });
      });
    }
  };

  popup.innerHTML = /* html */ `
    <div style="background:#1e1e1e; padding:24px; border-radius:16px; border:1px solid #444; color:#e3e3e3; width:380px; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index:10000; font-family:sans-serif; box-shadow:0 12px 40px rgba(0,0,0,0.7);">
      <h3 style="margin:0 0 20px 0; font-size:18px; font-weight:500;">${editingGroup ? "Edit Group" : "Create New Group"}</h3>
      <input type="text" id="group-name" value="${editingGroup?.name || ""}" placeholder="Enter group name..." style="width:100%; padding:10px; margin-bottom:16px; background:#2a2b2e; border:1px solid #3c4043; color:white; border-radius:8px; box-sizing:border-box;">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
        <span style="font-size:12px; color:#9aa0a6;">Color:</span>
        <input type="color" id="group-color" value="${editingGroup?.color || "#8ab4f8"}" style="width:40px; height:24px; border:none; background:none; cursor:pointer;">
      </div>
      <p style="font-size:12px; color:#9aa0a6; margin-bottom:8px;">Assign chats to this group:</p>
      <div class="struct-chat-list" style="max-height:180px; overflow-y:auto; border:1px solid #3c4043; background:#171717; border-radius:8px; margin-bottom:24px;"></div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        ${editingGroup ? `<button id="delete-group-btn" style="color:#ff4d4d; background:none; border:none; cursor:pointer; font-size:12px;">Delete Group</button>` : "<div></div>"}
        <div style="display:flex; gap:12px;">
          <button id="cancel-group-btn" style="padding:8px 20px; border-radius:20px; border:1px solid #5f6368; background:transparent; color:#8ab4f8; cursor:pointer; font-size:13px;">Cancel</button>
          <button id="save-group-btn" style="padding:8px 20px; border-radius:20px; border:none; background:#8ab4f8; color:#202124; font-weight:500; cursor:pointer; font-size:13px;">Save</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  renderList();

  const refreshHandler = () => renderList();
  window.addEventListener("struct-gemini-refresh-popup", refreshHandler);

  const close = () => {
    window.removeEventListener("struct-gemini-refresh-popup", refreshHandler);
    popup.remove();
  };

  popup.querySelector("#cancel-group-btn")?.addEventListener("click", close);

  popup
    .querySelector("#delete-group-btn")
    ?.addEventListener("click", async () => {
      if (!confirm(`Delete group "${editingGroup?.name}"?`)) return;
      const updatedGroups = groups.filter((g) => g.id !== editingGroupId);
      const updatedMapping = { ...chatMapping };
      Object.keys(updatedMapping).forEach((k) => {
        if (updatedMapping[k] === editingGroupId) delete updatedMapping[k];
      });
      await chrome.storage.local.set({
        groups: updatedGroups,
        chatMapping: updatedMapping,
      });
      await organizeChats();
      close();
    });

  popup
    .querySelector("#save-group-btn")
    ?.addEventListener("click", async () => {
      const name = (
        popup.querySelector("#group-name") as HTMLInputElement
      ).value.trim();
      if (!name) return;

      const selectedChatIds = Array.from(
        popup.querySelectorAll<HTMLInputElement>(".chat-check:checked"),
      ).map((el) => el.value);
      const color = (popup.querySelector("#group-color") as HTMLInputElement)
        .value;

      let updatedGroups = [...groups];
      const targetGroupId = editingGroupId || Date.now().toString();

      // 1. 그룹 정보 업데이트
      if (editingGroupId) {
        updatedGroups = groups.map((g) =>
          g.id === editingGroupId ? { ...g, name, color } : g,
        );
      } else {
        updatedGroups.push({ id: targetGroupId, name, color });
      }

      // 2. 매핑 정보 업데이트
      const updatedMapping = { ...chatMapping };

      // 이전에 이 그룹에 속해있던 것들 초기화
      Object.keys(updatedMapping).forEach((chatId) => {
        if (updatedMapping[chatId] === targetGroupId)
          delete updatedMapping[chatId];
      });

      // 현재 선택된 것들 다시 할당
      selectedChatIds.forEach((chatId) => {
        updatedMapping[chatId] = targetGroupId;
      });

      await chrome.storage.local.set({
        groups: updatedGroups,
        chatMapping: updatedMapping,
      });

      // 3. 즉시 화면 갱신
      await organizeChats();
      close();
    });
};
