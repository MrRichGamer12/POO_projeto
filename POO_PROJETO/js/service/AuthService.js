import UserModel from "../model/UserModel.js";
import StorageService from "./StorageService.js";
import MockApiService from "./MockApiService.js";

export default class AuthService {

    static initialize() {
        StorageService.getUsers();
    }

    static register(name, email, password, confirmPassword) {
        const cleanName = String(name || "").trim();
        const cleanEmail = StorageService.normalizeEmail(email);
        const cleanPassword = String(password || "").trim();
        const cleanConfirmPassword = String(confirmPassword || "").trim();

        if (!cleanName || !cleanEmail || !cleanPassword || !cleanConfirmPassword) {
            throw new Error("Preenche todos os campos obrigatórios.");
        }

        if (!this.isValidEmail(cleanEmail)) {
            throw new Error("Introduz um email válido.");
        }

        if (cleanPassword.length < 4) {
            throw new Error("A password deve ter pelo menos 4 caracteres.");
        }

        if (cleanPassword !== cleanConfirmPassword) {
            throw new Error("As passwords não coincidem.");
        }

        const user = new UserModel(cleanName, cleanEmail, cleanPassword, "user");
        StorageService.addUser(user);
        StorageService.saveCurrentUser(user);

        return user;
    }

    // O login usa localStorage como fonte principal.
    // Se o utilizador não existir localmente, tenta carregar uma cópia inicial do JSON Server.
    static async login(email, password) {
        const cleanEmail = StorageService.normalizeEmail(email);
        const cleanPassword = String(password || "").trim();

        if (!cleanEmail || !cleanPassword) {
            throw new Error("Introduz email e password.");
        }

        const localUser = StorageService.findUserByEmail(cleanEmail);

        if (localUser) {
            if (localUser.password !== cleanPassword) {
                throw new Error("Password incorreta.");
            }

            StorageService.saveCurrentUser(localUser);
            return localUser;
        }

        const mockUser = await MockApiService.findUserByEmail(cleanEmail);

        if (!mockUser) {
            throw new Error("Utilizador não encontrado.");
        }

        if (mockUser.password !== cleanPassword) {
            throw new Error("Password incorreta.");
        }

        const user = UserModel.fromObject(mockUser);

        // Ao fazer o primeiro login com dados do db.json, o utilizador passa a existir
        // na localStorage e a aplicação continua a funcionar mesmo sem o JSON Server.
        StorageService.updateUser(user);
        StorageService.saveCurrentUser(user);

        return user;
    }

    static logout() {
        StorageService.clearCurrentUser();
        window.location.href = "../index.html";
    }

    static getCurrentUser() {
        return StorageService.getCurrentUser();
    }

    static saveCurrentUser(user) {
        StorageService.updateUser(user);
        StorageService.saveCurrentUser(user);
    }

    static requireAuth() {
        const user = this.getCurrentUser();

        if (!user) {
            const currentPage = window.location.pathname.split("/").pop() || "home.html";
            window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}`;
            return null;
        }

        return user;
    }

    static requireAdmin() {
        const user = this.requireAuth();

        if (!user) {
            return null;
        }

        if (user.role !== "admin") {
            alert("Acesso negado. Esta área é reservada a administradores.");
            window.location.href = "home.html";
            return null;
        }

        return user;
    }

    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}
