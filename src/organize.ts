import { injectGroupContainers } from "./inject";

export const organizeChats = () => {
  const nav = document.querySelector<HTMLElement>("#conversations-list-0");
  if (!nav) return false;

  injectGroupContainers(nav);

  const chatLinks = Array.from(
    nav.querySelectorAll<HTMLAnchorElement>('a[href^="/app/"]:not([data-struct-organized])'),
  );

  if (chatLinks.length === 0) return false;

  let changed = false;
  chatLinks.forEach((link) => {
    // Double check it's not already in a container (though the selector should handle it)
    if (link.closest(".struct-container")) {
        link.setAttribute("data-struct-organized", "true");
        return;
    }

    const id = link.getAttribute("href")?.split("/app/")[1];
    if (!id) return;

    const chatItem = link.closest(".conversation-items-container");
    if (!chatItem) return;

    const targetGroupId =
      id.charCodeAt(id.length - 1) % 2 === 0 ? "study" : "misc";

    const targetContainer = document.querySelector(
      `#group-${targetGroupId} .group-content`,
    );

    if (targetContainer) {
      targetContainer.appendChild(chatItem);
      link.setAttribute("data-struct-organized", "true");
      changed = true;
    }
  });

  return changed;
};
