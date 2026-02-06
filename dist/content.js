"use strict";
console.log("Struct Gemini: TS Initialized ");
const scanChatItems = () => {
    const nav = document.querySelector("mat-sidenav");
    if (!nav) {
        console.log("Sidebar not found yet...");
        return;
    }
    const chatLinks = Array.from(nav.querySelectorAll('a[href^="/app/"]'));
    console.log(`Found ${chatLinks.length} chats.`);
    chatLinks.forEach((link) => {
        var _a;
        const id = (_a = link.getAttribute("href")) === null || _a === void 0 ? void 0 : _a.split("/app/")[1];
        link.style.border = "2px solid cyan";
        console.log(`ID: ${id}`);
    });
};
setTimeout(scanChatItems, 3000);
