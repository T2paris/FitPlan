import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import FitPlanMobile from '@/components/fitplan-mobile';

// Native action: mostra um Alert nativo e devolve a escolha ao componente web (DOM)
function confirmAction(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert('Confirmar', message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Confirmar', style: 'destructive', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1128' }} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <FitPlanMobile
        confirmAction={confirmAction}
        dom={{
          style: { flex: 1, backgroundColor: '#0A1128' },
          domStorageEnabled: true,
          showsVerticalScrollIndicator: false,
          showsHorizontalScrollIndicator: false,
          bounces: false,
          overScrollMode: 'never',
        }}
      />
    </SafeAreaView>
  );
}

