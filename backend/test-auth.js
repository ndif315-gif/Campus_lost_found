require('dotenv').config();

const url = 'http://localhost:5000/api/auth';
const email = `testuser_${Date.now()}@example.com`;
const studentId = `TEST${Date.now()}`;
const password = 'TestPass123!';

async function request(path, body) {
    try {
        const response = await fetch(`${url}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json().catch(() => null);
        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        return { ok: false, error: error.message };
    }
}

(async () => {
    console.log('Testing auth endpoints on', url);

    const registerResult = await request('/register', {
        full_name: 'Test User',
        student_id: studentId,
        email,
        password,
        language: 'en'
    });

    console.log('Register result:', registerResult);

    if (!registerResult.ok && registerResult.status !== 409) {
        console.error('Register failed unexpectedly.');
        process.exitCode = 1;
        return;
    }

    const loginResult = await request('/login', { email, password });
    console.log('Login result:', loginResult);

    if (!loginResult.ok) {
        console.error('Login did not succeed.');
        process.exitCode = 1;
        return;
    }

    if (!loginResult.data?.token) {
        console.error('Login response did not include a token.');
        process.exitCode = 1;
        return;
    }

    console.log('Login succeeded. Token length:', loginResult.data.token.length);
})();
