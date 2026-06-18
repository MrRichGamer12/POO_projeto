



export default class MockApiService {

    static baseUrl = "http://localhost:3000";

    
    static async isAvailable() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1200);

            const response = await fetch(`${this.baseUrl}/profile`, {
                signal: controller.signal
            });

            clearTimeout(timeout);
            return response.ok;
        }
        catch (error) {
            console.info("Mock Server indisponível. A aplicação continua a usar localStorage.");
            return false;
        }
    }

    
    static async get(resource) {
        try {
            const response = await fetch(`${this.baseUrl}/${resource}`);
            this.checkResponse(response);
            return await response.json();
        }
        catch (error) {
            console.warn(`Não foi possível obter ${resource} do Mock Server.`, error);
            return null;
        }
    }

    
    static async create(resource, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${resource}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            this.checkResponse(response);
            return await response.json();
        }
        catch (error) {
            console.warn(`Não foi possível criar dados em ${resource}.`, error);
            return null;
        }
    }

    
    static async update(resource, id, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${resource}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            this.checkResponse(response);
            return await response.json();
        }
        catch (error) {
            console.warn(`Não foi possível atualizar ${resource}/${id}.`, error);
            return null;
        }
    }

    
    static async remove(resource, id) {
        try {
            const response = await fetch(`${this.baseUrl}/${resource}/${id}`, {
                method: "DELETE"
            });

            this.checkResponse(response);
            return true;
        }
        catch (error) {
            console.warn(`Não foi possível remover ${resource}/${id}.`, error);
            return false;
        }
    }


    
    
    static async findUserByEmail(email) {
        const cleanEmail = encodeURIComponent(String(email || "").trim().toLowerCase());

        if (!cleanEmail) {
            return null;
        }

        try {
            const response = await fetch(`${this.baseUrl}/users?email=${cleanEmail}`);
            this.checkResponse(response);

            const users = await response.json();
            return Array.isArray(users) && users.length > 0 ? users[0] : null;
        }
        catch (error) {
            console.info("Utilizador não encontrado no Mock Server ou servidor indisponível.");
            return null;
        }
    }

    static async getUsers() {
        return this.get("users");
    }

    static async getTasks() {
        return this.get("tasks");
    }

    static async getHabits() {
        return this.get("habits");
    }

    static async getEvents() {
        return this.get("events");
    }

    static async getCalendarItems() {
        return this.get("calendarItems");
    }

    static async getPomodoroSessions() {
        return this.get("pomodoroSessions");
    }

    static async getAchievements() {
        return this.get("achievements");
    }

    static async getNotifications() {
        return this.get("notifications");
    }

    static async getNotes() {
        return this.get("notes");
    }

    static async getMotivationQuotes() {
        return this.get("motivationQuotes");
    }

    static async getMotivationLinks() {
        return this.get("motivationLinks");
    }

    static async getMotivationTips() {
        return this.get("motivationTips");
    }

    static checkResponse(response) {
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }
    }
}
