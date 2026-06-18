import { initPrivatePage } from "./commonView.js";
import StatsService from "../service/StatsService.js";
import AchievementService from "../service/AchievementService.js";

const user = initPrivatePage("home");

if (user) {
    AchievementService.checkAndSave(user);
    const summary = StatsService.getSummary(user);

    document.getElementById("welcomeTitle").textContent = `Resumo de ${user.name}`;
    document.getElementById("homeFocusSessions").textContent = summary.focusSessions;
    document.getElementById("homeCompletedTasks").textContent = summary.tasksCompleted;
    document.getElementById("homeBadges").textContent = summary.achievements;
    document.getElementById("homeProgress").textContent = `${summary.progress}%`;
    document.getElementById("lastFeature").textContent = `Última área usada: ${translateFeatureName(user.stats.lastUsed)}.`;
    document.getElementById("progressText").textContent = `Pontos: ${summary.points}. Nível: ${summary.level}.`;
}

function translateFeatureName(feature) {
    const names = {
        home: "Início",
        dashboard: "Dashboard",
        pomodoro: "Pomodoro",
        tasks: "Tarefas e Hábitos",
        achievements: "Conquistas",
        statistics: "Estatísticas",
        motivation: "Motivação",
        notes: "Notas",
        ranking: "Ranking",
        profile: "Perfil",
        admin: "Administração"
    };

    return names[feature] || "Início";
}
