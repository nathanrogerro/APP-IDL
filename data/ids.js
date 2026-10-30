import { randomUUID } from 'expo-crypto';

// IDs gerados no próprio app (ADR-001, decisão 5): o mesmo ID serve para o SQLite
// agora e para o Firestore na Entrega 3, sem tabela de conversão.
export function novoId() {
  return randomUUID();
}
