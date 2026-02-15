import { StructGroup } from "./type";
import { addGroup } from "./groupManage";

export const injectGroupContainers = async (nav: HTMLElement) => {
  // 1. 버튼 및 스타일 확인 (이미 있으면 내부에서 방어)
  addGroup();

  let container = nav.querySelector<HTMLElement>(".struct-container");
  
  // 2. 컨테이너가 없으면 생성
  if (!container) {
    const style = document.createElement("style");
    style.textContent = /* css */ `
      .group-content { margin-top: 8px; min-height: 5px; }
      .group-content .conversation-items-container { display: block !important; width: 100% !important; }
      .group-content a.conversation { display: flex !important; width: 100% !important; box-sizing: border-box; }
      .no-groups-msg { color: #888; font-size: 12px; text-align: center; padding: 10px; border: 1px dashed #555; border-radius: 6px; }
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

  // 3. 그룹 목록 가져오기 및 렌더링
  const result = await chrome.storage.local.get("groups");
  const groups: StructGroup[] = (result.groups as StructGroup[]) || [];

  // "No groups" 메시지 처리
  const existingMsg = container.querySelector(".no-groups-msg");
  if (groups.length > 0 && existingMsg) existingMsg.remove();
  if (groups.length === 0 && !existingMsg) {
    const msg = document.createElement("div");
    msg.className = "no-groups-msg";
    msg.innerText = "No groups created yet.";
    container.appendChild(msg);
    return;
  }

  // 각 그룹별로 존재 확인 후 없으면 추가
  groups.forEach((group) => {
    if (document.getElementById(`group-${group.id}`)) return;

    const groupDiv = document.createElement("div");
    groupDiv.id = `group-${group.id}`;
    groupDiv.style.marginBottom = "10px";

    groupDiv.innerHTML = /* html */ `
      <div class="group-header" style="display:flex; justify-content:space-between; align-items:center; background:transparent; border:1px solid #555; color:#e3e3e3; border-radius:6px; padding:8px 12px; cursor:pointer; transition:background-color 0.2s;">
        <div style="display:flex; align-items:center;">
          <span style="background:${group.color}; width:10px; height:10px; display:inline-block; margin-right:8px; border-radius:2px;"></span>
          <span style="font-weight:500; font-size:13px;">${group.name}</span>
        </div>
        <span class="arrow-icon" style="font-size:10px; color:#888;">▼</span>
      </div>
      <div class="group-content" style="display:none; padding-left:5px; margin-top:5px; border-left:1px solid ${group.color};"></div>
    `;

    const header = groupDiv.querySelector(".group-header") as HTMLElement;
    const content = groupDiv.querySelector(".group-content") as HTMLElement;
    const arrow = groupDiv.querySelector(".arrow-icon") as HTMLElement;

    header.addEventListener("click", () => {
      const isHidden = content.style.display === "none";
      content.style.display = isHidden ? "block" : "none";
      arrow.textContent = isHidden ? "▲" : "▼";
    });

    container!.appendChild(groupDiv);
  });
};
