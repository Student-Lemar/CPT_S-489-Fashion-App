
(function () {
  const App = window.FashionApp;
  const users = App?.getUsers() || [];
  const reports = App?.getReports() || [];
  document.getElementById('statTotalUsers').textContent = users.length;
  document.getElementById('statActiveCreators').textContent = users.filter(u => u.role === 'creator' && u.status === 'active').length;
  document.getElementById('statPendingReports').textContent = reports.filter(r => r.status === 'pending').length;
  document.getElementById('queueBadge').textContent = reports.filter(r => r.status === 'pending').length;
  document.getElementById('statSuspended').textContent = users.filter(u => u.status === 'suspended').length;
  const tbody = document.getElementById('auditLogBody');
  tbody.innerHTML = App.getAuditLog().slice(0,5).map(entry => `<tr><td>${new Date(entry.timestamp).toLocaleString()}</td><td>${entry.adminId}</td><td><span class="tag">${entry.action}</span></td><td>${entry.target}</td></tr>`).join('');
})();
