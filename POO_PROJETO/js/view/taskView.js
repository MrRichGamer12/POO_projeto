// View responsável pela página de Tarefas, Hábitos e Planeamento.
// Mantém a lógica da interface separada dos modelos, respeitando o MVC simplificado.
import { initPrivatePage, showBadgeNotifications, showMessage } from "./commonView.js";
import AuthService from "../service/AuthService.js";
import AchievementService from "../service/AchievementService.js";
import TaskModel from "../model/TaskModel.js";
import EventModel from "../model/EventModel.js";
import HabitModel from "../model/HabitModel.js";
import CalendarItemModel from "../model/CalendarItemModel.js";
import NotificationService from "../service/NotificationService.js";

class TaskView {

    constructor(user) {
        this.user = user;
        this.statusFilter = "all";
        this.priorityFilter = "all";
        this.activeHistoryTaskId = null;
        this.activeHistoryEventId = null;
        this.activeHistoryHabitId = null;
        this.lastFutureEventId = null;
        this.calendarCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        this.selectedCalendarDate = this.getDateKey(new Date());

        // Garante compatibilidade com dados guardados em versões anteriores da aplicação.
        this.user.tasks = (this.user.tasks || []).map(task => TaskModel.fromObject(task));
        this.user.events = (this.user.events || []).map(event => EventModel.fromObject(event));
        this.user.habits = (this.user.habits || []).map(habit => HabitModel.fromObject(habit));
        this.user.calendarItems = (this.user.calendarItems || []).map(item => CalendarItemModel.fromObject(item));

        this.elements = {
            requestNotificationsBtn: document.getElementById("requestNotificationsBtn"),
            notificationStatus: document.getElementById("notificationStatus"),

            form: document.getElementById("taskForm"),
            taskInput: document.getElementById("taskInput"),
            taskPriority: document.getElementById("taskPriority"),
            taskDueDate: document.getElementById("taskDueDate"),
            taskDueTime: document.getElementById("taskDueTime"),
            taskReminder: document.getElementById("taskReminder"),
            taskList: document.getElementById("taskList"),
            totalTasks: document.getElementById("totalTasks"),
            completedTasks: document.getElementById("completedTasks"),
            pendingTasks: document.getElementById("pendingTasks"),
            overdueTasks: document.getElementById("overdueTasks"),
            statusFilter: document.getElementById("taskStatusFilter"),
            priorityFilter: document.getElementById("taskPriorityFilter"),
            message: document.getElementById("taskMessage"),

            eventForm: document.getElementById("eventForm"),
            eventTitle: document.getElementById("eventTitle"),
            eventDescription: document.getElementById("eventDescription"),
            eventCategory: document.getElementById("eventCategory"),
            eventStartDate: document.getElementById("eventStartDate"),
            eventStartTime: document.getElementById("eventStartTime"),
            eventDueDate: document.getElementById("eventDueDate"),
            eventDueTime: document.getElementById("eventDueTime"),
            eventStartReminder: document.getElementById("eventStartReminder"),
            eventDueReminder: document.getElementById("eventDueReminder"),
            eventReflectionMessage: document.getElementById("eventReflectionMessage"),
            eventMessage: document.getElementById("eventMessage"),
            eventList: document.getElementById("eventList"),
            totalEvents: document.getElementById("totalEvents"),
            plannedEvents: document.getElementById("plannedEvents"),
            activeEvents: document.getElementById("activeEvents"),
            overdueEvents: document.getElementById("overdueEvents"),

            habitForm: document.getElementById("habitForm"),
            habitTitle: document.getElementById("habitTitle"),
            habitDescription: document.getElementById("habitDescription"),
            habitMessage: document.getElementById("habitMessage"),
            habitList: document.getElementById("habitList"),
            totalHabits: document.getElementById("totalHabits"),
            completedHabitsToday: document.getElementById("completedHabitsToday"),
            pendingHabitsToday: document.getElementById("pendingHabitsToday"),
            currentHabitStreak: document.getElementById("currentHabitStreak"),

            calendarForm: document.getElementById("calendarItemForm"),
            calendarTitle: document.getElementById("calendarItemTitle"),
            calendarDescription: document.getElementById("calendarItemDescription"),
            calendarCategory: document.getElementById("calendarItemCategory"),
            calendarType: document.getElementById("calendarItemType"),
            calendarDate: document.getElementById("calendarItemDate"),
            calendarTime: document.getElementById("calendarItemTime"),
            calendarReminder: document.getElementById("calendarItemReminder"),
            calendarMessage: document.getElementById("calendarMessage"),
            calendarGrid: document.getElementById("calendarGrid"),
            calendarMonthTitle: document.getElementById("calendarMonthTitle"),
            selectedCalendarDateTitle: document.getElementById("selectedCalendarDateTitle"),
            calendarDayItems: document.getElementById("calendarDayItems"),
            calendarPrevMonth: document.getElementById("calendarPrevMonth"),
            calendarNextMonth: document.getElementById("calendarNextMonth"),
            calendarToday: document.getElementById("calendarToday")
        };

        this.bindEvents();
        this.renderNotificationStatus();
        this.render();
    }

    bindEvents() {
        this.elements.requestNotificationsBtn?.addEventListener("click", async () => {
            await NotificationService.requestBrowserPermission();
            this.renderNotificationStatus();
        });

        this.elements.form.addEventListener("submit", event => {
            event.preventDefault();
            this.addTask();
        });

        this.elements.statusFilter.addEventListener("change", event => {
            this.statusFilter = event.target.value;
            this.renderTasks();
        });

        this.elements.priorityFilter.addEventListener("change", event => {
            this.priorityFilter = event.target.value;
            this.renderTasks();
        });

        this.elements.eventForm.addEventListener("submit", event => {
            event.preventDefault();
            this.addPlanningEvent();
        });

        this.elements.habitForm.addEventListener("submit", event => {
            event.preventDefault();
            this.addDailyHabit();
        });

        this.elements.calendarForm.addEventListener("submit", event => {
            event.preventDefault();
            this.addCalendarItem();
        });

        this.elements.calendarPrevMonth.addEventListener("click", () => this.changeCalendarMonth(-1));
        this.elements.calendarNextMonth.addEventListener("click", () => this.changeCalendarMonth(1));
        this.elements.calendarToday.addEventListener("click", () => this.goToToday());
    }

