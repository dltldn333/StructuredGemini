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

export const makeGroupPopup = async (editingGroupId?: string) => {
  const existing = document.getElementById("group-management-popup");
  if (existing) existing.remove();

  const result = await chrome.storage.local.get(["groups", "chatMapping"]);
  const groups = (result.groups as StructGroup[]) || [];
  const chatMapping = (result.chatMapping as Record<string, string>) || {};
  
  const editingGroup = editingGroupId ? groups.find(g => g.id === editingGroupId) : null;

  const popup = document.createElement("div");
  popup.id = "group-management-popup";
  
  const renderList = () => {
    const chatLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('#conversations-list-0 a[href^="/app/"]'));
    
    // 현재 그룹에 속해있는 채팅들 + 아직 할당 안된 채팅들
    const availableChats = chatLinks.filter(link => {
      const href = link.getAttribute('href');
      if (!href) return false;
      const id = href.split('/app/')[1];
      
      if (editingGroupId) {
        // 편집 모드: 현재 그룹에 속해있거나, 아예 할당 안 된 채팅만 표시
        return chatMapping[id] === editingGroupId || !link.closest(".struct-container");
      }
      // 생성 모드: 할당 안 된 채팅만 표시
      return !link.closest(".struct-container");
    });
    
    const listContainer = popup.querySelector('.struct-chat-list');
    if (!listContainer) return;

    if (availableChats.length === 0) {
      listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#80868b; font-size:13px;">No chats available to assign.</div>';
    } else {
      listContainer.innerHTML = availableChats.map((link, i) => {
        const href = link.getAttribute('href');
        const id = href?.split('/app/')[1] || `chat-${i}`;
        const text = link.textContent?.trim() || "Untitled Chat";
        const isChecked = chatMapping[id] === editingGroupId;
        
        return `
          <div class="struct-chat-item" data-id="${id}" style="display:flex; align-items:center; padding:10px 12px; border-bottom:1px solid #2a2b2e; cursor:pointer;">
            <input type="checkbox" class="chat-check" value="${id}" ${isChecked ? 'checked' : ''} style="margin-right:12px;">
            <label style="font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; cursor:pointer;">${text}</label>
          </div>`;
      }).join('');

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
      <h3 style="margin:0 0 20px 0; font-size:18px; font-weight:500;">${editingGroup ? 'Edit Group' : 'Create New Group'}</h3>
      <input type="text" id="group-name" value="${editingGroup?.name || ''}" placeholder="Enter group name..." style="width:100%; padding:10px; margin-bottom:16px; background:#2a2b2e; border:1px solid #3c4043; color:white; border-radius:8px; box-sizing:border-box;">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
        <span style="font-size:12px; color:#9aa0a6;">Color:</span>
        <input type="color" id="group-color" value="${editingGroup?.color || '#8ab4f8'}" style="width:40px; height:24px; border:none; background:none; cursor:pointer;">
      </div>
      <p style="font-size:12px; color:#9aa0a6; margin-bottom:8px;">Assignment (Scroll sidebar to see more):</p>
      <div class="struct-chat-list" style="max-height:180px; overflow-y:auto; border:1px solid #3c4043; background:#171717; border-radius:8px; margin-bottom:24px;"></div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        ${editingGroup ? `<button id="delete-group-btn" style="color:#ff4d4d; background:none; border:none; cursor:pointer; font-size:12px;">Delete Group</button>` : '<div></div>'}
        <div style="display:flex; gap:12px;">
          <button id="cancel-group-btn" style="padding:8px 20px; border-radius:20px; border:1px solid #5f6368; background:transparent; color:#8ab4f8; cursor:pointer; font-size:13px;">Cancel</button>
          <button id="create-group-btn" style="padding:8px 20px; border-radius:20px; border:none; background:#8ab4f8; color:#202124; font-weight:500; cursor:pointer; font-size:13px;">${editingGroup ? 'Save Changes' : 'Create Group'}</button>
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
  
  popup.querySelector("#delete-group-btn")?.addEventListener("click", async () => {
    if (!confirm(`Delete group "${editingGroup?.name}"?`)) return;
    
    const updatedGroups = groups.filter(g => g.id !== editingGroupId);
    // 매핑 정보에서 삭제된 그룹 제거
    const updatedMapping = { ...chatMapping };
    Object.keys(updatedMapping).forEach(key => {
      if (updatedMapping[key] === editingGroupId) delete updatedMapping[key];
    });

    await chrome.storage.local.set({ groups: updatedGroups, chatMapping: updatedMapping });
    location.reload(); // 복잡한 DOM 복구 대신 새로고침으로 깔끔하게 정리
  });

  popup.querySelector("#create-group-btn")?.addEventListener("click", async () => {
    const name = (popup.querySelector("#group-name") as HTMLInputElement).value.trim();
    if (!name) return;

    const selectedChatIds = Array.from(popup.querySelectorAll<HTMLInputElement>(".chat-check:checked")).map(el => el.value);
    const color = (popup.querySelector("#group-color") as HTMLInputElement).value;

    let updatedGroups;
    const targetGroupId = editingGroupId || Date.now().toString();

    if (editingGroupId) {
      updatedGroups = groups.map(g => g.id === editingGroupId ? { ...g, name, color } : g);
      // 기존에 이 그룹에 속해있던 매핑 제거 (새로운 선택으로 대체하기 위함)
      Object.keys(chatMapping).forEach(key => {
        if (chatMapping[key] === editingGroupId) delete chatMapping[key];
      });
    } else {
      updatedGroups = [...groups, { id: targetGroupId, name, color }];
    }

    selectedChatIds.forEach(id => chatMapping[id] = targetGroupId);

    await chrome.storage.local.set({ groups: updatedGroups, chatMapping: chatMapping });
    
    if (editingGroupId) {
        location.reload(); // 수정 시에는 복잡한 이동 로직 처리를 위해 새로고침 권장
    } else {
        await organizeChats();
        close();
    }
  });
};
