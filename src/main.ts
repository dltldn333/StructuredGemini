import { organizeChats } from "./organize";

let isRunning = false;
let timeout: ReturnType<typeof setTimeout> | null = null;

const observer = new MutationObserver(() => {
  if (isRunning) return;
  
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(async () => {
    isRunning = true;
    try {
      await organizeChats();
    } finally {
      isRunning = false;
    }
  }, 300); // 300ms 디바운스
});

const startObserver = () => {
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("struct Gemini: Observer Attached.");
  organizeChats();
};

setTimeout(startObserver, 1000);
