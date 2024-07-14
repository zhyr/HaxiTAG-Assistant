import { getData, saveData } from "../utils/storage.js";

document.addEventListener("DOMContentLoaded", async () => {
  const dataList = document
    .getElementById("dataList")
    .getElementsByTagName("tbody")[0];
  const addButton = document.getElementById("addButton");
  const searchButton = document.getElementById("searchButton");
  const editButton = document.getElementById("editButton");

  let isEditing = false;

  async function loadTable() {
    const data = await getData();
    dataList.innerHTML = "";
    data.forEach((item) => {
      const row = dataList.insertRow();
      row.dataset.id = item.id;
      const actionCell = row.insertCell(0);
      const titleCell = row.insertCell(1);
      const descCell = row.insertCell(2);
      const instrCell = row.insertCell(3);

      actionCell.innerHTML = `<button class="copyBtn" data-instruction="${item.instruction}">Copy</button>`;
      titleCell.textContent = item.title;
      descCell.textContent = item.describe;
      instrCell.innerHTML = `<span class="instrPreview">${item.instruction.slice(0, 80)}${item.instruction.length > 80 ? "..." : ""}</span>`;
      instrCell.className = "instrCell";
      instrCell.title = "Double-click to copy instruction";

      actionCell
        .querySelector(".copyBtn")
        .addEventListener("click", function () {
          copyToClipboard(item.instruction);
        });

      instrCell.addEventListener("dblclick", function () {
        copyToClipboard(item.instruction);
      });
    });
  }

  function toggleEditMode() {
    isEditing = !isEditing;
    const rows = dataList.getElementsByTagName("tr");
    for (let row of rows) {
      if (isEditing) {
        const overlay = document.createElement("div");
        overlay.className = "overlay";
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "deleteBtn";
        deleteBtn.addEventListener("click", function () {
          if (confirm("Are you sure you want to delete this item?")) {
            deleteItem(row.dataset.id);
          }
        });
        overlay.appendChild(deleteBtn);
        row.appendChild(overlay);
      } else {
        const overlay = row.querySelector(".overlay");
        if (overlay) {
          row.removeChild(overlay);
        }
      }
    }
    editButton.textContent = isEditing ? "Done" : "Edit";
  }

  async function deleteItem(id) {
    const data = await getData();
    const newData = data.filter((d) => d.id !== id);
    await saveData(newData);
    loadTable();
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showMessage("Copied to clipboard", "green");
    } catch (err) {
      console.error("Failed to copy: ", err);
      showMessage("Failed to copy", "red");
    }
  }

  function showMessage(text, color) {
    const message = document.createElement("div");
    message.textContent = text;
    message.style.position = "fixed";
    message.style.bottom = "20px";
    message.style.right = "20px";
    message.style.backgroundColor = color;
    message.style.color = "white";
    message.style.padding = "10px";
    message.style.borderRadius = "5px";
    document.body.appendChild(message);
    setTimeout(() => {
      document.body.removeChild(message);
    }, 2000);
  }

  addButton.addEventListener("click", () => {
    chrome.tabs.create({ url: "../add/add.html" });
  });

  searchButton.addEventListener("click", () => {
    chrome.tabs.create({ url: "../search/search.html" });
  });

  editButton.addEventListener("click", toggleEditMode);

  loadTable();
});
