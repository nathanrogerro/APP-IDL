// IDs gerados no próprio app (ADR-001, decisão 5): o mesmo ID serve para o banco local
// agora e para o Firestore na Entrega 3, sem tabela de conversão.
//
// Formato UUID versão 4 (122 bits aleatórios). Usa o gerador criptográfico do ambiente
// quando ele existe; senão, Math.random, suficiente para IDs que só precisam ser únicos.
// O expo-crypto não é usado porque o Expo Go 58 para Android não carrega o módulo dele.

function bytesAleatorios(quantidade) {
  const bytes = new Uint8Array(quantidade);
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < quantidade; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

export function novoId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  const b = bytesAleatorios(16);
  b[6] = (b[6] & 0x0f) | 0x40; // versão 4
  b[8] = (b[8] & 0x3f) | 0x80; // variante RFC 4122
  const hex = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
