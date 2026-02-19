/**
 * PM2 Monitor Plugin for Zync
 * Registers a rich panel inside the connection tab area that lets you
 * manage PM2 processes with one click.
 */

(function () {
    var PANEL_ID = 'pm2-monitor';

    var panelHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PM2 Monitor</title>
<style>
  :root {
    --bg: #0f111a;
    --surface: #1a1d2e;
    --border: rgba(255,255,255,0.08);
    --text: #e2e8f0;
    --muted: #64748b;
    --accent: #6366f1;
    --green: #10b981;
    --red: #ef4444;
    --yellow: #f59e0b;
    --orange: #f97316;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    font-size: 13px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .header-left { display: flex; align-items: center; gap: 10px; }
  .header-icon {
    width: 28px; height: 28px;
    background: linear-gradient(135deg, var(--accent), #8b5cf6);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
  }
  .header-title { font-weight: 600; font-size: 14px; }
  .header-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }

  .header-actions { display: flex; gap: 8px; align-items: center; }
  .badge {
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 600;
    background: rgba(99,102,241,0.15);
    color: var(--accent);
    border: 1px solid rgba(99,102,241,0.2);
  }

  /* Buttons */
  .btn {
    padding: 5px 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); }
  .btn.btn-accent { background: var(--accent); border-color: transparent; color: #fff; }
  .btn.btn-accent:hover { filter: brightness(1.1); }
  .btn.btn-danger { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: var(--red); }
  .btn.btn-danger:hover { background: rgba(239,68,68,0.2); }
  .btn.btn-sm { padding: 3px 8px; font-size: 11px; border-radius: 5px; }

  /* Stats Row */
  .stats-row {
    display: flex;
    gap: 12px;
    padding: 10px 16px;
    background: rgba(255,255,255,0.02);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .stat {
    flex: 1;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    display: flex; flex-direction: column; gap: 3px;
  }
  .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); font-weight: 600; }
  .stat-value { font-size: 18px; font-weight: 700; }
  .stat-value.green { color: var(--green); }
  .stat-value.red { color: var(--red); }
  .stat-value.yellow { color: var(--yellow); }

  /* Table */
  .table-wrap {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;
  }
  .table-wrap::-webkit-scrollbar { width: 4px; }
  .table-wrap::-webkit-scrollbar-track { background: transparent; }
  .table-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  table { width: 100%; border-collapse: collapse; }
  thead th {
    text-align: left;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
    padding: 6px 10px;
    border-bottom: 1px solid var(--border);
  }
  tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.1s;
  }
  tbody tr:hover { background: rgba(255,255,255,0.03); }
  tbody td { padding: 9px 10px; vertical-align: middle; }

  .process-name { font-weight: 600; font-size: 13px; }
  .process-id { font-size: 10px; color: var(--muted); margin-top: 1px; font-family: monospace; }

  .status-dot {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 600;
  }
  .status-dot::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
  .status-online { background: rgba(16,185,129,0.1); color: var(--green); border: 1px solid rgba(16,185,129,0.2); }
  .status-stopped { background: rgba(239,68,68,0.1); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }
  .status-errored { background: rgba(249,115,22,0.1); color: var(--orange); border: 1px solid rgba(249,115,22,0.2); }
  .status-launching { background: rgba(245,158,11,0.1); color: var(--yellow); border: 1px solid rgba(245,158,11,0.2); }

  .metric { font-family: monospace; font-size: 12px; }
  .metric-high { color: var(--orange); }
  .metric-critical { color: var(--red); }

  .actions { display: flex; gap: 4px; }

  /* Empty + Loading */
  .empty-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; gap: 12px; color: var(--muted); text-align: center;
    padding: 40px;
  }
  .empty-icon { font-size: 40px; filter: grayscale(0.5); }
  .empty-title { font-size: 15px; font-weight: 600; color: var(--text); }
  .empty-sub { font-size: 12px; max-width: 280px; line-height: 1.6; }

  .loading { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 12px; padding: 20px; justify-content: center; }
  .spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(99,102,241,0.3);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .log-btn-anchor { font-size: 10px; color: var(--accent); text-decoration: underline; cursor: pointer; }
  .last-updated { font-size: 10px; color: var(--muted); }

  .alert-banner {
    margin: 10px 16px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    display: flex; align-items: center; gap: 8px;
    border: 1px solid rgba(245,158,11,0.3);
    background: rgba(245,158,11,0.08);
    color: var(--yellow);
  }
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <div class="header-icon">⚡</div>
    <div>
      <div class="header-title">PM2 Monitor</div>
      <div class="header-sub" id="subtitle">Process Manager Dashboard</div>
    </div>
  </div>
  <div class="header-actions">
    <span class="badge" id="process-count-badge">Loading…</span>
    <button class="btn btn-accent" onclick="fetchProcesses()">⟳ Refresh</button>
    <button class="btn" onclick="runCmd('pm2 save')">💾 Save</button>
  </div>
</div>

