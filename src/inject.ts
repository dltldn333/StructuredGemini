import { StructGroup } from "./type";
import { addGroup, makeGroupPopup } from "./groupManage";

export const injectGroupContainers = async (nav: HTMLElement) => {
  addGroup();

  let container = nav.querySelector<HTMLElement>(".struct-container");
  
  if (!container) {
    const style = document.createElement("style");
    style.textContent = /* css */ `
      .group-content { margin-top: 8px; min-height: 5px; }
      .group-content .conversation-items-container { display: block !important; width: 100% !important; }
      .group-content a.conversation { display: flex !important; width: 100% !important; box-sizing: border-box; }
      .no-groups-msg { color: #888; font-size: 12px; text-align: center; padding: 10px; border: 1px dashed #555; border-radius: 6px; }
      
      .group-header:hover .edit-group-btn { opacity: 1 !important; }
      .edit-group-btn { 
        opacity: 0; 
        transition: opacity 0.2s; 
        background: rgba(255,255,255,0.1); 
        border: none; 
        color: #888; 
        border-radius: 4px; 
        padding: 2px 6px; 
        font-size: 10px; 
        cursor: pointer;
        margin-right: 8px;
      }
      .edit-group-btn:hover { color: white; background: rgba(255,255,255,0.2); }
    `;
    nav.appendChild(style);

    container = document.createElement("div");
    container.className = "struct-container";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    container.style.padding = "10px";
    nav.prepend(container);
  }

  const result = await chrome.storage.local.get("groups");
  const groups: StructGroup[] = (result.groups as StructGroup[]) || [];

  const existingMsg = container.querySelector(".no-groups-msg");
  if (groups.length > 0 && existingMsg) existingMsg.remove();
  if (groups.length === 0 && !existingMsg) {
    const msg = document.createElement("div");
    msg.className = "no-groups-msg";
    msg.innerText = "No groups created yet.";
    container.appendChild(msg);
    return;
  }

  groups.forEach((group) => {
    let groupDiv = document.getElementById(`group-${group.id}`);
    
    // 이미 있으면 이름과 색상만 업데이트
    if (groupDiv) {
      const nameEl = groupDiv.querySelector(".group-name");
      const colorEl = groupDiv.querySelector(".group-color-dot");
      if (nameEl) nameEl.textContent = group.name;
      if (colorEl) (colorEl as HTMLElement).style.backgroundColor = group.color;
      return;
    }

    groupDiv = document.createElement("div");
    groupDiv.id = `group-${group.id}`;
    groupDiv.style.marginBottom = "10px";

    groupDiv.innerHTML = /* html */ `
      <div class="group-header" style="display:flex; justify-content:space-between; align-items:center; background:transparent; border:1px solid #555; color:#e3e3e3; border-radius:6px; padding:8px 12px; cursor:pointer; transition:background-color 0.2s;">
        <div style="display:flex; align-items:center; flex:1; overflow:hidden;">
          <span class="group-color-dot" style="background:${group.color}; width:10px; height:10px; display:inline-block; margin-right:8px; border-radius:2px; flex-shrink:0;"></span>
          <span class="group-name" style="font-weight:500; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${group.name}</span>
        </div>
        <div style="display:flex; align-items:center;">
          <button class="edit-group-btn" data-id="${group.id}">edit</button>
          <span class="arrow-icon" style="font-size:10px; color:#888;">▼</span>
        </div>
      </div>
      <div class="group-content" style="display:none; padding-left:5px; margin-top:5px; border-left:1px solid ${group.color};"></div>
    `;

    const header = groupDiv.querySelector(".group-header") as HTMLElement;
    const content = groupDiv.querySelector(".group-content") as HTMLElement;
    const arrow = groupDiv.querySelector(".arrow-icon") as HTMLElement;
    const editBtn = groupDiv.querySelector(".edit-group-btn") as HTMLElement;

    header.addEventListener("click", (e) => {
      if (editBtn.contains(e.target as Node)) return;
      const isHidden = content.style.display === "none";
      content.style.display = isHidden ? "block" : "none";
      arrow.textContent = isHidden ? "▲" : "▼";
    });

    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      makeGroupPopup(group.id); // 편집 모드로 팝업 호출
    });

    container!.appendChild(groupDiv);
  });
};
