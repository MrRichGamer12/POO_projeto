import AuthService from "./service/AuthService.js";
import MockApiService from "./service/MockApiService.js";

// Arranque global da aplicação.
// Garante utilizador admin de teste e verifica, sem bloquear, se o JSON Server está ativo.
AuthService.initialize();

MockApiService.isAvailable().then(isAvailable => {
    console.log(
        isAvailable
            ? "Mock Server ativo em http://localhost:3000."
            : "Mock Server não detetado. A aplicação está a usar localStorage."
    );
});

console.log("Aplicação FocusUp iniciada.");
