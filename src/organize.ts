import { injectGroupContainers } from "./inject";
import { StructGroup } from "./type";

export const organizeChats = async () => {
  const nav = document.querySelector<HTMLElement>("#conversations-list-0");
  if (!nav) return;

  await injectGroupContainers(nav);

  const result = await chrome.storage.local.get(["groups", "chatMapping"]);
  const groups = (result.groups as StructGroup[]) || [];
  const chatMapping = (result.chatMapping as Record<string, string>) || {};

  const chatLinks = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="/app/"]'));

  chatLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const chatId = href?.split("/app/")[1];
    if (!chatId) return;

    const targetGroupId = chatMapping[chatId];
    const chatItem = link.closest(".conversation-items-container") as HTMLElement;
    if (!chatItem) return;

    // 해당 그룹이 실제로 존재하는지 확인
    const groupExists = groups.find(g => g.id === targetGroupId);

    if (targetGroupId && groupExists) {
      const targetContainer = document.querySelector(`#group-${targetGroupId} .group-content`);
      if (targetContainer && chatItem.parentElement !== targetContainer) {
        targetContainer.appendChild(chatItem);
      }
    } else {
      // 제외된 경우: 이미 그룹 안에 있다면 밖으로 꺼냄
      if (chatItem.parentElement?.classList.contains("group-content")) {
        const structContainer = nav.querySelector(".struct-container");
        if (structContainer) {
          structContainer.after(chatItem);
        } else {
          nav.prepend(chatItem);
        }
      }
    }
  });
};
