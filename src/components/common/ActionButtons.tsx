import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing } from '@theme/index';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  style?: ViewStyle;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onExport,
  onShare,
  style,
}) => {
  const actions = [
    { icon: '✏️', label: 'Editar', onPress: onEdit, visible: !!onEdit },
    { icon: '📋', label: 'Duplicar', onPress: onDuplicate, visible: !!onDuplicate },
    { icon: '📤', label: 'Compartir', onPress: onShare, visible: !!onShare },
    { icon: '💾', label: 'Exportar', onPress: onExport, visible: !!onExport },
    { icon: '📦', label: 'Archivar', onPress: onArchive, visible: !!onArchive },
    { icon: '🗑️', label: 'Eliminar', onPress: onDelete, visible: !!onDelete, danger: true },
  ];

  const visibleActions = actions.filter((a) => a.visible);

  return (
    <View style={[styles.container, style]}>
      {visibleActions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.button,
            action.danger ? styles.buttonDanger : styles.buttonPrimary,
          ]}
          onPress={action.onPress}
        >
          <Text style={styles.icon}>{action.icon}</Text>
          <Text style={[styles.label, action.danger && styles.labelDanger]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary + '20',
  },
  buttonDanger: {
    backgroundColor: colors.error + '20',
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  labelDanger: {
    color: colors.error,
  },
});
