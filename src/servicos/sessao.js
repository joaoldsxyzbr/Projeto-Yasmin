import { supabase } from '../lib/supabase'

export async function obterUsuarioAutenticado() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Sua sessão expirou. Entre novamente.')
  }

  return user
}
