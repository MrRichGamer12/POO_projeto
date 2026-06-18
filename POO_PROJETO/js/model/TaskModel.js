

export default class TaskModel {

    constructor(title, priority = "Média", dueDate = "", dueTime = "") {
        this.id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        this.title = String(title || "").trim();
        this.completed = false;
        this.priority = this.normalizePriority(priority);
        this.createdAt = new Date().toISOString();
        this.completedAt = null;
        this.dueDate = dueDate || "";
        this.dueTime = dueTime || "";
        this.versionHistory = [];
        this.reminders = [];

        this.addVersion("Criação", "", this.title, this.createdAt);
    }

    
    normalizePriority(priority) {
        const normalizedPriority = priority === "Normal" ? "Média" : priority;
        return ["Baixa", "Média", "Alta"].includes(normalizedPriority)
            ? normalizedPriority
            : "Média";
    }

    
    normalizeReminders(reminders = []) {
        return Array.isArray(reminders)
            ? reminders.map(reminder => ({
                id: reminder.id || `${reminder.trigger || reminder.type || "due"}-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
                trigger: reminder.trigger || reminder.type || "due",
                label: reminder.label || reminder.type || "Lembrete",
                minutesBefore: Number(reminder.minutesBefore) || 0,
                message: reminder.message || "",
                sent: Boolean(reminder.sent),
                sentAt: reminder.sentAt || null,
                createdAt: reminder.createdAt || new Date().toISOString()
            }))
            : [];
    }

    
    setReminders(reminders = []) {
        const normalized = this.normalizeReminders(reminders);
        const oldValue = this.reminders.map(reminder => reminder.label).join(", ") || "Sem lembrete";
        const newValue = normalized.map(reminder => reminder.label).join(", ") || "Sem lembrete";

        if (oldValue !== newValue) {
            this.addVersion("Alteração de lembrete", oldValue, newValue);
        }

        this.reminders = normalized;
    }

    
    resetReminderDelivery() {
        this.reminders = this.reminders.map(reminder => ({ ...reminder, sent: false, sentAt: null }));
    }

    
    addVersion(type, oldValue = "", newValue = "", date = new Date().toISOString()) {
        this.versionHistory.push({
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
            this.addVersion("Alteração de título", this.title, cleanTitle);
            this.title = cleanTitle;
        }
    }

    setPriority(priority) {
        const cleanPriority = this.normalizePriority(priority);

        if (cleanPriority !== this.priority) {
            this.addVersion("Alteração de prioridade", this.priority, cleanPriority);
            this.priority = cleanPriority;
        }
    }

    setDeadline(dueDate = "", dueTime = "") {
        const cleanDueDate = String(dueDate || "").trim();
        const cleanDueTime = String(dueTime || "").trim();

        let changed = false;

        if (cleanDueDate !== this.dueDate) {
            this.addVersion("Alteração de data limite", this.dueDate || "Sem data", cleanDueDate || "Sem data");
            this.dueDate = cleanDueDate;
            changed = true;
        }

        if (cleanDueTime !== this.dueTime) {
            this.addVersion("Alteração de horário limite", this.dueTime || "Sem horário", cleanDueTime || "Sem horário");
            this.dueTime = cleanDueTime;
            changed = true;
        }

        if (changed) {
            this.resetReminderDelivery();
        }
    }

    update(title, priority, dueDate = "", dueTime = "") {
        this.setTitle(title);
        this.setPriority(priority);
        this.setDeadline(dueDate, dueTime);
    }

    markCompleted() {
        if (this.completed) {
            return;
        }

        this.completed = true;
        this.completedAt = new Date().toISOString();
        this.addVersion("Conclusão", "Pendente", "Concluída", this.completedAt);
    }

    getDeadlineDateTime() {
        if (!this.dueDate) {
            return null;
        }

        const time = this.dueTime || "23:59";
        const date = new Date(`${this.dueDate}T${time}`);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    isOverdue(referenceDate = new Date()) {
        const deadline = this.getDeadlineDateTime();
        return Boolean(deadline && !this.completed && deadline < referenceDate);
    }

    getStatus(referenceDate = new Date()) {
        if (this.completed) {
            return "Concluída";
        }

        if (this.isOverdue(referenceDate)) {
            return "Atrasada";
        }

        return "Pendente";
    }

    static fromObject(data = {}) {
        const task = new TaskModel(
            data.title || "Tarefa sem nome",
            data.priority || "Média",
            data.dueDate || data.deadlineDate || "",
            data.dueTime || data.deadlineTime || ""
        );

        Object.assign(task, data);

        task.id = data.id || task.id;
        task.title = data.title || "Tarefa sem nome";
        task.completed = Boolean(data.completed);
        task.priority = task.normalizePriority(data.priority || "Média");
        task.createdAt = data.createdAt || task.createdAt;
        task.completedAt = data.completedAt || null;
        task.dueDate = data.dueDate || data.deadlineDate || "";
        task.dueTime = data.dueTime || data.deadlineTime || "";

        const history = data.versionHistory || data.versions || [];
        task.versionHistory = Array.isArray(history) ? history : [];
        task.reminders = task.normalizeReminders(data.reminders || data.notifications || []);

        if (task.versionHistory.length === 0) {
            task.addVersion("Criação", "", task.title, task.createdAt);
        }

        return task;
    }
}
