
(function () {
  const App = window.FashionApp;
  if (!App) return;
  const typeFilter = document.getElementById('typeFilter');
  const statusFilter = document.getElementById('statusFilter');
  const queueCount = document.getElementById('queueCount');
  const emptyQueue = document.getElementById('emptyQueue');
  const toast = document.getElementById('actionToast');
  const container = document.querySelector('.queue-list');
  function showToast(message) { toast.textContent = message; toast.style.display = 'block'; clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(()=>toast.style.display='none', 2500); }
  function render() {
    const reports = App.getReports().filter(report => (!typeFilter.value || report.type === typeFilter.value) && (!statusFilter.value || report.status === statusFilter.value));
    queueCount.textContent = `${App.getReports().filter(r => r.status === 'pending').length} item${App.getReports().filter(r => r.status === 'pending').length === 1 ? '' : 's'} pending review`;
    container.innerHTML = reports.map(report => `<div class="report-card ${report.status !== 'pending' ? 'resolved' : ''}" data-id="${report.id}"><div class="report-meta"><span class="type-tag ${report.type}">${report.type[0].toUpperCase()+report.type.slice(1)}</span><span class="report-id">${report.contentLabel}</span><span class="report-date">Reported: ${App.formatDate(report.createdAt)}</span><span class="report-count">${report.status}</span></div><div class="report-body"><div class="report-preview"><div class="preview-placeholder">[ ${report.type === 'post' ? 'Outfit Post' : 'Board'} Preview ]</div></div><div class="report-info"><p class="report-user">Posted by: <strong>@${report.poster}</strong></p><p class="report-reason"><strong>Reason:</strong> ${report.reason}</p><p class="report-caption">"${report.caption}"</p></div></div><div class="report-actions">${report.status === 'pending' ? `<button class="btn-mod remove" data-action="remove" data-id="${report.id}">Remove</button><button class="btn-mod hide" data-action="hide" data-id="${report.id}">Hide</button><button class="btn-mod warn" data-action="warn" data-id="${report.id}">Warn User</button><button class="btn-mod noaction" data-action="noaction" data-id="${report.id}">No Action</button>` : '<span style="color:#006e30;font-weight:700;">Resolved</span>'}</div></div>`).join('');
    emptyQueue.style.display = reports.length ? 'none' : 'block';
  }
  function takeAction(id, action) {
    const report = App.getReports().find(r => r.id === id); if (!report) return;
    const messages = { remove: `${report.contentLabel} removed from public views.`, hide: `${report.contentLabel} hidden pending review.`, warn: `@${report.poster} has been warned.`, noaction: `Report dismissed for ${report.contentLabel}.` };
    if (action === 'remove') App.updateReport(id, { status: 'removed' }); else if (action === 'hide') App.updateReport(id, { status: 'hidden' }); else App.updateReport(id, { status: 'resolved' });
    if (action === 'warn') App.updateUser(report.poster, { reports: (App.findUser(report.poster)?.reports || 0) + 1 });
    App.addAudit(action === 'remove' ? 'Content Removed' : action === 'hide' ? 'Content Hidden' : action === 'warn' ? 'User Warned' : 'Report Dismissed', report.contentLabel);
    render(); showToast(messages[action]);
  }
  container.addEventListener('click', (e) => { if (e.target.dataset.action) takeAction(e.target.dataset.id, e.target.dataset.action); });
  typeFilter.addEventListener('change', render); statusFilter.addEventListener('change', render); render();
})();
