import { getDb } from '../data/db';
import { bancoEstaVazio, popularDadosDeExemplo, restaurarDadosDeExemplo } from '../data/seed';

// Prepara o banco local na abertura do app: cria as tabelas e, na primeira execução,
// grava os dados de exemplo (README, passo 3).
export async function preparar() {
  await getDb();
  if (await bancoEstaVazio()) {
    await popularDadosDeExemplo();
  }
}

// Perfil → Restaurar dados de exemplo.
export async function restaurarExemplos() {
  await restaurarDadosDeExemplo();
}
