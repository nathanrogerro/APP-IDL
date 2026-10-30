import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { pode as podeFazer } from '../services/permissoes';

// Sessão do usuário: único estado global do app (ADR-004).
// Fase local: o usuário vem do banco local (authService). Na Entrega 3, o mesmo contexto passa
// a escutar o Firebase Authentication, e nenhuma tela precisa mudar (ADR-005).

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Sessão persistente: ao abrir o app, recupera quem estava logado neste aparelho.
  useEffect(() => {
    let ativo = true;
    authService
      .usuarioDaSessao()
      .then((u) => ativo && setUsuario(u))
      .catch((erro) => console.warn(erro))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const entrar = useCallback(async (email, senha) => {
    const u = await authService.entrar(email, senha);
    setUsuario(u);
    return u;
  }, []);

  const cadastrar = useCallback(async (dados) => {
    const u = await authService.cadastrar(dados);
    setUsuario(u);
    return u;
  }, []);

  const sair = useCallback(async () => {
    await authService.sair();
    setUsuario(null);
  }, []);

  // Relê o usuário do banco (após mudar preferências ou restaurar os dados de exemplo).
  const recarregarUsuario = useCallback(async () => {
    const u = await authService.usuarioDaSessao();
    setUsuario(u);
    return u;
  }, []);

  const pode = useCallback((acao) => podeFazer(usuario, acao), [usuario]);

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, cadastrar, sair, recarregarUsuario, pode }),
    [usuario, carregando, entrar, cadastrar, sair, recarregarUsuario, pode]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return contexto;
}
