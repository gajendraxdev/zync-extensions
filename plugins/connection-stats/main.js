/**
 * Connection Stats Plugin for Zync
 * Uses zync.on('ready', ...) to initialize after the plugin context is ready.
 * Uses zync.ui.notify() to show stats since zync.statusBar doesn't exist.
 */

(function () {
    zync.on('ready', function() {
        zync.commands.register(
            'connection-stats.show',
            'Connection Stats: Show Server Info',
            function() {
                zync.ui.notify({
                    title: 'Connection Stats',
                    body: 'This plugin shows server stats. Connect to a server and run: uptime && free -h && df -h'
                });
            }
        );

        zync.logger.log('[Connection Stats] Plugin ready. Registered command.');
    });
})();
