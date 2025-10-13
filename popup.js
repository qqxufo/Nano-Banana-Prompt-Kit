// popup.js - handles popup interactions

document.getElementById('openSidebar').addEventListener('click', async () => {
  // Open the side panel
  await chrome.sidePanel.open({ windowId: (await chrome.windows.getCurrent()).id });
  window.close();
});

document.getElementById('openEditor').addEventListener('click', () => {
  // Open NanaVis editor with UTM parameters
  const editorUrl = 'https://nanavis.com/tools/nano-banana?utm_source=chrome_extension&utm_medium=popup&utm_campaign=nano_banana_prompts';
  chrome.tabs.create({ url: editorUrl });
  window.close();
});
