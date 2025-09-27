# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the DexBee Astro documentation site - part of a larger DexBee ecosystem that includes a TypeScript IndexedDB ORM library and Next.js marketing site. This Astro project serves as a minimal documentation starter with a custom bee/honeycomb theme.

## Development Commands

```bash
pnpm install        # Install dependencies
pnpm dev           # Start development server at localhost:4321
pnpm build         # Build production site to ./dist/
pnpm preview       # Preview production build locally
pnpm astro ...     # Run Astro CLI commands
```

## Architecture

### Tech Stack
- **Astro 5.14+** with React integration for interactive components
- **Tailwind CSS v4** with custom bee/honeycomb design system
- **TypeScript** with strict configuration and path mapping (`@/*`)
- **Geist Sans/Mono** fonts via Fontsource

### Project Structure
```
src/
├── layouts/        # Base Layout.astro with theme handling
├── pages/          # File-based routing (index.astro)
├── components/
│   ├── astro/      # Server-side components (Hero, Features, Footer)
│   └── react/      # Client-side components (Header, BeeIcon)
├── styles/         # Global CSS with design system
└── utils/          # Theme utilities for client-side interactions
```

### Design System
The project implements a complete bee/honeycomb theme with:

- **Custom Color Palette**: Warm honey/amber colors with light/dark mode support using OKLCH color space
- **Honeycomb Patterns**: SVG-based background patterns and hexagonal layouts
- **CSS Custom Properties**: Comprehensive design tokens following shadcn/ui conventions
- **Component Architecture**: Mix of Astro (static) and React (interactive) components

### Key Configurations

**Astro Config** (`astro.config.mjs`):
- React integration for client components
- Static output mode
- Tailwind CSS v4 via Vite plugin
- Font optimization for Geist fonts

**TypeScript** (`tsconfig.json`):
- Extends Astro's strict config
- Path mapping with `@/*` for `./src/*`
- React JSX support

**Tailwind** (`tailwind.config.js`):
- Full design system with CSS custom properties
- Geist font family definitions
- Custom border radius using CSS variables

### Component Patterns

**Hybrid Architecture**:
- Use `.astro` components for static content (Hero, Features, Footer)
- Use `.tsx` components for interactive elements (Header with navigation)
- Apply `client:load` directive only when client-side behavior is needed

**Styling Approach**:
- Global styles in `src/styles/global.css` define the complete design system
- Honeycomb-specific CSS classes for backgrounds and grid layouts
- Tailwind utilities for component-level styling

### Theme Implementation
- CSS-in-JS theme detection prevents flash of unstyled content
- Theme utilities in `src/utils/theme.ts` for client-side theme switching
- Support for system preference detection and localStorage persistence

## Development Guidelines

### Component Development
- Follow the existing pattern: static Astro components for content, React for interactivity
- Maintain the honeycomb/bee theme consistency across new components
- Use the established design tokens from global.css

### Styling
- Leverage the comprehensive CSS custom properties system
- Use honeycomb-specific classes for themed layouts
- Maintain both light and dark mode support

### Performance
- Static generation with Astro's zero-JS default
- Selective hydration with `client:*` directives
- Font preloading and optimization built-in