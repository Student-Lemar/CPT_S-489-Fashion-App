// Admin User Management — S-17

// Sample user data mirroring the table rows
const users = [
    { username: 'styleking99',  displayName: 'Style King',   role: 'creator',  status: 'active',    reports: 2 },
    { username: 'user_trendy',  displayName: 'Trendy User',  role: 'creator',  status: 'suspended', reports: 5 },
    { username: 'jess_fits',    displayName: 'Jessica F.',   role: 'standard', status: 'active',    reports: 0 },
    { username: 'nova_drip',    displayName: 'Nova Drip',    role: 'creator',  status: 'active',    reports: 1 },
    { username: 'closet_queen', displayName: 'Closet Queen', role: 'standard', status: 'active',    reports: 0 },
    { username: 'fit_check_99', displayName: 'Fit Check',    role: 'creator',  status: 'suspended', reports: 8 },
    { username: 'minimal_looks',displayName: 'Min Looks',    role: 'standard', status: 'active',    reports: 0 },
    { username: 'admin_01',     displayName: 'Admin (You)',  role: 'admin',    status: 'active',    reports: null },
];

// --- Search & Filter ---
const searchInput  = document.getElementById('userSearch');
const searchBtn    = document.getElementById('searchBtn');
const roleFilter   = document.getElementById('roleFilter');
const statusFilter = document.getElementById('statusFilter');
const resultCount  = document.getElementById('resultCount');
const emptyState   = document.getElementById('emptyState');
const rows         = document.querySelectorAll('#userTableBody tr');

function applyFilters() {
    const query  = searchInput.value.toLowerCase().trim();
    const role   = roleFilter.value;
    const status = statusFilter.value;

    let visible = 0;
    rows.forEach(row => {
        const rowRole   = row.dataset.role;
        const rowStatus = row.dataset.status;
        const text      = row.textContent.toLowerCase();

        const matchesQuery  = !query  || text.includes(query);
        const matchesRole   = !role   || rowRole === role;
        const matchesStatus = !status || rowStatus === status;

        if (matchesQuery && matchesRole && matchesStatus) {
            row.style.display = '';
            visible++;
        } else {
            row.style.display = 'none';
        }
    });

    resultCount.textContent = `Showing ${visible} user${visible !== 1 ? 's' : ''}`;
    emptyState.style.display = visible === 0 ? 'block' : 'none';
}

searchBtn.addEventListener('click', applyFilters);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });
roleFilter.addEventListener('change', applyFilters);
statusFilter.addEventListener('change', applyFilters);

// --- Suspend / Reactivate (inline) ---
function suspendUser(username, btn) {
    if (!confirm(`Suspend @${username}? This will log the action.`)) return;

    const row = btn.closest('tr');
    const statusCell = row.querySelector('.status-tag');
    statusCell.textContent = 'Suspended';
    statusCell.className = 'status-tag suspended';

    btn.textContent = 'Reactivate';
    btn.className = 'btn-action reactivate';
    btn.setAttribute('onclick', `reactivateUser('${username}', this)`);

    row.dataset.status = 'suspended';
    logAction('suspend', username);
}

function reactivateUser(username, btn) {
    if (!confirm(`Reactivate @${username}?`)) return;

    const row = btn.closest('tr');
    const statusCell = row.querySelector('.status-tag');
    statusCell.textContent = 'Active';
    statusCell.className = 'status-tag active';

    btn.textContent = 'Suspend';
    btn.className = 'btn-action suspend';
    btn.setAttribute('onclick', `suspendUser('${username}', this)`);

    row.dataset.status = 'active';
    logAction('reactivate', username);
}

// --- View User Modal ---
const modal        = document.getElementById('userModal');
const modalClose   = document.getElementById('modalClose');
const modalCancel  = document.getElementById('modalCancelBtn');
const modalAction  = document.getElementById('modalActionBtn');

function viewUser(username) {
    const user = users.find(u => u.username === username);
    if (!user) return;

    document.getElementById('modalUsername').textContent    = `@${user.username}`;
    document.getElementById('modalDisplayName').textContent = user.displayName;
    document.getElementById('modalRole').textContent        = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('modalStatus').textContent      = user.status.charAt(0).toUpperCase() + user.status.slice(1);
    document.getElementById('modalReports').textContent     = user.reports !== null ? user.reports : '—';

    if (user.role === 'admin') {
        modalAction.textContent = 'Cannot Modify Admin';
        modalAction.disabled = true;
        modalAction.style.opacity = '0.5';
    } else if (user.status === 'active') {
        modalAction.textContent = 'Suspend Account';
        modalAction.disabled = false;
        modalAction.style.opacity = '';
        modalAction.onclick = () => { alert(`@${username} suspended. (logged)`); closeModal(); };
    } else {
        modalAction.textContent = 'Reactivate Account';
        modalAction.disabled = false;
        modalAction.style.opacity = '';
        modalAction.onclick = () => { alert(`@${username} reactivated. (logged)`); closeModal(); };
    }

    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// --- Audit log stub ---
function logAction(action, target) {
    console.log(`[AUDIT] Admin action: ${action} on @${target} at ${new Date().toISOString()}`);
}
