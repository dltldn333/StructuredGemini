import { StructGroup } from "./type";
import { organizeChats } from "./organize";

const PIN_ICON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="color: #8ab4f8; margin-left: 6px; flex-shrink: 0;"><path d="M16 9V4l1 0c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1l1 0v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"></path></svg>`;

export const addGroup = () => {
  const titleSection = document.querySelector<HTMLElement>("conversations-list .title-container");
  if (!titleSection || document.getElementById("group-add-btn")) return;

  titleSection.style.display = "flex";
  titleSection.style.justifyContent = "space-between";
  titleSection.style.position = "relative";

  const groupBtn = document.createElement("button");
  groupBtn.id = "group-add-btn";
  groupBtn.innerText = "add group +";
  groupBtn.style.cssText = "margin-left:10px; padding:6px 12px; border:1px solid #444; border-radius:6px; color:#e3e3e3; cursor:pointer; background:transparent; font-size:11px; font-weight:500;";
  
  groupBtn.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    makeGroupPopup();
  });

  titleSection.appendChild(groupBtn);
};

export const makeGroupPopup = async (editingGroupId?: string) => {
  const existing = document.getElementById("group-management-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "group-management-popup";
  
  // 팝업이 열릴 때 최신 데이터를 가져옴
  const result = await chrome.storage.local.get(["groups", "chatMapping"]);
  const groups = (result.groups as StructGroup[]) || [];
  const chatMapping = (result.chatMapping as Record<string, string>) || {};
  const editingGroup = editingGroupId ? groups.find(g => g.id === editingGroupId) : null;

  const renderList = () => {
    const chatLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="/app/"]'));
    const listContainer = popup.querySelector('.struct-chat-list');
    if (!listContainer) return;

    if (chatLinks.length === 0) {
      listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#80868b; font-size:13px;">No chats found. Scroll sidebar to load.</div>';
    } else {
      // 팝업 내에서 사용자가 이미 체크한 상태를 유지하기 위해 현재 체크된 값들 수집
      const currentlyChecked = new Set(
        Array.from(listContainer.querySelectorAll<HTMLInputElement>(".chat-check:checked")).map(el => el.value)
      );

      listContainer.innerHTML = chatLinks.map((link, i) => {
        const href = link.getAttribute('href');
        const id = href?.split('/app/')[1] || `chat-${i}`;
        let text = link.innerText || link.textContent || "Untitled Chat";
        
        const isPinned = /고정됨|고정된 채팅|Pinned|Pinned chat/i.test(text);
        text = text.replace(/고정됨|고정된 채팅|Pinned chat|Pinned/gi, "").trim();
        
        // 기존에 체크되어 있었거나, 수정 모드에서 이미 이 그룹에 속해있는 경우 체크
        const isChecked = currentlyChecked.has(id) || (editingGroupId ? chatMapping[id] === editingGroupId : false);
        const assignedGroup = groups.find(g => g.id === chatMapping[id]);
        const statusText = assignedGroup && assignedGroup.id !== editingGroupId ? `(in ${assignedGroup.name})` : "";
        
        return `
          <div class="struct-chat-item" data-id="${id}" style="display:flex; align-items:center; padding:10px 12px; border-bottom:1px solid #2a2b2e; cursor:pointer;">
            <input type="checkbox" class="chat-check" value="${id}" ${isChecked ? 'checked' : ''} style="margin-right:12px;">
            <div style="flex:1; overflow:hidden;">
              <div style="display:flex; align-items:center; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                <span style="overflow:hidden; text-overflow:ellipsis;">${text}</span>
                ${isPinned ? PIN_ICON : ""}
              </div>
              ${statusText ? `<div style="font-size:10px; color:#8ab4f8; margin-top:2px;">${statusText}</div>` : ""}
            </div>
          </div>`;
      }).join('');

      listContainer.querySelectorAll<HTMLElement>('.struct-chat-item').forEach(item => {
        item.onclick = (e:Event) => {
          const cb = item.querySelector('input') as HTMLInputElement;
          if (e.target !== cb) cb.checked = !cb.checked;
        };
      });
    }
  };

  popup.innerHTML = /* html */ `
    <div style="background:#1e1e1e; padding:24px; border-radius:16px; border:1px solid #444; color:#e3e3e3; width:380px; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index:10000; font-family:sans-serif; box-shadow:0 12px 40px rgba(0,0,0,0.7);">
      <h3 style="margin:0 0 20px 0; font-size:18px; font-weight:500;">${editingGroup ? 'Edit Group' : 'Create New Group'}</h3>
      <input type="text" id="group-name" value="${editingGroup?.name || ''}" placeholder="Enter group name..." style="width:100%; padding:10px; margin-bottom:16px; background:#2a2b2e; border:1px solid #3c4043; color:white; border-radius:8px; box-sizing:border-box;">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
        <span style="font-size:12px; color:#9aa0a6;">Color:</span>
        <input type="color" id="group-color" value="${editingGroup?.color || '#8ab4f8'}" style="width:40px; height:24px; border:none; background:none; cursor:pointer;">
      </div>
      <p style="font-size:12px; color:#9aa0a6; margin-bottom:8px;">Assign chats (Scroll sidebar to see more):</p>
      <div class="struct-chat-list" style="max-height:180px; overflow-y:auto; border:1px solid #3c4043; background:#171717; border-radius:8px; margin-bottom:24px;"></div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        ${editingGroup ? `<button id="delete-group-btn" style="color:#ff4d4d; background:none; border:none; cursor:pointer; font-size:12px;">Delete Group</button>` : '<div></div>'}
        <div style="display:flex; gap:12px;">
          <button id="cancel-group-btn" style="padding:8px 20px; border-radius:20px; border:1px solid #5f6368; background:transparent; color:#8ab4f8; cursor:pointer; font-size:13px;">Cancel</button>
          <button id="save-group-btn" style="padding:8px 20px; border-radius:20px; border:none; background:#8ab4f8; color:#202124; font-weight:500; cursor:pointer; font-size:13px;">Save</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  renderList();

  // main.ts의 신호를 받아 리스트 갱신
  const refreshPopup = () => renderList();
  window.addEventListener("struct-gemini-refresh-popup", refreshPopup);

  const close = () => {
    window.removeEventListener("struct-gemini-refresh-popup", refreshPopup);
    popup.remove();
  };

  popup.querySelector("#cancel-group-btn")?.addEventListener("click", close);
  
  popup.querySelector("#delete-group-btn")?.addEventListener("click", async () => {
    if (!confirm(`Delete group "${editingGroup?.name}"?`)) return;
    const updatedGroups = groups.filter(g => g.id !== editingGroupId);
    const updatedMapping = { ...chatMapping };
    Object.keys(updatedMapping).forEach(k => { if (updatedMapping[k] === editingGroupId) delete updatedMapping[k]; });
    await chrome.storage.local.set({ groups: updatedGroups, chatMapping: updatedMapping });
    await organizeChats();
    close();
  });

  popup.querySelector("#save-group-btn")?.addEventListener("click", async () => {
    const name = (popup.querySelector("#group-name") as HTMLInputElement).value.trim();
    if (!name) return;

    const selectedChatIds = Array.from(popup.querySelectorAll<HTMLInputElement>(".chat-check:checked")).map(el => el.value);
    const color = (popup.querySelector("#group-color") as HTMLInputElement).value;

    let updatedGroups = [...groups];
    const targetGroupId = editingGroupId || Date.now().toString();

    if (editingGroupId) {
      updatedGroups = groups.map(g => g.id === editingGroupId ? { ...g, name, color } : g);
      Object.keys(chatMapping).forEach(k => { if (chatMapping[k] === targetGroupId) delete chatMapping[k]; });
    } else {
      updatedGroups.push({ id: targetGroupId, name, color });
    }

    selectedChatIds.forEach(id => chatMapping[id] = targetGroupId);
    await chrome.storage.local.set({ groups: updatedGroups, chatMapping: chatMapping });
    await organizeChats();
    close();
  });
};
