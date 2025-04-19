export const colors = {
  primary: {
    DEFAULT: 'hsl(210 40% 50%)', // Example blue
    foreground: 'hsl(0 0% 100%)', // White
    muted: 'hsl(210 40% 95%)', // Light blue
  },
  secondary: {
    DEFAULT: 'hsl(240 5% 50%)', // Gray
    foreground: 'hsl(0 0% 100%)', // White
  },
  accent: { // Added accent color
    DEFAULT: 'hsl(240 5% 96%)', // Light Gray
    foreground: 'hsl(240 10% 10%)', // Dark Gray
  },
  // ... other colors like destructive, background, foreground, etc.
  // Match the names used in tailwind.config.ts (e.g., border, input, ring)
  border: 'hsl(240 5% 85%)',
  input: 'hsl(240 5% 75%)',
  ring: 'hsl(210 40% 60%)',
  background: 'hsl(0 0% 100%)',
  foreground: 'hsl(240 10% 10%)',
};

export const spacing = {
  xxs: '0.375rem', // 6px (Added for space-y-1.5)
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  base: '0.75rem', // 12px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '2.25rem', // 36px (Updated for h-9)
  '3xl': '2.5rem', // 40px (Renamed from 2xl)
  '4xl': '3rem',    // 48px (Added for consistency)
  '5xl': '5rem',    // 80px (Added for Textarea min-height)
  // ... add more as needed
};

export const borderRadius = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem', // Added for rounded-xl
  // Corresponds to --radius in tailwind.config.ts
  DEFAULT: '0.5rem', 
};

export const typography = {
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    // ... add more
  },
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: { // Added letterSpacing
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  // ... add letterSpacing, fonts (families) etc.
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

// Combine all tokens into a single theme object
export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export default theme;
