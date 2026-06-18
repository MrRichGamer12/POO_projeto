
import { initPrivatePage, showBadgeNotifications, showMessage } from "./commonView.js";
import AuthService from "../service/AuthService.js";
import AchievementService from "../service/AchievementService.js";
import FocusModel from "../model/FocusModel.js";
import StatsService from "../service/StatsService.js";
import NotificationService from "../service/NotificationService.js";



class PomodoroView {

    constructor(user) {
        this.user = user;
        this.defaultProfiles = FocusModel.getDefaultProfiles();
        this.customProfiles = this.normalizeCustomProfiles();
        this.currentProfile = this.defaultProfiles[0];
        this.remainingSeconds = 0;
        this.timerInterval = null;
        this.sessionRunning = false;
        this.currentCycle = 1;
        this.currentMode = "focus";
        this.lastSessionCompleted = false;

        this.elements = {
            timer: document.getElementById("timer"),
            sessionStatus: document.getElementById("sessionStatus"),
            profileName: document.getElementById("profileName"),
            focusMode: document.getElementById("focusMode"),
            cycleInfo: document.getElementById("cycleInfo"),
            cyclePercent: document.getElementById("cyclePercent"),
            focusDurationText: document.getElementById("focusDurationText"),
            breakDurationText: document.getElementById("breakDurationText"),
            focusSessions: document.getElementById("focusSessions"),
            focusBreaks: document.getElementById("focusBreaks"),
            focusMinutesTotal: document.getElementById("focusMinutesTotal"),
            customProfileSelect: document.getElementById("customProfileSelect"),
            customForm: document.getElementById("customPomodoroForm"),
            customProfileName: document.getElementById("customProfileName"),
            customCycles: document.getElementById("customCycles"),
            focusHours: document.getElementById("focusHours"),
            focusMinutes: document.getElementById("focusMinutes"),
            focusSeconds: document.getElementById("focusSeconds"),
            breakHours: document.getElementById("breakHours"),
            breakMinutes: document.getElementById("breakMinutes"),
            breakSeconds: document.getElementById("breakSeconds"),
            profileMessage: document.getElementById("profileMessage")
        };

        this.bindEvents();
        this.renderCustomProfiles();
        this.setFocusProfile(this.currentProfile);
        this.renderStats();
    }

    normalizeCustomProfiles() {
        this.user.customFocusProfiles = Array.isArray(this.user.customFocusProfiles)
            ? this.user.customFocusProfiles.map(profile => FocusModel.fromObject(profile))
            : [];

        return this.user.customFocusProfiles;
    }

    bindEvents() {
        document.getElementById("pomodoroBtn").addEventListener("click", () => this.setFocusProfile(this.defaultProfiles[0]));
        document.getElementById("shortFocusBtn").addEventListener("click", () => this.setFocusProfile(this.defaultProfiles[1]));
        document.getElementById("intenseFocusBtn").addEventListener("click", () => this.setFocusProfile(this.defaultProfiles[2]));
        document.getElementById("startFocusBtn").addEventListener("click", () => this.startTimer());
        document.getElementById("pauseFocusBtn").addEventListener("click", () => this.pauseTimer());
        document.getElementById("stopFocusBtn").addEventListener("click", () => this.resetTimer());
        document.getElementById("completeFocusBtn").addEventListener("click", () => this.completeCurrentPeriod());
        document.getElementById("deleteCustomProfileBtn").addEventListener("click", () => this.deleteSelectedCustomProfile());
        document.getElementById("clearCustomFormBtn").addEventListener("click", () => this.clearCustomForm());
        document.getElementById("requestPomodoroNotificationsBtn").addEventListener("click", () => NotificationService.requestBrowserPermission());

        this.elements.customProfileSelect.addEventListener("change", event => {
            const selectedProfile = this.customProfiles.find(profile => String(profile.id) === String(event.target.value));

            if (selectedProfile) {
                this.setFocusProfile(selectedProfile);
            }
        });

        this.elements.customForm.addEventListener("submit", event => {
            event.preventDefault();
            this.saveCustomProfile();
        });
    }

