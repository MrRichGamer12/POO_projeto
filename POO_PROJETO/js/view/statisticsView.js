import { initPrivatePage } from "./commonView.js";
import StatsService from "../service/StatsService.js";
import AchievementService from "../service/AchievementService.js";

class StatisticsView {

    constructor(user) {
        this.user = user;
        AchievementService.checkAndSave(this.user);
        this.render();
    }

    render() {
        const summary = StatsService.getSummary(this.user);

        document.getElementById("statFocusSessions").textContent = summary.focusSessions;
        document.getElementById("statBreaks").textContent = summary.breaks;
        document.getElementById("statFocusMinutes").textContent = `${summary.focusMinutes} min`;
        document.getElementById("statTasksCreated").textContent = summary.tasksCreated;
        document.getElementById("statTasksCompleted").textContent = summary.tasksCompleted;
        document.getElementById("statAchievements").textContent = summary.achievements;
        document.getElementById("statProgress").textContent = `${summary.progress}%`;

        this.renderBarChart("focusDailyChart", StatsService.groupSessionsByDay(this.user, "focus"));
        this.renderBarChart("focusWeeklyChart", StatsService.groupSessionsByWeek(this.user, "focus"));
        this.renderBarChart("tasksDailyChart", StatsService.groupCompletedTasksByDay(this.user));
        this.renderBarChart("tasksWeeklyChart", StatsService.groupCompletedTasksByWeek(this.user));
        this.renderBarChart("badgesDailyChart", StatsService.groupBadgesByDay(this.user));
        this.renderBarChart("weeklyComparisonChart", StatsService.getWeeklyComparison(this.user));
    }

    renderBarChart(containerId, data) {
        const container = document.getElementById(containerId);
        container.innerHTML = "";

        if (!data || data.length === 0) {
            container.innerHTML = `<p class="empty-state">Ainda não existem dados suficientes.</p>`;
            return;
        }

        const maxValue = Math.max(...data.map(item => item.value), 1);

        data.forEach(item => {
            const row = document.createElement("div");
            row.className = "chart-row";
            row.innerHTML = `
                <span class="chart-label">${item.label}</span>
                <div class="chart-track">
                    <div class="chart-bar" style="width: ${(item.value / maxValue) * 100}%"></div>
                </div>
                <span class="chart-value">${item.value}</span>
            `;

            container.appendChild(row);
        });
    }
}

const user = initPrivatePage("statistics");

if (user) {
    new StatisticsView(user);
}
