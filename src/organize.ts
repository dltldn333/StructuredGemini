import { injectGroupContainers } from "./inject";

export const organizeChats = () => {
  const nav = document.querySelector<HTMLElement>("#conversations-list-0");
  if (!nav) {
    console.log("struct Gemini: Navigation bar not found.");
    return;
  }

  injectGroupContainers(nav);

  const chatLinks = Array.from(
    nav.querySelectorAll<HTMLAnchorElement>('a[href^="/app/"]'),
  );

  chatLinks.forEach((link) => {
    if (link.closest(".struct-container")) return;

    const id = link.getAttribute("href")?.split("/app/")[1];
    if (!id) return;

    const chatItem = link.closest(".conversation-items-container");
    if (!chatItem) return;

    const targetGroupId =
      id.charCodeAt(id.length - 1) % 2 === 0 ? "study" : "misc";

    const targetContainer = document.querySelector(
      // `#group-${targetGroupId} .group-content`,
      `#group-${targetGroupId} .group-content`,
    );

    if (targetContainer) {
      targetContainer.appendChild(chatItem);
    }
  });
};
