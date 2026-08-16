import { supabase } from '../lib/supabase'

const campos = 'id, descricao, valor, tipo, categoria, data_transacao, criado_em'

function normalizarTransacao(transacao) {
  return {
    ...transacao,
    valor: Number(transacao.valor),
  }
}

export async function listarTransacoes() {
  const { data, error } = await supabase
    .from('transacoes')
    .select(campos)
    .order('data_transacao', { ascending: false })
    .order('criado_em', { ascending: false })

  if (error) throw error
  return data.map(normalizarTransacao)
}

export async function criarTransacao(transacao) {
  const { data, error } = await supabase
    .from('transacoes')
    .insert({
      descricao: transacao.descricao,
      valor: transacao.valor,
      tipo: transacao.tipo,
      categoria: transacao.categoria,
      data_transacao: transacao.data,
    })
    .select(campos)
    .single()

  if (error) throw error
  return normalizarTransacao(data)
}

export async function excluirTransacao(id) {
  const { error } = await supabase
    .from('transacoes')
    .delete()
    .eq('id', id)

  if (error) throw error
}
