# Zync Extensions

The official registry for [Zync](https://github.com/gajendraxdev/zync) plugins and themes.

## How it Works

Zync fetches `marketplace.json` from this repository to display available extensions in the **Marketplace** tab of the Settings modal. When a user clicks "Install", Zync downloads the `.zip` file from the `downloadUrl` and extracts it to `~/.config/zync/plugins/`.

## Available Extensions

| Name | Type | Description |
|------|------|-------------|
| SSH Quick Commands | Tool | Adds SSH utility commands to the command palette |
| Connection Stats | Tool | Shows live CPU/memory/disk stats in the status bar |

## Submitting Your Extension

1. **Create** your extension in its own repository (or fork this one).
2. **Package** it as a `.zip` file containing `manifest.json` and `main.js`.
3. **Host** the `.zip` as a GitHub Release asset (or any public URL).
4. **Fork** this repository and edit `marketplace.json` to add your entry.
5. **Submit a Pull Request** — we'll review and merge it!

## Extension Structure

Every extension must have a `manifest.json` at the root of the zip:

```json
{
  "id": "com.yourname.plugin.my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "main": "main.js"
}
```

### `manifest.json` Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✅ | Unique reverse-domain ID (e.g. `com.yourname.plugin.name`) |
| `name` | ✅ | Display name |
| `version` | ✅ | Semver version string |
| `main` | ❌ | Entry JS file (for tool plugins) |
| `style` | ❌ | CSS file (for theme plugins) |
| `mode` | ❌ | `"dark"` or `"light"` (for themes) |
| `preview_bg` | ❌ | Background color hex for theme preview |
| `preview_accent` | ❌ | Accent color hex for theme preview |

## Plugin API

Your `main.js` has access to the `zync` global object:

```js
// Register a command palette entry
zync.commands.register('my-plugin.hello', {
    label: 'My Plugin: Say Hello',
    description: 'Prints hello to the terminal',
    handler: () => zync.terminal.sendInput('echo Hello from My Plugin!\n'),
});

// Listen to events
zync.events.on('connection:connected', () => {
    console.log('Connected!');
});

// Update status bar
zync.statusBar.setText('my-plugin', 'Hello World');
```

## `marketplace.json` Schema

```json
{
  "plugins": [
    {
      "id": "com.example.plugin.my-plugin",
      "name": "My Plugin",
      "version": "1.0.0",
      "description": "A short description of what this plugin does.",
      "author": "Your Name",
      "downloadUrl": "https://github.com/yourname/my-plugin/releases/download/v1.0.0/my-plugin.zip",
      "thumbnailUrl": "https://...",
      "type": "tool"
    }
  ]
}
```

## License

MIT
