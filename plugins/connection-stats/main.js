/**
 * Connection Stats Plugin for Zync
 * Shows live CPU/memory/disk stats in the Zync status bar.
 * Uses zync.statusBar.set() and zync.commands.register().
 */

(function () {
    zync.on('ready', function() {
        // Register a manual refresh command
        zync.commands.register(
            'connection-stats.refresh',
            'Connection Stats: Refresh Server Stats',
            function() {
                // Send a compound command that outputs stats in a parseable format
                zync.terminal.send(
                    'echo "=== SERVER STATS ===" && uptime && echo "---" && free -h | grep Mem && echo "---" && df -h / | tail -1\n'
                );
                zync.ui.notify({
                    type: 'info',
                    body: 'Stats command sent to terminal!'
                });
            }
        );

        // Show a status bar indicator that the plugin is active
        zync.statusBar.set('connection-stats', '⚡ Stats Plugin Active');

        zync.logger.log('[Connection Stats] Plugin ready.');
    });
})();
