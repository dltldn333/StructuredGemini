import { organizeChats } from "./organize";

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
