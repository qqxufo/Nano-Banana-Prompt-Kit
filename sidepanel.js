// sidepanel.js - handles side panel functionality

async function loadPrompts() {
  const url = chrome.runtime.getURL('prompts.json');
  const response = await fetch(url);
  return response.json();
}

/**
 * Render the prompt list based on search and category filters.
 */
function renderList(prompts, searchValue, category) {
  const list = document.getElementById('list');
  list.innerHTML = '';
  
  const search = searchValue.toLowerCase();
  const filtered = prompts.filter((p) => {
    const matchCategory = category === 'All' || p.category === category;
    const text = (p.title + ' ' + p.desc + ' ' + p.prompt + ' ' + (p.tags || '')).toLowerCase();
    const matchSearch = text.includes(search);
    return matchCategory && matchSearch;
  });
  
  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3>No prompts found</h3>
        <p>Try different keywords or categories</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'card';
    
    card.innerHTML = `
      <div class="card-header">
        <div style="flex: 1;">
          <div class="card-title">${escapeHtml(p.title)}</div>
          ${p.uses ? `<div class="card-uses">Used ${p.uses.toLocaleString()} times</div>` : ''}
        </div>
        <span class="card-category">${escapeHtml(p.category)}</span>
      </div>
      ${p.desc ? `<div class="card-desc">${escapeHtml(p.desc)}</div>` : ''}
      <div class="card-prompt">${escapeHtml(p.prompt)}</div>
      <div class="card-actions">
        <button class="btn btn-copy" data-action="copy" data-prompt="${escapeHtml(p.prompt)}">
          <span>Copy</span>
        </button>
        <a href="#" class="btn btn-link" data-action="use" data-prompt="${escapeHtml(p.prompt)}">
          Use in Editor
        </a>
      </div>
    `;
    
    list.appendChild(card);
  });
  
  // Add event listeners
  document.querySelectorAll('[data-action="copy"]').forEach(btn => {
    btn.addEventListener('click', handleCopy);
  });
  
  document.querySelectorAll('[data-action="use"]').forEach(link => {
    link.addEventListener('click', handleUseNow);
  });
}

function handleCopy(e) {
  e.preventDefault();
  const btn = e.currentTarget;
  const prompt = btn.getAttribute('data-prompt');
  
  navigator.clipboard.writeText(prompt).then(() => {
    const originalHTML = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = '<span>Copied!</span>';
    
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = originalHTML;
    }, 2000);
  });
}

function handleUseNow(e) {
  e.preventDefault();
  const link = e.currentTarget;
  const prompt = link.getAttribute('data-prompt');
  
  // Open NanaVis editor with the prompt pre-filled and UTM parameters
  const editorUrl = `https://nanavis.com/tools/nano-banana?utm_source=chrome_extension&utm_medium=sidepanel&utm_campaign=nano_banana_prompts&prompt=${encodeURIComponent(prompt)}`;
  window.open(editorUrl, '_blank');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateStats(prompts, categories) {
  document.getElementById('total-count').textContent = prompts.length;
  document.getElementById('category-count').textContent = categories.length;
}

// Initialize the side panel on load
loadPrompts().then((prompts) => {
  const categorySelect = document.getElementById('category');
  const searchInput = document.getElementById('search');
  
  // Build categories list
  const categories = Array.from(new Set(prompts.map((p) => p.category))).sort();
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
  
  // Update stats
  updateStats(prompts, categories);
  
  // Event handlers
  function update() {
    renderList(prompts, searchInput.value.trim(), categorySelect.value);
  }
  
  searchInput.addEventListener('input', update);
  categorySelect.addEventListener('change', update);
  
  // Initial render
  update();
});
