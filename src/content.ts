console.log("Struct Gemini: TS Initialized ");


const scanChatItems = (): void => {
  const nav = document.querySelector<HTMLElement>("mat-sidenav");

  if (!nav) {
    console.log("Sidebar not found yet...");
    return;
  }

  const chatLinks = Array.from(
    nav.querySelectorAll<HTMLAnchorElement>('a[href^="/app/"]'),
  );

  console.log(`Found ${chatLinks.length} chats.`);

  chatLinks.forEach((link) => {
    const id: string | undefined = link.getAttribute("href")?.split("/app/")[1];
    link.style.border = "2px solid cyan";
    console.log(`ID: ${id}`);
  });
};

setTimeout(scanChatItems, 3000);
