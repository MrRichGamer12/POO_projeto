

import { initPrivatePage } from "./commonView.js";
import StorageService from "../service/StorageService.js";
import StatsService from "../service/StatsService.js";

class RankingView {

    constructor(currentUser) {
        this.currentUser = currentUser;
        this.tableBody = document.getElementById("rankingTableBody");
        this.render();
    }

    render() {
        const users = StorageService.getUsers();
        const ranking = StatsService.getUserRanking(users);
        this.tableBody.innerHTML = "";

        if (ranking.length === 0) {
            this.tableBody.innerHTML = `<tr><td colspan="9">Ainda não existem dados suficientes para ranking.</td></tr>`;
            return;
        }

        ranking.forEach(item => {
            const tr = document.createElement("tr");
            const currentClass = item.email === this.currentUser.email ? "ranking-current-user" : "";
            tr.className = currentClass;
            tr.innerHTML = `
                <td><span class="ranking-position ranking-position-${item.position}">${this.formatPosition(item.position)}</span></td>
                <td><strong>${item.name}</strong><br><small>${item.role === "admin" ? "Administrador" : "Utilizador"}</small></td>
                <td><strong>${item.score}</strong> pts</td>
                <td>${item.tasksCompleted}</td>
                <td>${item.eventsCompleted}</td>
                <td>${item.habitCompletions}</td>
                <td>${item.focusSessions}</td>
                <td>${item.focusMinutes} min</td>
                <td>${item.achievements}</td>
            `;
            this.tableBody.appendChild(tr);
        });
    }

    formatPosition(position) {
        if (position === 1) return "Top 1";
        if (position === 2) return "Top 2";
        if (position === 3) return "Top 3";
        return `${position}.º`;
    }
}

const user = initPrivatePage("ranking");

if (user) {
    new RankingView(user);
}