<div class="stats-row">
  <div class="stat">
    <div class="stat-label">Online</div>
    <div class="stat-value green" id="stat-online">—</div>
  </div>
  <div class="stat">
    <div class="stat-label">Stopped</div>
    <div class="stat-value red" id="stat-stopped">—</div>
  </div>
  <div class="stat">
    <div class="stat-label">Errored</div>
    <div class="stat-value yellow" id="stat-errored">—</div>
  </div>
  <div class="stat">
    <div class="stat-label">Total</div>
    <div class="stat-value" id="stat-total">—</div>
  </div>
</div>

<div id="alert-area"></div>

<div class="table-wrap">
  <div id="table-container">
    <div class="empty-state">
      <div class="empty-icon">🖥️</div>
      <div class="empty-title">No data yet</div>
      <div class="empty-sub">Click <strong>Refresh</strong> to run <code>pm2 jlist</code> on the server and load your processes.</div>
      <button class="btn btn-accent" style="margin-top:8px" onclick="fetchProcesses()">⟳ Load Processes</button>
    </div>
  </div>
</div>

<script>
var processes = [];
var lastUpdated = null;

function runCmd(cmd) {
  window.zync.terminal.send(cmd + '\\n');
}

function restartProcess(name) {
  if (confirm('Restart ' + name + '?')) {
    runCmd('pm2 restart ' + name);
    window.zync.ui.notify({ type: 'info', body: 'Restarting ' + name + '...' });
    setTimeout(fetchProcesses, 2000);
  }
}

function stopProcess(name) {
  if (confirm('Stop ' + name + '?')) {
    runCmd('pm2 stop ' + name);
    window.zync.ui.notify({ type: 'info', body: 'Stopping ' + name + '...' });
    setTimeout(fetchProcesses, 2000);
  }
}

function deleteProcess(name) {
  if (confirm('Delete ' + name + ' from PM2? This cannot be undone.')) {
    runCmd('pm2 delete ' + name);
    window.zync.ui.notify({ type: 'warning', body: 'Deleted ' + name + ' from PM2' });
    setTimeout(fetchProcesses, 2000);
  }
}

function startProcess(name) {
  runCmd('pm2 start ' + name);
  window.zync.ui.notify({ type: 'info', body: 'Starting ' + name + '...' });
  setTimeout(fetchProcesses, 2000);
}

function viewLogs(name) {
  runCmd('pm2 logs ' + name + ' --lines 50');
}

function fetchProcesses() {
  var container = document.getElementById('table-container');
  container.innerHTML = '<div class="loading"><div class="spinner"></div> Running pm2 jlist...</div>';
  document.getElementById('process-count-badge').textContent = 'Loading…';

  // Send pm2 jlist to terminal — output parsing is manual
  runCmd('pm2 jlist');

  // Since we cant read stdout from plugin, show demo data with a note
  setTimeout(loadDemoData, 800);
}

function formatUptime(ms) {
  if (!ms) return '—';
  var s = Math.floor(ms / 1000);
  var m = Math.floor(s / 60); s = s % 60;
  var h = Math.floor(m / 60); m = m % 60;
  var d = Math.floor(h / 24); h = h % 24;
  if (d > 0) return d + 'd ' + h + 'h';
  if (h > 0) return h + 'h ' + m + 'm';
  if (m > 0) return m + 'm ' + s + 's';
  return s + 's';
}

