import { injectGroupContainers } from "./inject";
import { StructGroup } from "./type";

export const organizeChats = async () => {
  const nav = document.querySelector<HTMLElement>("#conversations-list-0");
  if (!nav) return;

  // 그룹 컨테이너가 없으면 주입 (비동기)
  await injectGroupContainers(nav);

  const result = await chrome.storage.local.get(["groups", "chatMapping"]);
  const groups = (result.groups as StructGroup[]) || [];
  const chatMapping = (result.chatMapping as Record<string, string>) || {};

  if (groups.length === 0) return;

  const chatLinks = Array.from(
    nav.querySelectorAll<HTMLAnchorElement>('a[href^="/app/"]:not([data-struct-organized])'),
  );

  chatLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    
    const chatId = href.split("/app/")[1];
    if (!chatId) return;

    // 매핑 데이터에 있는 경우에만 이동
    const targetGroupId = chatMapping[chatId];
    if (targetGroupId) {
      const targetContainer = document.querySelector(`#group-${targetGroupId} .group-content`);
      const chatItem = link.closest(".conversation-items-container");
      
      if (targetContainer && chatItem) {
        targetContainer.appendChild(chatItem);
        link.setAttribute("data-struct-organized", "true");
      }
    }
  });
};
