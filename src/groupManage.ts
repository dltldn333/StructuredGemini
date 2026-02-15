import { StructGroup } from "./type";
import { organizeChats } from "./organize";

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
  
  groupBtn.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    makeGroupPopup();
  };

  titleSection.appendChild(groupBtn);
};

const makeGroupPopup = () => {
  const existing = document.getElementById("group-management-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "group-management-popup";
  
  const renderList = () => {
    const chatLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('#conversations-list-0 a[href^="/app/"]'));
    const unassignedChats = chatLinks.filter(link => !link.closest(".struct-container"));
    
    const listContainer = popup.querySelector('.struct-chat-list');
    if (!listContainer) return;

    if (unassignedChats.length === 0) {
      listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#80868b; font-size:13px;">Scroll sidebar to load more chats...</div>';
    } else {
      listContainer.innerHTML = unassignedChats.map((link, i) => {
        const id = link.getAttribute('href')?.split('/app/')[1] || i;
        const text = link.textContent?.trim() || "Untitled Chat";
        return `
          <div class="struct-chat-item" data-id="${id}" style="display:flex; align-items:center; padding:10px 12px; border-bottom:1px solid #2a2b2e; cursor:pointer;">
            <input type="checkbox" class="chat-check" value="${id}" style="margin-right:12px;">
            <label style="font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; cursor:pointer;">${text}</label>
          </div>`;
      }).join('');

      // 항목 클릭 시 체크박스 토글
      listContainer.querySelectorAll('.struct-chat-item').forEach(item => {
        item.addEventListener('click', (e) => {
          const cb = item.querySelector('input') as HTMLInputElement;
          if (e.target !== cb) cb.checked = !cb.checked;
        });
      });
    }
  };

  popup.innerHTML = /* html */ `
    <div style="background:#1e1e1e; padding:24px; border-radius:16px; border:1px solid #444; color:#e3e3e3; width:380px; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index:10000; font-family:sans-serif; box-shadow:0 12px 40px rgba(0,0,0,0.7);">
      <h3 style="margin:0 0 20px 0; font-size:18px; font-weight:500;">Create New Group</h3>
      <input type="text" id="group-name" placeholder="Enter group name..." style="width:100%; padding:10px; margin-bottom:16px; background:#2a2b2e; border:1px solid #3c4043; color:white; border-radius:8px; box-sizing:border-box;">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
        <span style="font-size:12px; color:#9aa0a6;">Color:</span>
        <input type="color" id="group-color" value="#8ab4f8" style="width:40px; height:24px; border:none; background:none; cursor:pointer;">
      </div>
      <p style="font-size:12px; color:#9aa0a6; margin-bottom:8px;">Select chats (Scroll sidebar to see more):</p>
      <div class="struct-chat-list" style="max-height:180px; overflow-y:auto; border:1px solid #3c4043; background:#171717; border-radius:8px; margin-bottom:24px;"></div>
      <div style="display:flex; justify-content:flex-end; gap:12px;">
        <button id="cancel-group-btn" style="padding:8px 20px; border-radius:20px; border:1px solid #5f6368; background:transparent; color:#8ab4f8; cursor:pointer;">Cancel</button>
        <button id="create-group-btn" style="padding:8px 20px; border-radius:20px; border:none; background:#8ab4f8; color:#202124; font-weight:500; cursor:pointer;">Create Group</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  renderList();

  // main.ts에서 보내는 신호를 받아 리스트 갱신 (스크롤 시 자동 업데이트)
  const refreshHandler = () => renderList();
  window.addEventListener("struct-gemini-refresh-popup", refreshHandler);

  const close = () => {
    window.removeEventListener("struct-gemini-refresh-popup", refreshHandler);
    popup.remove();
  };

  popup.querySelector("#cancel-group-btn")?.addEventListener("click", close);
  popup.querySelector("#create-group-btn")?.addEventListener("click", async () => {
    const name = (popup.querySelector("#group-name") as HTMLInputElement).value.trim();
    if (!name) return;

    const selectedChatIds = Array.from(popup.querySelectorAll<HTMLInputElement>(".chat-check:checked")).map(el => el.value);
    const result = await chrome.storage.local.get(["groups", "chatMapping"]);
    const groups = (result.groups as StructGroup[]) || [];
    const chatMapping = (result.chatMapping as Record<string, string>) || {};

    const newGroupId = Date.now().toString();
    selectedChatIds.forEach(id => chatMapping[id] = newGroupId);

    await chrome.storage.local.set({ 
      groups: [...groups, { id: newGroupId, name, color: (popup.querySelector("#group-color") as HTMLInputElement).value }],
      chatMapping: chatMapping
    });

    await organizeChats();
    close();
  });
};
