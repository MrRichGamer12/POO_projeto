import { initPrivatePage } from "./commonView.js";
import StatsService from "../service/StatsService.js";
import AchievementService from "../service/AchievementService.js";

const user = initPrivatePage("home");

if (user) {
    AchievementService.checkAndSave(user);
    renderHome(user);
}

function renderHome(user) {
    const summary = StatsService.getSummary(user);

    document.getElementById("welcomeTitle").textContent = `Olá, ${user.name}!`;
    document.getElementById("homeFocusSessions").textContent = summary.focusSessions;
    document.getElementById("homeCompletedTasks").textContent = summary.tasksCompleted;
    document.getElementById("homeBadges").textContent = summary.achievements;
    document.getElementById("homeProgress").textContent = `${summary.progress}%`;

    const lastFeature = translateFeatureName(user.stats.lastUsed);
    document.getElementById("lastFeature").textContent = lastFeature
        ? `A última área usada foi: ${lastFeature}.`
        : "Ainda não existe histórico de utilização.";

    document.getElementById("progressText").textContent = createProgressText(summary);
}

function translateFeatureName(feature) {
    const names = {
        home: "Início",
        dashboard: "Dashboard",
        pomodoro: "Pomodoro",
        tasks: "Tarefas e Hábitos",
        achievements: "Conquistas",
        statistics: "Estatísticas",
        profile: "Perfil",
        admin: "Administração"
    };

    return names[feature] || "Início";
}

function createProgressText(summary) {
    if (summary.focusSessions === 0 && summary.tasksCreated === 0) {
        return "Ainda estás no início. Cria uma tarefa ou inicia uma sessão de foco para começar a gerar progresso.";
    }

    return `Tens ${summary.focusSessions} sessões de foco, ${summary.tasksCompleted} tarefas concluídas e ${summary.achievements} conquistas desbloqueadas.`;
}
