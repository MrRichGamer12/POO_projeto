import UserModel from "../model/UserModel.js";

const loginBtn = document.getElementById("loginBtn");

const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", () => {

    const username = document.getElementById("username").value;

    const password = document.getElementById("password").value;

    const user = new UserModel(username, password);

    localStorage.setItem(
        username,
        JSON.stringify(user)
    );

    alert("Utilizador registado!");
});

loginBtn.addEventListener("click", () => {

    const username = document.getElementById("username").value;

    const password = document.getElementById("password").value;

    const user = JSON.parse(
        localStorage.getItem(username)
    );

    if (!user) {

        alert("Utilizador não encontrado");

        return;
    }

    if (user.password !== password) {

        alert("Password errada");

        return;
    }

    localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );

    window.location.href = "./dashboard.html";
});