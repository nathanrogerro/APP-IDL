import * as authService from '../services/authService';

// Ponte da tela de recuperação de senha para o serviço de autenticação (RF03).
export const solicitarRecuperacao = (email) => authService.solicitarRecuperacaoDeSenha(email);
