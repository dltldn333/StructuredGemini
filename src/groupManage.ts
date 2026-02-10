export const addGroup = () => {
  const titleSection = document.querySelector<HTMLElement>(
    "conversations-list .title-container",
  );

  if (!titleSection) {
    console.log("struct Gemini: 타이틀 없음");
    return;
  }

  titleSection.style.display = "flex";
  titleSection.style.flexDirection = "row";
  titleSection.style.justifyContent = "space-between";
  titleSection.style.position = "relative";

  const groupBtn = document.createElement("button");
  groupBtn.innerText = "add group +";
  groupBtn.id = "group-add-btn";
  const style = document.createElement("style");
  style.textContent = /* css */ `
    #group-add-btn {
      margin-left: 10px;
      padding: 5px 10px;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
      background-color: rgba(255, 255, 255, 0.1);
      padding: 5px 10px;
      margin-right: 10px;
    }
    #group-add-btn:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  `;

  groupBtn.onclick = () => {
    makeGroupPopup();
  };

  document.head.appendChild(style);
  titleSection.appendChild(groupBtn);
};

const makeGroupPopup = () => {
  const popup = document.createElement("div");
  popup.id = "group-management-popup";
  
  // Find unassigned chats
  const nav = document.querySelector<HTMLElement>("#conversations-list-0");
  const chatLinks = nav ? Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="/app/"]')) : [];
  const unassignedChats = chatLinks.filter(link => !link.closest(".struct-container"));

  popup.innerHTML = /* html */ `
    <h2>Create New Group</h2>
    <div class="input-row">
      <div class="field-group" style="flex: 1;">
        <label for="group-name">Group Name</label>
        <input type="text" id="group-name" name="group-name" placeholder="Enter group name" />
      </div>
      <div class="field-group" style="width: 80px;">
        <label for="group-color">Color</label>
        <input type="color" id="group-color" name="group-color" value="#8ab4f8" />
      </div>
    </div>
    
    <div class="toggle-section">
      <button id="toggle-chats-btn" type="button">Select Unassigned Chats (${unassignedChats.length}) ▼</button>
      <div id="unassigned-chats-list" class="hidden">
        ${unassignedChats.length > 0 ? '' : '<div class="no-chats">No unassigned chats found</div>'}
      </div>
    </div>

    <div class="button-group">
      <button id="create-group-btn">Create Group</button>
      <button id="cancel-group-btn">Cancel</button>
    </div>
  `;

  const chatsListContainer = popup.querySelector('#unassigned-chats-list');
  if (chatsListContainer && unassignedChats.length > 0) {
    unassignedChats.forEach((link, index) => {
      const title = link.textContent?.trim() || link.getAttribute('aria-label') || "Untitled Chat";
      const id = link.getAttribute('href')?.split('/app/')[1] || `chat-${index}`;
      
      const item = document.createElement('div');
      item.className = 'chat-selection-item';
      item.innerHTML = `
        <input type="checkbox" id="check-${id}" value="${id}" />
        <label for="check-${id}" title="${title}">${title}</label>
      `;
      chatsListContainer.appendChild(item);
    });
  }

  const style = document.createElement("style");
  style.textContent = /* css */ `
    #group-management-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #2a2a2a;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      width: 450px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      z-index: 10000;
      border: 1px solid #444;
      font-family: 'Google Sans', sans-serif;
    }
    #group-management-popup h2 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #e3e3e3;
      font-size: 20px;
      text-align: center;
    }
    .input-row {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      align-items: flex-start;
    }
    .field-group {
      display: flex;
      flex-direction: column;
    }
    #group-management-popup label {
      margin-bottom: 6px;
      color: #c4c7c5;
      font-size: 13px;
      text-align: left;
    }
    #group-management-popup input[type="text"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #555;
      border-radius: 6px;
      background: #1e1e1e;
      color: #e3e3e3;
      box-sizing: border-box;
      outline: none;
      height: 40px;
    }
    #group-management-popup input[type="text"]:focus {
      border-color: #8ab4f8;
    }
    #group-management-popup input[type="color"] {
      width: 100%;
      height: 40px;
      padding: 2px;
      border: 1px solid #555;
      border-radius: 6px;
      background: #1e1e1e;
      cursor: pointer;
      box-sizing: border-box;
    }

    .toggle-section {
      margin-bottom: 20px;
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    #toggle-chats-btn {
      width: 100%;
      background: transparent;
      border: 1px solid #555;
      color: #e3e3e3;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #toggle-chats-btn:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    #unassigned-chats-list {
      margin-top: 10px;
      border: 1px solid #444;
      border-radius: 6px;
      background: #1e1e1e;
      overflow-y: auto;
      transition: all 0.3s ease;
      flex: 1;
      min-height: 0; 
    }
    #unassigned-chats-list.hidden {
      display: none;
    }
    .chat-selection-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-bottom: 1px solid #333;
    }
    .chat-selection-item:last-child {
      border-bottom: none;
    }
    .chat-selection-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .chat-selection-item input[type="checkbox"] {
      margin-right: 10px;
      cursor: pointer;
    }
    .chat-selection-item label {
      margin-bottom: 0 !important;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .no-chats {
      padding: 10px;
      color: #888;
      text-align: center;
      font-style: italic;
    }

    .button-group {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid #333;
    }
    #group-management-popup button {
      padding: 8px 18px;
      border: none;
      border-radius: 18px;
      color: white;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    #group-management-popup #create-group-btn {
      background-color: #8ab4f8;
      color: #202124;
    }
    #group-management-popup #create-group-btn:hover {
      background-color: #aecbfa;
    }
    #group-management-popup #cancel-group-btn {
      background-color: transparent;
      color: #e3e3e3;
      border: 1px solid #555;
    }
    #group-management-popup #cancel-group-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(popup);

  // Event Listeners
  const toggleBtn = popup.querySelector("#toggle-chats-btn");
  const list = popup.querySelector("#unassigned-chats-list");
  
  toggleBtn?.addEventListener("click", () => {
    if (list) {
      list.classList.toggle("hidden");
      const isHidden = list.classList.contains("hidden");
      toggleBtn.innerHTML = `Select Unassigned Chats (${unassignedChats.length}) ${isHidden ? '▼' : '▲'}`;
    }
  });

  const cancelBtn = popup.querySelector("#cancel-group-btn");
  cancelBtn?.addEventListener("click", () => {
    popup.remove();
    style.remove(); // Clean up style tag too
  });
};
