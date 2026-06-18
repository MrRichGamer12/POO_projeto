import AuthService from "../service/AuthService.js";
import NotificationService from "../service/NotificationService.js";



export function renderNavbar() {
    return renderPrivateNavbar("home");
}



export function renderPrivateNavbar(activePage = "home") {
    const user = AuthService.getCurrentUser();
    const adminLink = user?.role === "admin"
        ? `<a class="nav-link ${activePage === "admin" ? "active" : ""}" href="admin.html">Admin</a>`
        : "";

    return `
        <header class="private-navbar navbar navbar-expand-lg shadow-sm">
            <div class="container-fluid app-nav-container">
                <a class="brand navbar-brand" href="home.html">Foflux</a>

                <nav class="navbar-center nav nav-pills" aria-label="Navegação principal">
                    <a class="nav-link ${activePage === "home" ? "active" : ""}" href="home.html">Início</a>
                    <a class="nav-link ${activePage === "pomodoro" ? "active" : ""}" href="pomodoro.html">Pomodoro</a>
                    <a class="nav-link ${activePage === "tasks" ? "active" : ""}" href="tasks.html">Tarefas e Hábitos</a>
                    <a class="nav-link ${activePage === "achievements" ? "active" : ""}" href="achievements.html">Conquistas</a>
                    <a class="nav-link ${activePage === "statistics" ? "active" : ""}" href="statistics.html">Estatísticas</a>
                    <a class="nav-link ${activePage === "motivation" ? "active" : ""}" href="motivation.html">Motivação</a>
                    <a class="nav-link ${activePage === "notes" ? "active" : ""}" href="notes.html">Notas</a>
                    <a class="nav-link ${activePage === "ranking" ? "active" : ""}" href="ranking.html">Ranking</a>
                    ${adminLink}
                </nav>

                <nav class="navbar-right" aria-label="Perfil">
                    <a class="btn btn-outline-primary btn-sm ${activePage === "profile" ? "active" : ""}" href="profile.html">
                        ${user?.name || "Perfil"}
                    </a>
                </nav>
            </div>
        </header>
    `;
}



export function initPrivatePage(activePage, options = {}) {
    AuthService.initialize();

    const user = options.admin
        ? AuthService.requireAdmin()
        : AuthService.requireAuth();

    if (!user) {
        return null;
    }

    const navbar = document.getElementById("navbar");

    if (navbar) {
        navbar.innerHTML = renderPrivateNavbar(activePage);
    }

    user.stats.lastUsed = activePage;
    AuthService.saveCurrentUser(user);

    createToastContainer();

    
    NotificationService.start({
        getUser: () => AuthService.getCurrentUser(),
        saveUser: updatedUser => AuthService.saveCurrentUser(updatedUser)
    });

    return user;
}


export function showMessage(element, text, type = "") {
    if (!element) {
        return;
    }

    element.textContent = text;
    element.className = `message ${type}`.trim();
}


export function showBadgeNotifications(badges) {
    if (!badges || badges.length === 0) {
        return;
    }

    const container = createToastContainer();

    badges.forEach(badge => {
        const toast = document.createElement("div");
        toast.className = "toast custom-toast show";
        toast.innerHTML = `
            <strong>Nova conquista desbloqueada</strong>
            <span>${badge.name}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4500);
    });
}


export function createToastContainer() {
    let container = document.getElementById("toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    return container;
}


export function safeRedirectTarget(target, fallback = "home.html") {
    const allowedPages = [
        "home.html",
        "dashboard.html",
        "pomodoro.html",
        "tasks.html",
        "achievements.html",
        "statistics.html",
        "motivation.html",
        "notes.html",
        "ranking.html",
        "profile.html",
        "admin.html"
    ];

    return allowedPages.includes(target) ? target : fallback;
}
