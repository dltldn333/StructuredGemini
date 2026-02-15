import { StructGroup } from "./type";
import { addGroup, makeGroupPopup } from "./groupManage";

const ICONS = {
  edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  chevron: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-svg"><polyline points="6 9 12 15 18 9"></polyline></svg>`
};

export const injectGroupContainers = async (nav: HTMLElement) => {
  addGroup();

  let container = nav.querySelector<HTMLElement>(".struct-container");
  if (!container) {
    const style = document.createElement("style");
    style.textContent = /* css */ `
      .struct-container { margin-top: 10px; display: flex; flex-direction: column; gap: 10px; }
      .group-wrapper { display: flex; flex-direction: column; }
      
      .group-header {
        display: flex; justify-content: space-between; align-items: center; 
        background: transparent; border: 1px solid #555; 
        color: #e3e3e3; border-radius: 6px; padding: 8px 12px; 
        cursor: pointer; transition: all 0.2s ease;
      }
      .group-header:hover { background: rgba(255, 255, 255, 0.05); border-color: #888; }
      .group-header:hover .edit-group-btn { opacity: 1; }

      .group-color-dot { width: 10px; height: 10px; display: inline-block; margin-right: 8px; border-radius: 2px; flex-shrink: 0; }
      
      .edit-group-btn { 
        opacity: 0; transition: opacity 0.2s; 
        background: transparent; border: none; 
        color: #8ab4f8; display: flex; align-items: center; justify-content: center;
        padding: 4px; cursor: pointer; margin-right: 6px;
      }
      .edit-group-btn:hover { color: #fff; background: rgba(138, 180, 248, 0.2); border-radius: 4px; }

      .chevron-svg { transition: transform 0.3s ease; color: #888; display: block; }
      
      .group-content { 
        display: none; padding-left: 4px; margin-left: 4px; margin-top: 4px;
        border-left: 1px solid transparent; 
      }
      
      .group-wrapper.expanded .group-content { display: block; }
      .group-wrapper.expanded .group-header { border-color: #8ab4f8; background: rgba(138, 180, 248, 0.05); }
      .group-wrapper.expanded .chevron-svg { transform: rotate(180deg); color: #8ab4f8; }
    `;
    nav.appendChild(style);
    container = document.createElement("div");
    container.className = "struct-container";
    container.style.cssText = "display:flex; flex-direction:column; gap:10px;";
    nav.prepend(container);
  }

  const result = await chrome.storage.local.get("groups");
  const groups: StructGroup[] = (result.groups as StructGroup[]) || [];

  // 삭제된 그룹 처리 (채팅 구출)
  Array.from(container.querySelectorAll(".group-wrapper")).forEach(dom => {
    const id = dom.id.replace("group-", "");
    if (!groups.find(g => g.id === id)) {
      const content = dom.querySelector(".group-content");
      if (content) {
        Array.from(content.children).forEach(chat => {
          container!.after(chat);
        });
      }
      dom.remove();
    }
  });

  groups.forEach((group) => {
    let groupDiv = document.getElementById(`group-${group.id}`);
    if (groupDiv) {
      (groupDiv.querySelector(".group-name") as HTMLElement).textContent = group.name;
      (groupDiv.querySelector(".group-color-dot") as HTMLElement).style.backgroundColor = group.color;
      (groupDiv.querySelector(".group-content") as HTMLElement).style.borderLeftColor = `${group.color}aa`;
      return;
    }

    groupDiv = document.createElement("div");
    groupDiv.id = `group-${group.id}`;
    groupDiv.className = "group-wrapper";
    groupDiv.innerHTML = /* html */ `
      <div class="group-header">
        <div style="display:flex; align-items:center; flex:1; overflow:hidden;">
          <span class="group-color-dot" style="background:${group.color};"></span>
          <span class="group-name" style="font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${group.name}</span>
        </div>
        <div style="display:flex; align-items:center;">
          <button class="edit-group-btn">${ICONS.edit}</button>
          ${ICONS.chevron}
        </div>
      </div>
      <div class="group-content" style="border-left-color: ${group.color}aa;"></div>
    `;

    const header = groupDiv.querySelector(".group-header") as HTMLElement;
    const editBtn = groupDiv.querySelector(".edit-group-btn") as HTMLElement;
    header.addEventListener("click", (e) => {
      if (editBtn.contains(e.target as Node)) return;
      groupDiv!.classList.toggle("expanded");
    });
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      makeGroupPopup(group.id);
    });
    container!.appendChild(groupDiv);
  });
};
