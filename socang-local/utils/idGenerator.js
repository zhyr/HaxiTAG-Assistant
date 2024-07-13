export function generateId() {
  const timestamp = Date.now().toString();
  const randomLetters = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `${timestamp}-${randomLetters}`;
}