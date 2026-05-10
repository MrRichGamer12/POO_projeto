import TaskModel from "../model/TaskModel.js";

import { renderNavbar }
from "./commonView.js";

document.getElementById("navbar").innerHTML =
    renderNavbar();

const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
);

const pointsSpan =
    document.getElementById("points");

const levelSpan =
    document.getElementById("level");

const taskList =
    document.getElementById("taskList");

const timerElement =
    document.getElementById("timer");

const sessionStatus =
    document.getElementById("sessionStatus");

let timerInterval = null;

let remainingSeconds = 0;

let sessionRunning = false;
function renderUser() {

    pointsSpan.textContent =
        currentUser.points;

    levelSpan.textContent =
        currentUser.level;
}

function renderTasks() {

    taskList.innerHTML = "";

    currentUser.tasks.forEach(task => {

        const li =
            document.createElement("li");

        li.textContent = task.title;

        taskList.appendChild(li);
    });
}

function updateTimerDisplay() {

    const minutes =
        Math.floor(remainingSeconds / 60);

    const seconds =
        remainingSeconds % 60;

    timerElement.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startFocusSession(minutes) {

    clearInterval(timerInterval);

    remainingSeconds = minutes * 60;

    sessionStatus.textContent =
        `Sessão de ${minutes} minutos ativa`;

    updateTimerDisplay();

    timerInterval = setInterval(() => {

        remainingSeconds--;

        updateTimerDisplay();

        if (remainingSeconds <= 0) {

            clearInterval(timerInterval);

            sessionStatus.textContent =
                "Sessão concluída!";

            currentUser.points +=
                minutes === 25 ? 20 : 10;

            updateLevel();

            saveUser();

            renderUser();

            alert("Sessão concluída!");
        }

    }, 1000);
}

function stopFocusSession() {

    clearInterval(timerInterval);

    remainingSeconds = 0;

    sessionRunning = false;

    updateTimerDisplay();

    sessionStatus.textContent =
        "Sessão parada";
}

function updateLevel() {

    if (currentUser.points >= 100) {
        currentUser.level = 3;
    }

    else if (currentUser.points >= 50) {
        currentUser.level = 2;
    }

    else {
        currentUser.level = 1;
    }
}

function saveUser() {

    localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
    );

    localStorage.setItem(
        currentUser.username,
        JSON.stringify(currentUser)
    );
}

function addFocusTime(minutes) {

    remainingSeconds += minutes * 60;

    sessionStatus.textContent =
        "Sessão preparada";

    updateTimerDisplay();
}

function startTimer() {

    if (sessionRunning) return;

    if (remainingSeconds <= 0) {

        alert("Adiciona tempo primeiro");

        return;
    }

    sessionRunning = true;

    sessionStatus.textContent =
        "Sessão em progresso";

    timerInterval = setInterval(() => {

        remainingSeconds--;

        updateTimerDisplay();

        if (remainingSeconds <= 0) {

            clearInterval(timerInterval);

            sessionRunning = false;

            sessionStatus.textContent =
                "Sessão concluída!";

            currentUser.points += 20;

            updateLevel();

            saveUser();

            renderUser();

            alert("Sessão concluída!");
        }

    }, 1000);
}

function pauseTimer() {

    if (!sessionRunning) return;

    clearInterval(timerInterval);

    sessionRunning = false;

    sessionStatus.textContent =
        "Sessão pausada";
}

document
.getElementById("addTaskBtn")
.addEventListener("click", () => {

    const title =
        document.getElementById("taskInput").value;

    const task = new TaskModel(title);

    currentUser.tasks.push(task);

    currentUser.points += 10;

    updateLevel();

    saveUser();

    renderUser();

    renderTasks();
});

document
.querySelectorAll(".focusBtn")
.forEach(button => {

    button.addEventListener("click", () => {

        const minutes =
            Number(button.dataset.minutes);

        addFocusTime(minutes);
    });
});

document
.getElementById("stopFocusBtn")
.addEventListener("click", () => {

    stopFocusSession();
});

document
.getElementById("customFocusBtn")
.addEventListener("click", () => {

    const customMinutes =
        Number(
            document.getElementById("customMinutes").value
        );

    if (customMinutes <= 0) {

        alert("Tempo inválido");

        return;
    }

    addFocusTime(customMinutes);

    document.getElementById("customMinutes").value = "";
});

document
.getElementById("startFocusBtn")
.addEventListener("click", () => {

    startTimer();
});

document
.getElementById("pauseFocusBtn")
.addEventListener("click", () => {

    pauseTimer();
});

renderUser();

renderTasks();

updateTimerDisplay();