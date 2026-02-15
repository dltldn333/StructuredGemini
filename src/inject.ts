import { StructGroup } from "./type";
import { addGroup } from "./groupManage";

export const injectGroupContainers = async (nav: HTMLElement) => {
  if (nav.querySelector(".struct-container")) return;

  addGroup();

  const result = await chrome.storage.local.get("groups");
  const groups: StructGroup[] = (result.groups as StructGroup[]) || [];

  const style = document.createElement("style");
  style.textContent = /* css */ `
    .group-content {
      margin-top: 8px;
    }

    .group-content .conversation-items-container {
      display: block !important;
      width: 100% !important;
    }
    .group-content a.conversation {
      display: flex !important;
      width: 100% !important;
      box-sizing: border-box;
    }
    .no-groups-msg {
      color: #888;
      font-size: 12px;
      text-align: center;
      padding: 10px;
      border: 1px dashed #555;
      border-radius: 6px;
    }
  `;
  nav.appendChild(style);

  const container = document.createElement("div");
  container.className = "struct-container";
  container.style.padding = "10px";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "10px";

  if (groups.length === 0) {
    const msg = document.createElement("div");
    msg.className = "no-groups-msg";
    msg.innerText = "No groups created yet. Click 'add group +' to start.";
    container.appendChild(msg);
  } else {
    groups.forEach((group) => {
      const groupDiv = document.createElement("div");
      groupDiv.id = `group-${group.id}`;

      groupDiv.innerHTML = /* html */ `
        <div 
          class="group-header"
          style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
          border: 1px solid #555;
          color: #e3e3e3;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          transition: background-color 0.2s;">
          <div style="display: flex; align-items: center;">
            <span style="background: ${group.color}; width: 10px; height: 10px; display: inline-block; margin-right: 8px; border-radius: 2px;"></span>
            <span style="font-weight: 500;">${group.name}</span>
          </div>
          <span class="arrow-icon" style="font-size: 12px; color: #888;">▼</span>
        </div>
        <div class="group-content" 
              style="
              display: none;
              padding-left: 5px; 
              margin-top: 5px;
              border-left: 1px solid ${group.color};">
        </div>
      `;

      const header = groupDiv.querySelector(".group-header") as HTMLElement;
      const content = groupDiv.querySelector(".group-content") as HTMLElement;
      const arrow = groupDiv.querySelector(".arrow-icon") as HTMLElement;

      if (header && content) {
        header.addEventListener("mouseover", () => {
          header.style.background = "rgba(255, 255, 255, 0.05)";
        });
        header.addEventListener("mouseout", () => {
          header.style.background = "transparent";
        });

        header.addEventListener("click", () => {
          const isHidden = content.style.display === "none";
          content.style.display = isHidden ? "block" : "none";
          if (arrow) {
            arrow.textContent = isHidden ? "▲" : "▼";
          }
          console.log(`Clicked group: ${group.name}`);
        });
      }

      container.appendChild(groupDiv);
    });
  }

  nav.prepend(container);
};
