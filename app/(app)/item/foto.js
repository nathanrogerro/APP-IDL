import { useRef, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { Botao } from '../../../components/Botao';
import { SemPermissao, TelaCarregando } from '../../../components/Estrutura';
import { cores, espaco, fonte, raio } from '../../../constants/tema';
import { mostrarToast } from '../../../utils/toast';

// Cadastro por foto do rótulo (RF08). Recurso nativo: câmera.
// Se a permissão for negada, a tela explica o motivo, oferece abrir as configurações e
// segue para o cadastro manual (RNF30). A foto não é armazenada pelo app.
export default function CadastroPorFoto() {
  const insets = useSafeAreaInsets();
  const { pode } = useAuth();
  const [permissao, pedirPermissao] = useCameraPermissions();
  const camera = useRef(null);
  const [pronta, setPronta] = useState(false);
  const [capturando, setCapturando] = useState(false);
  const [foto, setFoto] = useState(null);

  if (!pode('editarItens')) return <SemPermissao aoVoltar={() => router.back()} />;
  if (!permissao) return <TelaCarregando texto="Verificando a permissão da câmera..." />;

  const irParaCadastroManual = () => router.replace('/item/form');

  if (!permissao.granted) {
    return (
      <View style={[estilos.permissao, { paddingBottom: insets.bottom + espaco.xl }]}>
        <View style={estilos.iconePermissao}>
          <Ionicons name="camera-outline" size={40} color={cores.primaria} />
        </View>
        <Text style={estilos.titulo}>Acesso à câmera</Text>
        <Text style={estilos.texto}>
          O LabSto usa a câmera para fotografar o rótulo do reagente durante o cadastro. A foto não é armazenada.
        </Text>
        {permissao.canAskAgain ? (
          <Botao titulo="Permitir acesso à câmera" icone="camera-outline" onPress={pedirPermissao} estilo={estilos.botao} />
        ) : (
          <>
            <Text style={[estilos.texto, { color: cores.alerta }]}>
              O acesso foi negado. Para usar o cadastro por foto, permita a câmera nas configurações do aparelho.
            </Text>
            <Botao titulo="Abrir configurações" icone="settings-outline" onPress={() => Linking.openSettings()} estilo={estilos.botao} />
          </>
        )}
        <Botao titulo="Cadastrar manualmente" icone="create-outline" variante="secundario" onPress={irParaCadastroManual} estilo={estilos.botao} />
      </View>
    );
  }

  async function fotografar() {
    if (!camera.current || capturando) return;
    setCapturando(true);
    try {
      const resultado = await camera.current.takePictureAsync({ quality: 0.5 });
      setFoto(resultado);
    } catch (erro) {
      console.warn(erro);
      mostrarToast('Não foi possível tirar a foto. Tente novamente.', 'erro');
    } finally {
      setCapturando(false);
    }
  }

  if (foto) {
    return (
      <View style={estilos.escuro}>
        <Image source={{ uri: foto.uri }} style={estilos.previa} resizeMode="contain" accessibilityLabel="Foto do rótulo" />
        <View style={[estilos.barra, { paddingBottom: insets.bottom + espaco.lg }]}>
          <Botao titulo="Tirar outra" icone="camera-reverse-outline" variante="secundario" onPress={() => setFoto(null)} estilo={{ flex: 1 }} />
          <Botao titulo="Continuar cadastro" icone="arrow-forward" onPress={irParaCadastroManual} estilo={{ flex: 1 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={estilos.escuro}>
      <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" onCameraReady={() => setPronta(true)} />
      <View style={estilos.moldura} pointerEvents="none">
        <View style={estilos.quadro}>
          <View style={[estilos.canto, estilos.cantoSE]} />
          <View style={[estilos.canto, estilos.cantoSD]} />
          <View style={[estilos.canto, estilos.cantoIE]} />
          <View style={[estilos.canto, estilos.cantoID]} />
        </View>
        <Text style={estilos.instrucao}>Enquadre o rótulo do reagente</Text>
      </View>
      <View style={[estilos.controles, { paddingBottom: insets.bottom + espaco.lg }]}>
        <Pressable
          onPress={fotografar}
          disabled={!pronta || capturando}
          accessibilityRole="button"
          accessibilityLabel="Tirar foto do rótulo"
          style={({ pressed }) => [estilos.disparador, (!pronta || capturando) && { opacity: 0.5 }, pressed && { transform: [{ scale: 0.95 }] }]}
        >
          <View style={estilos.disparadorInterno} />
        </Pressable>
        <Pressable onPress={irParaCadastroManual} accessibilityRole="button" style={estilos.linkManual}>
          <Text style={estilos.textoManual}>Cadastrar manualmente</Text>
        </Pressable>
      </View>
    </View>
  );
}

const CANTO = 28;

const estilos = StyleSheet.create({
  permissao: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaco.xl,
    gap: espaco.md,
    backgroundColor: cores.fundo,
  },
  iconePermissao: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontSize: fonte.grande, fontWeight: '800', color: cores.texto },
  texto: { fontSize: fonte.normal, color: cores.textoSecundario, textAlign: 'center', lineHeight: 22 },
  botao: { alignSelf: 'stretch' },
  escuro: { flex: 1, backgroundColor: '#000' },
  previa: { flex: 1 },
  barra: { flexDirection: 'row', gap: espaco.md, padding: espaco.lg, backgroundColor: cores.cabecalho },
  moldura: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  quadro: { width: '80%', aspectRatio: 1.4 },
  canto: { position: 'absolute', width: CANTO, height: CANTO, borderColor: cores.destaque },
  cantoSE: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: raio.md },
  cantoSD: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: raio.md },
  cantoIE: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: raio.md },
  cantoID: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: raio.md },
  instrucao: {
    marginTop: espaco.lg,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: fonte.normal,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.xs,
    borderRadius: raio.pilula,
    overflow: 'hidden',
  },
  controles: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', gap: espaco.sm },
  disparador: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disparadorInterno: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFFFFF' },
  linkManual: { minHeight: 48, justifyContent: 'center', paddingHorizontal: espaco.lg },
  textoManual: { color: '#FFFFFF', fontWeight: '700', fontSize: fonte.normal, textDecorationLine: 'underline' },
});
