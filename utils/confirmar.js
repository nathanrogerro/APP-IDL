import { Alert, Platform } from 'react-native';

// Pergunta de confirmação antes de ações como excluir ou devolver.
// Devolve uma Promise<boolean>: true se o usuário confirmou.
export function confirmar({ titulo, mensagem, textoConfirmar = 'Confirmar', destrutivo = false }) {
  if (Platform.OS === 'web') {
    // O Alert do React Native não abre diálogos no navegador.
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensagem}`));
  }
  return new Promise((resolve) => {
    Alert.alert(
      titulo,
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        {
          text: textoConfirmar,
          style: destrutivo ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}
