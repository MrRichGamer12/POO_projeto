export default class FocusModel {

    constructor(name, focusTime, breakTime, cycles) {
        this.id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        this.name = name;
        this.focusTime = focusTime;
        this.breakTime = breakTime;
        this.cycles = cycles;
        this.createdAt = new Date().toISOString();
    }

    static getDefaultProfiles() {
        return [
            new FocusModel("Pomodoro Clássico", 25, 5, 4),
            new FocusModel("Sessão Curta", 15, 3, 4),
            new FocusModel("Estudo Intensivo", 50, 10, 4)
        ];
    }
}