    setFocusProfile(profile) {
        this.currentProfile = FocusModel.fromObject(profile);
        this.currentCycle = 1;
        this.currentMode = "focus";
        this.remainingSeconds = this.currentProfile.getFocusSeconds();
        this.sessionRunning = false;
        this.lastSessionCompleted = false;
        window.clearInterval(this.timerInterval);

        this.elements.profileName.textContent = this.currentProfile.name;
        this.elements.sessionStatus.textContent = `${this.currentProfile.name} preparado.`;
        this.renderTimer();
        this.renderCycle();
        this.renderProfileDetails();
    }

    saveCustomProfile() {
        try {
            const profile = FocusModel.fromDurations(
                this.elements.customProfileName.value,
                this.getDurationParts("focus"),
                this.getDurationParts("break"),
                this.elements.customCycles.value
            );

            this.customProfiles.push(profile);
            this.user.customFocusProfiles = this.customProfiles;
            this.user.markActivity();
            AuthService.saveCurrentUser(this.user);

            this.renderCustomProfiles(profile.id);
            this.setFocusProfile(profile);
            showMessage(this.elements.profileMessage, "Configuração personalizada guardada.", "success");
            NotificationService.notify({
                title: "Pomodoro guardado",
                message: `${profile.name} ficou disponível nas tuas configurações.`,
                type: "success"
            });
        }
        catch (error) {
            showMessage(this.elements.profileMessage, error.message, "error");
        }
    }

    getDurationParts(type) {
        return {
            hours: Number(this.elements[`${type}Hours`].value),
            minutes: Number(this.elements[`${type}Minutes`].value),
            seconds: Number(this.elements[`${type}Seconds`].value)
        };
    }

    deleteSelectedCustomProfile() {
        const selectedId = this.elements.customProfileSelect.value;

        if (!selectedId) {
            showMessage(this.elements.profileMessage, "Seleciona uma configuração personalizada para remover.", "error");
            return;
        }

        const selectedProfile = this.customProfiles.find(profile => String(profile.id) === String(selectedId));
        const confirmed = window.confirm(`Tens a certeza que queres remover "${selectedProfile?.name || "esta configuração"}"?`);

        if (!confirmed) {
            return;
        }

        this.customProfiles = this.customProfiles.filter(profile => String(profile.id) !== String(selectedId));
        this.user.customFocusProfiles = this.customProfiles;
        this.user.markActivity();
        AuthService.saveCurrentUser(this.user);
        this.renderCustomProfiles();

        if (String(this.currentProfile.id) === String(selectedId)) {
            this.setFocusProfile(this.defaultProfiles[0]);
        }

        showMessage(this.elements.profileMessage, "Configuração removida.", "success");
    }

    clearCustomForm() {
        this.elements.customForm.reset();
        this.elements.customCycles.value = "4";
        this.elements.focusHours.value = "0";
        this.elements.focusMinutes.value = "25";
        this.elements.focusSeconds.value = "0";
        this.elements.breakHours.value = "0";
        this.elements.breakMinutes.value = "5";
        this.elements.breakSeconds.value = "0";
        showMessage(this.elements.profileMessage, "", "");
    }

