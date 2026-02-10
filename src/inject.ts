import { StructGroup } from "./type";

const GROUPS: StructGroup[] = [
  { id: "study", name: "폴더 1", color: "#81D4FA" },
  { id: "misc", name: "폴더 2", color: "#E0E0E0" },
];

const chatMap: Record<string, string> = {};

export const injectGroupContainers = (nav: HTMLElement) => {
  if (nav.querySelector(".struct-container")) return;

  const style = document.createElement("style");
  style.textContent = /* css */ `
    .group-content .conversation-items-container {
      display: block !important;
      width: 100% !important;
    }
    .group-content a.conversation {
      display: flex !important;
      width: 100% !important;
      box-sizing: border-box;
    }
  `;
  nav.appendChild(style);

  const container = document.createElement("div");
  container.className = "struct-container";
  container.style.padding = "10px";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "10px";

  GROUPS.forEach((group) => {
    const groupDiv = document.createElement("div");
    groupDiv.id = `group-${group.id}`;

    groupDiv.innerHTML = /* html */ `
      <div 
        class="group-header"
        style="
        font-weight: bold; 
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        padding: 12px 16px;
        margin-bottom: 4px; 
        cursor: pointer;">
        <span style="background: ${group.color}; width: 10px; height: 10px; display: inline-block; margin-right: 5px;"></span>
        ${group.name}
      </div>
      <div class="group-content" 
            style="
            display: none;
            padding-left: 10px; 
            border-left: 2px solid ${group.color}33;">
      </div>
    `;

    const header = groupDiv.querySelector(".group-header") as HTMLElement;
    const content = groupDiv.querySelector(".group-content") as HTMLElement;

    if (header && content) {
      header.addEventListener("click", () => {
        const isHidden = content.style.display === "none";
        content.style.display = isHidden ? "block" : "none";

        console.log(`Clicked group: ${group.name}`);
      });
    }

    container.appendChild(groupDiv);
  });

  nav.appendChild(container);
};

