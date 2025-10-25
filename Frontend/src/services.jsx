// src/services/api.js
export const fetchData = async () => {
    const response = await fetch('/api/your-endpoint');
    return await response.json();
  };