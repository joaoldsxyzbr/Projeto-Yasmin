import { supabase } from '../lib/supabase'
import { obterUsuarioAutenticado } from './sessao'

export async function buscarOrcamentoMensal() {
  const usuario = await obterUsuarioAutenticado()

  const { data, error } = await supabase
    .from('configuracoes_usuario')
    .select('orcamento_mensal')
    .eq('usuario_id', usuario.id)
    .maybeSingle()

  if (error) throw new Error('Não foi possível carregar o orçamento mensal.')
  return data ? Number(data.orcamento_mensal) : 5000
}

export async function salvarOrcamentoMensal(valor) {
  const usuario = await obterUsuarioAutenticado()
  const orcamento = Number(valor)

  if (!Number.isFinite(orcamento) || orcamento < 0) {
    throw new Error('Informe um orçamento mensal válido.')
  }

  const { data, error } = await supabase
    .from('configuracoes_usuario')
    .upsert({
      usuario_id: usuario.id,
      orcamento_mensal: orcamento,
      atualizado_em: new Date().toISOString(),
    }, { onConflict: 'usuario_id' })
    .select('orcamento_mensal')
    .single()

  if (error) throw new Error('Não foi possível salvar o orçamento mensal.')
  return Number(data.orcamento_mensal)
}
