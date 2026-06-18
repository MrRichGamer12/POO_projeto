
import { initPrivatePage } from "./commonView.js";
import StatsService from "../service/StatsService.js";
import AchievementService from "../service/AchievementService.js";
import AuthService from "../service/AuthService.js";



class StatisticsView {

    constructor(user) {
        this.user = user;
        this.period = "all";

        this.elements = {
            period: document.getElementById("statisticsPeriod")
        };

        
        AchievementService.checkAndSave(this.user);
        this.user = AuthService.getCurrentUser() || this.user;

        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.elements.period?.addEventListener("change", event => {
            this.period = event.target.value;
            this.render();
        });
    }

    render() {
        const stats = StatsService.getAdvancedUserStats(this.user, this.period);

        this.renderMainCards(stats.cards);
        this.renderTasks(stats.tasks);
        this.renderEvents(stats.events);
        this.renderHabits(stats.habits);
        this.renderCalendar(stats.calendar);
        this.renderPomodoro(stats.pomodoro);
        this.renderAchievements(stats.achievements);
    }

    renderMainCards(cards) {
        this.setText("statTasksTotal", cards.tasksTotal);
        this.setText("statTasksCompleted", cards.tasksCompleted);
        this.setText("statTasksOverdue", cards.tasksOverdue);
        this.setText("statEventsTotal", cards.eventsTotal);
        this.setText("statEventsCompleted", cards.eventsCompleted);
        this.setText("statEventsOverdue", cards.eventsOverdue);
        this.setText("statHabitsTotal", cards.habitsTotal);
        this.setText("statHabitsToday", cards.habitsDoneToday);
        this.setText("statCalendarItems", cards.calendarItemsTotal);
        this.setText("statFocusSessions", cards.focusSessions);
        this.setText("statFocusMinutes", `${cards.focusMinutes} min`);
        this.setText("statAchievements", cards.achievements);
    }

    renderTasks(tasks) {
        this.setText("taskCompletionPercent", `${tasks.completionPercent}% concluídas`);
        this.renderBarChart("tasksPriorityChart", tasks.byPriority);
        this.renderBarChart("tasksStatusChart", tasks.byStatus);
        this.renderBarChart("tasksCreatedDailyChart", tasks.createdByDay);
        this.renderBarChart("tasksCompletedDailyChart", tasks.completedByDay);
    }

    renderEvents(events) {
        this.renderBarChart("eventsStatusChart", events.byStatus);
        this.renderBarChart("eventsCategoryChart", events.byCategory);
        this.renderBarChart("eventsMonthlyChart", events.byMonth);
    }

    renderHabits(habits) {
        this.setText("habitTotalCompletions", habits.totalCompletions);
        this.setText("habitBestStreak", `${habits.currentStreak} dias`);
        this.setText("habitBestTitle", habits.bestHabitTitle || "Sem sequência ativa");
        this.renderBarChart("habitsDailyChart", habits.completionsByDay);
        this.renderBarChart("habitsWeeklyChart", habits.completionsByWeek);
    }

    renderCalendar(calendar) {
        this.setText("calendarCurrentMonth", `${calendar.currentMonthItems} este mês`);
        this.renderBarChart("calendarCategoryChart", calendar.byCategory);
        this.renderBarChart("calendarTypeChart", calendar.byType);
        this.renderUpcomingCalendarItems(calendar.nextItems);
    }

    renderPomodoro(pomodoro) {
        this.setText("pomodoroAverage", `${pomodoro.averageMinutes} min/sessão`);
        this.setText("pomodoroCustomProfiles", pomodoro.customProfiles);
        this.setText("pomodoroLastSession", pomodoro.lastPomodoro ? this.formatDateTime(pomodoro.lastPomodoro.date) : "Sem dados");
        this.renderBarChart("focusDailyChart", pomodoro.sessionsByDay);
        this.renderBarChart("focusWeeklyChart", pomodoro.sessionsByWeek);
    }

    renderAchievements(achievements) {
        this.setText("achievementProgressText", `${achievements.progress}%`);
        this.setText(
            "achievementSummaryText",
            `${achievements.unlocked} conquistas desbloqueadas e ${achievements.locked} ainda bloqueadas.`
        );

        const progressBar = document.getElementById("achievementProgressBar");
        if (progressBar) {
            progressBar.style.width = `${achievements.progress}%`;
        }

        this.renderLatestAchievements(achievements.latest);
    }

    renderBarChart(containerId, data) {
        const container = document.getElementById(containerId);

        if (!container) {
            return;
        }

        container.innerHTML = "";

        if (!data || data.length === 0 || data.every(item => Number(item.value) === 0)) {
            container.innerHTML = `<p class="empty-state">Ainda não existem dados suficientes neste período.</p>`;
            return;
        }

        const maxValue = Math.max(...data.map(item => Number(item.value) || 0), 1);

        data.forEach(item => {
            const value = Number(item.value) || 0;
            const row = document.createElement("div");
            row.className = "chart-row statistics-chart-row";
            row.innerHTML = `
                <span class="chart-label">${item.label}</span>
                <div class="chart-track">
                    <div class="chart-bar" style="width: ${(value / maxValue) * 100}%"></div>
                </div>
                <span class="chart-value">${value}</span>
            `;

            container.appendChild(row);
        });
    }

    renderUpcomingCalendarItems(items) {
        const container = document.getElementById("upcomingCalendarItems");
        if (!container) {
            return;
        }

        if (!items || items.length === 0) {
            container.innerHTML = `<p class="empty-state">Não existem próximos itens de calendário.</p>`;
            return;
        }

        container.innerHTML = items.map(item => `
            <article class="statistics-list-item">
                <strong>${item.title}</strong>
                <span>${item.type} · ${item.category}</span>
                <small>${this.formatDate(item.date)}${item.time ? ` às ${item.time}` : ""}</small>
            </article>
        `).join("");
    }

    renderLatestAchievements(items) {
        const container = document.getElementById("latestAchievements");
        if (!container) {
            return;
        }

        if (!items || items.length === 0) {
            container.innerHTML = `<p class="empty-state">Ainda não existem conquistas desbloqueadas.</p>`;
            return;
        }

        container.innerHTML = items.map(item => `
            <article class="statistics-list-item">
                <strong>${item.name}</strong>
                <span>${item.description || "Conquista desbloqueada."}</span>
                <small>${this.formatDateTime(item.unlockedAt)}</small>
            </article>
        `).join("");
    }

    setText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    formatDate(value) {
        if (!value) {
            return "Sem data";
        }

        const date = new Date(String(value).includes("T") ? value : `${value}T12:00:00`);
        if (Number.isNaN(date.getTime())) {
            return "Sem data";
        }

        return date.toLocaleDateString("pt-PT");
    }

    formatDateTime(value) {
        if (!value) {
            return "Sem data";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "Sem data";
        }

        return date.toLocaleString("pt-PT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }
}

const user = initPrivatePage("statistics");

if (user) {
    new StatisticsView(user);
}
