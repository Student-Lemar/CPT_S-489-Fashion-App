document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-board-form');
    const radioCards = document.querySelectorAll('.radio-card');
    
    // 1. Handle Visual Selection State
    radioCards.forEach(card => {
        const radioInput = card.querySelector('input[type="radio"]');
        
        // Skip disabled cards (The Public Option)
        if (radioInput.disabled) return;

        card.addEventListener('click', () => {
            // Reset all active classes
            radioCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected class to clicked card
            card.classList.add('selected');
            
            // Ensure radio is checked
            radioInput.checked = true;
        });
    });

    // 2. Handle Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop page reload

        const name = document.getElementById('board-name').value;
        const visibility = document.querySelector('input[name="visibility"]:checked').value;

        if (name) {
            // Simulate success
            alert(`Success! Created new ${visibility} board: "${name}"`);
            
            // Redirect simulation (Go back to Dashboard or Boards list)
            window.location.href = 'dashboard.html';
        }
    });
});