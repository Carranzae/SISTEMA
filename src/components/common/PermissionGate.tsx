import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePermissions } from '@hooks/usePermissions';
import { colors, spacing, typography } from '@theme/index';

interface PermissionGateProps {
  modulo: string;
  accion: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  modulo,
  accion,
  children,
  fallback,
}) => {
  const { hasPermission, isLoading } = usePermissions(modulo, accion);

  if (isLoading) {
    return null;
  }

  if (!hasPermission) {
    return (
      fallback || (
        <View style={styles.container}>
          <Text style={styles.emoji}>🔒</Text>
          <Text style={styles.message}>
            No tienes permiso para acceder a esta función
          </Text>
          <Text style={styles.submessage}>
            Contacta al administrador para obtener acceso
          </Text>
        </View>
      )
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  emoji: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  message: {
    ...typography.bodySm,
    color: colors.black,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  submessage: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
  },
});
