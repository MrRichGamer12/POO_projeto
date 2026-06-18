

import { initPrivatePage, showBadgeNotifications, showMessage } from "./commonView.js";
import AuthService from "../service/AuthService.js";
import AchievementService from "../service/AchievementService.js";
import MockApiService from "../service/MockApiService.js";
import MotivationModel from "../model/MotivationModel.js";

class MotivationView {

    constructor(user) {
        this.user = user;
        this.model = MotivationModel.fromSources();
        this.elements = {
            dailyQuote: document.getElementById("dailyQuote"),
            dailyQuoteCategory: document.getElementById("dailyQuoteCategory"),
            randomQuote: document.getElementById("randomQuote"),
            randomQuoteCategory: document.getElementById("randomQuoteCategory"),
            newQuoteBtn: document.getElementById("newQuoteBtn"),
            practicalTips: document.getElementById("practicalTips"),
            usefulLinks: document.getElementById("usefulLinks"),
            sourceStatus: document.getElementById("motivationSourceStatus")
        };

        this.bindEvents();
        this.registerVisit();
        this.loadContent();
    }

    bindEvents() {
        this.elements.newQuoteBtn.addEventListener("click", () => this.renderRandomQuote());
    }

    
    registerVisit() {
        this.user.stats.motivationVisits = Number(this.user.stats?.motivationVisits) || 0;
        this.user.stats.motivationVisits += 1;
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);

        const badges = AchievementService.checkAndSave(this.user);
        showBadgeNotifications(badges);
    }

    async loadContent() {
        const fallback = MotivationModel.getFallbackData();
        const [quotes, links, tips] = await Promise.all([
            MockApiService.getMotivationQuotes?.() || Promise.resolve(null),
            MockApiService.getMotivationLinks?.() || Promise.resolve(null),
            MockApiService.getMotivationTips?.() || Promise.resolve(null)
        ]);

        this.model = MotivationModel.fromSources({
            quotes: quotes || fallback.quotes,
            links: links || fallback.links,
            tips: tips || fallback.tips
        });

        const usingMockServer = Array.isArray(quotes) || Array.isArray(links) || Array.isArray(tips);
        showMessage(
            this.elements.sourceStatus,
            usingMockServer
                ? "Conteúdos carregados do Mock Server, com fallback local disponível."
                : "Mock Server indisponível. A página está a usar conteúdos locais de fallback.",
            usingMockServer ? "success" : "warning"
        );

        this.render();
    }

    render() {
        this.renderDailyQuote();
        this.renderRandomQuote();
        this.renderTips();
        this.renderLinks();
    }

    renderDailyQuote() {
        const quote = this.model.getDailyQuote();
        this.elements.dailyQuote.textContent = quote ? `“${quote.text}”` : "Ainda não existe frase do dia.";
        this.elements.dailyQuoteCategory.textContent = quote?.category ? quote.category : "";
    }

    renderRandomQuote() {
        const quote = this.model.getRandomQuote();
        this.elements.randomQuote.textContent = quote ? `“${quote.text}”` : "Ainda não existem frases disponíveis.";
        this.elements.randomQuoteCategory.textContent = quote?.category ? quote.category : "";
    }

    renderTips() {
        this.elements.practicalTips.innerHTML = "";

        this.model.tips.forEach(tip => {
            const article = document.createElement("article");
            article.className = "motivation-tip-card";
            article.innerHTML = `
                <h3>${this.escapeHtml(tip.title)}</h3>
                <p>${this.escapeHtml(tip.description)}</p>
            `;
            this.elements.practicalTips.appendChild(article);
        });
    }

    renderLinks() {
        this.elements.usefulLinks.innerHTML = "";
        const groupedLinks = this.model.getLinksByCategory();

        Object.entries(groupedLinks).forEach(([category, links]) => {
            const section = document.createElement("section");
            section.className = "motivation-link-category";
            section.innerHTML = `<h3>${this.escapeHtml(category)}</h3>`;

            links.forEach(link => {
                const item = document.createElement("article");
                item.className = "motivation-link-card";
                item.innerHTML = `
                    <div>
                        <span class="lock-badge">${this.escapeHtml(link.type || "Recurso")}</span>
                        <h4>${this.escapeHtml(link.title)}</h4>
                        <p>${this.escapeHtml(link.description || "Recurso informativo.")}</p>
                    </div>
                    <a class="btn btn-outline-primary btn-sm" href="${this.escapeAttribute(link.url)}" target="_blank" rel="noopener noreferrer">
                        Abrir recurso
                    </a>
                `;
                section.appendChild(item);
            });

            this.elements.usefulLinks.appendChild(section);
        });
    }

    escapeHtml(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    escapeAttribute(value) {
        const url = String(value || "#").trim();
        return url.startsWith("http") ? this.escapeHtml(url) : "#";
    }
}

const user = initPrivatePage("motivation");

if (user) {
    new MotivationView(user);
}
