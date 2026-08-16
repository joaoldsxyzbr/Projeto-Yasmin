import { supabase } from '../lib/supabase'

export async function buscarOrcamentoMensal() {
  const { data, error } = await supabase
    .from('configuracoes_usuario')
    .select('orcamento_mensal')
    .maybeSingle()

  if (error) throw new Error('Não foi possível carregar o orçamento mensal.')
  return data ? Number(data.orcamento_mensal) : 5000
}

export async function salvarOrcamentoMensal(valor) {
  const { data: { user }, error: erroUsuario } = await supabase.auth.getUser()

  if (erroUsuario || !user) throw new Error('Sua sessão expirou. Entre novamente.')

  const { error } = await supabase
    .from('configuracoes_usuario')
    .upsert({
      usuario_id: user.id,
      orcamento_mensal: valor,
      atualizado_em: new Date().toISOString(),
    }, { onConflict: 'usuario_id' })

  if (error) throw new Error('Não foi possível salvar o orçamento mensal.')
}
