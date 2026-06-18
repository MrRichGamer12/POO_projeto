
import { initPrivatePage, showMessage } from "./commonView.js";
import StorageService from "../service/StorageService.js";
import StatsService from "../service/StatsService.js";

class AdminView {

    constructor(adminUser) {
        this.adminUser = adminUser;
        this.searchTerm = "";
        this.roleFilter = "all";

        this.elements = {
            usersCount: document.getElementById("adminUsersCount"),
            regularUsersCount: document.getElementById("adminRegularUsersCount"),
            adminsCount: document.getElementById("adminAdminsCount"),
            focusCount: document.getElementById("adminFocusCount"),
            focusMinutes: document.getElementById("adminFocusMinutes"),
            taskCount: document.getElementById("adminTaskCount"),
            overdueTasksCount: document.getElementById("adminOverdueTasksCount"),
            eventsCount: document.getElementById("adminEventsCount"),
            habitsCount: document.getElementById("adminHabitsCount"),
            searchInput: document.getElementById("adminSearch"),
            roleFilter: document.getElementById("adminRoleFilter"),
            tableBody: document.getElementById("usersTableBody"),
            message: document.getElementById("adminMessage")
        };

        this.bindFilters();
        this.render();
    }

    
    bindFilters() {
        this.elements.searchInput.addEventListener("input", event => {
            this.searchTerm = event.target.value.trim().toLowerCase();
            this.renderTable();
        });

        this.elements.roleFilter.addEventListener("change", event => {
            this.roleFilter = event.target.value;
            this.renderTable();
        });
    }

    render() {
        this.users = StorageService.getUsers();
        this.metrics = this.users.map(user => StatsService.getAdminUserMetrics(user));
        this.renderSummaryCards();
        this.renderTable();
    }

    renderSummaryCards() {
        const summary = StatsService.getAdminSummary(this.users);

        this.elements.usersCount.textContent = summary.users;
        this.elements.regularUsersCount.textContent = summary.regularUsers;
        this.elements.adminsCount.textContent = summary.admins;
        this.elements.taskCount.textContent = summary.tasks;
        this.elements.overdueTasksCount.textContent = summary.tasksOverdue;
        this.elements.eventsCount.textContent = summary.events;
        this.elements.habitsCount.textContent = summary.habits;
        this.elements.focusCount.textContent = summary.focusSessions;
        this.elements.focusMinutes.textContent = `${this.formatNumber(summary.focusMinutes)} min`;
    }

    renderTable() {
        const filteredUsers = this.getFilteredUsers();
        this.elements.tableBody.innerHTML = "";

        if (filteredUsers.length === 0) {
            this.elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="11" class="empty-state">Nenhum utilizador encontrado com os filtros atuais.</td>
                </tr>
            `;
            return;
        }

        filteredUsers.forEach(user => {
            const metrics = StatsService.getAdminUserMetrics(user);
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>
                    <strong>${this.escape(metrics.name)}</strong><br>
                    <small>${this.escape(metrics.email)}</small>
                </td>
                <td><span class="role-badge role-${this.escape(metrics.role)}">${this.escape(metrics.role)}</span></td>
                <td class="admin-bio-cell">${this.escape(metrics.bio || "-")}</td>
                <td>
                    <small>Criada: ${this.formatDateTime(metrics.createdAt)}</small><br>
                    <small>Última atividade: ${this.formatDateTime(metrics.lastActivity)}</small>
                </td>
                <td>${this.renderMetricStack([
                    ["Total", metrics.tasksTotal],
                    ["Concluídas", metrics.tasksCompleted],
                    ["Atrasadas", metrics.tasksOverdue]
                ])}</td>
                <td>${this.renderMetricStack([
                    ["Total", metrics.eventsTotal],
                    ["Concluídos", metrics.eventsCompleted],
                    ["Atrasados", metrics.eventsOverdue]
                ])}</td>
                <td>${this.renderMetricStack([
                    ["Total", metrics.habitsTotal],
                    ["Feitos hoje", metrics.habitsDoneToday]
                ])}</td>
                <td>${metrics.calendarItemsTotal}</td>
                <td>${this.renderMetricStack([
                    ["Sessões", metrics.focusSessions],
                    ["Tempo", `${this.formatNumber(metrics.focusMinutes)} min`]
                ])}</td>
                <td>${metrics.achievements}</td>
                <td>
                    <div class="admin-actions">
                        <button class="detailsUser secondary-button" data-email="${this.escape(metrics.email)}">Detalhes</button>
                        <button class="editUser secondary-button" data-email="${this.escape(metrics.email)}">Editar</button>
                        <button class="deleteUser danger-button" data-email="${this.escape(metrics.email)}">Remover</button>
                    </div>
                </td>
            `;

            this.elements.tableBody.appendChild(tr);
        });

