# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the DexBee Astro documentation site - part of a larger DexBee ecosystem that includes a TypeScript IndexedDB ORM library and Next.js marketing site. This Astro project serves as a minimal documentation starter with a custom bee/honeycomb theme.

## Development Commands

```bash
pnpm install        # Install dependencies
pnpm dev           # Start development server at localhost:4321
pnpm build         # Build production site to ./dist/
pnpm preview       # Preview production build locally
pnpm astro ...     # Run Astro CLI commands
pnpm astro check   # TypeScript type checking
```

## Architecture

### Tech Stack
- **Astro 5.14+** with React integration for interactive components
- **Tailwind CSS v4** using `@import 'tailwindcss'` in CSS (no config file needed)
- **TypeScript** with strict configuration and path mapping (`@/*` → `./src/*`)
- **Geist Sans/Mono** fonts via Fontsource with font preloading optimization
- **PNPM** as package manager

### Project Structure
```
src/
├── layouts/        # Base Layout.astro with theme handling and font preloading
├── pages/          # File-based routing (index.astro)
├── components/
│   ├── astro/      # Server-side components (Hero, Features, Footer, BeeIcon)
│   └── react/      # Client-side components (Header, BeeIcon)
├── styles/         # Global CSS with complete design system
└── utils/          # Theme utilities for client-side interactions
```

### Component Patterns

**Hybrid Architecture**:
- Use `.astro` components for static content (Hero, Features, Footer)
- Use `.tsx` components for interactive elements (Header with navigation)
- Apply `client:load` directive only when client-side behavior is needed
- Both Astro and React versions of BeeIcon component exist for different use cases

### Design System

The project implements a complete bee/honeycomb theme with:

**Color Palette**: Warm honey/amber colors using OKLCH color space
- Light mode: Clean white background with rich amber/brown primary colors
- Dark mode: Dark brown backgrounds with bright honey accents
- Complete CSS custom properties following shadcn/ui conventions

**Honeycomb Patterns**:
- SVG-based background patterns via `/bg-honeycomb.webp`
- Custom CSS classes: `.honeycomb-bg`, `.honeycomb-grid`, `.honeycomb-cell`
- Hexagonal layouts with hover effects and transforms

**Typography**:
- Geist Sans for body text, Geist Mono for code
- Font preloading in Layout.astro prevents flash of unstyled text

### Key Configurations

**Astro Config** (`astro.config.mjs`):
```javascript
integrations: [react()]
output: 'static'
vite: {
  plugins: [tailwind()], // Tailwind v4 via Vite plugin
  ssr: { noExternal: ['@fontsource/geist-sans', '@fontsource/geist-mono'] }
}
```

**Tailwind v4 Setup**:
- No `tailwind.config.js` file needed
- Uses `@import 'tailwindcss'` at top of `src/styles/global.css`
- Configured via `@tailwindcss/vite` plugin in Astro config
- Design system implemented via CSS custom properties

**TypeScript**:
- Extends Astro's strict config
- Path mapping: `@/*` maps to `./src/*`
- React JSX support enabled

### Theme System

**Theme Detection & Persistence**:
- Inline script in Layout.astro prevents flash of unstyled content
- Supports system preference detection via `prefers-color-scheme`
- Client-side theme utilities in `src/utils/theme.ts` for theme switching
- Theme state persisted in localStorage

**CSS Architecture**:
- Complete design system defined in `src/styles/global.css`
- Light and dark mode variables with smooth transitions
- Honeycomb-specific CSS classes for themed layouts
- Uses modern CSS features like `oklch()` color space and CSS custom properties

## Development Guidelines

### Styling Approach
- Leverage the comprehensive CSS custom properties system
- Use honeycomb-specific classes for themed layouts (`.honeycomb-bg`, `.honeycomb-cell`)
- Maintain both light and dark mode support in new components
- Follow established color palette and spacing tokens

### Performance Considerations
- Static generation with Astro's zero-JS default
- Selective hydration with `client:*` directives
- Font preloading and optimization built-in
- Background images optimized as WebP format

### Component Development
- Follow the existing pattern: static Astro components for content, React for interactivity
- Maintain the honeycomb/bee theme consistency across new components
- Use the established design tokens from `global.css`
- Consider both server-side rendering and client-side hydration needs