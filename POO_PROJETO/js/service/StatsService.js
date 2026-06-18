
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

    
    
    static getAdminUserMetrics(user, referenceDate = new Date()) {
        const summary = this.getSummary(user);
        const tasks = Array.isArray(user.tasks) ? user.tasks : [];
        const events = Array.isArray(user.events) ? user.events : [];
        const habits = Array.isArray(user.habits) ? user.habits : [];
        const calendarItems = Array.isArray(user.calendarItems) ? user.calendarItems : [];

        const tasksCompleted = tasks.filter(task => Boolean(task.completed)).length;
        const tasksOverdue = tasks.filter(task => this.isTaskOverdue(task, referenceDate)).length;
        const eventsCompleted = events.filter(event => Boolean(event.completed)).length;
        const eventsOverdue = events.filter(event => this.isEventOverdue(event, referenceDate)).length;
        const habitsDoneToday = habits.filter(habit => this.isHabitDoneToday(habit, referenceDate)).length;

        return {
            id: user.id || user.email,
            name: user.name || "Utilizador",
            email: user.email || user.username || "-",
            role: user.role || "user",
            bio: user.bio || "",
            createdAt: user.createdAt || "",
            lastActivity: this.getLastActivity(user),
            tasksTotal: tasks.length,
            tasksCompleted,
            tasksOverdue,
            eventsTotal: events.length,
            eventsCompleted,
            eventsOverdue,
            habitsTotal: habits.length,
            habitsDoneToday,
            calendarItemsTotal: calendarItems.length,
            focusSessions: summary.focusSessions,
            focusMinutes: summary.focusMinutes,
            achievements: summary.achievements,
            points: summary.points,
            level: summary.level
        };
    }

    
    static getAdminSummary(users = [], referenceDate = new Date()) {
        const metrics = users.map(user => this.getAdminUserMetrics(user, referenceDate));

        return metrics.reduce((total, item) => ({
            users: total.users + 1,
            regularUsers: total.regularUsers + (item.role === "user" ? 1 : 0),
            admins: total.admins + (item.role === "admin" ? 1 : 0),
            tasks: total.tasks + item.tasksTotal,
            tasksOverdue: total.tasksOverdue + item.tasksOverdue,
            events: total.events + item.eventsTotal,
            habits: total.habits + item.habitsTotal,
            focusSessions: total.focusSessions + item.focusSessions,
            focusMinutes: total.focusMinutes + item.focusMinutes
        }), {
            users: 0,
            regularUsers: 0,
            admins: 0,
            tasks: 0,
            tasksOverdue: 0,
            events: 0,
            habits: 0,
            focusSessions: 0,
            focusMinutes: 0
        });
    }

    
    
    static isTaskOverdue(task, referenceDate = new Date()) {
        if (typeof task?.isOverdue === "function") {
            return task.isOverdue(referenceDate);
        }

        if (!task?.dueDate || task.completed) {
            return false;
        }

        const date = new Date(`${task.dueDate}T${task.dueTime || "23:59"}`);
        return !Number.isNaN(date.getTime()) && date < referenceDate;
    }

    
    static isEventOverdue(event, referenceDate = new Date()) {
        if (typeof event?.isOverdue === "function") {
            return event.isOverdue(referenceDate);
        }

        if (!event?.dueDate || event.completed) {
            return false;
        }

        const date = new Date(`${event.dueDate}T${event.dueTime || "23:59"}`);
        return !Number.isNaN(date.getTime()) && date < referenceDate;
    }

    
    static isHabitDoneToday(habit, referenceDate = new Date()) {
        if (typeof habit?.isDoneToday === "function") {
            return habit.isDoneToday(referenceDate);
        }

        const today = this.toDateKey(referenceDate);
        return (habit?.completedDates || []).some(item => {
            if (typeof item === "string") {
                return item === today;
            }
            return item.date === today;
        });
    }

    
    static getLastActivity(user) {
        const dates = [];
        this.pushDate(dates, user.createdAt);

        (user.stats?.activityDates || []).forEach(day => this.pushDate(dates, `${day}T12:00:00`));
        (user.focusHistory || []).forEach(session => this.pushDate(dates, session.date));
        (user.badges || []).forEach(badge => this.pushDate(dates, badge.unlockedAt));
        (user.customFocusProfiles || []).forEach(profile => this.pushDate(dates, profile.createdAt));

        (user.tasks || []).forEach(task => {
            this.pushDate(dates, task.createdAt);
            this.pushDate(dates, task.completedAt);
            (task.versionHistory || []).forEach(version => this.pushDate(dates, version.date));
        });

        (user.events || []).forEach(event => {
            this.pushDate(dates, event.createdAt);
            this.pushDate(dates, event.completedAt);
            (event.versionHistory || []).forEach(version => this.pushDate(dates, version.date));
        });

        (user.habits || []).forEach(habit => {
            this.pushDate(dates, habit.createdAt);
            (habit.completedDates || []).forEach(item => this.pushDate(dates, item.completedAt || item.date));
            (habit.history || []).forEach(item => this.pushDate(dates, item.date));
        });

        (user.calendarItems || []).forEach(item => {
            this.pushDate(dates, item.createdAt);
            (item.history || []).forEach(history => this.pushDate(dates, history.date));
        });

        if (dates.length === 0) {
            return "";
        }

        return new Date(Math.max(...dates.map(date => date.getTime()))).toISOString();
    }

    static pushDate(list, value) {
        if (!value) {
            return;
        }

        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            list.push(date);
        }
    }

    static toDateKey(date = new Date()) {
        const value = date instanceof Date ? date : new Date(date);
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }


    
    
    static getAdvancedUserStats(user, period = "all", referenceDate = new Date()) {
        const filteredUser = this.getFilteredUserSnapshot(user, period, referenceDate);
        const summary = this.getSummary(filteredUser);
        const fullSummary = this.getSummary(user);
        const tasks = Array.isArray(filteredUser.tasks) ? filteredUser.tasks : [];
        const events = Array.isArray(filteredUser.events) ? filteredUser.events : [];
        const habits = Array.isArray(user.habits) ? user.habits : [];
        const calendarItems = Array.isArray(filteredUser.calendarItems) ? filteredUser.calendarItems : [];
        const achievements = Array.isArray(user.badges) ? user.badges : [];
        const referenceKey = this.toDateKey(referenceDate);

        const taskStatus = this.countTasksByStatus(tasks, referenceDate);
        const eventStatus = this.countEventsByStatus(events, referenceDate);
        const habitCompletions = this.getHabitCompletions(user, period, referenceDate);
        const habitsDoneToday = habits.filter(habit => this.isHabitDoneToday(habit, referenceDate)).length;
        const bestHabit = this.getBestHabitStreak(habits, referenceDate);
        const focusSessions = (filteredUser.focusHistory || []).filter(session => session.type !== "break");
        const lastPomodoro = this.getLastPomodoro(user);
        const achievementTotal = AchievementService.definitions.length;
        const lockedAchievements = Math.max(achievementTotal - achievements.length, 0);

        return {
            period,
            cards: {
                tasksTotal: tasks.length,
                tasksCompleted: taskStatus["Concluída"] || 0,
                tasksOverdue: taskStatus["Atrasada"] || 0,
                eventsTotal: events.length,
                eventsCompleted: eventStatus["Concluído"] || 0,
                eventsOverdue: eventStatus["Atrasado"] || 0,
                habitsTotal: habits.length,
                habitsDoneToday,
                calendarItemsTotal: calendarItems.length,
                focusSessions: summary.focusSessions,
                focusMinutes: summary.focusMinutes,
                achievements: achievements.length
            },
            tasks: {
                byPriority: this.toFixedChartData(this.countBy(tasks, task => task.priority || "Média"), ["Baixa", "Média", "Alta"]),
                byStatus: this.toFixedChartData(taskStatus, ["Pendente", "Concluída", "Atrasada"]),
                completionPercent: tasks.length ? Math.round(((taskStatus["Concluída"] || 0) / tasks.length) * 100) : 0,
                createdByDay: this.groupByDate(tasks, task => task.createdAt),
                completedByDay: this.groupCompletedTasksByDay(filteredUser),
                completedByWeek: this.groupCompletedTasksByWeek(filteredUser)
            },
            events: {
                total: events.length,
                byStatus: this.toFixedChartData(eventStatus, ["Planeado", "Em andamento", "Concluído", "Atrasado"]),
                byCategory: this.toChartData(this.countBy(events, event => event.category || "Sem categoria")),
                byMonth: this.groupByMonth(events, event => event.createdAt || event.startDate)
            },
            habits: {
                total: habits.length,
                doneToday: habitsDoneToday,
                totalCompletions: habitCompletions.length,
                currentStreak: bestHabit.streak,
                bestHabitTitle: bestHabit.title,
                completionsByDay: this.groupByDate(habitCompletions, completion => completion.completedAt || completion.date),
                completionsByWeek: this.groupByWeek(habitCompletions, completion => completion.completedAt || completion.date)
            },
            calendar: {
                total: calendarItems.length,
                byCategory: this.toChartData(this.countBy(calendarItems, item => item.category || "Outro")),
                byType: this.toChartData(this.countBy(calendarItems, item => item.type || "Outro")),
                nextItems: this.getUpcomingCalendarItems(user, referenceDate),
                currentMonthItems: this.countCalendarItemsInCurrentMonth(user, referenceDate)
            },
            pomodoro: {
                sessions: summary.focusSessions,
                focusMinutes: summary.focusMinutes,
                averageMinutes: focusSessions.length ? Math.round(summary.focusMinutes / focusSessions.length) : 0,
                sessionsByDay: this.groupSessionsByDay(filteredUser, "focus"),
                sessionsByWeek: this.groupSessionsByWeek(filteredUser, "focus"),
                customProfiles: (user.customFocusProfiles || []).length,
                lastPomodoro
            },
            achievements: {
                unlocked: achievements.length,
                locked: lockedAchievements,
                progress: achievementTotal > 0 ? Math.round((achievements.length / achievementTotal) * 100) : 0,
                latest: achievements
                    .slice()
                    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
                    .slice(0, 5)
            },
            fullSummary,
            referenceDay: referenceKey
        };
    }

    
    static getFilteredUserSnapshot(user, period = "all", referenceDate = new Date()) {
        if (period === "all") {
            return user;
        }

        return {
            ...user,
            tasks: (user.tasks || []).filter(task => this.itemMatchesPeriod(task, period, referenceDate, ["createdAt", "completedAt", "dueDate"])),
            events: (user.events || []).filter(event => this.itemMatchesPeriod(event, period, referenceDate, ["createdAt", "completedAt", "startDate", "dueDate"])),
            calendarItems: (user.calendarItems || []).filter(item => this.itemMatchesPeriod(item, period, referenceDate, ["createdAt", "date"])),
            focusHistory: (user.focusHistory || []).filter(session => this.isInSelectedPeriod(session.date, period, referenceDate)),
            badges: (user.badges || []).filter(badge => this.isInSelectedPeriod(badge.unlockedAt, period, referenceDate))
        };
    }

    static itemMatchesPeriod(item, period, referenceDate, keys = []) {
        return keys.some(key => {
            const value = item?.[key];
            if (!value) {
                return false;
            }

            const dateValue = key.endsWith("Date") && !String(value).includes("T")
                ? `${value}T12:00:00`
                : value;

            return this.isInSelectedPeriod(dateValue, period, referenceDate);
        });
    }

    static isInSelectedPeriod(value, period = "all", referenceDate = new Date()) {
        if (period === "all") {
            return true;
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return false;
        }

        const start = new Date(referenceDate);
        start.setHours(0, 0, 0, 0);

        if (period === "today") {
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            return date >= start && date < end;
        }

        if (period === "7d") {
            start.setDate(start.getDate() - 6);
            return date >= start && date <= referenceDate;
        }

        if (period === "30d") {
            start.setDate(start.getDate() - 29);
            return date >= start && date <= referenceDate;
        }

        return true;
    }

    static countTasksByStatus(tasks = [], referenceDate = new Date()) {
        return tasks.reduce((counts, task) => {
            const status = typeof task?.getStatus === "function"
                ? task.getStatus(referenceDate)
                : (task.completed ? "Concluída" : (this.isTaskOverdue(task, referenceDate) ? "Atrasada" : "Pendente"));
            counts[status] = (counts[status] || 0) + 1;
            return counts;
        }, {});
    }

    static countEventsByStatus(events = [], referenceDate = new Date()) {
        return events.reduce((counts, event) => {
            const status = typeof event?.getStatus === "function"
                ? event.getStatus(referenceDate)
                : (event.completed ? "Concluído" : (this.isEventOverdue(event, referenceDate) ? "Atrasado" : "Planeado"));
            counts[status] = (counts[status] || 0) + 1;
            return counts;
        }, {});
    }

    static countBy(items = [], getKey) {
        return items.reduce((counts, item) => {
            const key = getKey(item) || "Sem dados";
            counts[key] = (counts[key] || 0) + 1;
            return counts;
        }, {});
    }

    static toFixedChartData(grouped, labels = []) {
        return labels.map(label => ({
            label,
            value: grouped[label] || 0
        }));
    }

    static getHabitCompletions(user, period = "all", referenceDate = new Date()) {
        const completions = [];

        (user.habits || []).forEach(habit => {
            (habit.completedDates || []).forEach(completion => {
                const normalized = typeof completion === "string"
                    ? { date: completion, completedAt: `${completion}T12:00:00.000Z` }
                    : completion;

                const completedAt = normalized.completedAt || `${normalized.date}T12:00:00.000Z`;

                if (this.isInSelectedPeriod(completedAt, period, referenceDate)) {
                    completions.push({
                        habitId: habit.id,
                        habitTitle: habit.title,
                        date: normalized.date,
                        completedAt
                    });
                }
            });
        });

        return completions;
    }

    static getBestHabitStreak(habits = [], referenceDate = new Date()) {
        return habits.reduce((best, habit) => {
            const streak = typeof habit?.getCurrentStreak === "function"
                ? habit.getCurrentStreak(referenceDate)
                : 0;

            if (streak > best.streak) {
                return {
                    title: habit.title || "Hábito sem nome",
                    streak
                };
            }

            return best;
        }, { title: "Sem sequência ativa", streak: 0 });
    }

    static getUpcomingCalendarItems(user, referenceDate = new Date(), limit = 5) {
        return (user.calendarItems || [])
            .map(item => ({
                title: item.title || "Item sem título",
                category: item.category || "Outro",
                type: item.type || "Outro",
                date: item.date,
                time: item.time || "",
                dateTime: new Date(`${item.date}T${item.time || "23:59"}`)
            }))
            .filter(item => item.date && !Number.isNaN(item.dateTime.getTime()) && item.dateTime >= referenceDate)
            .sort((a, b) => a.dateTime - b.dateTime)
            .slice(0, limit);
    }

    static countCalendarItemsInCurrentMonth(user, referenceDate = new Date()) {
        const monthKey = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;
        return (user.calendarItems || []).filter(item => String(item.date || "").startsWith(monthKey)).length;
    }

    static getLastPomodoro(user) {
        const focusSessions = (user.focusHistory || [])
            .filter(session => session.type !== "break" && session.date)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        return focusSessions[0] || null;
    }

    static groupByMonth(items, getDate) {
        const grouped = {};

        items.forEach(item => {
            const value = getDate(item);
            if (!value) {
                return;
            }

            const date = new Date(String(value).includes("T") ? value : `${value}T12:00:00`);
            const key = Number.isNaN(date.getTime())
                ? "Sem mês"
                : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

            grouped[key] = (grouped[key] || 0) + 1;
        });

        return this.toChartData(grouped);
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


    
    
    static getUserRanking(users = []) {
        return users
            .map(user => this.getRankingUserScore(user))
            .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
            .map((item, index) => ({ ...item, position: index + 1 }));
    }

    static getRankingUserScore(user) {
        const tasksCompleted = (user.tasks || []).filter(task => task.completed).length;
        const eventsCompleted = (user.events || []).filter(event => event.completed).length;
        const habitCompletions = this.getHabitCompletions(user).length;
        const focusSessions = AchievementService.countFocusSessions(user);
        const focusMinutes = (user.focusHistory || [])
            .filter(session => session.type !== "break")
            .reduce((total, session) => total + (Number(session.minutes) || 0), 0);
        const achievements = (user.badges || []).length;
        const notes = (user.notes || []).length;
        const usedAreas = [
            tasksCompleted > 0,
            eventsCompleted > 0,
            habitCompletions > 0,
            focusSessions > 0,
            (user.calendarItems || []).length > 0,
            notes > 0,
            achievements > 0
        ].filter(Boolean).length;

        const score =
            tasksCompleted * 10 +
            eventsCompleted * 12 +
            habitCompletions * 4 +
            focusSessions * 8 +
            Math.round(focusMinutes / 5) +
            achievements * 15 +
            notes * 3 +
            usedAreas * 5;

        return {
            id: user.id || user.email,
            name: user.name || "Utilizador",
            email: user.email || user.username || "",
            role: user.role || "user",
            score,
            tasksCompleted,
            eventsCompleted,
            habitCompletions,
            focusSessions,
            focusMinutes,
            achievements,
            notes,
            usedAreas
        };
    }

}
