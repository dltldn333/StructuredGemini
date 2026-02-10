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
  popup.innerHTML = /* html */ `
    <h2>Create New Group</h2>
    <label for="group-name">Group Name:</label>
    <input type="text" id="group-name" name="group-name" />
    <br />
    <label for="group-color">Group Color:</label>
    <input type="color" id="group-color" name="group-color" value="#0000ff" />
    <br /><br />
    <div class="button-group">
      <button id="create-group-btn">Create Group</button>
      <button id="cancel-group-btn">Cancel</button>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = /* css */ `
    #group-management-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #2a2a2a;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      width: 400px;
      z-index: 10000;
      border: 1px solid #444;
    }
    #group-management-popup h2 {
      margin-top: 0;
      margin-bottom: 15px;
      color: white;
    }
    #group-management-popup label {
      display: block;
      margin-bottom: 5px;
      color: white;
      text-align: left;
    }
    #group-management-popup input[type="text"] {
      width: 100%;
      padding: 8px;
      margin-bottom: 15px;
      border: 1px solid #444;
      border-radius: 4px;
      background: #1e1e1e;
      color: white;
      box-sizing: border-box;
    }
    #group-management-popup input[type="color"] {
      width: 100%;
      height: 40px;
      padding: 2px;
      margin-bottom: 15px;
      border: 1px solid #444;
      border-radius: 4px;
      background: #1e1e1e;
      cursor: pointer;
    }
    #group-management-popup .button-group {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    #group-management-popup button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
      font-weight: 500;
    }
    #group-management-popup #create-group-btn {
      background-color: #007bff;
    }
    #group-management-popup #create-group-btn:hover {
      background-color: #0056b3;
    }
    #group-management-popup #cancel-group-btn {
      background-color: #6c757d;
    }
    #group-management-popup #cancel-group-btn:hover {
      background-color: #5a6268;
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(popup);

  const cancelBtn = popup.querySelector("#cancel-group-btn");
  cancelBtn?.addEventListener("click", () => {
    popup.remove();
  });
};