        this.bindButtons();
    }

    renderMetricStack(items) {
        return `
            <div class="admin-metric-stack">
                ${items.map(([label, value]) => `
                    <span><strong>${this.escape(value)}</strong> ${this.escape(label)}</span>
                `).join("")}
            </div>
        `;
    }

    getFilteredUsers() {
        return this.users.filter(user => {
            const term = this.searchTerm;
            const roleMatches = this.roleFilter === "all" || user.role === this.roleFilter;
            const searchMatches = !term
                || String(user.name || "").toLowerCase().includes(term)
                || String(user.email || user.username || "").toLowerCase().includes(term)
                || String(user.role || "").toLowerCase().includes(term);

            return roleMatches && searchMatches;
        });
    }

    bindButtons() {
        document.querySelectorAll(".detailsUser").forEach(button => {
            button.addEventListener("click", () => this.showDetails(button.dataset.email));
        });

        document.querySelectorAll(".editUser").forEach(button => {
            button.addEventListener("click", () => this.editUser(button.dataset.email));
        });

        document.querySelectorAll(".deleteUser").forEach(button => {
            button.addEventListener("click", () => this.deleteUser(button.dataset.email));
        });
    }

    showDetails(email) {
        const user = StorageService.findUserByEmail(email);

        if (!user) {
            showMessage(this.elements.message, "Utilizador não encontrado.", "error");
            return;
        }

        const metrics = StatsService.getAdminUserMetrics(user);
        const details = [
            `Nome: ${metrics.name}`,
            `Email: ${metrics.email}`,
            `Role: ${metrics.role}`,
            `Bio: ${metrics.bio || "Sem bio"}`,
            `Conta criada: ${this.formatDateTime(metrics.createdAt)}`,
            `Última atividade: ${this.formatDateTime(metrics.lastActivity)}`,
            `Tarefas: ${metrics.tasksTotal} total, ${metrics.tasksCompleted} concluídas, ${metrics.tasksOverdue} atrasadas`,
            `Eventos: ${metrics.eventsTotal} total, ${metrics.eventsCompleted} concluídos, ${metrics.eventsOverdue} atrasados`,
            `Hábitos: ${metrics.habitsTotal} total, ${metrics.habitsDoneToday} feitos hoje`,
            `Itens de calendário: ${metrics.calendarItemsTotal}`,
            `Pomodoro: ${metrics.focusSessions} sessões, ${this.formatNumber(metrics.focusMinutes)} minutos de foco`,
            `Conquistas: ${metrics.achievements}`
        ].join("\n");

        alert(details);
    }

    editUser(email) {
        const user = StorageService.findUserByEmail(email);

        if (!user) {
            showMessage(this.elements.message, "Utilizador não encontrado.", "error");
            return;
        }

        const newName = prompt("Nome do utilizador:", user.name);
        if (!newName || !newName.trim()) {
            return;
        }

        const newBio = prompt("Bio do utilizador:", user.bio || "") ?? user.bio;
        const requestedRole = prompt("Role do utilizador: user ou admin", user.role) || user.role;
        const cleanRole = String(requestedRole).trim().toLowerCase();

        if (!["user", "admin"].includes(cleanRole)) {
            showMessage(this.elements.message, "Role inválida. Usa apenas user ou admin.", "error");
            return;
        }

        if (!this.canChangeRole(user, cleanRole)) {
            return;
        }

        user.name = newName.trim();
        user.bio = String(newBio || "").trim();
        user.role = cleanRole;
        user.markActivity?.();

        StorageService.updateUser(user);
        showMessage(this.elements.message, "Utilizador atualizado.", "success");
        this.render();
    }

    canChangeRole(user, newRole) {
        if (user.role === newRole) {
            return true;
        }

        const admins = this.users.filter(item => item.role === "admin");
        const isCurrentAdmin = user.email === this.adminUser.email;
        const isLastAdmin = user.role === "admin" && admins.length <= 1;

        if (isCurrentAdmin && newRole !== "admin") {
            showMessage(this.elements.message, "Não podes remover o role admin da conta que está em sessão.", "error");
            return false;
        }

        if (isLastAdmin && newRole !== "admin") {
            showMessage(this.elements.message, "Não é possível remover o último administrador da aplicação.", "error");
            return false;
        }

        return true;
    }

    deleteUser(email) {
        const user = StorageService.findUserByEmail(email);

        if (!user) {
            showMessage(this.elements.message, "Utilizador não encontrado.", "error");
            return;
        }

        if (email === this.adminUser.email) {
            showMessage(this.elements.message, "Não podes apagar o administrador que está em sessão.", "error");
            return;
        }

        const admins = this.users.filter(item => item.role === "admin");
        if (user.role === "admin" && admins.length <= 1) {
            showMessage(this.elements.message, "Não é possível apagar o último administrador da aplicação.", "error");
            return;
        }

        const warning = user.role === "admin"
            ? `Atenção: ${email} também é administrador. Tens a certeza que queres remover esta conta?`
            : `Tens a certeza que queres apagar o utilizador ${email}?`;

        const confirmed = confirm(warning);

        if (!confirmed) {
            return;
        }

        StorageService.deleteUser(email);
        showMessage(this.elements.message, "Utilizador removido.", "success");
        this.render();
    }

    formatDateTime(value) {
        if (!value) {
            return "Sem dados";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "Sem dados";
        }

        return date.toLocaleString("pt-PT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    formatNumber(value) {
        const number = Number(value) || 0;
        return Number.isInteger(number) ? number : number.toFixed(1);
    }

    escape(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

const adminUser = initPrivatePage("admin", { admin: true });

if (adminUser) {
    new AdminView(adminUser);
}
