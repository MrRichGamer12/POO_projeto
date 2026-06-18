


export default class FocusModel {

    constructor(name, focusTime, breakTime, cycles, options = {}) {
        this.id = options.id || `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        this.name = String(name || "Pomodoro").trim();
        this.focusSeconds = Number(options.focusSeconds) || Math.round((Number(focusTime) || 0) * 60);
        this.breakSeconds = Number(options.breakSeconds) || Math.round((Number(breakTime) || 0) * 60);
        this.cycles = Math.max(1, Number.parseInt(cycles, 10) || 1);
        this.isCustom = Boolean(options.isCustom);
        this.createdAt = options.createdAt || new Date().toISOString();

        
        this.focusTime = this.secondsToMinutes(this.focusSeconds);
        this.breakTime = this.secondsToMinutes(this.breakSeconds);
    }

    
    static getDefaultProfiles() {
        return [
            new FocusModel("Pomodoro Clássico", 25, 5, 4),
            new FocusModel("Sessão Curta", 15, 3, 4),
            new FocusModel("Estudo Intensivo", 50, 10, 4)
        ];
    }

    
    static fromDurations(name, focusParts, breakParts, cycles) {
        const focusSeconds = this.partsToSeconds(focusParts);
        const breakSeconds = this.partsToSeconds(breakParts);

        this.validateDuration("tempo de foco", focusSeconds);
        this.validateDuration("tempo de pausa", breakSeconds);

        const cleanCycles = Number.parseInt(cycles, 10);
        if (!Number.isInteger(cleanCycles) || cleanCycles <= 0) {
            throw new Error("O número de ciclos deve ser maior do que zero.");
        }

        return new FocusModel(
            String(name || "Sessão personalizada").trim() || "Sessão personalizada",
            focusSeconds / 60,
            breakSeconds / 60,
            cleanCycles,
            { focusSeconds, breakSeconds, isCustom: true }
        );
    }

    
    static fromObject(data = {}) {
        return new FocusModel(
            data.name || "Pomodoro",
            data.focusTime ?? ((Number(data.focusSeconds) || 0) / 60),
            data.breakTime ?? ((Number(data.breakSeconds) || 0) / 60),
            data.cycles || 1,
            {
                id: data.id,
                focusSeconds: Number(data.focusSeconds) || Math.round((Number(data.focusTime) || 0) * 60),
                breakSeconds: Number(data.breakSeconds) || Math.round((Number(data.breakTime) || 0) * 60),
                isCustom: Boolean(data.isCustom),
                createdAt: data.createdAt
            }
        );
    }

    
    static partsToSeconds(parts = {}) {
        const hours = Number(parts.hours) || 0;
        const minutes = Number(parts.minutes) || 0;
        const seconds = Number(parts.seconds) || 0;

        if ([hours, minutes, seconds].some(value => value < 0)) {
            throw new Error("Os valores de tempo não podem ser negativos.");
        }

        if ([hours, minutes, seconds].some(value => !Number.isFinite(value))) {
            throw new Error("Introduz apenas valores numéricos válidos.");
        }

        return (hours * 3600) + (minutes * 60) + seconds;
    }

    static validateDuration(label, totalSeconds) {
        if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
            throw new Error(`O ${label} deve ser maior do que zero.`);
        }
    }

    secondsToMinutes(seconds) {
        return Number((Number(seconds || 0) / 60).toFixed(2));
    }

    getFocusSeconds() {
        return Number(this.focusSeconds) || Math.round((Number(this.focusTime) || 0) * 60);
    }

    getBreakSeconds() {
        return Number(this.breakSeconds) || Math.round((Number(this.breakTime) || 0) * 60);
    }

    getFocusMinutesForStats() {
        return this.secondsToMinutes(this.getFocusSeconds());
    }

    getBreakMinutesForStats() {
        return this.secondsToMinutes(this.getBreakSeconds());
    }

    getSummary() {
        return `${FocusModel.formatSeconds(this.getFocusSeconds())} foco · ${FocusModel.formatSeconds(this.getBreakSeconds())} pausa · ${this.cycles} ciclo(s)`;
    }

    static formatSeconds(totalSeconds) {
        const value = Math.max(0, Number(totalSeconds) || 0);
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor(value / 60) % 60;
        const seconds = value % 60;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
}
