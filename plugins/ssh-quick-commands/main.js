/**
 * SSH Quick Commands Plugin for Zync
 * Registers useful SSH utility commands into the command palette.
 */

(function () {
    const commands = [
        {
            id: 'ssh-quick.ping',
            label: 'SSH: Ping Host',
            description: 'Run ping to test connectivity',
            run: () => zync.terminal.sendInput('ping -c 4 localhost\n'),
        },
        {
            id: 'ssh-quick.uptime',
            label: 'SSH: Show Uptime',
            description: 'Display server uptime and load',
            run: () => zync.terminal.sendInput('uptime\n'),
        },
        {
            id: 'ssh-quick.disk',
            label: 'SSH: Disk Usage',
            description: 'Show disk usage (df -h)',
            run: () => zync.terminal.sendInput('df -h\n'),
        },
        {
            id: 'ssh-quick.memory',
            label: 'SSH: Memory Usage',
            description: 'Show memory usage (free -h)',
            run: () => zync.terminal.sendInput('free -h\n'),
        },
        {
            id: 'ssh-quick.top',
            label: 'SSH: Process List',
            description: 'Show running processes (top)',
            run: () => zync.terminal.sendInput('top\n'),
        },
        {
            id: 'ssh-quick.whoami',
            label: 'SSH: Who Am I',
            description: 'Show current user',
            run: () => zync.terminal.sendInput('whoami && id\n'),
        },
        {
            id: 'ssh-quick.netstat',
            label: 'SSH: Network Connections',
            description: 'Show active network connections',
            run: () => zync.terminal.sendInput('ss -tuln\n'),
        },
        {
            id: 'ssh-quick.os',
            label: 'SSH: OS Info',
            description: 'Show OS release information',
            run: () => zync.terminal.sendInput('cat /etc/os-release\n'),
        },
    ];

    // Register each command with Zync
    commands.forEach(cmd => {
        zync.commands.register(cmd.id, {
            label: cmd.label,
            description: cmd.description,
            handler: cmd.run,
        });
    });

    console.log('[SSH Quick Commands] Registered', commands.length, 'commands.');
})();