    addTask() {
        const title = this.elements.taskInput.value.trim();
        const priority = this.elements.taskPriority.value;
        const dueDate = this.elements.taskDueDate.value;
        const dueTime = this.elements.taskDueTime.value;

        if (!title) {
            showMessage(this.elements.message, "Introduz o nome da tarefa.", "error");
            return;
        }

        if (dueTime && !dueDate) {
            showMessage(this.elements.message, "Para usar horário limite, escolhe também uma data limite.", "error");
            return;
        }

        if (this.elements.taskReminder.value !== "none" && !dueDate) {
            showMessage(this.elements.message, "Para configurar lembrete, a tarefa precisa de data limite.", "error");
            return;
        }

        const exists = this.user.tasks.some(task => task.title.toLowerCase() === title.toLowerCase());

        if (exists) {
            showMessage(this.elements.message, "Esta tarefa já existe.", "error");
            return;
        }

        const task = new TaskModel(title, priority, dueDate, dueTime);
        task.setReminders(this.createRemindersFromSelect("due", this.elements.taskReminder.value));
        this.user.tasks.push(task);
        this.user.stats.tasksCreated += 1;
        this.user.addPoints(10);
        this.user.markActivity();

        this.saveAndCheckAchievements();
        this.elements.form.reset();
        this.elements.taskPriority.value = "Média";
        this.elements.taskReminder.value = "none";
        showMessage(this.elements.message, "Tarefa adicionada com sucesso.", "success");
        this.render();
    }

    completeTask(taskId) {
        const task = this.findTask(taskId);

        if (!task || task.completed) {
            return;
        }

        task.markCompleted();
        this.user.stats.tasksCompleted += 1;
        this.user.addPoints(15);
        this.user.markActivity();

        this.saveAndCheckAchievements();
        this.render();
    }

    editTask(taskId) {
        const task = this.findTask(taskId);

        if (!task) {
            return;
        }

        const newTitle = prompt("Novo nome da tarefa:", task.title);

        if (!newTitle || !newTitle.trim()) {
            return;
        }

        const newPriority = prompt("Prioridade: Baixa, Média ou Alta", task.priority) || task.priority;
        const allowedPriorities = ["Baixa", "Média", "Alta"];

        if (!allowedPriorities.includes(newPriority)) {
            showMessage(this.elements.message, "Prioridade inválida. Usa Baixa, Média ou Alta.", "error");
            return;
        }

        const newDueDate = prompt("Data limite no formato AAAA-MM-DD. Deixa vazio para remover.", task.dueDate || "") ?? task.dueDate;
        const newDueTime = prompt("Horário limite no formato HH:MM. Deixa vazio para remover.", task.dueTime || "") ?? task.dueTime;

        if (newDueTime && !newDueDate) {
            showMessage(this.elements.message, "Para usar horário limite, a tarefa também precisa de uma data limite.", "error");
            return;
        }

        const reminderValue = this.promptReminderValue("Lembrete da tarefa", task.reminders, "due");

        if (reminderValue !== "none" && !newDueDate) {
            showMessage(this.elements.message, "Para configurar lembrete, a tarefa precisa de data limite.", "error");
            return;
        }

        task.update(newTitle.trim(), newPriority, newDueDate.trim(), newDueTime.trim());
        task.setReminders(this.createRemindersFromSelect("due", reminderValue));
        this.user.markActivity();

        AuthService.saveCurrentUser(this.user);
        showMessage(this.elements.message, "Tarefa atualizada com histórico de versões.", "success");
        this.render();
    }

