# Git-Boi

A modern, customizable terminal emulator built with Electron that supports remote control via WebSocket connections.

![Git-Boi Terminal](build/icon.ico)

## Features

- 🚀 Fast and responsive terminal emulation
- 🎨 Dark theme
- 🔄 Remote control capabilities via WebSocket
- 💾 Persistent window state and configuration
- 🖥️ Cross-platform support (Windows, macOS, Linux)
- 🎮 Stream Deck integration for quick command execution
- 🔌 Customizable Stream Deck actions

## Architecture

Git-Boi is built using three main components:

1. **Terminal UI (xterm.js)**
   - Provides the terminal interface
   - Handles text rendering and input capture
   - Supports terminal colors and formatting

2. **Shell Process (node-pty)**
   - Manages the actual terminal process
   - Supports various shells (Git Bash, cmd, bash, etc.)
   - Handles command execution

3. **Remote Control (WebSocket)**
   - Enables external control of the terminal
   - Allows sending commands remotely
   - Supports multiple client connections

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shyrzaza/Git-Boi.git
   cd Git-Boi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

## Configuration

Git-Boi can be customized through a configuration file:

1. Create a `config.json` file at:
   - Windows: `%APPDATA%\git-boi\config.json`
   - macOS/Linux: `~/.config/git-boi/config.json`

2. Add your preferred shell configuration:
   ```json
   {
     "customPath": "C:\\Program Files\\Git\\bin\\bash.exe"
   }
   ```

Default paths:
- Windows: Git Bash (`C:\Program Files\Git\bin\bash.exe`)
- macOS/Linux: Bash (`/bin/bash`)

## Stream Deck Integration

Git-Boi comes with a built-in Stream Deck plugin that makes it easy to control your terminal right from your Stream Deck device.

### Installing the Stream Deck Plugin

1. Find the plugin in the `StreamDeck SDK/sd-git-boi/` directory
2. Double-click the `com.cedric-fromm.sd-git-boi.streamDeckPlugin` file to install
3. Stream Deck will automatically recognize the plugin

### Creating Custom Actions

1. Drag the Git-Boi action onto your Stream Deck
2. Configure the action with any terminal command:
   - Git commands: `git status`, `git pull`, `git push`
   - Directory navigation: `cd /your/path`
   - Custom shell commands: `npm start`, `docker ps`
   - Any valid terminal command!

### Example Use Cases

- One-click git operations
- Quick directory switching
- Project startup commands
- Server control (start/stop)
- Build commands
- Custom scripts

## WebSocket API

The Stream Deck plugin uses Git-Boi's WebSocket API (port 3000) to communicate with the terminal. You can also use this API for your own integrations:

```javascript
// Execute a command
{
    "cmd": "command",
    "terminalcommand": "git status"
}

// Change directory
{
    "cmd": "open",
    "path": "/path/to/directory"
}
```

This makes it easy to:
- Create your own custom integrations
- Automate terminal commands
- Control Git-Boi from other applications

## Development

Built with:
- Electron - Desktop application framework
- xterm.js - Terminal emulator
- node-pty - Shell process management
- WebSocket - Remote control capabilities

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.