import { organizeChats } from "./organize";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const debouncedOrganize = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    organizeChats();
  }, 100);
};

const observer = new MutationObserver((mutations) => {
  // Only trigger if children are added or removed
  const hasRelevantChanges = mutations.some(
    (m) => m.type === "childList" && m.addedNodes.length > 0,
  );

  if (hasRelevantChanges) {
    debouncedOrganize();
  }
});

const startObserver = () => {
  // Try to find a more specific container than body if possible
  const targetNode = document.querySelector("#conversations-list-0")?.parentElement || document.body;
  
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
  });
  
  console.log(`struct Gemini: Observer Attached to ${targetNode === document.body ? "body" : "nav parent"}.`);
  
  // Initial run
  organizeChats();
};

// Start observing as soon as possible, but with a slight delay for initial load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => setTimeout(startObserver, 500));
} else {
  setTimeout(startObserver, 500);
}
