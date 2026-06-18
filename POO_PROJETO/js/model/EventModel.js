// Modelo responsável por representar um evento ou item de planeamento.
// Guarda datas de início/limite, estado calculado e histórico de versões.
export default class EventModel {

    constructor(title, description = "", startDate = "", startTime = "", dueDate = "", dueTime = "", category = "Faculdade") {
        this.id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        this.title = String(title || "").trim();
        this.description = String(description || "").trim();
        this.createdAt = new Date().toISOString();
        this.startDate = startDate || "";
        this.startTime = startTime || "";
        this.dueDate = dueDate || "";
        this.dueTime = dueTime || "";
        this.category = this.normalizeCategory(category);
        this.completed = false;
        this.completedAt = null;
        this.versionHistory = [];
        this.reminders = [];

        this.addVersion("Criação do evento", "", this.title, this.createdAt);
    }

    // Mantém as categorias controladas para evitar valores inconsistentes no localStorage.
    normalizeCategory(category) {
        const allowedCategories = ["Faculdade", "Trabalho", "Estudo", "Projeto", "Pessoal", "Outro"];
        return allowedCategories.includes(category) ? category : "Outro";
    }

    // Normaliza lembretes vindos do localStorage ou do Mock Server.
    normalizeReminders(reminders = []) {
        return Array.isArray(reminders)
            ? reminders.map(reminder => ({
                id: reminder.id || `${reminder.trigger || reminder.type || "event"}-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
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

    // Atualiza lembretes e mantém registo no histórico do evento.
    setReminders(reminders = []) {
        const normalized = this.normalizeReminders(reminders);
        const oldValue = this.reminders.map(reminder => `${reminder.trigger}: ${reminder.label}`).join(", ") || "Sem lembrete";
        const newValue = normalized.map(reminder => `${reminder.trigger}: ${reminder.label}`).join(", ") || "Sem lembrete";

        if (oldValue !== newValue) {
            this.addVersion("Alteração de lembrete", oldValue, newValue);
        }

        this.reminders = normalized;
    }

    // Reinicia lembretes quando datas de início ou limite mudam.
    resetReminderDelivery(trigger = null) {
        this.reminders = this.reminders.map(reminder => {
            if (!trigger || reminder.trigger === trigger) {
                return { ...reminder, sent: false, sentAt: null };
            }
            return reminder;
        });
    }

    // Regista uma mudança no histórico, de forma semelhante ao histórico das tarefas.
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

    setDescription(description) {
        const cleanDescription = String(description || "").trim();

        if (cleanDescription !== this.description) {
            this.addVersion("Alteração de descrição", this.description || "Sem descrição", cleanDescription || "Sem descrição");
            this.description = cleanDescription;
        }
    }

    setStart(startDate = "", startTime = "") {
        const cleanStartDate = String(startDate || "").trim();
        const cleanStartTime = String(startTime || "").trim();

        let changed = false;

        if (cleanStartDate !== this.startDate) {
            this.addVersion("Alteração de data de início", this.startDate || "Sem data", cleanStartDate || "Sem data");
            this.startDate = cleanStartDate;
            changed = true;
        }

        if (cleanStartTime !== this.startTime) {
            this.addVersion("Alteração de horário de início", this.startTime || "Sem horário", cleanStartTime || "Sem horário");
            this.startTime = cleanStartTime;
            changed = true;
        }

        if (changed) {
            this.resetReminderDelivery("start");
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
            this.resetReminderDelivery("due");
        }
    }

    setCategory(category) {
        const cleanCategory = this.normalizeCategory(category);

        if (cleanCategory !== this.category) {
            this.addVersion("Alteração de categoria", this.category, cleanCategory);
            this.category = cleanCategory;
        }
    }

    update(title, description, startDate, startTime, dueDate, dueTime, category) {
        this.setTitle(title);
        this.setDescription(description);
        this.setStart(startDate, startTime);
        this.setDeadline(dueDate, dueTime);
        this.setCategory(category);
    }

    // Permite antecipar o início quando o utilizador decide começar imediatamente.
    startNow() {
        const now = new Date();
        const oldStart = this.formatStartValue();

        this.startDate = now.toISOString().slice(0, 10);
        this.startTime = now.toTimeString().slice(0, 5);

        this.addVersion("Começar agora", oldStart, this.formatStartValue());
        this.resetReminderDelivery("start");
    }

    markCompleted() {
        if (this.completed) {
            return;
        }

        const oldStatus = this.getStatus();
        this.completed = true;
        this.completedAt = new Date().toISOString();
        this.addVersion("Alteração de estado", oldStatus, "Concluído", this.completedAt);
    }

    reopen() {
        if (!this.completed) {
            return;
        }

        this.completed = false;
        this.completedAt = null;
        this.addVersion("Alteração de estado", "Concluído", this.getStatus());
    }

    getStartDateTime() {
        if (!this.startDate) {
            return null;
        }

        const time = this.startTime || "00:00";
        const date = new Date(`${this.startDate}T${time}`);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    getDeadlineDateTime() {
        if (!this.dueDate) {
            return null;
        }

        const time = this.dueTime || "23:59";
        const date = new Date(`${this.dueDate}T${time}`);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    isStartInFuture(referenceDate = new Date()) {
        const start = this.getStartDateTime();
        return Boolean(start && start > referenceDate);
    }

    isOverdue(referenceDate = new Date()) {
        const deadline = this.getDeadlineDateTime();
        return Boolean(deadline && !this.completed && deadline < referenceDate);
    }

    getStatus(referenceDate = new Date()) {
        if (this.completed) {
            return "Concluído";
        }

        if (this.isOverdue(referenceDate)) {
            return "Atrasado";
        }

        const start = this.getStartDateTime();

        if (start && start <= referenceDate) {
            return "Em andamento";
        }

        return "Planeado";
    }

    formatStartValue() {
        if (!this.startDate) {
            return "Sem início definido";
        }

        return this.startTime ? `${this.startDate} ${this.startTime}` : this.startDate;
    }

    formatDeadlineValue() {
        if (!this.dueDate) {
            return "Sem limite definido";
        }

        return this.dueTime ? `${this.dueDate} ${this.dueTime}` : this.dueDate;
    }

    static fromObject(data = {}) {
        const event = new EventModel(
            data.title || "Evento sem título",
            data.description || "",
            data.startDate || data.startAt?.slice(0, 10) || "",
            data.startTime || data.startAt?.slice(11, 16) || "",
            data.dueDate || data.deadlineDate || data.deadlineAt?.slice(0, 10) || "",
            data.dueTime || data.deadlineTime || data.deadlineAt?.slice(11, 16) || "",
            data.category || data.priority || "Faculdade"
        );

        Object.assign(event, data);

        event.id = data.id || event.id;
        event.title = data.title || "Evento sem título";
        event.description = data.description || "";
        event.createdAt = data.createdAt || event.createdAt;
        event.startDate = data.startDate || data.startAt?.slice(0, 10) || "";
        event.startTime = data.startTime || data.startAt?.slice(11, 16) || "";
        event.dueDate = data.dueDate || data.deadlineDate || data.deadlineAt?.slice(0, 10) || "";
        event.dueTime = data.dueTime || data.deadlineTime || data.deadlineAt?.slice(11, 16) || "";
        event.category = event.normalizeCategory(data.category || data.priority || "Faculdade");
        event.completed = Boolean(data.completed || data.status === "Concluído");
        event.completedAt = data.completedAt || null;

        const history = data.versionHistory || data.versions || [];
        event.versionHistory = Array.isArray(history) ? history : [];
        event.reminders = event.normalizeReminders(data.reminders || data.notifications || []);

        if (event.versionHistory.length === 0) {
            event.addVersion("Criação do evento", "", event.title, event.createdAt);
        }

        return event;
    }
}
