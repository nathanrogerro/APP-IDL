import { StyleSheet, View } from 'react-native';
import { Campo } from './Campo';
import { Chip } from './Seletor';
import { hojeISO, isoParaBr, mascararData, somarDias } from '../utils/datas';
import { espaco } from '../constants/tema';

// Campo de data no formato DD/MM/AAAA, com atalhos opcionais (ex.: "+7 dias").
// atalhos: [{ rotulo: '+7 dias', dias: 7 }]
export function CampoData({ valor, onChange, atalhos = [], ...props }) {
  return (
    <Campo
      value={valor}
      onChangeText={(texto) => onChange(mascararData(texto))}
      placeholder="DD/MM/AAAA"
      keyboardType="number-pad"
      maxLength={10}
      {...props}
    >
      {atalhos.length ? (
        <View style={estilos.atalhos}>
          {atalhos.map((atalho) => {
            const data = isoParaBr(somarDias(hojeISO(), atalho.dias));
            return (
              <Chip key={atalho.rotulo} rotulo={atalho.rotulo} ativo={valor === data} onPress={() => onChange(data)} />
            );
          })}
        </View>
      ) : null}
    </Campo>
  );
}

const estilos = StyleSheet.create({
  atalhos: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm, marginTop: espaco.sm },
});
