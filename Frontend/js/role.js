/* =====================
   ROLE SELECTION FUNCTIONALITY
===================== */

// Function to handle role selection
function chooseRole(role, event) {
    // Prevent any default behavior
    event.preventDefault();
    
    // Store the selected role in localStorage
    localStorage.setItem('userRole', role);
    
    // Remove previous selections from all cards
    document.querySelectorAll('.role-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selected class to clicked card
    event.currentTarget.classList.add('selected');
    
    // Add fade-out effect to body
    document.body.classList.add('fade-out');
    
    // Navigate to appropriate registration page after animation
    setTimeout(() => {
        switch(role) {
            case 'student':
                window.location.href = 'student-register.html';
                break;
            case 'cafe':
                window.location.href = 'cafe-register.html';
                break;
            case 'admin':
                window.location.href = 'admin-register.html';
                break;
            default:
                console.error('Unknown role:', role);
                window.location.href = 'student-register.html';
        }
    }, 500);
}

// Add keyboard support for accessibility
document.addEventListener('DOMContentLoaded', function() {
    const roleCards = document.querySelectorAll('.role-card');
    
    roleCards.forEach(card => {
        // Make cards focusable
        card.setAttribute('tabindex', '0');
        
        // Add keyboard event listener
        card.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const role = this.onclick.toString().match(/'(\w+)'/)[1];
                chooseRole(role, event);
            }
        });
        
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = '';
            }
        });
    });
});

// Clear any previous role selection when page loads
document.addEventListener('DOMContentLoaded', function() {
    localStorage.removeItem('userRole');
});