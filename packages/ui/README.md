# AXIS UI Component Library

Luxury UI component library built with Shadcn and Tailwind V4.

## Features

- **Luxury Design System**: Gold, platinum, and navy color palette
- **Tailwind V4**: Latest utility-first CSS framework
- **Shadcn Patterns**: Copy-paste component architecture
- **Flexible Theming**: Adapts to business metadata
- **Type-Safe**: Full TypeScript support

## Installation

```bash
pnpm add @axis/ui
```

## Usage

### Basic Components

```tsx
import { Button, Card } from "@axis/ui";

function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to AXIS</CardTitle>
        <CardDescription>Luxury business platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="luxury">Get Started</Button>
      </CardContent>
    </Card>
  );
}
```

### Button Variants

- `default`: Standard navy button
- `luxury`: Gold accent button with shadow
- `outline`: Outlined button
- `ghost`: Minimal button
- `link`: Text link button

### Button Sizes

- `default`: Standard size
- `sm`: Small
- `lg`: Large
- `icon`: Square icon button

## Styling

The UI package uses Tailwind V4 with custom luxury color palette:

- `luxury-gold-*`: Gold color scale
- `luxury-platinum-*`: Platinum color scale
- `luxury-navy-*`: Navy color scale
- `alias-*`: Kernel aliases (blue, hex, hsl)

## Adding Components

Components follow Shadcn patterns. To add a new component:

1. Create component file in `src/components/`
2. Export from `src/components/index.ts`
3. Use `cn()` utility for class merging
4. Follow luxury design system guidelines

## Customization

The UI adapts to business metadata through CSS variables and Tailwind configuration. Alias colors from the kernel are automatically available.
