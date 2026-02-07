console.log("struct Gemini: Loaded.");

interface StructGroup {
  id: string;
  name: string;
  color: string;
}

const GROUPS: StructGroup[] = [
  { id: "study", name: "struct Study", color: "#81D4FA" },
  { id: "misc", name: "struct Misc", color: "#E0E0E0" },
];

const chatMap: Record<string, string> = {};

const injectGroupContainers = (nav: HTMLElement) => {
  if (nav.querySelector(".struct-container")) return;

  const container = document.createElement("div");
  container.className = "struct-container";
  container.style.padding = "10px";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "10px";

  GROUPS.forEach((group) => {
    const groupDiv = document.createElement("div");
    groupDiv.id = `group-${group.id}`;
    groupDiv.innerHTML = `
      <div style="
        font-size: 12px; 
        font-weight: bold; 
        color: ${group.color}; 
        margin-bottom: 5px; 
        font-family: monospace;">
        ${group.name} {
      </div>
      <div class="group-content" style="padding-left: 10px; border-left: 2px solid ${group.color}33;"></div>
      <div style="
        font-size: 12px; 
        color: ${group.color}; 
        margin-top: 5px; 
        font-family: monospace;">
      }
      </div>
    `;
    container.appendChild(groupDiv);
  });

  nav.prepend(container);
};

const organizeChats = () => {
  const nav =
    document.querySelector<HTMLElement>("mat-sidenav") ||
    document.querySelector<HTMLElement>("bard-sidenav");
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

    const targetGroupId =
      id.charCodeAt(id.length - 1) % 2 === 0 ? "study" : "misc";

    const targetContainer = document.querySelector(
      `#group-${targetGroupId} .group-content`,
    );

    if (targetContainer) {
      targetContainer.appendChild(link);

      link.style.display = "flex";
      link.style.marginBottom = "2px";
    }
  });
};

const observer = new MutationObserver((mutations) => {
  organizeChats();
});

const startObserver = () => {
  const body = document.querySelector("body");
  if (body) {
    observer.observe(body, { childList: true, subtree: true });
    console.log("struct Gemini: Observer Attached.");
  }
};

setTimeout(startObserver, 1000);
