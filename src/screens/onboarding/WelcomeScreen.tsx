import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from '@components/common';
import { colors, spacing, typography } from '@theme/index';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📱</Text>
        
        <Text style={styles.title}>
          Bienvenido a OmniTienda
        </Text>
        
        <Text style={styles.subtitle}>
          Software inteligente para tu negocio en Perú
        </Text>

        <View style={styles.features}>
          <Feature emoji="✅" text="Adaptado a tu rubro" />
          <Feature emoji="💰" text="Control total de ventas" />
          <Feature emoji="📊" text="Reportes en tiempo real" />
          <Feature emoji="🔒" text="Tus datos seguros" />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label="Comenzar →"
          onPress={onStart}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
};

interface FeatureProps {
  emoji: string;
  text: string;
}

const Feature: React.FC<FeatureProps> = ({ emoji, text }) => (
  <View style={styles.feature}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  features: {
    gap: spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    ...typography.body,
    color: colors.gray[700],
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
