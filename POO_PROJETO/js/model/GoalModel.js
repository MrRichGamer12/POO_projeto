export default class GoalModel {

    constructor(title, target) {
        this.id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        this.title = title;
        this.target = Number(target);
        this.progress = 0;
        this.completed = false;
        this.createdAt = new Date().toISOString();
    }

    increaseProgress(value = 1) {
        this.progress += value;

        if (this.progress >= this.target) {
            this.progress = this.target;
            this.completed = true;
        }
    }
}
