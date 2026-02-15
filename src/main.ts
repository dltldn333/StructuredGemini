import { organizeChats } from "./organize";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isBusy = false;

const observer = new MutationObserver((mutations) => {
  if (isBusy) return;

  // 새로운 노드가 추가되었을 때만 실행
  const hasNewNodes = mutations.some(m => m.addedNodes.length > 0);

  if (hasNewNodes) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      isBusy = true;
      try {
        await organizeChats();
        // 팝업이 열려있을 경우 리스트 갱신을 위한 커스텀 이벤트 발생
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
  console.log("struct Gemini: Observer Active");
  organizeChats();
};

if (document.readyState === "complete") {
  setTimeout(start, 1000);
} else {
  window.addEventListener("load", () => setTimeout(start, 1000));
}
