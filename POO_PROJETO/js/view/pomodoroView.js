import { initPrivatePage, showBadgeNotifications } from "./commonView.js";
import AuthService from "../service/AuthService.js";
import AchievementService from "../service/AchievementService.js";
import FocusModel from "../model/FocusModel.js";
import StatsService from "../service/StatsService.js";

class PomodoroView {

    constructor(user) {
        this.user = user;
        this.profiles = FocusModel.getDefaultProfiles();
        this.currentProfile = this.profiles[0];
        this.remainingSeconds = 0;
        this.timerInterval = null;
        this.sessionRunning = false;
        this.currentCycle = 1;
        this.currentMode = "focus";

        this.elements = {
            timer: document.getElementById("timer"),
            sessionStatus: document.getElementById("sessionStatus"),
            profileName: document.getElementById("profileName"),
            focusMode: document.getElementById("focusMode"),
            cycleInfo: document.getElementById("cycleInfo"),
            cyclePercent: document.getElementById("cyclePercent"),
            focusSessions: document.getElementById("focusSessions"),
            focusBreaks: document.getElementById("focusBreaks"),
            focusMinutesTotal: document.getElementById("focusMinutesTotal"),
            customMinutes: document.getElementById("customMinutes")
        };

        this.bindEvents();
        this.setFocusProfile(this.currentProfile);
        this.renderStats();
    }

    bindEvents() {
        document.getElementById("pomodoroBtn").addEventListener("click", () => this.setFocusProfile(this.profiles[0]));
        document.getElementById("shortFocusBtn").addEventListener("click", () => this.setFocusProfile(this.profiles[1]));
        document.getElementById("intenseFocusBtn").addEventListener("click", () => this.setFocusProfile(this.profiles[2]));
        document.getElementById("customFocusBtn").addEventListener("click", () => this.setCustomFocusTime());
        document.getElementById("startFocusBtn").addEventListener("click", () => this.startTimer());
        document.getElementById("pauseFocusBtn").addEventListener("click", () => this.pauseTimer());
        document.getElementById("stopFocusBtn").addEventListener("click", () => this.stopTimer());
        document.getElementById("completeFocusBtn").addEventListener("click", () => this.completeCurrentPeriod());
    }

    setFocusProfile(profile) {
        this.currentProfile = profile;
        this.currentCycle = 1;
        this.currentMode = "focus";
        this.remainingSeconds = profile.focusTime * 60;
        this.sessionRunning = false;
        clearInterval(this.timerInterval);

        this.elements.profileName.textContent = profile.name;
        this.elements.sessionStatus.textContent = `${profile.name} preparado.`;
        this.renderTimer();
        this.renderCycle();
    }

    setCustomFocusTime() {
        const minutes = Number(this.elements.customMinutes.value);

        if (minutes <= 0) {
            alert("Introduz um tempo válido.");
            return;
        }

        this.currentProfile = new FocusModel("Sessão personalizada", minutes, 5, 1);
        this.setFocusProfile(this.currentProfile);
        this.elements.customMinutes.value = "";
    }

    startTimer() {
        if (this.sessionRunning) {
            return;
        }

        if (this.remainingSeconds <= 0) {
            alert("Escolhe ou prepara uma sessão primeiro.");
            return;
        }

        this.sessionRunning = true;
        this.elements.sessionStatus.textContent = "Sessão em progresso.";

        this.timerInterval = setInterval(() => {
            this.remainingSeconds -= 1;
            this.renderTimer();

            if (this.remainingSeconds <= 0) {
                this.completeCurrentPeriod();
            }
        }, 1000);
    }

    pauseTimer() {
        if (!this.sessionRunning) {
            return;
        }

        clearInterval(this.timerInterval);
        this.sessionRunning = false;
        this.elements.sessionStatus.textContent = "Sessão pausada.";
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        this.sessionRunning = false;
        this.remainingSeconds = 0;
        this.elements.sessionStatus.textContent = "Sessão parada.";
        this.renderTimer();
    }

    completeCurrentPeriod() {
        clearInterval(this.timerInterval);
        this.sessionRunning = false;

        if (this.currentMode === "focus") {
            this.user.addFocusSession(this.currentProfile.focusTime, this.currentProfile.name, this.currentCycle);
            this.elements.sessionStatus.textContent = `Foco ${this.currentCycle}/${this.currentProfile.cycles} concluído. Pausa preparada.`;
            this.currentMode = "break";
            this.remainingSeconds = this.currentProfile.breakTime * 60;
        }
        else {
            this.user.addBreakSession(this.currentProfile.breakTime, this.currentProfile.name, this.currentCycle);
            this.currentCycle += 1;

            if (this.currentCycle > this.currentProfile.cycles) {
                this.user.addPoints(50);
                this.currentCycle = 1;
                this.currentMode = "focus";
                this.remainingSeconds = this.currentProfile.focusTime * 60;
                this.elements.sessionStatus.textContent = "Ciclo completo concluído. Nova sessão preparada.";
            }
            else {
                this.currentMode = "focus";
                this.remainingSeconds = this.currentProfile.focusTime * 60;
                this.elements.sessionStatus.textContent = `Pausa concluída. Foco ${this.currentCycle}/${this.currentProfile.cycles} preparado.`;
            }
        }

        AuthService.saveCurrentUser(this.user);
        const badges = AchievementService.checkAndSave(this.user);
        showBadgeNotifications(badges);
        this.renderTimer();
        this.renderCycle();
        this.renderStats();
    }

    renderTimer() {
        const hours = Math.floor(this.remainingSeconds / 3600);
        const minutes = Math.floor(this.remainingSeconds / 60) % 60;
        const seconds = this.remainingSeconds % 60;

        this.elements.timer.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    renderCycle() {
        const percent = Math.round((this.currentCycle / this.currentProfile.cycles) * 100);

        this.elements.focusMode.textContent = this.currentMode === "focus" ? "Foco" : "Pausa";
        this.elements.cycleInfo.textContent = `${this.currentCycle}/${this.currentProfile.cycles}`;
        this.elements.cyclePercent.textContent = `${percent}%`;
    }

    renderStats() {
        const summary = StatsService.getSummary(this.user);

        this.elements.focusSessions.textContent = summary.focusSessions;
        this.elements.focusBreaks.textContent = summary.breaks;
        this.elements.focusMinutesTotal.textContent = summary.focusMinutes;
    }
}

const user = initPrivatePage("pomodoro");

if (user) {
    new PomodoroView(user);
}
