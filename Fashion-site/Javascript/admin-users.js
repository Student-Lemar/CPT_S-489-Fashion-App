
(function () {
  const App = window.FashionApp;
  if (!App) return;
  const searchInput = document.getElementById('userSearch');
  const searchBtn = document.getElementById('searchBtn');
  const roleFilter = document.getElementById('roleFilter');
  const statusFilter = document.getElementById('statusFilter');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  const tbody = document.getElementById('userTableBody');
  const modal = document.getElementById('userModal');
  const modalClose = document.getElementById('modalClose');
  const modalCancel = document.getElementById('modalCancelBtn');
  const modalAction = document.getElementById('modalActionBtn');
  let modalUser = null;

  function roleClass(role) { return role === 'admin' ? 'admin' : role === 'creator' ? 'creator' : 'standard'; }
  function visibleUsers() {
    const q = searchInput.value.trim().toLowerCase();
    return App.getUsers().filter(user => {
      const roleOk = !roleFilter.value || user.role === roleFilter.value;
      const statusOk = !statusFilter.value || user.status === statusFilter.value;
      const qOk = !q || user.username.toLowerCase().includes(q) || (user.displayName || '').toLowerCase().includes(q);
      return roleOk && statusOk && qOk;
    });
  }
  function render() {
    const users = visibleUsers();
    tbody.innerHTML = users.map(user => `<tr data-role="${user.role}" data-status="${user.status}"><td>@${user.username}</td><td>${user.displayName || user.username}</td><td><span class="role-tag ${roleClass(user.role)}">${user.role[0].toUpperCase()+user.role.slice(1)}</span></td><td><span class="status-tag ${user.status}">${user.status[0].toUpperCase()+user.status.slice(1)}</span></td><td>${user.reports ?? 0}</td><td class="action-cell"><button class="btn-action view" data-view="${user.username}">View</button>${user.role === 'admin' ? '<button class="btn-action disabled" disabled>Suspend</button>' : user.status === 'active' ? `<button class="btn-action suspend" data-toggle="${user.username}">Suspend</button>` : `<button class="btn-action reactivate" data-toggle="${user.username}">Reactivate</button>`}</td></tr>`).join('');
    resultCount.textContent = `Showing ${users.length} user${users.length === 1 ? '' : 's'}`;
    emptyState.style.display = users.length ? 'none' : 'block';
  }
  function openModal(username) {
    modalUser = App.findUser(username);
    if (!modalUser) return;
    document.getElementById('modalUsername').textContent = `@${modalUser.username}`;
    document.getElementById('modalDisplayName').textContent = modalUser.displayName || modalUser.username;
    document.getElementById('modalRole').textContent = modalUser.role;
    document.getElementById('modalStatus').textContent = modalUser.status;
    document.getElementById('modalReports').textContent = modalUser.reports ?? 0;
    if (modalUser.role === 'admin') { modalAction.disabled = true; modalAction.textContent = 'Cannot Modify Admin'; }
    else { modalAction.disabled = false; modalAction.textContent = modalUser.status === 'active' ? 'Suspend Account' : 'Reactivate Account'; }
    modal.style.display = 'flex';
  }
  function closeModal() { modal.style.display = 'none'; }
  function toggleUser(username) {
    const target = App.findUser(username); if (!target || target.role === 'admin') return;
    const nextStatus = target.status === 'active' ? 'suspended' : 'active';
    App.updateUser(username, { status: nextStatus });
    App.addAudit(nextStatus === 'active' ? 'User Reactivated' : 'User Suspended', `@${username}`);
    render(); if (modal.style.display === 'flex') openModal(username);
  }
  tbody.addEventListener('click', (e) => { const view = e.target.dataset.view; const toggle = e.target.dataset.toggle; if (view) openModal(view); if (toggle) toggleUser(toggle); });
  [searchInput, roleFilter, statusFilter].forEach(el => el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', render));
  searchBtn.onclick = render; modalClose.onclick = closeModal; modalCancel.onclick = closeModal; modal.onclick = (e) => { if (e.target === modal) closeModal(); }; modalAction.onclick = () => { if (modalUser) toggleUser(modalUser.username); };
  render();
})();
