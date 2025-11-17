export const colors = {
  // Primarios
  primary: '#2563EB',      // Azul
  secondary: '#7C3AED',    // Púrpura
  
  // Neutrales
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Semánticos
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Estados
  disabled: '#D1D5DB',
  focus: '#2563EB',
  hover: '#1D4ED8',
  
  // Sombras
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
};

export const backgrounds = {
  light: colors.gray[50],
  default: colors.white,
  dark: colors.gray[900],
};
