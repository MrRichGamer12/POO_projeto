import BadgeModel from "../model/BadgeModel.js";
import StorageService from "./StorageService.js";

export default class AchievementService {

    static definitions = [
        {
            key: "first_focus",
            name: "Primeira sessão de foco concluída",
            description: "Conclui a tua primeira sessão de foco.",
            category: "Foco",
            target: 1,
            getValue: user => AchievementService.countFocusSessions(user)
        },
        {
            key: "focus_5",
            name: "5 sessões de foco concluídas",
            description: "Completa 5 sessões de foco.",
            category: "Foco",
            target: 5,
            getValue: user => AchievementService.countFocusSessions(user)
        },
        {
            key: "focus_10",
            name: "10 sessões de foco concluídas",
            description: "Completa 10 sessões de foco.",
            category: "Foco",
            target: 10,
            getValue: user => AchievementService.countFocusSessions(user)
        },
        {
            key: "focus_25",
            name: "25 sessões de foco concluídas",
            description: "Completa 25 sessões de foco.",
            category: "Foco",
            target: 25,
            getValue: user => AchievementService.countFocusSessions(user)
        },
        {
            key: "first_task_created",
            name: "Primeira tarefa criada",
            description: "Cria a tua primeira tarefa.",
            category: "Tarefas",
            target: 1,
            getValue: user => user.tasks.length
        },
        {
            key: "first_task_completed",
            name: "Primeira tarefa concluída",
            description: "Conclui a tua primeira tarefa.",
            category: "Tarefas",
            target: 1,
            getValue: user => AchievementService.countCompletedTasks(user)
        },
        {
            key: "tasks_5",
            name: "5 tarefas concluídas",
            description: "Conclui 5 tarefas.",
            category: "Tarefas",
            target: 5,
            getValue: user => AchievementService.countCompletedTasks(user)
        },
        {
            key: "tasks_10",
            name: "10 tarefas concluídas",
            description: "Conclui 10 tarefas.",
            category: "Tarefas",
            target: 10,
            getValue: user => AchievementService.countCompletedTasks(user)
        },
        {
            key: "activity_3_days",
            name: "3 dias com atividade",
            description: "Usa a aplicação em 3 dias diferentes.",
            category: "Consistência",
            target: 3,
            getValue: user => user.stats.activityDates.length
        },
        {
            key: "activity_7_days",
            name: "7 dias com atividade",
            description: "Usa a aplicação em 7 dias diferentes.",
            category: "Consistência",
            target: 7,
            getValue: user => user.stats.activityDates.length
        },
        {
            key: "first_badge",
            name: "Primeira conquista desbloqueada",
            description: "Desbloqueia a tua primeira conquista.",
            category: "Conquistas",
            target: 1,
            getValue: user => user.badges.filter(badge => badge.key !== "first_badge").length
        },
        {
            key: "profile_completed",
            name: "Perfil preenchido",
            description: "Preenche nome, bio e foto de perfil.",
            category: "Perfil",
            target: 1,
            getValue: user => user.name && user.bio && user.photo ? 1 : 0
        }
    ];

    static getAchievements(user) {
        const unlockedKeys = new Set((user.badges || []).map(badge => badge.key));

        return this.definitions.map(definition => {
            const value = Math.min(definition.getValue(user), definition.target);
            const percent = Math.min(100, Math.round((value / definition.target) * 100));

            return {
                ...definition,
                value,
                percent,
                unlocked: unlockedKeys.has(definition.key),
                badge: (user.badges || []).find(badge => badge.key === definition.key) || null
            };
        });
    }

    static checkAndSave(user) {
        const newlyUnlocked = [];
        let changed = false;

        user.badges = Array.isArray(user.badges) ? user.badges : [];

        for (let pass = 0; pass < 2; pass++) {
            this.definitions.forEach(definition => {
                const alreadyUnlocked = user.badges.some(badge => badge.key === definition.key);
                const currentValue = definition.getValue(user);

                if (!alreadyUnlocked && currentValue >= definition.target) {
                    const badge = new BadgeModel(
                        definition.name,
                        definition.description,
                        definition.key,
                        definition.category,
                        definition.target
                    );

                    user.badges.push(badge);
                    user.addPoints(20);
                    user.markActivity();
                    newlyUnlocked.push(badge);
                    changed = true;
                }
            });
        }

        if (changed) {
            StorageService.updateUser(user);
            StorageService.saveCurrentUser(user);
        }

        return newlyUnlocked;
    }

    static countFocusSessions(user) {
        return (user.focusHistory || []).filter(session => session.type !== "break").length;
    }

    static countBreaks(user) {
        return (user.focusHistory || []).filter(session => session.type === "break").length;
    }

    static countCompletedTasks(user) {
        return (user.tasks || []).filter(task => task.completed).length;
    }
}
