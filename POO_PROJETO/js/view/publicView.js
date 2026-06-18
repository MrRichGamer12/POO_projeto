import AuthService from "../service/AuthService.js";

AuthService.initialize();

const privateActions = document.querySelectorAll(".private-action");

privateActions.forEach(action => {
    action.addEventListener("click", event => {
        const target = action.dataset.target || "home.html";
        const currentUser = AuthService.getCurrentUser();

        if (currentUser) {
            event.preventDefault();
            window.location.href = `html/${target}`;
        }
    });
});
