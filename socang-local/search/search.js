import { getData } from '../utils/storage.js';

document.getElementById('searchInput').addEventListener('input', async (event) => {
  const query = event.target.value.toLowerCase();
  const data = await getData();
  const results = data.filter(item => 
    item.title.toLowerCase().includes(query) ||
    item.describe.toLowerCase().includes(query) ||
    item.instruction.toLowerCase().includes(query)
  );

  const searchResults = document.getElementById('searchResults').getElementsByTagName('tbody')[0];
  searchResults.innerHTML = '';
  results.forEach(item => {
    const row = searchResults.insertRow();
    const titleCell = row.insertCell(0);
    const descCell = row.insertCell(1);
    const instrCell = row.insertCell(2);

    titleCell.textContent = item.title;
    descCell.textContent = item.describe;
    instrCell.textContent = item.instruction;
  });
});