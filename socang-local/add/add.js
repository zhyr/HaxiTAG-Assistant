import { saveData, getData } from '../utils/storage.js';
import { generateId } from '../utils/idGenerator.js';

document.getElementById('addForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = document.getElementById('title').value;
  const describe = document.getElementById('describe').value;
  const instruction = document.getElementById('instruction').value;

  const newItem = {
    id: generateId(),
    title,
    describe,
    instruction
  };

  const data = await getData();
  data.push(newItem);
  await saveData(data);

  alert('Item added successfully!');
  window.close();
});