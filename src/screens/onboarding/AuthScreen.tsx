import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Input, Button, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useAuthStore } from '@store/auth.store';
import { isValidEmail, isValidPassword } from '@utils/validators';

interface AuthScreenProps {
  onSuccess: () => void;
  isLogin?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  isLogin = false,
}) => {
  const [isSignUp, setIsSignUp] = useState(!isLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, isLoading, error } = useAuthStore();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isValidEmail(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isValidPassword(password)) {
      newErrors.password = 'Mínimo 8 caracteres';
    }

    if (isSignUp && password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert('Éxito', 'Cuenta creada. Inicia sesión para continuar.');
        setIsSignUp(false);
      } else {
        await signIn(email, password);
        onSuccess();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error en autenticación');
    }
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </Text>
        <Text style={styles.subtitle}>
          {isSignUp
            ? 'Crea tu cuenta para comenzar'
            : 'Accede a tu negocio'}
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Correo Electrónico"
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          error={errors.email}
        />

        <Input
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />

        {isSignUp && (
          <Input
            label="Confirmar Contraseña"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={errors.confirmPassword}
          />
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Button
          label={isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          onPress={handleAuth}
          fullWidth
          loading={isLoading}
          style={styles.submitButton}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
        </Text>
        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.toggleLink}>
            {isSignUp ? 'Inicia sesión' : 'Regístrate'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.black,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[600],
  },
  form: {
    marginBottom: spacing.xl,
  },
  errorBox: {
    backgroundColor: colors.error + '15',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    ...typography.bodySm,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  toggleLink: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: '700',
  },
});
