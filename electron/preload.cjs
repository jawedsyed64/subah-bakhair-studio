const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  isElectron: true,
  storeGet: (key) => ipcRenderer.invoke('store:get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store:set', key, value),
  secretsStatus: () => ipcRenderer.invoke('secrets:status'),
  setSecret: (name, value) => ipcRenderer.invoke('secrets:set', name, value),
  aiMessage: (args) => ipcRenderer.invoke('ai:message', args),
  aiImage: (args) => ipcRenderer.invoke('ai:image', args),
  saveImage: (args) => ipcRenderer.invoke('file:saveImage', args),
  copyImage: (dataUrl) => ipcRenderer.invoke('clipboard:image', dataUrl),
  copyText: (text) => ipcRenderer.invoke('clipboard:text', text),
  openExternal: (url) => ipcRenderer.invoke('shell:open', url),
  showFile: (p) => ipcRenderer.invoke('shell:showFile', p)
});
