import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { Header, Button, Input, Card, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { sunatService, SUNATEmpresa, SUNATPersona } from '@services/sunat/sunat.service';

interface SUNATSearchScreenProps {
  onDataFound: (data: any) => void;
  onClose: () => void;
}

export default function SUNATSearchScreen({
  onDataFound,
  onClose,
}: SUNATSearchScreenProps) {
  const [searchType, setSearchType] = useState<'RUC' | 'DNI'>('RUC');
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<SUNATEmpresa | SUNATPersona | null>(
    null
  );

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      Alert.alert('Error', 'Ingresa un número');
      return;
    }

    setIsLoading(true);
    try {
      let data: SUNATEmpresa | SUNATPersona | null = null;

      if (searchType === 'RUC') {
        if (!sunatService.validateRUCFormat(searchValue)) {
          Alert.alert('Error', 'RUC inválido. Debe tener 11 dígitos');
          setIsLoading(false);
          return;
        }
        data = await sunatService.searchEmpresaByRUC(searchValue);
      } else {
        if (!sunatService.validateDNIFormat(searchValue)) {
          Alert.alert('Error', 'DNI inválido. Debe tener 8 dígitos');
          setIsLoading(false);
          return;
        }
        data = await sunatService.searchPersonaByDNI(searchValue);
      }

      if (data) {
        setResultado(data);
      } else {
        Alert.alert(
          'No Encontrado',
          `No se encontraron resultados para ${searchValue}`
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectData = () => {
    if (resultado) {
      onDataFound(resultado);
    }
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="🔍 Buscar en SUNAT"
        subtitle="RUC o DNI"
        onBackPress={onClose}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Selector de Tipo */}
        <View style={styles.typeSelector}>
          {['RUC', 'DNI'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                searchType === type && styles.typeButtonActive,
              ]}
              onPress={() => {
                setSearchType(type as 'RUC' | 'DNI');
                setResultado(null);
                setSearchValue('');
              }}
            >
              <Text
                style={[
                  styles.typeText,
                  searchType === type && styles.typeTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input de Búsqueda */}
        <Card style={styles.searchCard}>
          <Input
            label={searchType === 'RUC' ? 'Número de RUC' : 'Número de DNI'}
            placeholder={searchType === 'RUC' ? '20123456789' : '12345678'}
            value={searchValue}
            onChangeText={setSearchValue}
            keyboardType="numeric"
            maxLength={searchType === 'RUC' ? 11 : 8}
          />
          <Button
            label={`🔍 Buscar ${searchType}`}
            onPress={handleSearch}
            fullWidth
            loading={isLoading}
          />
        </Card>

        {/* Resultado */}
        {resultado && (
          <Card style={styles.resultCard}>
            <Text style={styles.resultTitle}>✅ Resultado Encontrado</Text>

            {searchType === 'RUC' ? (
              <>
                <ResultItem
                  label="RUC"
                  value={(resultado as SUNATEmpresa).ruc}
                />
                <ResultItem
                  label="Razón Social"
                  value={(resultado as SUNATEmpresa).razon_social}
                />
                <ResultItem
                  label="Nombre Comercial"
                  value={(resultado as SUNATEmpresa).nombre_comercial}
                />
                <ResultItem
                  label="Estado"
                  value={(resultado as SUNATEmpresa).estado}
                />
                <ResultItem
                  label="Dirección"
                  value={(resultado as SUNATEmpresa).direccion}
                />
                <ResultItem
                  label="Distrito"
                  value={
                    `${(resultado as SUNATEmpresa).distrito}, ${(resultado as SUNATEmpresa).provincia}, ${(resultado as SUNATEmpresa).departamento}`
                  }
                />
              </>
            ) : (
              <>
                <ResultItem label="DNI" value={(resultado as SUNATPersona).dni} />
                <ResultItem
                  label="Nombres"
                  value={(resultado as SUNATPersona).nombres}
                />
                <ResultItem
                  label="Apellidos"
                  value={(resultado as SUNATPersona).apellidos}
                />
                <ResultItem
                  label="Estado"
                  value={(resultado as SUNATPersona).estado}
                />
              </>
            )}

            <Button
              label="✓ Usar Estos Datos"
              onPress={handleSelectData}
              fullWidth
              style={styles.selectButton}
            />
          </Card>
        )}

        {/* Información */}
        <Card>
          <Text style={styles.infoTitle}>ℹ️ Información</Text>
          <Text style={styles.infoText}>
            • Ingresa un RUC de 11 dígitos para empresas
          </Text>
          <Text style={styles.infoText}>
            • Ingresa un DNI de 8 dígitos para personas
          </Text>
          <Text style={styles.infoText}>
            • Los datos se consultan de SUNAT en tiempo real
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

interface ResultItemProps {
  label: string;
  value: string;
}

const ResultItem: React.FC<ResultItemProps> = ({ label, value }) => (
  <View style={styles.resultItem}>
    <Text style={styles.resultLabel}>{label}</Text>
    <Text style={styles.resultValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  typeTextActive: {
    color: colors.white,
  },
  searchCard: {
    marginBottom: spacing.lg,
  },
  resultCard: {
    backgroundColor: colors.success + '15',
    marginBottom: spacing.lg,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
    marginBottom: spacing.md,
  },
  resultItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  resultLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  selectButton: {
    marginTop: spacing.lg,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: colors.black,
  },
  infoText: {
    fontSize: 12,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
});
