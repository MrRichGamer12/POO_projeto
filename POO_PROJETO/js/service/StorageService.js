import UserModel from "../model/UserModel.js";

export default class StorageService {

    static usersKey = "focusup_users";
    static currentUserKey = "currentUser";

    static getUsers() {
        const storedUsers = this.readJson(this.usersKey, []);
        let users = Array.isArray(storedUsers)
            ? storedUsers.map(user => UserModel.fromObject(user))
            : [];

        users = this.migrateLegacyUsers(users);
        users = this.ensureAdminUser(users);

        this.saveUsers(users);

        return users;
    }

    static saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));

        users.forEach(user => {
            localStorage.setItem(user.email, JSON.stringify(user));
        });
    }

    static findUserByEmail(email) {
        const users = this.getUsers();
        const normalizedEmail = this.normalizeEmail(email);

        return users.find(user => this.normalizeEmail(user.email) === normalizedEmail) || null;
    }

    static addUser(user) {
        const users = this.getUsers();
        const exists = users.some(existingUser =>
            this.normalizeEmail(existingUser.email) === this.normalizeEmail(user.email)
        );

        if (exists) {
            throw new Error("Este email já está registado.");
        }

        users.push(UserModel.fromObject(user));
        this.saveUsers(users);
    }

    static updateUser(updatedUser) {
        const users = this.getUsers();
        const normalizedEmail = this.normalizeEmail(updatedUser.email);
        const index = users.findIndex(user => this.normalizeEmail(user.email) === normalizedEmail);

        if (index >= 0) {
            users[index] = UserModel.fromObject(updatedUser);
        }
        else {
            users.push(UserModel.fromObject(updatedUser));
        }

        this.saveUsers(users);

        const currentUser = this.getCurrentUser();
        if (currentUser && this.normalizeEmail(currentUser.email) === normalizedEmail) {
            this.saveCurrentUser(UserModel.fromObject(updatedUser));
        }
    }

    static deleteUser(email) {
        const normalizedEmail = this.normalizeEmail(email);
        const users = this.getUsers().filter(user => this.normalizeEmail(user.email) !== normalizedEmail);

        localStorage.removeItem(email);
        this.saveUsers(users);
    }

    static getCurrentUser() {
        const storedUser = this.readJson(this.currentUserKey, null);

        if (!storedUser) {
            return null;
        }

        return UserModel.fromObject(storedUser);
    }

    static saveCurrentUser(user) {
        const normalizedUser = UserModel.fromObject(user);
        localStorage.setItem(this.currentUserKey, JSON.stringify(normalizedUser));
        localStorage.setItem(normalizedUser.email, JSON.stringify(normalizedUser));
    }

    static clearCurrentUser() {
        localStorage.removeItem(this.currentUserKey);
    }

    static readJson(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        }
        catch (error) {
            console.warn(`Erro ao ler ${key} da localStorage`, error);
            return fallback;
        }
    }

    static migrateLegacyUsers(users) {
        const mergedUsers = [...users];
        const ignoredKeys = [this.usersKey, this.currentUserKey, "focusup_badge_notifications"];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (!key || ignoredKeys.includes(key)) {
                continue;
            }

            const value = this.readJson(key, null);

            if (!value || !value.password || (!value.username && !value.email)) {
                continue;
            }

            const migratedUser = UserModel.fromObject(value);
            const alreadyExists = mergedUsers.some(user =>
                this.normalizeEmail(user.email) === this.normalizeEmail(migratedUser.email)
            );

            if (!alreadyExists) {
                mergedUsers.push(migratedUser);
            }
        }

        return mergedUsers;
    }

    static ensureAdminUser(users) {
        const adminEmail = "admin@admin.com";
        const hasAdmin = users.some(user => this.normalizeEmail(user.email) === adminEmail);

        if (!hasAdmin) {
            users.push(new UserModel("Administrador", adminEmail, "admin123", "admin"));
        }

        return users;
    }

    static normalizeEmail(email) {
        return String(email || "").trim().toLowerCase();
    }
}
