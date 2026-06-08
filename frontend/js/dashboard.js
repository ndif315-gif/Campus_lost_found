function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

function updateUI() {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = userData.userName || localStorage.getItem('userName') || 'Student';
    const welcomeName = document.getElementById('welcomeName');
    if (welcomeName) welcomeName.textContent = `Hello, ${userName}!`;
    
    const welcomeDate = document.getElementById('welcomeDate');
    if (welcomeDate) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        welcomeDate.textContent = new Date().toLocaleDateString(undefined, options);
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
    
    const activePanel = document.getElementById(`${tabName}Tab`);
    if (activePanel) activePanel.classList.add('active');
    
    // Find button using onclick or text content
    const buttons = document.querySelectorAll('.tab-link');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(tabName)) {
            btn.classList.add('active');
        }
    });

    if (tabName === 'lostItems') loadLostItems();
    if (tabName === 'foundItems') loadFoundItems();
    if (tabName === 'matches') loadMatches();
}

const itemPlaceholder = (name) => `
    <div class="item-image">
        <svg class="placeholder-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
    </div>
`;

function createItemCard(item, type) {
    const isLost = type === 'lost';
    const date = new Date(item.created_at || Date.now()).toLocaleDateString();
    const location = isLost ? item.last_seen_location : item.found_location;
    const imageSource = item.image_path || item.image_url || null;
    const imagePath = imageSource ? `${Config.API_URL}${imageSource}` : null;
    
    return `
        <div class="item-card">
            ${imagePath ? `<div class="item-image"><img src="${imagePath}" alt="${item.item_name}"></div>` : itemPlaceholder(item.item_name)}
            <div class="item-details">
                <span class="item-category">${item.category}</span>
                <h3 class="item-name">${item.item_name}</h3>
                <div class="item-meta">
                    <div class="meta-row">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span>${location}</span>
                    </div>
                    <div class="meta-row">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        <span>${date}</span>
                    </div>
                </div>
                <div class="item-footer">
                    <span class="status-badge ${item.status === 'matched' ? 'active' : 'pending'}">${item.status || 'Active'}</span>
                    <button class="btn btn-ghost btn-sm">Details</button>
                </div>
            </div>
        </div>
    `;
}

async function loadLostItems() {
    if (!checkAuth()) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${Config.API_URL}/lost`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const payload = await response.json();
        const data = Array.isArray(payload) ? payload : (payload.items || []);
        const list = document.getElementById('lostItemsList');
        document.getElementById('lostCount').textContent = data.length;
        
        if (data.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="15"/><line x1="15" x2="9" y1="9" y2="15"/></svg>
                    <p>You haven't reported any lost items yet.</p>
                    <a href="report-lost.html" class="btn btn-primary btn-sm">Report Now</a>
                </div>`;
            return;
        }
        list.innerHTML = data.map(item => createItemCard(item, 'lost')).join('');
    } catch (error) {
        console.error('Error loading lost items:', error);
    }
}

async function loadFoundItems() {
    if (!checkAuth()) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${Config.API_URL}/found`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const payload = await response.json();
        const data = Array.isArray(payload) ? payload : (payload.items || []);
        const list = document.getElementById('foundItemsList');
        document.getElementById('foundCount').textContent = data.length;
        
        if (data.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <p>No found items reported by you.</p>
                    <a href="report-found.html" class="btn btn-primary btn-sm">Report Item</a>
                </div>`;
            return;
        }
        list.innerHTML = data.map(item => createItemCard(item, 'found')).join('');
    } catch (error) {
        console.error('Error loading found items:', error);
    }
}

async function loadMatches() {
    // Basic implementation for matches
    const list = document.getElementById('matchesList');
    list.innerHTML = `
        <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3l-1.5 5.5Z"/></svg>
            <p>Scanning for potential matches...</p>
        </div>`;
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    updateUI();
    loadLostItems();
});

// Polyfill for btn-sm since it might not be in base CSS yet
const style = document.createElement('style');
style.textContent = `
    .btn-sm { padding: 4px 12px; font-size: 0.8rem; border-radius: var(--radius-md); }
    .tab-link:focus { outline: none; }
`;
document.head.appendChild(style);
