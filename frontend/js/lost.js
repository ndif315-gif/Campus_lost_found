document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('photo');
    const fileLabel = document.getElementById('file-label');
    const fileNameDisplay = document.getElementById('fileName');

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileNameDisplay.textContent = `Selected: ${fileInput.files[0].name}`;
                fileNameDisplay.style.display = 'block';
                fileLabel.style.display = 'none';
            }
        });

        ['dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, e => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('dragover');
            fileInput.files = e.dataTransfer.files;
            if (fileInput.files.length > 0) {
                fileNameDisplay.textContent = `Selected: ${fileInput.files[0].name}`;
                fileNameDisplay.style.display = 'block';
                fileLabel.style.display = 'none';
            }
        });
    }

    const form = document.getElementById('reportLostForm');
    if (form) {
        form.addEventListener('submit', handleReportLost);
    }
});

async function handleReportLost(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = new FormData();
    formData.append('category', document.getElementById('category').value);
    formData.append('item_name', document.getElementById('itemName').value);
    formData.append('brand', document.getElementById('brand').value);
    formData.append('color', document.getElementById('color').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('last_seen_location', document.getElementById('location').value);
    
    const fileInput = document.getElementById('photo');
    if (fileInput.files[0]) {
        formData.append('photo', fileInput.files[0]);
    }

    try {
        const response = await fetch(`${Config.API_URL}/lost/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData // Fetch handles boundaries for FormData
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.textContent = data.message || 'Failed to submit report';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        errorMessage.textContent = 'Network error. Please try again.';
        errorMessage.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Report';
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
