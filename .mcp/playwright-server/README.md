# Playwright MCP Server

This directory contains configuration for the Playwright MCP server integration.

## Overview

The Playwright MCP server allows AI assistants to interact with browsers through the Model Context Protocol.

## Installation

The Playwright MCP server is installed automatically via npx when needed:

```bash
npx -y @anthropic/playwright-mcp-server
```

## Usage

### With Claude Desktop

Add this to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic/playwright-mcp-server"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "true"
      }
    }
  }
}
```

### Available Tools

The Playwright MCP server provides tools for:

- **Navigation**: `browser_navigate`, `browser_go_back`, `browser_go_forward`
- **Interaction**: `browser_click`, `browser_fill`, `browser_select`, `browser_hover`
- **Observation**: `browser_snapshot`, `browser_screenshot`
- **Keyboard**: `browser_press_key`, `browser_type`
- **Tabs**: `browser_new_tab`, `browser_switch_tab`, `browser_close_tab`
- **Utilities**: `browser_wait`, `browser_evaluate`

## Configuration Options

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `PLAYWRIGHT_HEADLESS` | Run browser in headless mode | `true` |
| `PLAYWRIGHT_BROWSER` | Browser to use (chromium, firefox, webkit) | `chromium` |
| `PLAYWRIGHT_TIMEOUT` | Default timeout in ms | `30000` |

## Running Manually

```bash
# Start the server manually
npx -y @anthropic/playwright-mcp-server

# With specific browser
PLAYWRIGHT_BROWSER=firefox npx -y @anthropic/playwright-mcp-server
```
