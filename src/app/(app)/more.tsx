import { useRouter } from 'expo-router';
import MoreScreen from '@screens/more/MoreScreen';

export default function MorePage() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    router.push(`/${screen}` as any);
  };

  return <MoreScreen onNavigate={handleNavigate} />;
}
