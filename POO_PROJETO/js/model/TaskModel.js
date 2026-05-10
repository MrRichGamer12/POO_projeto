export default class TaskModel {

    constructor(title) {

        this.id = Date.now();

        this.title = title;

        this.completed = false;
    }
}