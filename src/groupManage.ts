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

  const groupBtn = document.createElement("button");
  groupBtn.innerText = "그룹 추가 +";
  groupBtn.style.marginLeft = "10px";
  groupBtn.style.padding = "5px 10px";
  groupBtn.style.border = "none";
  groupBtn.style.borderRadius = "4px";
  groupBtn.style.color = "white";
  groupBtn.style.cursor = "pointer";
  groupBtn.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
  groupBtn.style.padding = "5px 10px";
  groupBtn.style.marginRight = "10px";

  groupBtn.onclick = () => {
    console.log("struct Gemini: 그룹 관리 버튼 클릭됨");
  };

  titleSection.appendChild(groupBtn);
};
