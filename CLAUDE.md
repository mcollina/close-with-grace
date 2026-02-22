# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Run tests**: `npm test` - Runs linting, tests, and TypeScript type checking
- **Run tests only**: `npm run test-only` - Runs just the test suite without linting
- **Lint**: `standard` - Code style checking using JavaScript Standard Style
- **Type check**: `tsd` - TypeScript declaration file testing

## Architecture

close-with-grace is a Node.js library that provides graceful shutdown handling for applications. The architecture is modular and event-driven:

### Core Components

- **`index.js`**: Main entry point containing the core graceful shutdown logic
- **`events/`**: Event definition modules that categorize different types of process events:
  - `signal.events.js` - Unix signal events (SIGTERM, SIGINT, etc.)
  - `error.events.js` - Process error events (uncaughtException, unhandledRejection)
  - `exit.events.js` - Process exit events (beforeExit)
- **`index.d.ts`**: TypeScript definitions providing full type safety

### Key Patterns

- **Event Listener Management**: Registers listeners for signals, errors, and exit events, with cleanup functionality to remove listeners
- **Promise/Callback Support**: Supports both async/await and callback patterns for the shutdown handler
- **Timeout Handling**: Uses `Promise.race()` with a configurable delay to prevent hanging shutdowns
- **Second Signal Protection**: Immediately exits if a second signal is received during graceful shutdown
- **Global State**: Maintains a `closing` property to track shutdown state

### Testing Strategy

Tests are located in `test/` directory and use the `tape` testing framework. The test suite:
- Uses child process forking to test signal handling in isolation
- Tests all supported signals and error conditions
- Validates timeout behavior and second-signal handling
- Covers both callback and async/await patterns
- Tests custom logger integration and logger disabling

The library follows a defensive approach where each test spawns a separate process to avoid interference between tests when dealing with process signals and exits.