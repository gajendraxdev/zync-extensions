/**
 * Connection Stats Plugin for Zync
 * Periodically fetches CPU, memory, and disk stats from the active SSH session
 * and displays them in the status bar.
 */

(function () {
    let intervalId = null;

    const COMMANDS = {
        cpu: "top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1",
        mem: "free -m | awk 'NR==2{printf \"%.0f\", $3*100/$2}'",
        disk: "df -h / | awk 'NR==2{print $5}'",
    };

    async function fetchStats() {
        try {
            const [cpu, mem, disk] = await Promise.all([
                zync.ssh.exec(COMMANDS.cpu),
                zync.ssh.exec(COMMANDS.mem),
                zync.ssh.exec(COMMANDS.disk),
            ]);

            const label = `CPU: ${parseFloat(cpu).toFixed(1)}%  MEM: ${mem.trim()}%  DISK: ${disk.trim()}`;
            zync.statusBar.setText('connection-stats', label);
        } catch (e) {
            zync.statusBar.setText('connection-stats', '');
        }
    }

    // Start polling every 10 seconds
    function start() {
        fetchStats();
        intervalId = setInterval(fetchStats, 10000);
        console.log('[Connection Stats] Started polling.');
    }

    function stop() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        zync.statusBar.setText('connection-stats', '');
        console.log('[Connection Stats] Stopped polling.');
    }

    // Listen for connection events
    zync.events.on('connection:connected', start);
    zync.events.on('connection:disconnected', stop);

    console.log('[Connection Stats] Plugin loaded. Waiting for connection...');
})();
