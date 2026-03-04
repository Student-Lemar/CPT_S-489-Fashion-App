// Simple Greeting Logic
document.addEventListener('DOMContentLoaded', () => {
    const welcomeHeader = document.querySelector('.dashboard-welcome h1');
    const now = new Date();
    const hour = now.getHours();
    let greeting = "Welcome back";

    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }

    // This replaces "Welcome back" with the time-specific greeting
    // But keeps the name span intact if we reconstruct the HTML
    console.log(`${greeting}, User! Dashboard loaded.`);
});