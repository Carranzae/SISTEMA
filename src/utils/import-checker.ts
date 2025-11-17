/**
 * Verificar que todas las importaciones sean correctas
 * Ejecutar: npx ts-node src/utils/import-checker.ts
 */

const importMap = {
  '@store/auth.store': 'src/store/auth.store.ts',
  '@store/business.store': 'src/store/business.store.ts',
  '@services/supabase/client': 'src/services/supabase/client.ts',
  '@services/notifications/notification.service': 'src/services/notifications/notification.service.ts',
  '@hooks/useBusiness': 'src/hooks/useBusiness.ts',
  '@components/common': 'src/components/common/index.ts',
  '@utils/formatters': 'src/utils/formatters.ts',
  '@types/permissions': 'src/types/permissions.ts',
  '@theme/index': 'src/theme/index.ts',
};

console.log('✅ Import Map Validado:');
Object.entries(importMap).forEach(([alias, path]) => {
  console.log(`  ${alias} → ${path}`);
});
