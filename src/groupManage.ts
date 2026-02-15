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
  groupBtn.style.cssText = "margin-left:10px; padding:5px 10px; border:none; border-radius:4px; color:white; cursor:pointer; background-color:rgba(255,255,255,0.1); font-size:12px;";
  
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

  popup.innerHTML = /* html */ `
    <div style="background:#2a2a2a; padding:20px; border-radius:12px; border:1px solid #444; color:white; width:350px; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index:10000; font-family:sans-serif;">
      <h3 style="margin-top:0">Create New Group</h3>
      <input type="text" id="group-name" placeholder="Group Name" style="width:100%; padding:8px; margin-bottom:10px; background:#1e1e1e; border:1px solid #555; color:white; border-radius:6px;">
      <input type="color" id="group-color" value="#8ab4f8" style="width:100%; height:30px; margin-bottom:15px; border:none; border-radius:4px; cursor:pointer;">
      
      <div style="max-height:150px; overflow-y:auto; border:1px solid #444; padding:10px; margin-bottom:15px; background:#1e1e1e; border-radius:6px;">
        <p style="font-size:12px; margin-top:0; color:#888;">Select chats to include:</p>
        ${unassignedChats.map((link, i) => {
          const id = link.getAttribute('href')?.split('/app/')[1] || i;
          const text = link.textContent?.trim() || "Untitled Chat";
          return `<div style="display:flex; align-items:center; margin-bottom:5px;"><input type="checkbox" class="chat-check" value="${id}" id="c-${id}"><label for="check-${id}" style="font-size:12px; margin-left:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${text}</label></div>`;
        }).join('')}
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button id="cancel-group-btn" style="background:none; border:1px solid #555; color:white; padding:6px 15px; border-radius:15px; cursor:pointer;">Cancel</button>
        <button id="create-group-btn" style="background:#8ab4f8; border:none; color:#202124; padding:6px 15px; border-radius:15px; cursor:pointer; font-weight:bold;">Create</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  popup.querySelector("#cancel-group-btn")?.addEventListener("click", () => popup.remove());

  popup.querySelector("#create-group-btn")?.addEventListener("click", async () => {
    const name = (popup.querySelector("#group-name") as HTMLInputElement).value.trim();
    const color = (popup.querySelector("#group-color") as HTMLInputElement).value;
    if (!name) return;

    const selectedChatIds = Array.from(popup.querySelectorAll<HTMLInputElement>(".chat-check:checked")).map(el => el.value);

    const result = await chrome.storage.local.get(["groups", "chatMapping"]);
    const groups = (result.groups as StructGroup[]) || [];
    const chatMapping = (result.chatMapping as Record<string, string>) || {};

    const newGroupId = Date.now().toString();
    const newGroup = { id: newGroupId, name, color };

    // 매핑 정보 업데이트
    selectedChatIds.forEach(chatId => {
      chatMapping[chatId] = newGroupId;
    });

    await chrome.storage.local.set({ 
      groups: [...groups, newGroup],
      chatMapping: chatMapping
    });

    popup.remove();
  });
};
