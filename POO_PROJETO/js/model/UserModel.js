export default class UserModel {

    constructor(username, password) {

        this.username = username;
        this.password = password;

        this.points = 0;
        this.level = 1;

        this.tasks = [];
    }

    addPoints(points) {

        this.points += points;

        this.updateLevel();
    }

    updateLevel() {

        if (this.points >= 100) {
            this.level = 3;
        }

        else if (this.points >= 50) {
            this.level = 2;
        }

        else {
            this.level = 1;
        }
    }
}