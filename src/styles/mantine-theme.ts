import { createTheme, MantineColorsTuple } from '@mantine/core';

/**
 * Dynamic color palettes that reference CSS variables set in applyTheme.
 */
const primary: MantineColorsTuple = [
  'rgba(var(--space-primary-rgb), 0.05)',
  'rgba(var(--space-primary-rgb), 0.1)',
  'rgba(var(--space-primary-rgb), 0.2)',
  'rgba(var(--space-primary-rgb), 0.3)',
  'rgba(var(--space-primary-rgb), 0.4)',
  'rgba(var(--space-primary-rgb), 0.5)',
  'var(--space-primary)', // primary[6] is usually the main color
  'rgba(var(--space-primary-rgb), 0.8)',
  'rgba(var(--space-primary-rgb), 0.9)',
  'rgba(var(--space-primary-rgb), 1)',
];

const secondary: MantineColorsTuple = [
  'rgba(var(--space-secondary-rgb), 0.05)',
  'rgba(var(--space-secondary-rgb), 0.1)',
  'rgba(var(--space-secondary-rgb), 0.2)',
  'rgba(var(--space-secondary-rgb), 0.3)',
  'rgba(var(--space-secondary-rgb), 0.4)',
  'rgba(var(--space-secondary-rgb), 0.5)',
  'var(--space-secondary)',
  'rgba(var(--space-secondary-rgb), 0.8)',
  'rgba(var(--space-secondary-rgb), 0.9)',
  'rgba(var(--space-secondary-rgb), 1)',
];

export const theme = createTheme({
  primaryColor: 'primary',
  colors: {
    primary,
    secondary,
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
});
