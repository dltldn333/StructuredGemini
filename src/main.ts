import { organizeChats } from "./organize";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isBusy = false;

const observer = new MutationObserver((mutations) => {
  if (isBusy) return;

  const hasNewNodes = mutations.some(m => m.addedNodes.length > 0);

  if (hasNewNodes) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      isBusy = true;
      try {
        await organizeChats();
        window.dispatchEvent(new CustomEvent("struct-gemini-refresh-popup"));
      } finally {
        isBusy = false;
      }
    }, 300);
  }
});

const start = () => {
  const sidebar = document.querySelector("#conversations-list-0") || document.body;
  observer.observe(sidebar, { childList: true, subtree: true });
  organizeChats();
};

if (document.readyState === "complete") {
  setTimeout(start, 1000);
} else {
  window.addEventListener("load", () => setTimeout(start, 1000));
}
