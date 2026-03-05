// Admin Moderation Queue — S-18

const typeFilter   = document.getElementById('typeFilter');
const statusFilter = document.getElementById('statusFilter');
const queueCount   = document.getElementById('queueCount');
const emptyQueue   = document.getElementById('emptyQueue');
const toast        = document.getElementById('actionToast');
const cards        = document.querySelectorAll('.report-card');

// --- Filter ---
function applyFilters() {
    const type   = typeFilter.value;
    const status = statusFilter.value;

    let visible = 0;
    cards.forEach(card => {
        const matchType   = !type   || card.dataset.type === type;
        const matchStatus = !status || card.dataset.status === status;

        if (matchType && matchStatus) {
            card.style.display = '';
            if (card.dataset.status === 'pending') visible++;
        } else {
            card.style.display = 'none';
        }
    });

    const pending = [...cards].filter(c => c.dataset.status === 'pending').length;
    queueCount.textContent = `${pending} item${pending !== 1 ? 's' : ''} pending review`;
    emptyQueue.style.display = visible === 0 ? 'block' : 'none';
}

typeFilter.addEventListener('change', applyFilters);
statusFilter.addEventListener('change', applyFilters);

// --- Take Action (BR-08: actions must be logged; BR-09: removed content not shown in feed) ---
function takeAction(reportId, action, btn) {
    const card = btn.closest('.report-card');
    const contentId = card.querySelector('.report-id').textContent;
    const poster = card.querySelector('.report-user strong').textContent;

    const messages = {
        remove:   `Content ${contentId} removed. It will no longer appear in the public feed.`,
        hide:     `Content ${contentId} hidden pending further review.`,
        warn:     `User ${poster} has been warned.`,
        noaction: `No action taken on ${contentId}. Report dismissed.`,
    };

    const confirmMessages = {
        remove:   `Remove ${contentId}? This will hide it from all public feeds.`,
        hide:     `Hide ${contentId} pending review?`,
        warn:     `Send a warning to ${poster}?`,
        noaction: `Dismiss all reports for ${contentId}?`,
    };

    if (!confirm(confirmMessages[action])) return;

    // Mark resolved
    card.dataset.status = 'resolved';
    card.classList.add('resolved');

    // Disable all action buttons
    card.querySelectorAll('.btn-mod').forEach(b => {
        b.disabled = true;
        b.style.opacity = '0.5';
        b.style.cursor = 'default';
    });

    // Update meta bar
    const metaBar = card.querySelector('.report-meta');
    const resolvedTag = document.createElement('span');
    resolvedTag.style.cssText = 'margin-left:auto; color:#006e30; font-weight:700;';
    resolvedTag.textContent = 'Resolved';
    metaBar.appendChild(resolvedTag);

    // Show toast
    showToast(messages[action]);

    // Audit log
    logAuditEntry(action, contentId, poster);

    // Update count
    applyFilters();
}

// --- Toast ---
let toastTimer;
function showToast(message) {
    toast.textContent = message;
    toast.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

// --- Audit log stub ---
function logAuditEntry(action, contentId, poster) {
    console.log(`[AUDIT] admin_01 | action: ${action} | target: ${contentId} (${poster}) | ${new Date().toISOString()}`);
}
