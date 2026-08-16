import { supabase } from '../lib/supabase'

export async function verificarAcessoAutorizado() {
  const { data: { user }, error: erroUsuario } = await supabase.auth.getUser()

  if (erroUsuario || !user?.email) return false

  const email = user.email.trim().toLowerCase()
  const { data, error } = await supabase
    .from('usuarios_autorizados')
    .select('email')
    .eq('email', email)
    .eq('ativo', true)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}
