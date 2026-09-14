// Ponto de entrada
if (document.readyState !== "loading") {
    AppController.init();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        AppController.init();
    });
}
