

export default class CalendarItemModel {

    constructor(title, description = "", category = "Outro", type = "Outro", date = "", time = "") {
        this.id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        this.title = String(title || "").trim();
        this.description = String(description || "").trim();
        this.category = this.normalizeCategory(category);
        this.type = this.normalizeType(type);
        this.date = date || this.getTodayKey();
        this.time = String(time || "").trim();
        this.createdAt = new Date().toISOString();
        this.history = [];
        this.reminders = [];

        this.addHistory("Criação do item", "", this.title, this.createdAt);
    }

    
    getTodayKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    normalizeCategory(category) {
        const allowed = ["Faculdade", "Trabalho", "Estudo", "Teste", "Apresentação", "Projeto", "Pessoal", "Outro"];
        return allowed.includes(category) ? category : "Outro";
    }

    normalizeType(type) {
        const allowed = ["Aula", "Trabalho", "Teste", "Apresentação", "Projeto", "Estudo", "Evento pessoal", "Outro"];
        return allowed.includes(type) ? type : "Outro";
    }

    
    normalizeReminders(reminders = []) {
        return Array.isArray(reminders)
            ? reminders.map(reminder => ({
                id: reminder.id || `${reminder.trigger || reminder.type || "date"}-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
                trigger: reminder.trigger || reminder.type || "date",
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
            this.addHistory("Alteração de lembrete", oldValue, newValue);
        }

        this.reminders = normalized;
    }

    
    resetReminderDelivery() {
        this.reminders = this.reminders.map(reminder => ({ ...reminder, sent: false, sentAt: null }));
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

    setCategory(category) {
        const cleanCategory = this.normalizeCategory(category);

        if (cleanCategory !== this.category) {
            this.addHistory("Alteração de categoria", this.category, cleanCategory);
            this.category = cleanCategory;
        }
    }

    setType(type) {
        const cleanType = this.normalizeType(type);

        if (cleanType !== this.type) {
            this.addHistory("Alteração de tipo", this.type, cleanType);
            this.type = cleanType;
        }
    }

    setDateTime(date, time = "") {
        const cleanDate = String(date || "").trim();
        const cleanTime = String(time || "").trim();
        const oldValue = this.formatDateTimeValue();
        const newValue = cleanTime ? `${cleanDate} ${cleanTime}` : cleanDate;

        if (cleanDate && newValue !== oldValue) {
            this.addHistory("Alteração de data/horário", oldValue, newValue);
            this.date = cleanDate;
            this.time = cleanTime;
            this.resetReminderDelivery();
        }
    }

    update(title, description, category, type, date, time = "") {
        this.setTitle(title);
        this.setDescription(description);
        this.setCategory(category);
        this.setType(type);
        this.setDateTime(date, time);
    }

    formatDateTimeValue() {
        if (!this.date) {
            return "Sem data";
        }

        return this.time ? `${this.date} ${this.time}` : this.date;
    }

    static fromObject(data = {}) {
        const item = new CalendarItemModel(
            data.title || data.name || "Item sem título",
            data.description || "",
            data.category || "Outro",
            data.type || "Outro",
            data.date || data.startDate || "",
            data.time || data.startTime || ""
        );

        Object.assign(item, data);

        item.id = data.id || item.id;
        item.title = data.title || data.name || "Item sem título";
        item.description = data.description || "";
        item.category = item.normalizeCategory(data.category || "Outro");
        item.type = item.normalizeType(data.type || "Outro");
        item.date = data.date || data.startDate || item.date;
        item.time = data.time || data.startTime || "";
        item.createdAt = data.createdAt || item.createdAt;
        item.history = Array.isArray(data.history) ? data.history : [];
        item.reminders = item.normalizeReminders(data.reminders || data.notifications || []);

        if (item.history.length === 0) {
            item.addHistory("Criação do item", "", item.title, item.createdAt);
        }

        return item;
    }
}
