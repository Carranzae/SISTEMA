import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, typography } from '@theme/index';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const buttonStyles: ViewStyle[] = [styles.button];
  const textStyles: TextStyle[] = [styles.text];

  // Variantes
  switch (variant) {
    case 'primary':
      buttonStyles.push(styles.primary);
      textStyles.push(styles.textPrimary);
      break;
    case 'secondary':
      buttonStyles.push(styles.secondary);
      textStyles.push(styles.textSecondary);
      break;
    case 'danger':
      buttonStyles.push(styles.danger);
      textStyles.push(styles.textDanger);
      break;
    case 'ghost':
      buttonStyles.push(styles.ghost);
      textStyles.push(styles.textGhost);
      break;
  }

  // Tamaños
  switch (size) {
    case 'sm':
      buttonStyles.push(styles.sm);
      textStyles.push(styles.textSm);
      break;
    case 'lg':
      buttonStyles.push(styles.lg);
      textStyles.push(styles.textLg);
      break;
  }

  if (fullWidth) buttonStyles.push(styles.fullWidth);
  if (disabled || loading) buttonStyles.push(styles.disabled);
  if (style) buttonStyles.push(style);

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={textStyles}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  danger: {
    backgroundColor: colors.error,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
  textPrimary: {
    color: colors.white,
  },
  textSecondary: {
    color: colors.white,
  },
  textDanger: {
    color: colors.white,
  },
  textGhost: {
    color: colors.primary,
  },
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  textSm: {
    fontSize: 14,
  },
  textLg: {
    fontSize: 18,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});
