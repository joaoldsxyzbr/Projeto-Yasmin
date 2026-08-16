import { supabase } from '../lib/supabase'
import { obterUsuarioAutenticado } from './sessao'

export async function verificarAcessoAutorizado() {
  const usuario = await obterUsuarioAutenticado()

  if (!usuario.email) return false

  const email = usuario.email.trim().toLowerCase()
  const { data, error } = await supabase
    .from('usuarios_autorizados')
    .select('email')
    .eq('email', email)
    .eq('ativo', true)
    .maybeSingle()

  if (error) throw new Error('Não foi possível validar a autorização desta conta.')
  return Boolean(data)
}