function formatMemory(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function cpuClass(cpu) {
  if (cpu >= 80) return 'metric-critical';
  if (cpu >= 50) return 'metric-high';
  return '';
}

function statusClass(status) {
  if (status === 'online') return 'status-online';
  if (status === 'stopped') return 'status-stopped';
  if (status === 'errored') return 'status-errored';
  return 'status-launching';
}

function loadDemoData() {
  // Demo processes — in a real SSH exec scenario these would come from pm2 jlist
  processes = [
    {
      name: 'api-server',      pm_id: 0, status: 'online',
      cpu: 12, memory: 48 * 1024 * 1024,
      restarts: 2, uptime: 3 * 24 * 60 * 60 * 1000,
      pid: 12345
    },
    {
      name: 'worker-queue',    pm_id: 1, status: 'online',
      cpu: 4, memory: 32 * 1024 * 1024,
      restarts: 0, uptime: 5 * 24 * 60 * 60 * 1000,
      pid: 12346
    },
    {
      name: 'cron-jobs',       pm_id: 2, status: 'online',
      cpu: 0, memory: 24 * 1024 * 1024,
      restarts: 1, uptime: 2 * 60 * 60 * 1000,
      pid: 12347
    },
    {
      name: 'ws-gateway',      pm_id: 3, status: 'stopped',
      cpu: 0, memory: 0, restarts: 5, uptime: 0, pid: null
    },
    {
      name: 'metrics-exporter', pm_id: 4, status: 'errored',
      cpu: 0, memory: 0, restarts: 99, uptime: 0, pid: null
    },
  ];

  renderTable();

  document.getElementById('alert-area').innerHTML =
    '<div class="alert-banner">⚠️ Showing demo data. <strong>pm2 jlist</strong> output was sent to your terminal. Paste the JSON into a file and use pm2 import to manage processes.</div>';
}

function renderTable() {
  lastUpdated = new Date();
  var online  = processes.filter(function(p) { return p.status === 'online'; }).length;
  var stopped = processes.filter(function(p) { return p.status === 'stopped'; }).length;
  var errored = processes.filter(function(p) { return p.status === 'errored'; }).length;

  document.getElementById('stat-online').textContent  = online;
  document.getElementById('stat-stopped').textContent = stopped;
  document.getElementById('stat-errored').textContent = errored;
  document.getElementById('stat-total').textContent   = processes.length;
  document.getElementById('process-count-badge').textContent = processes.length + ' processes';
  document.getElementById('subtitle').textContent = 'Updated ' + lastUpdated.toLocaleTimeString();

  // Update status bar
  window.zync.statusBar.set('pm2-monitor',
    '⚡ PM2: ' + online + '↑ ' + stopped + '↓ ' + errored + '⚠'
  );

  if (processes.length === 0) {
    document.getElementById('table-container').innerHTML =
      '<div class="empty-state"><div class="empty-icon">🎉</div><div class="empty-title">No processes found</div><div class="empty-sub">No PM2 processes are currently running on this server.</div></div>';
    return;
  }

  var rows = processes.map(function(p) {
    return '<tr>' +
      '<td>' +
        '<div class="process-name">' + escapeHtml(p.name) + '</div>' +
        '<div class="process-id">id:' + p.pm_id + (p.pid ? ' · pid:' + p.pid : '') + '</div>' +
      '</td>' +
      '<td><span class="status-dot ' + statusClass(p.status) + '">' + p.status + '</span></td>' +
      '<td><span class="metric ' + cpuClass(p.cpu) + '">' + p.cpu + '%</span></td>' +
      '<td><span class="metric">' + formatMemory(p.memory) + '</span></td>' +
      '<td><span class="metric">' + p.restarts + '</span></td>' +
      '<td class="metric">' + (p.status === 'online' ? formatUptime(p.uptime) : '—') + '</td>' +
      '<td>' +
        '<div class="actions">' +
        (p.status === 'online'
          ? '<button class="btn btn-sm" onclick="restartProcess(\\\' + escapeHtml(p.name) + \\\')">↺ Restart</button>' +
            '<button class="btn btn-sm btn-danger" onclick="stopProcess(\\\' + escapeHtml(p.name) + \\\')">■ Stop</button>'
          : '<button class="btn btn-sm btn-accent" onclick="startProcess(\\\' + escapeHtml(p.name) + \\\')">▶ Start</button>') +
        '<button class="btn btn-sm" onclick="viewLogs(\\\' + escapeHtml(p.name) + \\\')">📜 Logs</button>' +
        '<button class="btn btn-sm btn-danger" onclick="deleteProcess(\\\' + escapeHtml(p.name) + \\\')">🗑</button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }).join('');

  document.getElementById('table-container').innerHTML =
    '<table>' +
      '<thead><tr>' +
        '<th>Process</th>' +
        '<th>Status</th>' +
        '<th>CPU</th>' +
        '<th>Memory</th>' +
        '<th>Restarts</th>' +
        '<th>Uptime</th>' +
        '<th>Actions</th>' +
      '</tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>';
}

function escapeHtml(str) {
  str = String(str);
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Auto-refresh every 30s
setInterval(function() {
  if (processes.length > 0) fetchProcesses();
}, 30000);
</script>
</body>
</html>`;

    zync.on('ready', function() {
        zync.panel.register(PANEL_ID, 'PM2 Monitor', panelHTML);

        // Also register a command palette shortcut to open the panel
        zync.commands.register(
            'pm2-monitor.open',
            'PM2 Monitor: Open Dashboard',
            function() {
                zync.ui.notify({ type: 'info', body: 'Open the connection dropdown ⋯ → Plugins → PM2 Monitor' });
            }
        );

        // Register quick PM2 commands
        var quickCmds = [
            { id: 'pm2-monitor.list',        title: 'PM2: List Processes',      cmd: 'pm2 list\n' },
            { id: 'pm2-monitor.logs-all',    title: 'PM2: View All Logs',       cmd: 'pm2 logs --lines 100\n' },
            { id: 'pm2-monitor.restart-all', title: 'PM2: Restart All',         cmd: 'pm2 restart all\n' },
            { id: 'pm2-monitor.stop-all',    title: 'PM2: Stop All',            cmd: 'pm2 stop all\n' },
            { id: 'pm2-monitor.save',        title: 'PM2: Save Process List',   cmd: 'pm2 save\n' },
            { id: 'pm2-monitor.monit',       title: 'PM2: Open Monit Dashboard',cmd: 'pm2 monit\n' },
        ];

        quickCmds.forEach(function(c) {
            (function(cmd) {
                zync.commands.register(cmd.id, cmd.title, function() {
                    zync.terminal.send(cmd.cmd);
                });
            })(c);
        });

        zync.statusBar.set('pm2-monitor', '⚡ PM2 Monitor Active');
        zync.logger.log('[PM2 Monitor] Plugin ready. Panel registered.');
    });
})();
