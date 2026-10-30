import { Tabs } from 'expo-router/js-tabs';
import { Ionicons } from '@expo/vector-icons';
import { cabecalhoPadrao } from '../../../constants/navegacao';
import { cores } from '../../../constants/tema';

// Barra inferior com as quatro telas principais (PRD, seção 9).
function icone(nome) {
  return ({ color, size }) => <Ionicons name={nome} size={size} color={color} />;
}

export default function LayoutAbas() {
  return (
    <Tabs
      screenOptions={{
        ...cabecalhoPadrao,
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarLabelStyle: { fontWeight: '600' },
        sceneStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Painel', tabBarIcon: icone('grid-outline') }} />
      <Tabs.Screen name="inventario" options={{ title: 'Inventário', tabBarIcon: icone('flask-outline') }} />
      <Tabs.Screen name="emprestimos" options={{ title: 'Empréstimos', tabBarIcon: icone('swap-horizontal-outline') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icone('person-circle-outline') }} />
    </Tabs>
  );
}
