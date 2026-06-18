// Serviço central de notificações da aplicação.
// Gere toasts internos, permissões do navegador e lembretes guardados no localStorage.
export default class NotificationService {

    static settingsKey = "focusup_notification_settings";
    static scanInterval = null;
    static scanFrequencyMs = 30000;

    static reminderOptions = {
        none: { label: "Sem lembrete", minutesBefore: null },
        "0": { label: "No momento", minutesBefore: 0 },
        "10": { label: "10 minutos antes", minutesBefore: 10 },
        "30": { label: "30 minutos antes", minutesBefore: 30 },
        "120": { label: "2 horas antes", minutesBefore: 120 },
        "1440": { label: "1 dia antes", minutesBefore: 1440 },
        "10080": { label: "1 semana antes", minutesBefore: 10080 }
    };

    // Começa a verificação periódica dos lembretes para o utilizador autenticado.
    static start(options = {}) {
        this.stop();

        if (!options.getUser || !options.saveUser) {
            return;
        }

        this.getUser = options.getUser;
        this.saveUser = options.saveUser;
        this.scanAndDispatch();
        this.scanInterval = window.setInterval(() => this.scanAndDispatch(), this.scanFrequencyMs);
    }

    static stop() {
        if (this.scanInterval) {
            window.clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
    }

    static isSupported() {
        return typeof window !== "undefined" && "Notification" in window;
    }

    static getBrowserPermission() {
        if (!this.isSupported()) {
            return "unsupported";
        }

        return Notification.permission;
    }

    static getSettings() {
        try {
            const stored = localStorage.getItem(this.settingsKey);
            return stored ? JSON.parse(stored) : { browserEnabled: false, permissionAsked: false };
        }
        catch (error) {
            console.warn("Erro ao ler definições de notificações", error);
            return { browserEnabled: false, permissionAsked: false };
        }
    }

    static saveSettings(settings) {
        localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    }

    // Pede permissão ao navegador. Se não for possível, mantém apenas o fallback visual.
    static async requestBrowserPermission() {
        const settings = this.getSettings();

        if (!this.isSupported()) {
            settings.browserEnabled = false;
            settings.permissionAsked = true;
            this.saveSettings(settings);
            this.showInternalNotification({
                title: "Notificações visuais ativas",
                message: "Este navegador não suporta notificações externas. A app vai usar avisos internos.",
                type: "warning"
            });
            return "unsupported";
        }

        if (Notification.permission === "granted") {
            settings.browserEnabled = true;
            settings.permissionAsked = true;
            this.saveSettings(settings);
            this.showInternalNotification({
                title: "Notificações ativas",
                message: "As notificações do navegador estão permitidas.",
                type: "success"
            });
            return "granted";
        }

        const permission = await Notification.requestPermission();
        settings.browserEnabled = permission === "granted";
        settings.permissionAsked = true;
        this.saveSettings(settings);

        this.showInternalNotification({
            title: permission === "granted" ? "Notificações ativas" : "Notificações visuais ativas",
            message: permission === "granted"
                ? "A app pode mostrar notificações do navegador enquanto estiver aberta."
                : "A permissão foi negada. A app vai continuar a mostrar avisos internos.",
            type: permission === "granted" ? "success" : "warning"
        });

        return permission;
    }

    // Cria uma estrutura de lembrete simples e reutilizável pelos models.
    static createReminder(trigger, optionValue, customMessage = "") {
        const option = this.reminderOptions[String(optionValue)] || this.reminderOptions.none;

        if (option.minutesBefore === null) {
            return null;
        }

        return {
            id: `${trigger}-${option.minutesBefore}-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            trigger,
            label: option.label,
            minutesBefore: option.minutesBefore,
            message: customMessage,
            sent: false,
            sentAt: null,
            createdAt: new Date().toISOString()
        };
    }

    static normalizeReminders(reminders = []) {
        return Array.isArray(reminders)
            ? reminders.map(reminder => ({
                id: reminder.id || `${reminder.trigger || reminder.type || "reminder"}-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
                trigger: reminder.trigger || reminder.type || "due",
                label: reminder.label || reminder.type || this.getReminderLabel(reminder.minutesBefore),
                minutesBefore: Number(reminder.minutesBefore) || 0,
                message: reminder.message || "",
                sent: Boolean(reminder.sent),
                sentAt: reminder.sentAt || null,
                createdAt: reminder.createdAt || new Date().toISOString()
            }))
            : [];
    }

    static getReminderLabel(minutesBefore) {
        const option = Object.values(this.reminderOptions)
            .find(item => item.minutesBefore === Number(minutesBefore));

        return option?.label || `${Number(minutesBefore) || 0} minutos antes`;
    }

    static getReminderSelectValue(reminders = [], trigger) {
        const reminder = (reminders || []).find(item => item.trigger === trigger);
        return reminder ? String(reminder.minutesBefore) : "none";
    }

    // Mostra um toast interno não bloqueante. Funciona mesmo quando o navegador bloqueia notificações externas.
    static showInternalNotification({ title = "FocusUp", message = "", type = "info", duration = 6000 } = {}) {
        const container = this.createToastContainer();
        const toast = document.createElement("div");

        toast.className = `custom-toast notification-toast notification-${type}`;
        toast.innerHTML = `
            <button type="button" class="toast-close" aria-label="Fechar notificação">×</button>
            <strong>${this.escapeHtml(title)}</strong>
            <span>${this.escapeHtml(message)}</span>
        `;

        toast.querySelector(".toast-close").addEventListener("click", () => toast.remove());
        container.appendChild(toast);

        window.setTimeout(() => toast.remove(), duration);
    }

    static createToastContainer() {
        let container = document.getElementById("toastContainer");

        if (!container) {
            container = document.createElement("div");
            container.id = "toastContainer";
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        return container;
    }

    static showBrowserNotification(title, message) {
        const settings = this.getSettings();

        if (!settings.browserEnabled || !this.isSupported() || Notification.permission !== "granted") {
            return false;
        }

        try {
            new Notification(title, {
                body: message,
                tag: `focusup-${title}-${Date.now()}`
            });
            return true;
        }
        catch (error) {
            console.warn("Não foi possível mostrar notificação do navegador", error);
            return false;
        }
    }

    static notify(payload) {
        this.showInternalNotification(payload);
        this.showBrowserNotification(payload.title, payload.message);
    }

    // Lê o utilizador atual, procura lembretes vencidos e marca-os como enviados para evitar duplicação.
    static scanAndDispatch() {
        if (!this.getUser || !this.saveUser) {
            return;
        }

        const user = this.getUser();
        if (!user) {
            return;
        }

        const now = new Date();
        let changed = false;
        const dueNotifications = this.collectDueNotifications(user, now);

        dueNotifications.forEach(item => {
            item.reminder.sent = true;
            item.reminder.sentAt = now.toISOString();
            changed = true;

            this.notify({
                title: item.title,
                message: item.message,
                type: item.type
            });
        });

        if (changed) {
            this.saveUser(user);
        }
    }

    static collectDueNotifications(user, now = new Date()) {
        const notifications = [];

        (user.tasks || []).forEach(task => {
            this.collectFromItem({
                item: task,
                sourceLabel: "Tarefa",
                type: "warning",
                getBaseDate: reminder => reminder.trigger === "due" ? this.getTaskDeadline(task) : null,
                getMessage: reminder => `${task.title}: ${reminder.label} do prazo.`,
                getTitle: () => "Lembrete de tarefa"
            }, now, notifications);
        });

        (user.events || []).forEach(event => {
            this.collectFromItem({
                item: event,
                sourceLabel: "Evento",
                type: "info",
                getBaseDate: reminder => {
                    if (reminder.trigger === "start") {
                        return this.getDateTime(event.startDate, event.startTime || "00:00");
                    }
                    if (reminder.trigger === "due") {
                        return this.getDateTime(event.dueDate, event.dueTime || "23:59");
                    }
                    return null;
                },
                getMessage: reminder => `${event.title}: ${reminder.label} ${reminder.trigger === "start" ? "do início" : "do limite"}.`,
                getTitle: () => "Lembrete de evento"
            }, now, notifications);
        });

        (user.calendarItems || []).forEach(item => {
            this.collectFromItem({
                item,
                sourceLabel: "Calendário",
                type: "info",
                getBaseDate: reminder => reminder.trigger === "date" ? this.getDateTime(item.date, item.time || "09:00") : null,
                getMessage: reminder => `${item.title}: ${reminder.label} do item de calendário.`,
                getTitle: () => "Lembrete de calendário"
            }, now, notifications);
        });

        return notifications;
    }

    static collectFromItem(config, now, notifications) {
        const reminders = Array.isArray(config.item.reminders) ? config.item.reminders : [];

        reminders.forEach(reminder => {
            if (reminder.sent) {
                return;
            }

            const baseDate = config.getBaseDate(reminder);
            if (!baseDate) {
                return;
            }

            const triggerDate = new Date(baseDate.getTime() - (Number(reminder.minutesBefore) || 0) * 60000);

            if (triggerDate <= now) {
                notifications.push({
                    reminder,
                    title: config.getTitle(reminder),
                    message: reminder.message || config.getMessage(reminder),
                    type: config.type
                });
            }
        });
    }

    static getTaskDeadline(task) {
        if (!task.dueDate) {
            return null;
        }

        return this.getDateTime(task.dueDate, task.dueTime || "23:59");
    }

    static getDateTime(date, time = "00:00") {
        if (!date) {
            return null;
        }

        const value = new Date(`${date}T${time || "00:00"}`);
        return Number.isNaN(value.getTime()) ? null : value;
    }

    static escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}
