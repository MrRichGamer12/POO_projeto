import AuthService from "../service/AuthService.js";
import { showMessage, safeRedirectTarget } from "./commonView.js";

AuthService.initialize();

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const message = document.getElementById("authMessage");
const params = new URLSearchParams(window.location.search);
const redirectTarget = safeRedirectTarget(params.get("redirect") || "home.html");

const registerLink = document.getElementById("registerLink");
if (registerLink) {
    registerLink.href = `register.html?redirect=${encodeURIComponent(redirectTarget)}`;
}

const loginLink = document.getElementById("loginLink");
if (loginLink) {
    loginLink.href = `login.html?redirect=${encodeURIComponent(redirectTarget)}`;
}

if (loginForm) {
    loginForm.addEventListener("submit", async event => {
        event.preventDefault();

        try {
            await AuthService.login(
                document.getElementById("email").value,
                document.getElementById("password").value
            );

            showMessage(message, "Login efetuado com sucesso.", "success");
            window.location.href = redirectTarget;
        }
        catch (error) {
            showMessage(message, error.message, "error");
        }
    });
}

if (registerForm) {
    registerForm.addEventListener("submit", event => {
        event.preventDefault();

        try {
            AuthService.register(
                document.getElementById("name").value,
                document.getElementById("email").value,
                document.getElementById("password").value,
                document.getElementById("confirmPassword").value
            );

            showMessage(message, "Conta criada com sucesso.", "success");
            window.location.href = redirectTarget;
        }
        catch (error) {
            showMessage(message, error.message, "error");
        }
    });
}