    startTimer() {
        if (this.sessionRunning) {
            return;
        }

        if (this.remainingSeconds <= 0) {
            this.remainingSeconds = this.currentMode === "break"
                ? this.currentProfile.getBreakSeconds()
                : this.currentProfile.getFocusSeconds();
        }

        if (this.remainingSeconds <= 0) {
            showMessage(this.elements.profileMessage, "Escolhe uma sessão válida antes de iniciar.", "error");
            return;
        }

        this.sessionRunning = true;
        this.elements.sessionStatus.textContent = this.currentMode === "focus"
            ? "Sessão de foco em progresso."
            : "Pausa em progresso.";

        this.timerInterval = window.setInterval(() => {
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

        window.clearInterval(this.timerInterval);
        this.sessionRunning = false;
        this.elements.sessionStatus.textContent = "Sessão pausada. Clica em Iniciar para retomar.";
    }

    resetTimer() {
        window.clearInterval(this.timerInterval);
        this.sessionRunning = false;
        this.currentCycle = 1;
        this.currentMode = "focus";
        this.remainingSeconds = this.currentProfile.getFocusSeconds();
        this.lastSessionCompleted = false;
        this.elements.sessionStatus.textContent = "Sessão reiniciada.";
        this.renderTimer();
        this.renderCycle();
    }

    completeCurrentPeriod() {
        window.clearInterval(this.timerInterval);
        this.sessionRunning = false;

        if (this.currentMode === "focus") {
            this.completeFocusPeriod();
        }
        else {
            this.completeBreakPeriod();
        }

        AuthService.saveCurrentUser(this.user);
        const badges = AchievementService.checkAndSave(this.user);
        showBadgeNotifications(badges);
        this.renderTimer();
        this.renderCycle();
        this.renderProfileDetails();
        this.renderStats();
    }

    completeFocusPeriod() {
        this.user.addFocusSession(
            this.currentProfile.getFocusMinutesForStats(),
            this.currentProfile.name,
            this.currentCycle
        );

        NotificationService.notify({
            title: "Fim do foco",
            message: `Terminaste o foco ${this.currentCycle}/${this.currentProfile.cycles} de ${this.currentProfile.name}.`,
            type: "success"
        });

        this.currentMode = "break";
        this.remainingSeconds = this.currentProfile.getBreakSeconds();
        this.elements.sessionStatus.textContent = `Foco ${this.currentCycle}/${this.currentProfile.cycles} concluído. Pausa preparada.`;

        NotificationService.notify({
            title: "Início da pausa",
            message: `Faz uma pausa de ${FocusModel.formatSeconds(this.currentProfile.getBreakSeconds())}.`,
            type: "info"
        });
    }

    completeBreakPeriod() {
        this.user.addBreakSession(
            this.currentProfile.getBreakMinutesForStats(),
            this.currentProfile.name,
            this.currentCycle
        );

        NotificationService.notify({
            title: "Fim da pausa",
            message: `A pausa do ciclo ${this.currentCycle}/${this.currentProfile.cycles} terminou.`,
            type: "info"
        });

        if (this.currentCycle >= this.currentProfile.cycles) {
            this.completeFullSession();
            return;
        }

        this.currentCycle += 1;
        this.currentMode = "focus";
        this.remainingSeconds = this.currentProfile.getFocusSeconds();
        this.elements.sessionStatus.textContent = `Pausa concluída. Foco ${this.currentCycle}/${this.currentProfile.cycles} preparado.`;

        NotificationService.notify({
            title: "Novo ciclo preparado",
            message: `Está na hora de iniciar o foco ${this.currentCycle}/${this.currentProfile.cycles}.`,
            type: "info"
        });
    }

    completeFullSession() {
        this.user.addPoints(50);
        this.currentCycle = 1;
        this.currentMode = "focus";
        this.remainingSeconds = this.currentProfile.getFocusSeconds();
        this.lastSessionCompleted = true;
        this.elements.sessionStatus.textContent = "Sessão Pomodoro completa. Nova sessão preparada.";

        NotificationService.notify({
            title: "Pomodoro completo",
            message: `Concluíste todos os ciclos de ${this.currentProfile.name}. Excelente consistência.`,
            type: "success"
        });

        NotificationService.notify({
            title: "Nova sessão?",
            message: "Quando estiveres pronto, podes iniciar uma nova sessão de foco.",
            type: "info"
        });
    }

    renderCustomProfiles(selectedId = "") {
        this.elements.customProfileSelect.innerHTML = `<option value="">Seleciona uma configuração guardada</option>`;

        if (this.customProfiles.length === 0) {
            this.elements.customProfileSelect.innerHTML = `<option value="">Nenhuma configuração guardada</option>`;
            return;
        }

        this.customProfiles.forEach(profile => {
            const option = document.createElement("option");
            option.value = profile.id;
            option.textContent = `${profile.name} - ${profile.getSummary()}`;
            option.selected = String(profile.id) === String(selectedId);
            this.elements.customProfileSelect.appendChild(option);
        });
    }

    renderTimer() {
        this.elements.timer.textContent = FocusModel.formatSeconds(this.remainingSeconds);
    }

    renderCycle() {
        const totalCycles = Math.max(1, Number(this.currentProfile.cycles) || 1);
        const percent = Math.min(100, Math.round((this.currentCycle / totalCycles) * 100));

        this.elements.focusMode.textContent = this.currentMode === "focus" ? "Foco" : "Pausa";
        this.elements.cycleInfo.textContent = `${this.currentCycle}/${totalCycles}`;
        this.elements.cyclePercent.textContent = `${percent}%`;
    }

    renderProfileDetails() {
        this.elements.focusDurationText.textContent = FocusModel.formatSeconds(this.currentProfile.getFocusSeconds());
        this.elements.breakDurationText.textContent = FocusModel.formatSeconds(this.currentProfile.getBreakSeconds());
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
