import { organizeChats } from "./organize";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isBusy = false;

// 스크롤 시 추가되는 항목을 더 잘 감지하기 위해 targetNode와 필터 수정
const observer = new MutationObserver((mutations) => {
  if (isBusy) return;

  // 노드가 추가되었는지 확인 (삭제는 무시하여 성능 향상)
  const hasAddedNodes = mutations.some(m => m.addedNodes.length > 0);

  if (hasAddedNodes) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      isBusy = true;
      try {
        await organizeChats();
        
        // 팝업이 열려있다면 팝업 내 리스트도 갱신 신호를 보냄
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
  console.log("struct Gemini: Observer Started on sidebar");
  organizeChats();
};

if (document.readyState === "complete") {
  setTimeout(start, 1000);
} else {
  window.addEventListener("load", () => setTimeout(start, 1000));
}
