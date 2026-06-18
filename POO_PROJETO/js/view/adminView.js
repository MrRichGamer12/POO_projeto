import { initPrivatePage, showMessage } from "./commonView.js";
import AuthService from "../service/AuthService.js";
import StorageService from "../service/StorageService.js";
import StatsService from "../service/StatsService.js";

class AdminView {

    constructor(adminUser) {
        this.adminUser = adminUser;
        this.elements = {
            usersCount: document.getElementById("adminUsersCount"),
            focusCount: document.getElementById("adminFocusCount"),
            taskCount: document.getElementById("adminTaskCount"),
            tableBody: document.getElementById("usersTableBody"),
            message: document.getElementById("adminMessage")
        };

        this.render();
    }

    render() {
        this.users = StorageService.getUsers();
        const totalFocus = this.users.reduce((total, user) => total + StatsService.getSummary(user).focusSessions, 0);
        const totalTasks = this.users.reduce((total, user) => total + user.tasks.length, 0);

        this.elements.usersCount.textContent = this.users.length;
        this.elements.focusCount.textContent = totalFocus;
        this.elements.taskCount.textContent = totalTasks;

        this.renderTable();
    }

    renderTable() {
        this.elements.tableBody.innerHTML = "";

        this.users.forEach(user => {
            const summary = StatsService.getSummary(user);
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="role-badge">${user.role}</span></td>
                <td>${user.bio || "-"}</td>
                <td>${summary.focusSessions}</td>
                <td>${summary.tasksCreated}</td>
                <td>${summary.achievements}</td>
                <td>
                    <button class="editUser secondary-button" data-email="${user.email}">Editar</button>
                    <button class="deleteUser danger-button" data-email="${user.email}">Excluir</button>
                </td>
            `;

            this.elements.tableBody.appendChild(tr);
        });

        this.bindButtons();
    }

    bindButtons() {
        document.querySelectorAll(".editUser").forEach(button => {
            button.addEventListener("click", () => this.editUser(button.dataset.email));
        });

        document.querySelectorAll(".deleteUser").forEach(button => {
            button.addEventListener("click", () => this.deleteUser(button.dataset.email));
        });
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
        const newRole = prompt("Role do utilizador: user ou admin", user.role) || user.role;

        user.name = newName.trim();
        user.bio = newBio.trim();
        user.role = ["user", "admin"].includes(newRole) ? newRole : user.role;

        StorageService.updateUser(user);
        showMessage(this.elements.message, "Utilizador atualizado.", "success");
        this.render();
    }

    deleteUser(email) {
        if (email === this.adminUser.email) {
            showMessage(this.elements.message, "Não podes apagar o administrador que está em sessão.", "error");
            return;
        }

        const confirmed = confirm(`Tens a certeza que queres apagar o utilizador ${email}?`);

        if (!confirmed) {
            return;
        }

        StorageService.deleteUser(email);
        showMessage(this.elements.message, "Utilizador removido.", "success");
        this.render();
    }
}

const adminUser = initPrivatePage("admin", { admin: true });

if (adminUser) {
    new AdminView(adminUser);
}
