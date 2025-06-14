# YouTube Subscription Manager

A modern YouTube subscription management system built with Model Context Protocol (MCP).

## Project Structure

This is a monorepo containing the following packages:

- `packages/backend` - Node.js backend service
- `packages/frontend` - React-based web application
- `packages/agent` - AI agent logic using MCP
- `packages/shared` - Shared types and utilities

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start development servers:
   ```bash
   pnpm dev
   ```

## Available Scripts

- `pnpm build` - Build all packages
- `pnpm dev` - Start development servers
- `pnpm lint` - Run linting
- `pnpm test` - Run tests
- `pnpm clean` - Clean build artifacts

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request

## License

MIT 