// Admin Dashboard — S-16
// Highlights the active nav link based on current page
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.nav-center a');
    links.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('active');
        }
    });
});
