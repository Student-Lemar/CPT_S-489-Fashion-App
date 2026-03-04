const form = document.getElementById("loginForm");
const message = document.getElementById("message");

const forgotLink = document.getElementById("forgotLink");
const registerLink = document.getElementById("registerLink");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "";
    message.style.color = "#d64545";

    if (!username || !password) {
        message.textContent = "Please enter your username and password.";
        return;
    }

    // Demo login success
    message.style.color = "#2a9d50";
    message.textContent = "Login successful (demo)";
});

forgotLink.addEventListener("click", function(e){
    e.preventDefault();
    message.style.color = "#555";
    message.textContent = "Forgot password page coming soon.";
});

registerLink.addEventListener("click", function(e){
    e.preventDefault();
    message.style.color = "#555";
    message.textContent = "Register page coming soon.";
});