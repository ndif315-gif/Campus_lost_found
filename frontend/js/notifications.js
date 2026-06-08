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
    window.location.href = 'login.html';
}

async function loadNotifications() {
    if (!checkAuth()) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${Config.API_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const container = document.getElementById('notificationsList');

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                    <p>No new notifications at the moment.</p>
                </div>`;
            return;
        }

        container.innerHTML = data.map(n => `
            <div class="notification-card ${n.is_read ? '' : 'unread'}">
                <div class="notif-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
                <div class="notif-content">
                    <h4>${n.type || 'System Notification'}</h4>
                    <p>${n.message}</p>
                    <span class="notif-time">${new Date(n.created_at).toLocaleString()}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

async function markAllAsRead() {
    const token = localStorage.getItem('token');
    try {
        await fetch(`${Config.API_URL}/notifications/read-all`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadNotifications();
    } catch (error) {
        console.error('Error marking as read:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadNotifications);
