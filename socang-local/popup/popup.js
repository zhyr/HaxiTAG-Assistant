import { getData, saveData } from '../utils/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const dataList = document.getElementById('dataList').getElementsByTagName('tbody')[0];
  const addButton = document.getElementById('addButton');
  const searchButton = document.getElementById('searchButton');

  async function loadTable() {
    const data = await getData();
    dataList.innerHTML = '';
    data.forEach(item => {
      const row = dataList.insertRow();
      const actionCell = row.insertCell(0);
      const titleCell = row.insertCell(1);
      const descCell = row.insertCell(2);
      const instrCell = row.insertCell(3);

      actionCell.innerHTML = `<button class="deleteBtn" data-id="${item.id}">Delete</button>`;
      titleCell.textContent = item.title;
      descCell.textContent = item.describe;
      instrCell.innerHTML = `<span class="instrPreview">${item.instruction.slice(0, 80)}${item.instruction.length > 80 ? '...' : ''}</span>
                             <button class="copyBtn" data-instruction="${item.instruction}">Copy</button>`;

      instrCell.querySelector('.copyBtn').addEventListener('click', async function() {
        try {
          await navigator.clipboard.writeText(item.instruction);
          showCopySuccessMessage();
        } catch (err) {
          console.error('Failed to copy: ', err);
        }
      });

      actionCell.querySelector('.deleteBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this item?')) {
          const newData = data.filter(d => d.id !== this.dataset.id);
          saveData(newData).then(loadTable);
        }
      });
    });
  }

  function showCopySuccessMessage() {
    const message = document.createElement('div');
    message.textContent = 'Copied to clipboard';
    message.style.position = 'fixed';
    message.style.bottom = '20px';
    message.style.right = '20px';
    message.style.backgroundColor = 'green';
    message.style.color = 'white';
    message.style.padding = '10px';
    message.style.borderRadius = '5px';
    document.body.appendChild(message);
    setTimeout(() => {
      document.body.removeChild(message);
    }, 2000);
  }

  addButton.addEventListener('click', () => {
    chrome.tabs.create({ url: '../add/add.html' });
  });

  searchButton.addEventListener('click', () => {
    chrome.tabs.create({ url: '../search/search.html' });
  });

  loadTable();
});