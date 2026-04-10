<!-- Workspace-specific custom instructions for Copilot -->

# PhilliesTracker - Next.js Project Settings

This is a Next.js project with TypeScript, Material UI, and standard CSS.

## Project Stack

- **Framework**: Next.js 16.2.3 with App Router
- **Language**: TypeScript
- **UI Library**: Material UI (@mui/material) with Emotion styling
- **Styling**: Standard CSS (no Tailwind)
- **Linting**: ESLint

## Development Guidelines

- Use TypeScript for all new code
- Place components in `src/components/`
- Use Material UI components for UI elements
- Use standard CSS or CSS modules for styling
- Store global styles in `src/app/globals.css`
- Next.js app files are in `src/app/`

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/           # Next.js app router pages and layouts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── components/    # React components
```
