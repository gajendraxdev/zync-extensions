/**
 * SSH Quick Commands Plugin for Zync
 * Registers useful SSH utility commands into the command palette.
 * When executed, sends the command directly to the active terminal.
 */

(function () {
    var commands = [
        { id: 'ssh-quick.uptime',   title: 'SSH: Show Uptime',           cmd: 'uptime\n' },
        { id: 'ssh-quick.disk',     title: 'SSH: Disk Usage (df -h)',     cmd: 'df -h\n' },
        { id: 'ssh-quick.memory',   title: 'SSH: Memory Usage (free -h)', cmd: 'free -h\n' },
        { id: 'ssh-quick.top',      title: 'SSH: Process List (top)',      cmd: 'top\n' },
        { id: 'ssh-quick.whoami',   title: 'SSH: Who Am I',               cmd: 'whoami && id\n' },
        { id: 'ssh-quick.netstat',  title: 'SSH: Network Connections',    cmd: 'ss -tuln\n' },
        { id: 'ssh-quick.os',       title: 'SSH: OS Info',                cmd: 'cat /etc/os-release\n' },
        { id: 'ssh-quick.ps',       title: 'SSH: Running Processes',      cmd: 'ps aux --sort=-%cpu | head -20\n' },
        { id: 'ssh-quick.env',      title: 'SSH: Environment Variables',  cmd: 'env | sort\n' },
        { id: 'ssh-quick.last',     title: 'SSH: Last Logins',            cmd: 'last -n 10\n' },
    ];

    commands.forEach(function(c) {
        (function(cmd) {
            zync.commands.register(cmd.id, cmd.title, function() {
                zync.terminal.send(cmd.cmd);
                zync.logger.log('[SSH Quick Commands] Sent: ' + cmd.title);
            });
        })(c);
    });

    zync.logger.log('[SSH Quick Commands] Registered ' + commands.length + ' commands.');
})();
