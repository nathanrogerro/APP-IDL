import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ouvirToast } from '../utils/toast';
import { cores, espaco, raio } from '../constants/tema';

const ICONES = { sucesso: 'checkmark-circle', erro: 'alert-circle', info: 'information-circle' };
const FUNDOS = { sucesso: cores.sucesso, erro: cores.perigo, info: cores.cabecalho };

// Mensagem rápida no topo da tela ("Retirada registrada"). Fica no layout raiz.
export function Toast() {
  const insets = useSafeAreaInsets();
  const [aviso, setAviso] = useState(null);
  const opacidade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let temporizador;
    const parar = ouvirToast((novo) => {
      clearTimeout(temporizador);
      setAviso(novo);
      opacidade.setValue(0);
      Animated.timing(opacidade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      temporizador = setTimeout(() => {
        Animated.timing(opacidade, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setAviso(null));
      }, 2600);
    });
    return () => {
      clearTimeout(temporizador);
      parar();
    };
  }, [opacidade]);

  if (!aviso) return null;
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[estilos.toast, { top: insets.top + espaco.sm, opacity: opacidade, backgroundColor: FUNDOS[aviso.tipo] }]}
    >
      <Ionicons name={ICONES[aviso.tipo]} size={20} color={cores.textoInverso} />
      <Text style={estilos.texto}>{aviso.mensagem}</Text>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: espaco.lg,
    right: espaco.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    paddingVertical: espaco.md,
    paddingHorizontal: espaco.lg,
    borderRadius: raio.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  texto: { color: cores.textoInverso, fontWeight: '700', fontSize: 15, flex: 1 },
});
