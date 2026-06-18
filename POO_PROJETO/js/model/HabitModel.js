

export default class HabitModel {

    constructor(title, description = "") {
        this.id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        this.title = String(title || "").trim();
        this.description = String(description || "").trim();
        this.createdAt = new Date().toISOString();
        this.completedDates = [];
        this.history = [];

        this.addHistory("Criação do hábito", "", this.title, this.createdAt);
    }

    
    getDateKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    
    addHistory(type, oldValue = "", newValue = "", date = new Date().toISOString()) {
        this.history.push({
            id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            date,
            type,
            oldValue: oldValue ?? "",
            newValue: newValue ?? ""
        });
    }

    setTitle(title) {
        const cleanTitle = String(title || "").trim();

        if (cleanTitle && cleanTitle !== this.title) {
            this.addHistory("Alteração de título", this.title, cleanTitle);
            this.title = cleanTitle;
        }
    }

    setDescription(description) {
        const cleanDescription = String(description || "").trim();

        if (cleanDescription !== this.description) {
            this.addHistory("Alteração de descrição", this.description || "Sem descrição", cleanDescription || "Sem descrição");
            this.description = cleanDescription;
        }
    }

    update(title, description = "") {
        this.setTitle(title);
        this.setDescription(description);
    }

    isDoneOn(dateKey) {
        return this.completedDates.some(item => item.date === dateKey);
    }

    isDoneToday(date = new Date()) {
        return this.isDoneOn(this.getDateKey(date));
    }

    markDoneToday(date = new Date()) {
        const today = this.getDateKey(date);

        if (this.isDoneOn(today)) {
            return false;
        }

        const completedAt = date.toISOString();
        this.completedDates.push({
            date: today,
            completedAt
        });

        this.addHistory("Conclusão diária", "Pendente", `Feito em ${today}`, completedAt);
        return true;
    }

    unmarkToday(date = new Date()) {
        const today = this.getDateKey(date);
        const wasDone = this.isDoneOn(today);

        if (!wasDone) {
            return false;
        }

        this.completedDates = this.completedDates.filter(item => item.date !== today);
        this.addHistory("Desmarcação diária", `Feito em ${today}`, "Pendente");
        return true;
    }

    getStatusToday(date = new Date()) {
        return this.isDoneToday(date) ? "Feito" : "Pendente";
    }

    getCompletedDaysTotal() {
        return new Set(this.completedDates.map(item => item.date)).size;
    }

    getCurrentStreak(referenceDate = new Date()) {
        const completedDays = new Set(this.completedDates.map(item => item.date));
        let streak = 0;
        const cursor = new Date(referenceDate);

        
        while (completedDays.has(this.getDateKey(cursor))) {
            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
        }

        return streak;
    }

    getSortedCompletions() {
        return this.completedDates
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    static normalizeCompletedDates(completedDates = []) {
        if (!Array.isArray(completedDates)) {
            return [];
        }

        return completedDates
            .map(item => {
                if (typeof item === "string") {
                    return {
                        date: item,
                        completedAt: `${item}T12:00:00.000Z`
                    };
                }

                const date = item.date || item.day || "";
                return {
                    date,
                    completedAt: item.completedAt || item.dateTime || `${date}T12:00:00.000Z`
                };
            })
            .filter(item => item.date);
    }

    static fromObject(data = {}) {
        const habit = new HabitModel(
            data.title || data.name || "Hábito sem nome",
            data.description || ""
        );

        Object.assign(habit, data);

        habit.id = data.id || habit.id;
        habit.title = data.title || data.name || "Hábito sem nome";
        habit.description = data.description || "";
        habit.createdAt = data.createdAt || habit.createdAt;
        habit.completedDates = HabitModel.normalizeCompletedDates(data.completedDates || data.completedDays || []);

        const history = data.history || data.versionHistory || [];
        habit.history = Array.isArray(history) ? history : [];

        if (habit.history.length === 0) {
            habit.addHistory("Criação do hábito", "", habit.title, habit.createdAt);
        }

        return habit;
    }
}
