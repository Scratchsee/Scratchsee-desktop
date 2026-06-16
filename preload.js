const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // Yenilenen Doğrudan Scratch API İstek Fonksiyonu
  fetchScratch: async (endpoint) => {
    try {
      // Eğer gelen parametre tam bir URL ise direkt kullan, değilse api.scratch uç noktasını ekle
      const targetUrl = endpoint.startsWith('http') ? endpoint : `https://api.scratch.mit.edu/${endpoint}`;
      
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error(`API hatası: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Scratchsee API Bağlantı Hatası:", error);
      return null;
    }
  }
});