    deleteTask(taskId) {
        const confirmed = confirm("Tens a certeza que queres remover esta tarefa?");

        if (!confirmed) {
            return;
        }

        this.user.tasks = this.user.tasks.filter(task => String(task.id) !== String(taskId));
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);
        showMessage(this.elements.message, "Tarefa removida.", "success");
        this.render();
    }

    addPlanningEvent() {
        const title = this.elements.eventTitle.value.trim();
        const description = this.elements.eventDescription.value.trim();
        const category = this.elements.eventCategory.value;
        const startDate = this.elements.eventStartDate.value;
        const startTime = this.elements.eventStartTime.value;
        const dueDate = this.elements.eventDueDate.value;
        const dueTime = this.elements.eventDueTime.value;

        if (!title || !startDate || !dueDate) {
            showMessage(this.elements.eventMessage, "Preenche o título, a data de início e a data limite.", "error");
            return;
        }

        if (!this.isDateOrderValid(startDate, startTime, dueDate, dueTime)) {
            showMessage(this.elements.eventMessage, "A data limite não pode ser anterior à data de início.", "error");
            return;
        }

        const planningEvent = new EventModel(title, description, startDate, startTime, dueDate, dueTime, category);
        planningEvent.setReminders([
            ...this.createRemindersFromSelect("start", this.elements.eventStartReminder.value),
            ...this.createRemindersFromSelect("due", this.elements.eventDueReminder.value)
        ]);
        this.user.events.push(planningEvent);
        this.user.addPoints(10);
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);

        this.elements.eventForm.reset();
        this.elements.eventCategory.value = "Faculdade";
        this.elements.eventStartReminder.value = "none";
        this.elements.eventDueReminder.value = "none";
        showMessage(this.elements.eventMessage, "Evento criado com sucesso.", "success");

        this.lastFutureEventId = planningEvent.isStartInFuture() ? String(planningEvent.id) : null;
        this.render();
    }

    editPlanningEvent(eventId) {
        const planningEvent = this.findPlanningEvent(eventId);

        if (!planningEvent) {
            return;
        }

        const newTitle = prompt("Novo título do evento:", planningEvent.title);
        if (!newTitle || !newTitle.trim()) {
            return;
        }

        const newDescription = prompt("Descrição do evento:", planningEvent.description || "") ?? planningEvent.description;
        const newCategory = prompt("Categoria: Faculdade, Trabalho, Estudo, Projeto, Pessoal ou Outro", planningEvent.category) || planningEvent.category;
        const newStartDate = prompt("Data de início no formato AAAA-MM-DD:", planningEvent.startDate || "") ?? planningEvent.startDate;
        const newStartTime = prompt("Hora de início no formato HH:MM. Pode ficar vazia.", planningEvent.startTime || "") ?? planningEvent.startTime;
        const newDueDate = prompt("Data limite no formato AAAA-MM-DD:", planningEvent.dueDate || "") ?? planningEvent.dueDate;
        const newDueTime = prompt("Hora limite no formato HH:MM. Pode ficar vazia.", planningEvent.dueTime || "") ?? planningEvent.dueTime;

        if (!newStartDate || !newDueDate) {
            showMessage(this.elements.eventMessage, "O evento precisa de data de início e data limite.", "error");
            return;
        }

        if (!this.isDateOrderValid(newStartDate.trim(), newStartTime.trim(), newDueDate.trim(), newDueTime.trim())) {
            showMessage(this.elements.eventMessage, "A data limite não pode ser anterior à data de início.", "error");
            return;
        }

        const startReminderValue = this.promptReminderValue("Lembrete antes do início", planningEvent.reminders, "start");
        const dueReminderValue = this.promptReminderValue("Lembrete antes do limite", planningEvent.reminders, "due");

        planningEvent.update(
            newTitle.trim(),
            newDescription.trim(),
            newStartDate.trim(),
            newStartTime.trim(),
            newDueDate.trim(),
            newDueTime.trim(),
            newCategory.trim()
        );
        planningEvent.setReminders([
            ...this.createRemindersFromSelect("start", startReminderValue),
            ...this.createRemindersFromSelect("due", dueReminderValue)
        ]);

        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);
        showMessage(this.elements.eventMessage, "Evento atualizado com histórico de versões.", "success");
        this.render();
    }

    deletePlanningEvent(eventId) {
        const planningEvent = this.findPlanningEvent(eventId);
        const confirmed = confirm(`Tens a certeza que queres remover o evento ${planningEvent?.title || "selecionado"}?`);

        if (!confirmed) {
            return;
        }

        if (planningEvent) {
            planningEvent.addVersion("Remoção do evento", planningEvent.title, "Evento removido");
        }

        this.user.events = this.user.events.filter(event => String(event.id) !== String(eventId));
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);
        showMessage(this.elements.eventMessage, "Evento removido.", "success");
        this.render();
    }

    startPlanningEventNow(eventId) {
        const planningEvent = this.findPlanningEvent(eventId);

        if (!planningEvent) {
            return;
        }

        planningEvent.startNow();
        this.lastFutureEventId = null;
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);
        showMessage(this.elements.eventMessage, "Data de início atualizada para agora.", "success");
        this.render();
    }

    completePlanningEvent(eventId) {
        const planningEvent = this.findPlanningEvent(eventId);

        if (!planningEvent || planningEvent.completed) {
            return;
        }

        const oldStatus = planningEvent.getStatus();
        planningEvent.markCompleted();
        // O método markCompleted regista o estado anterior no histórico; isto garante atividade no perfil.
        this.user.addPoints(15);
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);
        showMessage(this.elements.eventMessage, `Evento concluído. Estado anterior: ${oldStatus}.`, "success");
        this.render();
    }

    reopenPlanningEvent(eventId) {
        const planningEvent = this.findPlanningEvent(eventId);

        if (!planningEvent || !planningEvent.completed) {
            return;
        }

        planningEvent.reopen();
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);
        showMessage(this.elements.eventMessage, "Evento reaberto.", "success");
        this.render();
    }


    addDailyHabit() {
        const title = this.elements.habitTitle.value.trim();
        const description = this.elements.habitDescription.value.trim();

        if (!title) {
            showMessage(this.elements.habitMessage, "Introduz o nome do hábito.", "error");
            return;
        }

        const exists = this.user.habits.some(habit => habit.title.toLowerCase() === title.toLowerCase());

        if (exists) {
            showMessage(this.elements.habitMessage, "Este hábito já existe.", "error");
            return;
        }

        const habit = new HabitModel(title, description);
        this.user.habits.push(habit);
        this.user.addPoints(10);
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);

        this.elements.habitForm.reset();
        showMessage(this.elements.habitMessage, "Hábito diário criado com sucesso.", "success");
        this.render();
    }

    editDailyHabit(habitId) {
        const habit = this.findDailyHabit(habitId);

        if (!habit) {
            return;
        }

        const newTitle = prompt("Novo nome do hábito:", habit.title);

        if (!newTitle || !newTitle.trim()) {
            return;
        }

        const newDescription = prompt("Descrição do hábito:", habit.description || "") ?? habit.description;

        habit.update(newTitle.trim(), newDescription.trim());
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);
        showMessage(this.elements.habitMessage, "Hábito atualizado com histórico.", "success");
        this.render();
    }

    deleteDailyHabit(habitId) {
        const habit = this.findDailyHabit(habitId);
        const confirmed = confirm(`Tens a certeza que queres remover o hábito ${habit?.title || "selecionado"}?`);

        if (!confirmed) {
            return;
        }

        if (habit) {
            habit.addHistory("Remoção do hábito", habit.title, "Hábito removido");
        }

        this.user.habits = this.user.habits.filter(item => String(item.id) !== String(habitId));
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);
        showMessage(this.elements.habitMessage, "Hábito removido.", "success");
        this.render();
    }

    markHabitDoneToday(habitId) {
        const habit = this.findDailyHabit(habitId);

        if (!habit) {
            return;
        }

        const changed = habit.markDoneToday();

        if (!changed) {
            showMessage(this.elements.habitMessage, "Este hábito já está marcado como feito hoje.", "error");
            return;
        }

        this.user.addPoints(5);
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);
        showMessage(this.elements.habitMessage, "Hábito marcado como feito hoje.", "success");
        this.render();
    }

    unmarkHabitDoneToday(habitId) {
        const habit = this.findDailyHabit(habitId);

        if (!habit) {
            return;
        }

        const changed = habit.unmarkToday();

        if (!changed) {
            showMessage(this.elements.habitMessage, "Este hábito ainda não estava feito hoje.", "error");
            return;
        }

        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);
        showMessage(this.elements.habitMessage, "Hábito desmarcado para o dia atual.", "success");
        this.render();
    }


    addCalendarItem() {
        const title = this.elements.calendarTitle.value.trim();
        const description = this.elements.calendarDescription.value.trim();
        const category = this.elements.calendarCategory.value;
        const type = this.elements.calendarType.value;
        const date = this.elements.calendarDate.value;
        const time = this.elements.calendarTime.value;

        if (!title || !date) {
            showMessage(this.elements.calendarMessage, "Preenche o título e a data do item de calendário.", "error");
            return;
        }

        const item = new CalendarItemModel(title, description, category, type, date, time);
        item.setReminders(this.createRemindersFromSelect("date", this.elements.calendarReminder.value));
        this.user.calendarItems.push(item);
        this.user.addPoints(5);
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);

        this.selectedCalendarDate = item.date;
        this.calendarCurrentMonth = this.getMonthStartFromKey(item.date);
        this.elements.calendarForm.reset();
        this.elements.calendarCategory.value = "Faculdade";
        this.elements.calendarType.value = "Teste";
        this.elements.calendarReminder.value = "none";
        this.elements.calendarDate.value = this.selectedCalendarDate;
        showMessage(this.elements.calendarMessage, "Item de calendário criado com sucesso.", "success");
        this.render();
    }

    editCalendarItem(itemId) {
        const item = this.findCalendarItem(itemId);

        if (!item) {
            return;
        }

        const newTitle = prompt("Novo título do item:", item.title);
        if (!newTitle || !newTitle.trim()) {
            return;
        }

        const newDescription = prompt("Descrição do item:", item.description || "") ?? item.description;
        const newCategory = prompt("Categoria: Faculdade, Trabalho, Estudo, Teste, Apresentação, Projeto, Pessoal ou Outro", item.category) || item.category;
        const newType = prompt("Tipo: Aula, Trabalho, Teste, Apresentação, Projeto, Estudo, Evento pessoal ou Outro", item.type) || item.type;
        const newDate = prompt("Data no formato AAAA-MM-DD:", item.date) || item.date;
        const newTime = prompt("Horário no formato HH:MM. Pode ficar vazio.", item.time || "") ?? item.time;

        if (!newDate || !newDate.trim()) {
            showMessage(this.elements.calendarMessage, "O item de calendário precisa de uma data.", "error");
            return;
        }

        const reminderValue = this.promptReminderValue("Lembrete do item de calendário", item.reminders, "date");

        item.update(newTitle.trim(), newDescription.trim(), newCategory.trim(), newType.trim(), newDate.trim(), newTime.trim());
        item.setReminders(this.createRemindersFromSelect("date", reminderValue));
        this.selectedCalendarDate = item.date;
        this.calendarCurrentMonth = this.getMonthStartFromKey(item.date);
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);
        showMessage(this.elements.calendarMessage, "Item de calendário atualizado.", "success");
        this.render();
    }

    deleteCalendarItem(itemId) {
        const item = this.findCalendarItem(itemId);
        const confirmed = confirm(`Tens a certeza que queres remover o item ${item?.title || "selecionado"}?`);

        if (!confirmed) {
            return;
        }

        if (item) {
            item.addHistory("Remoção do item", item.title, "Item removido");
        }

        this.user.calendarItems = this.user.calendarItems.filter(calendarItem => String(calendarItem.id) !== String(itemId));
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);
        showMessage(this.elements.calendarMessage, "Item de calendário removido.", "success");
        this.render();
    }

    changeCalendarMonth(offset) {
        this.calendarCurrentMonth = new Date(
            this.calendarCurrentMonth.getFullYear(),
            this.calendarCurrentMonth.getMonth() + offset,
            1
        );

        this.selectedCalendarDate = this.getDateKey(this.calendarCurrentMonth);
        this.elements.calendarDate.value = this.selectedCalendarDate;
        this.renderCalendar();
    }

    goToToday() {
        const today = new Date();
        this.calendarCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        this.selectedCalendarDate = this.getDateKey(today);
        this.elements.calendarDate.value = this.selectedCalendarDate;
        this.renderCalendar();
    }

    findCalendarItem(itemId) {
        return this.user.calendarItems.find(item => String(item.id) === String(itemId));
    }

    toggleHabitHistory(habitId) {
        this.activeHistoryHabitId = this.activeHistoryHabitId === habitId ? null : habitId;
        this.renderHabits();
    }

    toggleTaskHistory(taskId) {
        this.activeHistoryTaskId = this.activeHistoryTaskId === taskId ? null : taskId;
        this.renderTasks();
    }

    toggleEventHistory(eventId) {
        this.activeHistoryEventId = this.activeHistoryEventId === eventId ? null : eventId;
        this.renderEvents();
    }

    findTask(taskId) {
        return this.user.tasks.find(item => String(item.id) === String(taskId));
    }

    findPlanningEvent(eventId) {
        return this.user.events.find(item => String(item.id) === String(eventId));
    }

    findDailyHabit(habitId) {
        return this.user.habits.find(item => String(item.id) === String(habitId));
    }

    saveAndCheckAchievements() {
        AuthService.saveCurrentUser(this.user);
        const badges = AchievementService.checkAndSave(this.user);
        showBadgeNotifications(badges);
    }

    renderNotificationStatus() {
        const permission = NotificationService.getBrowserPermission();
        const settings = NotificationService.getSettings();

        if (!this.elements.notificationStatus) {
            return;
        }

        if (permission === "granted" || settings.browserEnabled) {
            this.elements.notificationStatus.textContent = "Notificações do navegador ativas.";
            this.elements.notificationStatus.className = "notification-status status-ok";
        }
        else if (permission === "denied") {
            this.elements.notificationStatus.textContent = "Permissão negada. A app vai usar avisos internos.";
            this.elements.notificationStatus.className = "notification-status status-warning";
        }
        else if (permission === "unsupported") {
            this.elements.notificationStatus.textContent = "Navegador sem suporte. A app vai usar avisos internos.";
            this.elements.notificationStatus.className = "notification-status status-warning";
        }
        else {
            this.elements.notificationStatus.textContent = "Notificações do navegador ainda não autorizadas.";
            this.elements.notificationStatus.className = "notification-status";
        }
    }

    render() {
        this.renderStats();
        this.renderTasks();
        this.renderEventStats();
        this.renderEvents();
        this.renderReflectionMessage();
        this.renderHabitStats();
        this.renderHabits();
        this.renderCalendar();
    }

    renderStats() {
        const total = this.user.tasks.length;
        const completed = this.user.tasks.filter(task => task.completed).length;
        const overdue = this.user.tasks.filter(task => task.isOverdue()).length;
        const pending = total - completed - overdue;

        this.elements.totalTasks.textContent = total;
        this.elements.completedTasks.textContent = completed;
        this.elements.pendingTasks.textContent = Math.max(pending, 0);
        this.elements.overdueTasks.textContent = overdue;
    }

    renderTasks() {
        const tasks = this.getFilteredTasks();
        this.elements.taskList.innerHTML = "";

        if (tasks.length === 0) {
            this.elements.taskList.innerHTML = `<li class="empty-state">Ainda não existem tarefas neste filtro.</li>`;
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement("li");
            const status = task.getStatus();
            const completedClass = task.completed ? "completed" : "";
            const overdueClass = status === "Atrasada" ? "overdue-task" : "";
            const priorityClass = `priority-${task.priority}`;
            const statusClass = `status-${status.toLowerCase()}`;

            li.className = overdueClass;
            li.innerHTML = `
                <div class="task-row-main task-row-rich">
                    <div class="task-info">
                        <div class="task-title-line">
                            <strong class="task-title ${completedClass}">${task.completed ? "✓" : "□"} ${this.escapeHtml(task.title)}</strong>
                            <span class="priority-badge ${priorityClass}">${task.priority}</span>
                            <span class="status-badge ${statusClass}">${status}</span>
                        </div>

                        <div class="task-meta-grid">
                            <span><strong>Criada:</strong> ${this.formatDateTime(task.createdAt)}</span>
                            <span><strong>Limite:</strong> ${this.formatDeadline(task)}</span>
                            <span><strong>Lembrete:</strong> ${this.formatReminders(task.reminders)}</span>
                        </div>
                    </div>

                    <div class="button-row task-actions">
                        ${!task.completed ? `<button class="completeTask success-button" data-id="${task.id}">Concluir</button>` : ""}
                        <button class="editTask secondary-button" data-id="${task.id}">Editar</button>
                        <button class="historyTask secondary-button" data-id="${task.id}">Ver versões</button>
                        <button class="deleteTask danger-button" data-id="${task.id}">Remover</button>
                    </div>
                </div>

                ${this.activeHistoryTaskId === String(task.id) ? this.renderVersionHistory(task.versionHistory, "Histórico de versões da tarefa") : ""}
            `;

            this.elements.taskList.appendChild(li);
        });

        this.bindTaskButtons();
    }

    renderEventStats() {
        const total = this.user.events.length;
        const planned = this.user.events.filter(event => event.getStatus() === "Planeado").length;
        const active = this.user.events.filter(event => event.getStatus() === "Em andamento").length;
        const overdue = this.user.events.filter(event => event.getStatus() === "Atrasado").length;

        this.elements.totalEvents.textContent = total;
        this.elements.plannedEvents.textContent = planned;
        this.elements.activeEvents.textContent = active;
        this.elements.overdueEvents.textContent = overdue;
    }

    renderEvents() {
        const events = this.user.events
            .slice()
            .sort((a, b) => this.getSortableDate(a.getStartDateTime()) - this.getSortableDate(b.getStartDateTime()));

        this.elements.eventList.innerHTML = "";

        if (events.length === 0) {
            this.elements.eventList.innerHTML = `<li class="empty-state">Ainda não existem eventos de planeamento.</li>`;
            return;
        }

        events.forEach(planningEvent => {
            const li = document.createElement("li");
            const status = planningEvent.getStatus();
            const statusClass = `status-${this.createCssToken(status)}`;
            const overdueClass = status === "Atrasado" ? "overdue-task" : "";

            li.className = overdueClass;
            li.innerHTML = `
                <div class="event-row-rich">
                    <div class="task-info">
                        <div class="task-title-line">
                            <strong class="task-title ${planningEvent.completed ? "completed" : ""}">${planningEvent.completed ? "✓" : "□"} ${this.escapeHtml(planningEvent.title)}</strong>
                            <span class="priority-badge category-badge">${this.escapeHtml(planningEvent.category)}</span>
                            <span class="status-badge ${statusClass}">${status}</span>
                        </div>

                        ${planningEvent.description ? `<p class="event-description">${this.escapeHtml(planningEvent.description)}</p>` : ""}

                        <div class="task-meta-grid event-meta-grid">
                            <span><strong>Criado:</strong> ${this.formatDateTime(planningEvent.createdAt)}</span>
                            <span><strong>Início:</strong> ${this.formatEventStart(planningEvent)}</span>
                            <span><strong>Limite:</strong> ${this.formatEventDeadline(planningEvent)}</span>
                            <span><strong>Lembretes:</strong> ${this.formatReminders(planningEvent.reminders)}</span>
                        </div>
                    </div>

                    <div class="button-row task-actions">
                        ${planningEvent.isStartInFuture() && !planningEvent.completed ? `<button class="startEventNow success-button" data-id="${planningEvent.id}">Começar agora</button>` : ""}
                        ${!planningEvent.completed ? `<button class="completeEvent success-button" data-id="${planningEvent.id}">Concluir</button>` : `<button class="reopenEvent secondary-button" data-id="${planningEvent.id}">Reabrir</button>`}
                        <button class="editEvent secondary-button" data-id="${planningEvent.id}">Editar</button>
                        <button class="historyEvent secondary-button" data-id="${planningEvent.id}">Ver versões</button>
                        <button class="deleteEvent danger-button" data-id="${planningEvent.id}">Remover</button>
                    </div>
                </div>

                ${planningEvent.isStartInFuture() && !planningEvent.completed ? this.renderFutureStartNote(planningEvent) : ""}
                ${this.activeHistoryEventId === String(planningEvent.id) ? this.renderVersionHistory(planningEvent.versionHistory, "Histórico de versões do evento") : ""}
            `;

            this.elements.eventList.appendChild(li);
        });

        this.bindEventButtons();
    }

    renderReflectionMessage() {
        const futureEvent = this.lastFutureEventId ? this.findPlanningEvent(this.lastFutureEventId) : null;

        if (!futureEvent || !futureEvent.isStartInFuture()) {
            this.elements.eventReflectionMessage.classList.add("d-none");
            this.elements.eventReflectionMessage.innerHTML = "";
            return;
        }

        this.elements.eventReflectionMessage.classList.remove("d-none");
        this.elements.eventReflectionMessage.innerHTML = `
            <strong>Tens certeza de que não queres começar esta tarefa agora?</strong>
            Às vezes subestimamos o tempo necessário.
            <button type="button" class="startEventNow reflection-button" data-id="${futureEvent.id}">Começar agora</button>
        `;

        this.elements.eventReflectionMessage.querySelector(".startEventNow")
            .addEventListener("click", event => this.startPlanningEventNow(event.target.dataset.id));
    }

    renderFutureStartNote(planningEvent) {
        return `
            <div class="reflection-message inline-reflection">
                <strong>Começo futuro:</strong>
                Tens certeza de que não queres começar esta tarefa agora? Às vezes subestimamos o tempo necessário.
            </div>
        `;
    }

    renderVersionHistory(history = [], title = "Histórico de versões") {
        if (!history || history.length === 0) {
            return `<div class="version-history-panel"><p class="empty-state">Ainda não existe histórico.</p></div>`;
        }

        const items = history
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(version => `
                <li>
                    <span class="version-date">${this.formatDateTime(version.date)}</span>
                    <strong>${this.escapeHtml(version.type)}</strong>
                    <span>Anterior: ${this.escapeHtml(this.stringifyVersionValue(version.oldValue))}</span>
                    <span>Novo: ${this.escapeHtml(this.stringifyVersionValue(version.newValue))}</span>
                </li>
            `)
            .join("");

        return `
            <div class="version-history-panel">
                <h4>${title}</h4>
                <ul class="version-history-list">${items}</ul>
            </div>
        `;
    }


    renderHabitStats() {
        const total = this.user.habits.length;
        const completedToday = this.user.habits.filter(habit => habit.isDoneToday()).length;
        const pendingToday = total - completedToday;
        const maxStreak = this.user.habits.reduce((max, habit) => Math.max(max, habit.getCurrentStreak()), 0);

        this.elements.totalHabits.textContent = total;
        this.elements.completedHabitsToday.textContent = completedToday;
        this.elements.pendingHabitsToday.textContent = Math.max(pendingToday, 0);
        this.elements.currentHabitStreak.textContent = maxStreak;
    }

    renderHabits() {
        const habits = this.user.habits
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        this.elements.habitList.innerHTML = "";

        if (habits.length === 0) {
            this.elements.habitList.innerHTML = `<li class="empty-state">Ainda não existem hábitos diários.</li>`;
            return;
        }

        habits.forEach(habit => {
            const li = document.createElement("li");
            const status = habit.getStatusToday();
            const doneToday = status === "Feito";
            const statusClass = doneToday ? "status-feito" : "status-pendente";

            li.className = doneToday ? "habit-done-today" : "";
            li.innerHTML = `
                <div class="habit-row-rich">
                    <div class="task-info">
                        <div class="task-title-line">
                            <strong class="task-title ${doneToday ? "completed" : ""}">${doneToday ? "✓" : "□"} ${this.escapeHtml(habit.title)}</strong>
                            <span class="status-badge ${statusClass}">${status} hoje</span>
                        </div>

                        ${habit.description ? `<p class="event-description">${this.escapeHtml(habit.description)}</p>` : ""}

                        <div class="task-meta-grid habit-meta-grid">
                            <span><strong>Criado:</strong> ${this.formatDateTime(habit.createdAt)}</span>
                            <span><strong>Dias concluídos:</strong> ${habit.getCompletedDaysTotal()}</span>
                            <span><strong>Sequência atual:</strong> ${habit.getCurrentStreak()} dia(s)</span>
                        </div>
                    </div>

                    <div class="button-row task-actions">
                        ${!doneToday ? `<button class="completeHabit success-button" data-id="${habit.id}">Marcar como feito hoje</button>` : `<button class="uncompleteHabit secondary-button" data-id="${habit.id}">Desmarcar hoje</button>`}
                        <button class="editHabit secondary-button" data-id="${habit.id}">Editar</button>
                        <button class="historyHabit secondary-button" data-id="${habit.id}">Ver histórico</button>
                        <button class="deleteHabit danger-button" data-id="${habit.id}">Remover</button>
                    </div>
                </div>

                ${this.activeHistoryHabitId === String(habit.id) ? this.renderHabitHistory(habit) : ""}
            `;

            this.elements.habitList.appendChild(li);
        });

        this.bindHabitButtons();
    }

    renderHabitHistory(habit) {
        const completions = habit.getSortedCompletions();
        const completionItems = completions.length > 0
            ? completions.map(item => `<li><span class="version-date">${this.formatDate(item.date)}</span><strong>Conclusão</strong><span>Feito às ${this.formatDateTime(item.completedAt)}</span></li>`).join("")
            : `<li><span class="version-date">-</span><strong>Sem conclusões</strong><span>Este hábito ainda não foi marcado como feito.</span></li>`;

        const historyItems = (habit.history || [])
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(entry => `
                <li>
                    <span class="version-date">${this.formatDateTime(entry.date)}</span>
                    <strong>${this.escapeHtml(entry.type)}</strong>
                    <span>Anterior: ${this.escapeHtml(this.stringifyVersionValue(entry.oldValue))}</span>
                    <span>Novo: ${this.escapeHtml(this.stringifyVersionValue(entry.newValue))}</span>
                </li>
            `)
            .join("");

        return `
            <div class="version-history-panel habit-history-panel">
                <h4>Histórico do hábito</h4>
                <p class="text-muted mb-2">Datas em que o hábito foi concluído.</p>
                <ul class="version-history-list habit-completion-list">${completionItems}</ul>
                <h4 class="mt-3">Alterações do hábito</h4>
                <ul class="version-history-list">${historyItems}</ul>
            </div>
        `;
    }


    renderCalendar() {
        const year = this.calendarCurrentMonth.getFullYear();
        const month = this.calendarCurrentMonth.getMonth();
        const monthTitle = this.calendarCurrentMonth.toLocaleDateString("pt-PT", {
            month: "long",
            year: "numeric"
        });
        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstWeekdayIndex = (firstDay.getDay() + 6) % 7;
        const todayKey = this.getDateKey(new Date());

        this.elements.calendarMonthTitle.textContent = monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1);
        this.elements.calendarGrid.innerHTML = "";

        for (let i = 0; i < firstWeekdayIndex; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.className = "calendar-day empty-calendar-day";
            this.elements.calendarGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = this.getDateKey(date);
            const entries = this.getCalendarEntriesForDate(dateKey);
            const button = document.createElement("button");
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === this.selectedCalendarDate;
            const hasEntries = entries.length > 0;

            button.type = "button";
            button.className = [
                "calendar-day",
                isToday ? "calendar-today" : "",
                isSelected ? "calendar-selected" : "",
                hasEntries ? "calendar-has-items" : ""
            ].filter(Boolean).join(" ");
            button.dataset.date = dateKey;
            button.innerHTML = `
                <span class="calendar-day-number">${day}</span>
                ${hasEntries ? `<span class="calendar-item-count">${entries.length}</span>` : ""}
            `;

            this.elements.calendarGrid.appendChild(button);
        }

        this.elements.calendarDate.value = this.selectedCalendarDate;
        this.bindCalendarButtons();
        this.renderSelectedCalendarDay();
    }

    renderSelectedCalendarDay() {
        const entries = this.getCalendarEntriesForDate(this.selectedCalendarDate)
            .sort((a, b) => String(a.time || "23:59").localeCompare(String(b.time || "23:59")));

        this.elements.selectedCalendarDateTitle.textContent = `Itens de ${this.formatDate(this.selectedCalendarDate)}`;
        this.elements.calendarDayItems.innerHTML = "";

        if (entries.length === 0) {
            this.elements.calendarDayItems.innerHTML = `<p class="empty-state">Não existem itens para este dia.</p>`;
            return;
        }

        entries.forEach(entry => {
            const item = document.createElement("div");
            const sourceClass = `calendar-source-${this.createCssToken(entry.source)}`;

            item.className = `calendar-day-item ${sourceClass}`;
            item.innerHTML = `
                <div class="calendar-day-item-header">
                    <div>
                        <strong>${this.escapeHtml(entry.title)}</strong>
                        <div class="calendar-day-item-meta">
                            <span>${this.escapeHtml(entry.source)}</span>
                            <span>${this.escapeHtml(entry.type)}</span>
                            ${entry.time ? `<span>${this.escapeHtml(entry.time)}</span>` : ""}
                        </div>
                    </div>
                    <span class="priority-badge category-badge">${this.escapeHtml(entry.category)}</span>
                </div>
                ${entry.description ? `<p>${this.escapeHtml(entry.description)}</p>` : ""}
                ${entry.createdAt ? `<small>Criado: ${this.formatDateTime(entry.createdAt)}</small>` : ""}
                ${entry.reminders ? `<small>Lembrete: ${this.formatReminders(entry.reminders)}</small>` : ""}
                ${entry.editable ? `
                    <div class="button-row calendar-item-actions">
                        <button class="editCalendarItem secondary-button" data-id="${entry.id}">Editar</button>
                        <button class="deleteCalendarItem danger-button" data-id="${entry.id}">Remover</button>
                    </div>
                ` : ""}
            `;

            this.elements.calendarDayItems.appendChild(item);
        });

        this.bindCalendarItemButtons();
    }

    getCalendarEntriesForDate(dateKey) {
        const entries = [];

        // Itens próprios do calendário: são editáveis diretamente nesta secção.
        (this.user.calendarItems || []).forEach(item => {
            if (item.date === dateKey) {
                entries.push({
                    id: item.id,
                    source: "Calendário",
                    title: item.title,
                    description: item.description,
                    category: item.category,
                    type: item.type,
                    date: item.date,
                    time: item.time,
                    createdAt: item.createdAt,
                    reminders: item.reminders,
                    editable: true
                });
            }
        });

        // Tarefas: aparecem no calendário quando têm data limite.
        (this.user.tasks || []).forEach(task => {
            if (task.dueDate === dateKey) {
                entries.push({
                    id: task.id,
                    source: "Tarefa",
                    title: task.title,
                    description: `Estado: ${task.getStatus()}`,
                    category: task.priority,
                    type: "Data limite",
                    date: task.dueDate,
                    time: task.dueTime,
                    createdAt: task.createdAt,
                    editable: false
                });
            }
        });

        // Eventos: aparecem pelo menos no dia de início e no dia limite.
        (this.user.events || []).forEach(planningEvent => {
            if (planningEvent.startDate === dateKey) {
                entries.push({
                    id: `${planningEvent.id}-start`,
                    source: "Evento",
                    title: planningEvent.title,
                    description: planningEvent.description || `Estado: ${planningEvent.getStatus()}`,
                    category: planningEvent.category,
                    type: "Início",
                    date: planningEvent.startDate,
                    time: planningEvent.startTime,
                    createdAt: planningEvent.createdAt,
                    editable: false
                });
            }

            if (planningEvent.dueDate === dateKey) {
                entries.push({
                    id: `${planningEvent.id}-due`,
                    source: "Evento",
                    title: planningEvent.title,
                    description: planningEvent.description || `Estado: ${planningEvent.getStatus()}`,
                    category: planningEvent.category,
                    type: "Data limite",
                    date: planningEvent.dueDate,
                    time: planningEvent.dueTime,
                    createdAt: planningEvent.createdAt,
                    editable: false
                });
            }
        });

        // Hábitos: aparecem nos dias em que foram marcados como concluídos.
        (this.user.habits || []).forEach(habit => {
            habit.completedDates.forEach(completion => {
                if (completion.date === dateKey) {
                    entries.push({
                        id: `${habit.id}-${completion.date}`,
                        source: "Hábito",
                        title: habit.title,
                        description: habit.description || "Hábito concluído neste dia.",
                        category: "Rotina",
                        type: "Concluído",
                        date: completion.date,
                        time: completion.completedAt ? new Date(completion.completedAt).toTimeString().slice(0, 5) : "",
                        createdAt: completion.completedAt,
                        editable: false
                    });
                }
            });
        });

        return entries;
    }

    bindCalendarButtons() {
        document.querySelectorAll(".calendar-day:not(.empty-calendar-day)").forEach(button => {
            button.addEventListener("click", () => {
                this.selectedCalendarDate = button.dataset.date;
                this.elements.calendarDate.value = this.selectedCalendarDate;
                this.renderCalendar();
            });
        });
    }

    bindCalendarItemButtons() {
        document.querySelectorAll(".editCalendarItem").forEach(button => {
            button.addEventListener("click", () => this.editCalendarItem(button.dataset.id));
        });

        document.querySelectorAll(".deleteCalendarItem").forEach(button => {
            button.addEventListener("click", () => this.deleteCalendarItem(button.dataset.id));
        });
    }

    createRemindersFromSelect(trigger, value) {
        const reminder = NotificationService.createReminder(trigger, value);
        return reminder ? [reminder] : [];
    }

    promptReminderValue(label, reminders = [], trigger) {
        const currentValue = NotificationService.getReminderSelectValue(reminders, trigger);
        const options = "none, 0, 10, 30, 120, 1440, 10080";
        const value = prompt(`${label}: usa ${options}. none = sem lembrete.`, currentValue) || currentValue;

        return ["none", "0", "10", "30", "120", "1440", "10080"].includes(String(value))
            ? String(value)
            : currentValue;
    }

    formatReminders(reminders = []) {
        if (!reminders || reminders.length === 0) {
            return "Sem lembrete";
        }

        return reminders
            .map(reminder => {
                const trigger = reminder.trigger === "start"
                    ? "início"
                    : reminder.trigger === "due"
                        ? "limite"
                        : "data";
                const sent = reminder.sent ? " - enviado" : "";
                return `${reminder.label} (${trigger})${sent}`;
            })
            .join("; ");
    }

    getFilteredTasks() {
        return this.user.tasks.filter(task => {
            const status = task.getStatus();
            const matchesStatus = this.statusFilter === "all"
                || (this.statusFilter === "pending" && status === "Pendente")
                || (this.statusFilter === "completed" && status === "Concluída")
                || (this.statusFilter === "overdue" && status === "Atrasada");

            const matchesPriority = this.priorityFilter === "all" || task.priority === this.priorityFilter;

            return matchesStatus && matchesPriority;
        });
    }

    bindTaskButtons() {
        document.querySelectorAll(".completeTask").forEach(button => {
            button.addEventListener("click", () => this.completeTask(button.dataset.id));
        });

        document.querySelectorAll(".editTask").forEach(button => {
            button.addEventListener("click", () => this.editTask(button.dataset.id));
        });

        document.querySelectorAll(".historyTask").forEach(button => {
            button.addEventListener("click", () => this.toggleTaskHistory(button.dataset.id));
        });

        document.querySelectorAll(".deleteTask").forEach(button => {
            button.addEventListener("click", () => this.deleteTask(button.dataset.id));
        });
    }

    bindEventButtons() {
        document.querySelectorAll(".startEventNow").forEach(button => {
            button.addEventListener("click", () => this.startPlanningEventNow(button.dataset.id));
        });

        document.querySelectorAll(".completeEvent").forEach(button => {
            button.addEventListener("click", () => this.completePlanningEvent(button.dataset.id));
        });

        document.querySelectorAll(".reopenEvent").forEach(button => {
            button.addEventListener("click", () => this.reopenPlanningEvent(button.dataset.id));
        });

        document.querySelectorAll(".editEvent").forEach(button => {
            button.addEventListener("click", () => this.editPlanningEvent(button.dataset.id));
        });

        document.querySelectorAll(".historyEvent").forEach(button => {
            button.addEventListener("click", () => this.toggleEventHistory(button.dataset.id));
        });

        document.querySelectorAll(".deleteEvent").forEach(button => {
            button.addEventListener("click", () => this.deletePlanningEvent(button.dataset.id));
        });
    }


    bindHabitButtons() {
        document.querySelectorAll(".completeHabit").forEach(button => {
            button.addEventListener("click", () => this.markHabitDoneToday(button.dataset.id));
        });

        document.querySelectorAll(".uncompleteHabit").forEach(button => {
            button.addEventListener("click", () => this.unmarkHabitDoneToday(button.dataset.id));
        });

        document.querySelectorAll(".editHabit").forEach(button => {
            button.addEventListener("click", () => this.editDailyHabit(button.dataset.id));
        });

        document.querySelectorAll(".historyHabit").forEach(button => {
            button.addEventListener("click", () => this.toggleHabitHistory(button.dataset.id));
        });

        document.querySelectorAll(".deleteHabit").forEach(button => {
            button.addEventListener("click", () => this.deleteDailyHabit(button.dataset.id));
        });
    }


    getDateKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    getMonthStartFromKey(dateKey) {
        const date = new Date(`${dateKey}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            const today = new Date();
            return new Date(today.getFullYear(), today.getMonth(), 1);
        }

        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    isDateOrderValid(startDate, startTime, dueDate, dueTime) {
        const start = new Date(`${startDate}T${startTime || "00:00"}`);
        const due = new Date(`${dueDate}T${dueTime || "23:59"}`);

        if (Number.isNaN(start.getTime()) || Number.isNaN(due.getTime())) {
            return false;
        }

        return due >= start;
    }

    getSortableDate(date) {
        return date instanceof Date && !Number.isNaN(date.getTime()) ? date.getTime() : Number.MAX_SAFE_INTEGER;
    }

    formatDeadline(task) {
        if (!task.dueDate) {
            return "Sem data limite";
        }

        const date = this.formatDate(task.dueDate);
        return task.dueTime ? `${date} às ${task.dueTime}` : date;
    }

    formatEventStart(planningEvent) {
        if (!planningEvent.startDate) {
            return "Sem data de início";
        }

        const date = this.formatDate(planningEvent.startDate);
        return planningEvent.startTime ? `${date} às ${planningEvent.startTime}` : date;
    }

    formatEventDeadline(planningEvent) {
        if (!planningEvent.dueDate) {
            return "Sem data limite";
        }

        const date = this.formatDate(planningEvent.dueDate);
        return planningEvent.dueTime ? `${date} às ${planningEvent.dueTime}` : date;
    }

    formatDate(dateValue) {
        const date = new Date(`${dateValue}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return "Data inválida";
        }

        return date.toLocaleDateString("pt-PT");
    }

    formatDateTime(dateValue) {
        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Sem data";
        }

        return date.toLocaleString("pt-PT", {
            dateStyle: "short",
            timeStyle: "short"
        });
    }

    stringifyVersionValue(value) {
        if (value === null || value === undefined || value === "") {
            return "-";
        }

        if (typeof value === "object") {
            return JSON.stringify(value);
        }

        return String(value);
    }

    createCssToken(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}

const user = initPrivatePage("tasks");

if (user) {
    new TaskView(user);
}
