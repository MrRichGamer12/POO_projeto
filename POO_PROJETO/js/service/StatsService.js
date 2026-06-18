import AchievementService from "./AchievementService.js";

export default class StatsService {

    static getSummary(user) {
        const focusSessions = AchievementService.countFocusSessions(user);
        const breaks = AchievementService.countBreaks(user);
        const focusMinutes = (user.focusHistory || [])
            .filter(session => session.type !== "break")
            .reduce((total, session) => total + (Number(session.minutes) || 0), 0);
        const tasksCreated = (user.tasks || []).length;
        const tasksCompleted = AchievementService.countCompletedTasks(user);
        const achievements = (user.badges || []).length;
        const achievementTotal = AchievementService.definitions.length;
        const progress = achievementTotal > 0
            ? Math.round((achievements / achievementTotal) * 100)
            : 0;

        return {
            focusSessions,
            breaks,
            focusMinutes,
            tasksCreated,
            tasksCompleted,
            achievements,
            progress,
            points: Number(user.points) || 0,
            level: Number(user.level) || 1
        };
    }

    static groupSessionsByDay(user, type = "focus") {
        const sessions = (user.focusHistory || []).filter(session => {
            if (type === "focus") {
                return session.type !== "break";
            }
            return session.type === type;
        });

        return this.groupByDate(sessions, session => session.date);
    }

    static groupSessionsByWeek(user, type = "focus") {
        const sessions = (user.focusHistory || []).filter(session => {
            if (type === "focus") {
                return session.type !== "break";
            }
            return session.type === type;
        });

        return this.groupByWeek(sessions, session => session.date);
    }

    static groupCompletedTasksByDay(user) {
        const tasks = (user.tasks || []).filter(task => task.completed && task.completedAt);
        return this.groupByDate(tasks, task => task.completedAt);
    }

    static groupCompletedTasksByWeek(user) {
        const tasks = (user.tasks || []).filter(task => task.completed && task.completedAt);
        return this.groupByWeek(tasks, task => task.completedAt);
    }

    static groupBadgesByDay(user) {
        return this.groupByDate(user.badges || [], badge => badge.unlockedAt);
    }

    static groupBadgesByWeek(user) {
        return this.groupByWeek(user.badges || [], badge => badge.unlockedAt);
    }

    static getWeeklyComparison(user) {
        const focus = this.totalFromGroups(this.groupSessionsByWeek(user, "focus"));
        const tasks = this.totalFromGroups(this.groupCompletedTasksByWeek(user));
        const badges = this.totalFromGroups(this.groupBadgesByWeek(user));

        return [
            { label: "Pomodoro", value: focus },
            { label: "Tarefas", value: tasks },
            { label: "Conquistas", value: badges }
        ];
    }

    static groupByDate(items, getDate) {
        const grouped = {};

        items.forEach(item => {
            const date = new Date(getDate(item));
            const key = Number.isNaN(date.getTime())
                ? "Sem data"
                : date.toISOString().slice(0, 10);

            grouped[key] = (grouped[key] || 0) + 1;
        });

        return this.toChartData(grouped);
    }

    static groupByWeek(items, getDate) {
        const grouped = {};

        items.forEach(item => {
            const date = new Date(getDate(item));
            const key = Number.isNaN(date.getTime())
                ? "Sem semana"
                : this.getWeekLabel(date);

            grouped[key] = (grouped[key] || 0) + 1;
        });

        return this.toChartData(grouped);
    }

    static getWeekLabel(date) {
        const year = date.getFullYear();
        const firstDay = new Date(year, 0, 1);
        const pastDays = Math.floor((date - firstDay) / 86400000);
        const week = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);

        return `${year} - S${String(week).padStart(2, "0")}`;
    }

    static toChartData(grouped) {
        return Object.entries(grouped)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .slice(-7)
            .map(([label, value]) => ({ label, value }));
    }

    static totalFromGroups(groups) {
        return groups.reduce((total, item) => total + item.value, 0);
    }
}
