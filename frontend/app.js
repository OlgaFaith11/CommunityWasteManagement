const API_URL = "http://localhost:5000/api";

// GET HTML ELEMENTS
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

const message = document.getElementById("message");
const registerMessage = document.getElementById("registerMessage");

const registerText = document.querySelector(".register-text");
const subtitle = document.querySelector(".subtitle");


// SWITCH TO REGISTRATION
showRegister.addEventListener("click", (event) => {
    event.preventDefault();

    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");

    registerText.classList.add("hidden");
    subtitle.classList.add("hidden");

    document.querySelector(".login-box h2").textContent =
        "Create Account";
});


// SWITCH BACK TO LOGIN
showLogin.addEventListener("click", (event) => {
    event.preventDefault();

    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");

    registerText.classList.remove("hidden");
    subtitle.classList.remove("hidden");

    document.querySelector(".login-box h2").textContent =
        "Welcome Back!";

    registerMessage.textContent = "";
});


// RESIDENT REGISTRATION
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    registerMessage.textContent = "Creating your account...";

    const residentData = {
        fullName: document.getElementById("fullName").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("regEmail").value,
        address: document.getElementById("address").value,
        houseNumber: document.getElementById("houseNumber").value,
        password: document.getElementById("regPassword").value
    };

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(residentData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Registration failed.");
        }

        registerMessage.textContent =
            "Registration successful! You can now log in.";

        registerMessage.style.color = "green";

        registerForm.reset();

    } catch (error) {
        registerMessage.textContent = error.message;
        registerMessage.style.color = "red";
    }
});


// USER LOGIN
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "Signing in...";

    const loginData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed.");
        }

        // SAVE LOGIN DETAILS
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.userId);

        // REDIRECT ACCORDING TO USER ROLE
        if (data.role === "Admin") {
            window.location.href = "admin.html";
        } 
        else if (data.role === "Resident") {
            window.location.href = "resident.html";
        } 
        else if (data.role === "Collector") {
            window.location.href = "collector.html";
        } 
        else {
            throw new Error("Unrecognized user role.");
        }

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";
    }
});