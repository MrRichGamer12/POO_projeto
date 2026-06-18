import TaskModel from "./TaskModel.js";
import EventModel from "./EventModel.js";
import HabitModel from "./HabitModel.js";
import CalendarItemModel from "./CalendarItemModel.js";

export default class UserModel {

    constructor(name, email, password, role = "user") {
        this.id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        this.name = name || email || "Utilizador";
        this.username = email;
        this.email = email;
        this.password = password;
        this.role = role;

        this.bio = "";
        this.photo = "";

        this.points = 0;
        this.level = 1;

        this.tasks = [];
        this.goals = [];
        this.events = [];
        this.habits = [];
        this.calendarItems = [];
        this.focusHistory = [];
        this.badges = [];

        this.stats = {
            breaks: 0,
            tasksCreated: 0,
            tasksCompleted: 0,
            activityDates: [],
            lastUsed: "home"
        };
    }

    static fromObject(data) {
        const email = data.email || data.username;
        const user = new UserModel(
            data.name || data.username || email,
            email,
            data.password,
            data.role || "user"
        );

        Object.assign(user, data);

        user.email = email;
        user.username = email;
        user.name = data.name || data.username || email;
        user.role = data.role || "user";
        user.bio = data.bio || "";
        user.photo = data.photo || "";

        user.points = Number(data.points) || 0;
        user.level = Number(data.level) || 1;

        user.tasks = Array.isArray(data.tasks) ? data.tasks : [];
        user.goals = Array.isArray(data.goals) ? data.goals : [];
        user.events = Array.isArray(data.events) ? data.events : [];
        user.habits = Array.isArray(data.habits) ? data.habits : [];
        user.calendarItems = Array.isArray(data.calendarItems) ? data.calendarItems : [];
        user.focusHistory = Array.isArray(data.focusHistory) ? data.focusHistory : [];
        user.badges = Array.isArray(data.badges) ? data.badges : [];

        user.stats = {
            breaks: Number(data.stats?.breaks) || 0,
            tasksCreated: Number(data.stats?.tasksCreated) || user.tasks.length,
            tasksCompleted: Number(data.stats?.tasksCompleted) || user.tasks.filter(task => task.completed).length,
            activityDates: Array.isArray(data.stats?.activityDates) ? data.stats.activityDates : [],
            lastUsed: data.stats?.lastUsed || "home"
        };

        // Reidrata as tarefas guardadas no localStorage para voltarem a ter os métodos da classe TaskModel.
        // Também migra tarefas antigas que ainda não tinham data limite ou histórico de versões.
        user.tasks = user.tasks.map(task => TaskModel.fromObject(task));

        // Reidrata eventos de planeamento para manter métodos e histórico após leitura do localStorage.
        user.events = user.events.map(event => EventModel.fromObject(event));

        // Reidrata hábitos diários para que voltem a ter métodos como isDoneToday() e getCurrentStreak().
        user.habits = user.habits.map(habit => HabitModel.fromObject(habit));

        // Reidrata itens próprios do calendário para manter métodos de edição e histórico.
        user.calendarItems = user.calendarItems.map(item => CalendarItemModel.fromObject(item));

        user.focusHistory = user.focusHistory.map(session => ({
            id: session.id || `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            type: session.type || "focus",
            profile: session.profile || session.name || "Sessão de foco",
            minutes: Number(session.minutes) || 0,
            cycle: Number(session.cycle) || 1,
            date: session.date || new Date().toISOString()
        }));

        user.badges = user.badges.map(badge => ({
            id: badge.id || `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            key: badge.key || UserModel.createKeyFromName(badge.name),
            name: badge.name,
            description: badge.description || "Conquista desbloqueada.",
            category: badge.category || "general",
            target: Number(badge.target) || 1,
            unlockedAt: badge.unlockedAt || new Date().toISOString()
        }));

        user.updateLevel();

        return user;
    }

    static createKeyFromName(name) {
        return String(name || "badge")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "");
    }

    addPoints(points) {
        this.points += Number(points) || 0;
        this.updateLevel();
    }

    updateLevel() {
        if (this.points >= 200) {
            this.level = 4;
        }
        else if (this.points >= 100) {
            this.level = 3;
        }
        else if (this.points >= 50) {
            this.level = 2;
        }
        else {
            this.level = 1;
        }
    }

    markActivity(date = new Date()) {
        const day = date.toISOString().slice(0, 10);

        if (!this.stats.activityDates.includes(day)) {
            this.stats.activityDates.push(day);
        }
    }

    updateProfile(name, bio, photo) {
        this.name = name || this.name;
        this.bio = bio || "";
        this.photo = photo || "";
        this.markActivity();
    }

    addFocusSession(minutes, profile, cycle = 1) {
        this.focusHistory.push({
            id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            type: "focus",
            profile,
            minutes: Number(minutes) || 0,
            cycle,
            date: new Date().toISOString()
        });

        this.addPoints(10);
        this.markActivity();
    }

    addBreakSession(minutes, profile, cycle = 1) {
        this.focusHistory.push({
            id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            type: "break",
            profile,
            minutes: Number(minutes) || 0,
            cycle,
            date: new Date().toISOString()
        });

        this.stats.breaks += 1;
        this.markActivity();
    }
}
