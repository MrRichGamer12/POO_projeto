import { initPrivatePage } from "./commonView.js";
import AchievementService from "../service/AchievementService.js";
import AuthService from "../service/AuthService.js";

class AchievementView {

    constructor(user) {
        this.user = user;
        this.elements = {
            unlockedCount: document.getElementById("unlockedCount"),
            lockedCount: document.getElementById("lockedCount"),
            achievementProgress: document.getElementById("achievementProgress"),
            unlockedBadges: document.getElementById("unlockedBadges"),
            lockedBadges: document.getElementById("lockedBadges")
        };

        const newBadges = AchievementService.checkAndSave(this.user);
        if (newBadges.length > 0) {
            this.user = AuthService.getCurrentUser();
        }

        this.render();
    }

    render() {
        const achievements = AchievementService.getAchievements(this.user);
        const unlocked = achievements.filter(achievement => achievement.unlocked);
        const locked = achievements.filter(achievement => !achievement.unlocked);
        const progress = Math.round((unlocked.length / achievements.length) * 100);

        this.elements.unlockedCount.textContent = unlocked.length;
        this.elements.lockedCount.textContent = locked.length;
        this.elements.achievementProgress.textContent = `${progress}%`;

        this.renderList(this.elements.unlockedBadges, unlocked, true);
        this.renderList(this.elements.lockedBadges, locked, false);
    }

    renderList(container, achievements, unlocked) {
        container.innerHTML = "";

        if (achievements.length === 0) {
            container.innerHTML = `<p class="empty-state">${unlocked ? "Ainda não existem conquistas desbloqueadas." : "Todas as conquistas foram desbloqueadas."}</p>`;
            return;
        }

        achievements.forEach(achievement => {
            const item = document.createElement("div");
            item.className = `achievement-item ${unlocked ? "" : "locked"}`;
            item.innerHTML = `
                <div class="achievement-meta">
                    <span class="lock-badge">${unlocked ? "Desbloqueada" : "Bloqueada"}</span>
                    <span>${achievement.category}</span>
                </div>
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
                <div class="progress-track" aria-label="Progresso da conquista">
                    <div class="progress-bar" style="width: ${achievement.percent}%"></div>
                </div>
                <small>${achievement.value}/${achievement.target} - ${achievement.percent}%</small>
            `;

            container.appendChild(item);
        });
    }
}

const user = initPrivatePage("achievements");

if (user) {
    new AchievementView(user);
}
