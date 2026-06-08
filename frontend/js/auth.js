class AuthApi {
    static get baseUrl() {
        return Config.API_URL;
    }

    static get endpoints() {
        return {
            login: `${this.baseUrl}${Config.ENDPOINTS.AUTH.LOGIN}`,
            register: `${this.baseUrl}${Config.ENDPOINTS.AUTH.REGISTER}`
        };
    }

    static async request(url, payload) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        let data;
        try {
            data = await response.json();
        } catch (error) {
            data = { message: 'Invalid server response' };
        }

        return {
            ok: response.ok,
            status: response.status,
            data
        };
    }

    static async login(email, password) {
        return this.request(this.endpoints.login, { email, password });
    }

    static async register(userData) {
        return this.request(this.endpoints.register, userData);
    }
}

async function register() {
    const full_name = document.getElementById("full_name")?.value || "";
    const student_id = document.getElementById("student_id")?.value || "";
    const email = document.getElementById("email")?.value || "";
    const password = document.getElementById("password")?.value || "";
    const language = document.getElementById("language")?.value || "en";

    const response = await AuthApi.register({
        full_name,
        student_id,
        email,
        password,
        language
    });

    if (response.ok && response.data.success) {
        window.location.href = "login.html";
        return;
    }

    alert(response.data.message || "Registration failed");
}
