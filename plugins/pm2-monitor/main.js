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
  .header-left { display: flex; align-items: center;    gap: 12px;
  }
  .header-icon {
    width: 44px; height: 44px; background: linear-gradient(135deg, var(--accent), #eab308);
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    font-size: 22px; color: #fff; box-shadow: 0 4px 16px rgba(59,130,246,0.4); text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }font-size: 14px; }
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
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
  }
  .stat {
    background: linear-gradient(145deg, var(--surface) 0%, rgba(255,255,255,0.03) 100%);
    border: 1px solid var(--border); border-radius: 12px;
    padding: 16px 20px;
    display: flex; flex-direction: column; gap: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .stat:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  }
  .stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
  .stat-value { font-size: 32px; font-weight: 500; font-family: 'JetBrains Mono', 'Fira Code', monospace; line-height: 1; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
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
  thead  th {
    text-align: left; padding: 12px 16px; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px;
    border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.2); font-weight: 600;
  }
  td {
    padding: 12px 16px; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.02); vertical-align: middle;
  }
  tr { transition: background 0.15s; }
  tr:hover { background: rgba(255,255,255,0.02); }
  tr:last-child td { border-bottom: none; }

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

  /* Checkboxes */
  .checkbox { width: 14px; height: 14px; cursor: pointer; accent-color: var(--accent); }
  
  /* Sortable Headers */
  th.sortable { cursor: pointer; user-select: none; transition: color 0.15s; }
  th.sortable:hover { color: var(--accent); }
  th.sortable::after { content: "↕"; margin-left: 6px; font-size: 10px; opacity: 0.3; }
  th.sort-asc::after { content: "↑"; opacity: 1; color: var(--accent); }
  th.sort-desc::after { content: "↓"; opacity: 1; color: var(--accent); }

  /* Context Menu */
  .context-btn {
    background: transparent; border: none; color: var(--muted); cursor: pointer;
    padding: 2px 6px; border-radius: 4px; font-size: 14px; transition: all 0.2s;
  }
  .context-btn:hover { background: rgba(255,255,255,0.1); color: var(--text); }
  
  .context-menu {
    position: absolute; right: 28px; top: 10px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    padding: 4px; display: none; z-index: 100; min-width: 120px;
  }
  .context-menu.active { display: block; }
  .context-menu-item {
    display: block; width: 100%; text-align: left; padding: 6px 10px;
    background: transparent; border: none; font-size: 11px;
    color: var(--text); cursor: pointer; border-radius: 4px;
  }
  .context-menu-item:hover { background: rgba(255,255,255,0.05); color: var(--accent); }
  .context-menu-item.danger:hover { color: var(--red); background: rgba(239,68,68,0.1); }

  /* Bulk Actions Bar */
  .bulk-bar {
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 16px;
    display: flex; gap: 12px; align-items: center;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5); z-index: 200;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0; pointer-events: none; transform: translate(-50%, 20px);
  }
  .bulk-bar.visible { opacity: 1; pointer-events: auto; transform: translate(-50%, 0); }
  .bulk-count { font-size: 12px; font-weight: 500; color: var(--text); border-right: 1px solid var(--border); padding-right: 12px; }

  /* Inspector Modal */
  .inspector-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    z-index: 300; display: none; backdrop-filter: blur(2px);
  }
  .inspector-drawer {
    position: fixed; top: 0; right: 0; bottom: 0; width: 400px;
    background: var(--bg); border-left: 1px solid var(--border);
    z-index: 310; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    display: flex; flex-direction: column; box-shadow: -4px 0 24px rgba(0,0,0,0.5);
  }
  .inspector-drawer.open { transform: translateX(0); }
  .inspector-header { padding: 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .inspector-title { font-size: 14px; font-weight: 500; }
  .inspector-close { background: transparent; border: none; color: var(--muted); cursor: pointer; font-size: 16px; }
  .inspector-close:hover { color: var(--text); }
  .inspector-body { padding: 16px; overflow-y: auto; flex: 1; font-size: 12px; }
  .inspector-body pre { background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; border: 1px solid var(--border); overflow-x: auto; color: var(--green); margin-top: 8px; }
  .inspector-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .inspector-label { color: var(--muted); }
  .inspector-val { font-family: 'JetBrains Mono', 'Fira Code', monospace; color: var(--text); }
  .metric { font-family: 'JetBrains Mono', 'Fira Code', monospace; color: var(--muted); font-size: 12px; }
  .process-name-link { cursor: pointer; transition: color 0.15s; }
  .process-name-link:hover { color: var(--accent); text-decoration: underline; }
</style>
</head>
<body onclick="closeAllContextMenus()">

<div class="header">
  <div class="header-left">
    <div class="header-icon">⚡</div>
    <div>
      <div class="header-title">PM2 Monitor</div>
      <div class="header-sub" id="subtitle">Process Manager Dashboard</div>
    </div>
  </div>
  <div class="header-actions">
    <input type="text" id="search-box" class="search-input" placeholder="Search processes..." oninput="filterTable()" />
    <span class="badge" id="process-count-badge">Loading…</span>
    <button class="btn btn-accent" id="refresh-btn" onclick="fetchProcesses()">⟳ Refresh</button>
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
      <div class="spinner"></div>
      <div class="empty-sub" style="margin-top:12px">Connecting to PM2...</div>
    </div>
  </div>
</div>

<!-- Bulk Actions Bar -->
<div class="bulk-bar" id="bulk-bar">
  <div class="bulk-count" id="bulk-count">0 Selected</div>
  <button class="btn btn-sm" onclick="bulkAction('restart')">↺ Restart All</button>
  <button class="btn btn-sm btn-danger" onclick="bulkAction('stop')">■ Stop All</button>
  <button class="btn btn-sm btn-danger" onclick="bulkAction('delete')">🗑 Delete All</button>
</div>

<!-- Inspector Drawer -->
<div class="inspector-overlay" id="inspector-overlay" onclick="closeInspector()"></div>
<div class="inspector-drawer" id="inspector-drawer">
  <div class="inspector-header">
    <div class="inspector-title" id="inspector-title">Process Details</div>
    <button class="inspector-close" onclick="closeInspector()">×</button>
  </div>
  <div class="inspector-body" id="inspector-body">
    Loading...
  </div>
</div>

<script>
var processes = [];
var lastUpdated = null;
var sortCol = 'name';
var sortAsc = true;
var selectedItems = [];

function runCmd(cmd) {
  return window.zync.ssh.exec(cmd);
}

// Helpers
function escapeHtml(unsafe) {
    return (unsafe || '').toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function closeAllContextMenus() {
  var menus = document.querySelectorAll('.context-menu');
  menus.forEach(function(m) { m.classList.remove('active'); });
}

function toggleMenu(e, id) {
  e.stopPropagation();
  closeAllContextMenus();
  var menu = document.getElementById('menu-' + id);
  if (menu) menu.classList.toggle('active');
}

// Sorting logic
function setSort(col) {
  if (sortCol === col) sortAsc = !sortAsc;
  else { sortCol = col; sortAsc = true; }
  renderTable();
}

function getSortClass(col) {
  if (sortCol !== col) return '';
  return sortAsc ? 'sort-asc' : 'sort-desc';
}

// Selection logic
function toggleSelectAll(e) {
  if (e.target.checked) {
    selectedItems = processes.map(function(p) { return p.name; });
  } else {
    selectedItems = [];
  }
  renderTable();
}

function toggleSelect(e, name) {
  e.stopPropagation();
  if (e.target.checked) selectedItems.push(name);
  else selectedItems = selectedItems.filter(function(n) { return n !== name; });
  renderTable();
}

// Inspector Logic
function openInspector(name) {
  var p = processes.find(function(proc) { return proc.name === name; });
  if (!p) return;
  document.getElementById('inspector-overlay').style.display = 'block';
  setTimeout(function() { document.getElementById('inspector-drawer').classList.add('open'); }, 10);
  document.getElementById('inspector-title').textContent = p.name;
  
  var html = '';
  html += '<div class="inspector-row"><span class="inspector-label">Status</span><span class="inspector-val ' + statusClass(p.status) + '">' + p.status + '</span></div>';
  html += '<div class="inspector-row"><span class="inspector-label">PM2 ID</span><span class="inspector-val">' + p.pm_id + '</span></div>';
  html += '<div class="inspector-row"><span class="inspector-label">PID</span><span class="inspector-val">' + (p.pid || 'N/A') + '</span></div>';
  html += '<div class="inspector-row"><span class="inspector-label">CPU</span><span class="inspector-val">' + p.cpu + '%</span></div>';
  html += '<div class="inspector-row"><span class="inspector-label">Memory</span><span class="inspector-val">' + formatMemory(p.memory) + '</span></div>';
  html += '<div class="inspector-row"><span class="inspector-label">Restarts</span><span class="inspector-val">' + p.restarts + '</span></div>';
  
  if (p.raw && p.raw.pm2_env) {
    html += '<div class="inspector-row"><span class="inspector-label">Node Version</span><span class="inspector-val">' + (p.raw.pm2_env.node_version || 'Unknown') + '</span></div>';
    html += '<div class="inspector-row"><span class="inspector-label">Script Path</span><span class="inspector-val" style="font-size:10px;text-align:right">' + (p.raw.pm2_env.pm_exec_path || 'Unknown') + '</span></div>';
    html += '<div class="inspector-row"><span class="inspector-label">Exec Mode</span><span class="inspector-val">' + (p.raw.pm2_env.exec_mode || 'Unknown') + '</span></div>';
    html += '<h4 style="margin:16px 0 8px">Environment Variables</h4>';
    var envStr = '';
    for (var key in (p.raw.pm2_env.env || {})) {
      envStr += key + '=' + p.raw.pm2_env.env[key] + '\\n';
    }
    if (envStr) html += '<pre>' + escapeHtml(envStr) + '</pre>';
    else html += '<div class="inspector-label">No custom environment variables found.</div>';
  }
  
  document.getElementById('inspector-body').innerHTML = html;
}

function closeInspector() {
  document.getElementById('inspector-drawer').classList.remove('open');
  setTimeout(function() { document.getElementById('inspector-overlay').style.display = 'none'; }, 300);
}

// Bulk Actions
async function bulkAction(action) {
  if (selectedItems.length === 0) return;
  const verb = action === 'delete' ? 'Delete' : (action === 'stop' ? 'Stop' : 'Restart');
  const confirmed = await window.zync.ui.confirm({
    title: verb + ' Multiple Processes',
    message: 'Are you sure you want to ' + action + ' ' + selectedItems.length + ' processes?',
    variant: action === 'restart' ? 'primary' : 'danger',
    confirmText: verb
  });
  if (confirmed) {
    var promises = selectedItems.map(function(name) {
      updateProcessStateLocally(name, action === 'delete' ? 'deleting...' : (action === 'stop' ? 'stopping...' : 'launching...'));
      return runCmd('pm2 ' + action + ' ' + name);
    });
    window.zync.ui.notify({ type: 'info', body: verb + 'ing ' + selectedItems.length + ' processes...' });
    
    // Clear selection aggressively, refetch later
    selectedItems = [];
    renderTable();
    
    Promise.all(promises).then(function() {
      setTimeout(fetchProcesses, 3000);
    });
  }
}

// Helper for Optimistic UI Updates
function updateProcessStateLocally(name, pseudoStatus) {
  var p = processes.find(function(proc) { return proc.name === name; });
  if (p) {
    p.status = pseudoStatus; // e.g. "stopping...", "launching..."
    renderTable();
  }
}

async function restartProcess(name) {
  closeAllContextMenus();
  const confirmed = await window.zync.ui.confirm({
    title: 'Restart Process',
    message: 'Are you sure you want to restart ' + name + '?'
  });
  if (confirmed) {
    updateProcessStateLocally(name, 'launching...');
    runCmd('pm2 restart ' + name);
    window.zync.ui.notify({ type: 'info', body: 'Restarting ' + name + '...' });
    setTimeout(fetchProcesses, 2000);
  }
}

async function stopProcess(name) {
  closeAllContextMenus();
  const confirmed = await window.zync.ui.confirm({
    title: 'Stop Process',
    message: 'Are you sure you want to stop ' + name + '?',
    variant: 'danger'
  });
  if (confirmed) {
    updateProcessStateLocally(name, 'stopping...');
    runCmd('pm2 stop ' + name);
    window.zync.ui.notify({ type: 'info', body: 'Stopping ' + name + '...' });
    setTimeout(fetchProcesses, 3000);
  }
}

async function deleteProcess(name) {
  closeAllContextMenus();
  const confirmed = await window.zync.ui.confirm({
    title: 'Delete Process',
    message: 'Delete ' + name + ' from PM2? This cannot be undone.',
    variant: 'danger',
    confirmText: 'Delete'
  });
  if (confirmed) {
    updateProcessStateLocally(name, 'deleting...');
    runCmd('pm2 delete ' + name);
    window.zync.ui.notify({ type: 'warning', body: 'Deleted ' + name + ' from PM2' });
    setTimeout(fetchProcesses, 3000);
  }
}

function startProcess(name) {
  closeAllContextMenus();
  updateProcessStateLocally(name, 'launching...');
  runCmd('pm2 start ' + name);
  window.zync.ui.notify({ type: 'info', body: 'Starting ' + name + '...' });
  setTimeout(fetchProcesses, 2000);
}

function viewLogs(name) {
  closeAllContextMenus();
  window.zync.terminal.newTab({ command: 'pm2 logs ' + name + ' --lines 50\\n' });
  window.zync.ui.notify({ type: 'success', body: 'Opening logs for ' + name + ' in new Terminal tab.' });
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
  // Fallback for "stopping...", "launching...", etc.
  return 'status-launching';
}

function fetchProcesses() {
  document.getElementById('refresh-btn').disabled = true;
  document.getElementById('refresh-btn').textContent = 'Loading...';

  window.zync.ssh.exec('pm2 jlist').then(function(output) {
      try {
          var trimmed = output.trim();
          // pm2 jlist sometimes outputs warnings before JSON, try to find the array
          var jsonStart = trimmed.indexOf('[');
          if (jsonStart !== -1) {
              trimmed = trimmed.substring(jsonStart);
          }
          
          var data = JSON.parse(trimmed);
          processes = data.map(function(p) {
              return {
                  name: p.name,
                  pm_id: p.pm_id,
                  status: p.pm2_env.status,
                  cpu: p.monit ? p.monit.cpu : 0,
                  memory: p.monit ? p.monit.memory : 0,
                  restarts: p.pm2_env.restart_time,
                  uptime: p.pm2_env.pm_uptime ? (new Date().getTime() - p.pm2_env.pm_uptime) : 0,
                  pid: p.pid,
                  raw: p // Store full obj for inspector
              };
          });
          document.getElementById('alert-area').innerHTML = '';
          renderTable();
      } catch (e) {
          console.error('Failed to parse pm2 jlist', e, output);
           document.getElementById('alert-area').innerHTML =
            '<div class="alert-banner">⚠️ Error parsing process data. Is PM2 installed?</div>';
          document.getElementById('table-container').innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Parse Error</div></div>';
      }
  }).catch(function(err) {
      console.error('SSH Exec Error:', err);
      document.getElementById('alert-area').innerHTML =
        '<div class="alert-banner">⚠️ Error executing PM2: ' + String(err) + '</div>';
      document.getElementById('table-container').innerHTML = '';
  }).finally(function() {
      document.getElementById('refresh-btn').disabled = false;
      document.getElementById('refresh-btn').textContent = '⟳ Refresh';
  });
}

function filterTable() {
  renderTable();
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
  
  // Bulk actions bar visibility
  var bulkBar = document.getElementById('bulk-bar');
  if (bulkBar) {
    if (selectedItems.length > 0) {
      bulkBar.classList.add('visible');
      document.getElementById('bulk-count').textContent = selectedItems.length + ' Selected';
    } else {
      bulkBar.classList.remove('visible');
    }
  }

  var searchTerm = (document.getElementById('search-box').value || '').toLowerCase();
  
  // Apply Search
  var filteredProcesses = processes.filter(function(p) {
    return p.name.toLowerCase().indexOf(searchTerm) > -1;
  });
  
  // Apply Sort
  filteredProcesses.sort(function(a, b) {
    var valA = a[sortCol];
    var valB = b[sortCol];
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  if (processes.length === 0) {
    document.getElementById('table-container').innerHTML =
      '<div class="empty-state"><div class="empty-icon">🎉</div><div class="empty-title">No processes found</div><div class="empty-sub">No PM2 processes are currently running on this server.</div></div>';
    return;
  }
  
  if (filteredProcesses.length === 0) {
    document.getElementById('table-container').innerHTML =
      '<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No matches</div><div class="empty-sub">No processes match your search query.</div></div>';
    return;
  }
  
  var allSelected = filteredProcesses.length > 0 && filteredProcesses.every(function(p) { return selectedItems.includes(p.name); });

  var rows = filteredProcesses.map(function(p) {
    // Disable buttons if status is a pseudo-state (optimistic UI)
    var isPending = p.status.endsWith('...');
    var isSelected = selectedItems.includes(p.name);
    
    var contextMenuHtml = 
      '<div style="position:relative">' +
        '<button class="context-btn" ' + (isPending ? 'disabled' : '') + ' onclick="toggleMenu(event, &apos;' + p.pm_id + '&apos;)">⋮</button>' +
        '<div class="context-menu" id="menu-' + p.pm_id + '">' +
          (p.status === 'online' 
            ? '<button class="context-menu-item" onclick="restartProcess(&apos;' + escapeHtml(p.name) + '&apos;)">↺ Restart</button>' +
              '<button class="context-menu-item" onclick="stopProcess(&apos;' + escapeHtml(p.name) + '&apos;)">■ Stop</button>'
            : '<button class="context-menu-item" onclick="startProcess(&apos;' + escapeHtml(p.name) + '&apos;)">▶ Start</button>') +
          '<hr style="border:none;border-top:1px solid var(--border);margin:4px 0">' +
          '<button class="context-menu-item" onclick="viewLogs(&apos;' + escapeHtml(p.name) + '&apos;)">📜 Logs</button>' +
          '<button class="context-menu-item danger" onclick="deleteProcess(&apos;' + escapeHtml(p.name) + '&apos;)">🗑 Delete</button>' +
        '</div>' +
      '</div>';
    
    return '<tr>' +
      '<td style="width: 30px;"><input type="checkbox" class="checkbox" ' + (isSelected ? 'checked' : '') + ' onclick="toggleSelect(event, &apos;' + escapeHtml(p.name) + '&apos;)"></td>' +
      '<td>' +
        '<div class="process-name process-name-link" onclick="openInspector(&apos;' + escapeHtml(p.name) + '&apos;)">' + escapeHtml(p.name) + '</div>' +
        '<div class="process-id">id:' + p.pm_id + (p.pid ? ' · pid:' + p.pid : '') + '</div>' +
      '</td>' +
      '<td><span class="status-dot ' + statusClass(p.status) + '">' + p.status + '</span></td>' +
      '<td><span class="metric ' + cpuClass(p.cpu) + '">' + p.cpu + '%</span></td>' +
      '<td><span class="metric">' + formatMemory(p.memory) + '</span></td>' +
      '<td><span class="metric">' + p.restarts + '</span></td>' +
      '<td class="metric">' + (p.status === 'online' ? formatUptime(p.uptime) : '—') + '</td>' +
      '<td style="text-align:right;">' + contextMenuHtml + '</td>' +
    '</tr>';
  });

  var tableHtml = '<table>' +
    '<thead><tr>' +
      '<th style="width: 30px;"><input type="checkbox" class="checkbox" ' + (allSelected ? 'checked' : '') + ' onclick="toggleSelectAll(event)"></th>' +
      '<th class="sortable ' + getSortClass('name') + '" onclick="setSort(\'name\')">Process</th>' +
      '<th class="sortable ' + getSortClass('status') + '" onclick="setSort(\'status\')">Status</th>' +
      '<th class="sortable ' + getSortClass('cpu') + '" onclick="setSort(\'cpu\')">CPU</th>' +
      '<th class="sortable ' + getSortClass('memory') + '" onclick="setSort(\'memory\')">Memory</th>' +
      '<th class="sortable ' + getSortClass('restarts') + '" onclick="setSort(\'restarts\')">↺</th>' +
      '<th class="sortable ' + getSortClass('uptime') + '" onclick="setSort(\'uptime\')">Uptime</th>' +
      '<th style="text-align:right;">Actions</th>' +
    '</tr></thead>' +
    '<tbody>' + rows.join('') + '</tbody>' +
  '</table>';

  document.getElementById('table-container').innerHTML = tableHtml;
}

// Auto-Load on Startup
setTimeout(fetchProcesses, 100);
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
