import { StructGroup } from "./type";

export const addGroup = () => {
  const titleSection = document.querySelector<HTMLElement>("conversations-list .title-container");
  if (!titleSection || document.getElementById("group-add-btn")) return;

  titleSection.style.display = "flex";
  titleSection.style.justifyContent = "space-between";
  titleSection.style.position = "relative";

  const groupBtn = document.createElement("button");
  groupBtn.id = "group-add-btn";
  groupBtn.innerText = "add group +";
  groupBtn.style.cssText = `
    margin-left: 10px;
    padding: 6px 12px;
    border: 1px solid #444;
    border-radius: 6px;
    color: #e3e3e3;
    cursor: pointer;
    background-color: transparent;
    font-size: 11px;
    font-weight: 500;
    transition: all 0.2s ease;
  `;
  
  groupBtn.onmouseover = () => { groupBtn.style.backgroundColor = "rgba(255,255,255,0.05)"; groupBtn.style.borderColor = "#666"; };
  groupBtn.onmouseout = () => { groupBtn.style.backgroundColor = "transparent"; groupBtn.style.borderColor = "#444"; };
  
  groupBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    makeGroupPopup();
  };

  titleSection.appendChild(groupBtn);
};

const makeGroupPopup = () => {
  const existing = document.getElementById("group-management-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "group-management-popup";
  
  const chatLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('#conversations-list-0 a[href^="/app/"]'));
  const unassignedChats = chatLinks.filter(link => !link.closest(".struct-container"));

  const style = document.createElement("style");
  style.id = "popup-fancy-style";
  style.textContent = /* css */ `
    @keyframes popupFadeIn {
      from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    .struct-popup-container {
      background: #1e1e1e;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid #444;
      color: #e3e3e3;
      width: 380px;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      font-family: 'Google Sans', Arial, sans-serif;
      box-shadow: 0 12px 40px rgba(0,0,0,0.7);
      animation: popupFadeIn 0.2s ease-out;
    }
    .struct-popup-title {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 500;
      color: #fff;
    }
    .struct-input-label {
      display: block;
      font-size: 12px;
      color: #9aa0a6;
      margin-bottom: 6px;
    }
    .struct-text-input {
      width: 100%;
      padding: 10px 12px;
      margin-bottom: 16px;
      background: #2a2b2e;
      border: 1px solid #3c4043;
      color: #e8eaed;
      border-radius: 8px;
      font-size: 14px;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .struct-text-input:focus {
      border-color: #8ab4f8;
      outline: none;
    }
    .struct-chat-list {
      max-height: 180px;
      overflow-y: auto;
      border: 1px solid #3c4043;
      background: #171717;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .struct-chat-item {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      border-bottom: 1px solid #2a2b2e;
      cursor: pointer;
      transition: background 0.2s;
    }
    .struct-chat-item:hover { background: #2a2b2e; }
    .struct-chat-item:last-child { border-bottom: none; }
    .struct-chat-item input { margin-right: 12px; cursor: pointer; }
    .struct-chat-item label { cursor: pointer; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
    
    .struct-button-group {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .struct-btn {
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .struct-btn-cancel {
      background: transparent;
      border: 1px solid #5f6368;
      color: #8ab4f8;
    }
    .struct-btn-cancel:hover { background: rgba(138, 180, 248, 0.08); border-color: #8ab4f8; }
    .struct-btn-create {
      background: #8ab4f8;
      border: none;
      color: #202124;
    }
    .struct-btn-create:hover { background: #aecbfa; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
    
    /* Scrollbar styling */
    .struct-chat-list::-webkit-scrollbar { width: 6px; }
    .struct-chat-list::-webkit-scrollbar-thumb { background: #5f6368; border-radius: 3px; }
  `;
  document.head.appendChild(style);

  popup.innerHTML = /* html */ `
    <div class="struct-popup-container">
      <h3 class="struct-popup-title">Create New Group</h3>
      
      <label class="struct-input-label">Group Details</label>
      <input type="text" id="group-name" class="struct-text-input" placeholder="Enter group name..." autofocus>
      
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
        <label class="struct-input-label" style="margin-bottom:0">Theme Color:</label>
        <input type="color" id="group-color" value="#8ab4f8" style="width:40px; height:24px; border:none; background:none; cursor:pointer; padding:0;">
      </div>
      
      <label class="struct-input-label">Assign Chats (${unassignedChats.length})</label>
      <div class="struct-chat-list">
        ${unassignedChats.length > 0 ? unassignedChats.map((link, i) => {
          const id = link.getAttribute('href')?.split('/app/')[1] || i;
          const text = link.textContent?.trim() || "Untitled Chat";
          return `
            <div class="struct-chat-item" onclick="this.querySelector('input').click()">
              <input type="checkbox" class="chat-check" value="${id}" id="c-${id}" onclick="event.stopPropagation()">
              <label>${text}</label>
            </div>`;
        }).join('') : '<div style="padding:20px; text-align:center; color:#80868b; font-size:13px;">No unassigned chats available</div>'}
      </div>

      <div class="struct-button-group">
        <button id="cancel-group-btn" class="struct-btn struct-btn-cancel">Cancel</button>
        <button id="create-group-btn" class="struct-btn struct-btn-create">Create Group</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  const close = () => {
    popup.remove();
    style.remove();
  };

  popup.querySelector("#cancel-group-btn")?.addEventListener("click", close);

  popup.querySelector("#create-group-btn")?.addEventListener("click", async () => {
    const name = (popup.querySelector("#group-name") as HTMLInputElement).value.trim();
    const color = (popup.querySelector("#group-color") as HTMLInputElement).value;
    if (!name) {
      (popup.querySelector("#group-name") as HTMLInputElement).style.borderColor = "#f28b82";
      return;
    }

    const selectedChatIds = Array.from(popup.querySelectorAll<HTMLInputElement>(".chat-check:checked")).map(el => el.value);

    const result = await chrome.storage.local.get(["groups", "chatMapping"]);
    const groups = (result.groups as StructGroup[]) || [];
    const chatMapping = (result.chatMapping as Record<string, string>) || {};

    const newGroupId = Date.now().toString();
    const newGroup = { id: newGroupId, name, color };

    selectedChatIds.forEach(chatId => {
      chatMapping[chatId] = newGroupId;
    });

    await chrome.storage.local.set({ 
      groups: [...groups, newGroup],
      chatMapping: chatMapping
    });

    close();
  });
};
