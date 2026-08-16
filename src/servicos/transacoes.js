import { supabase } from '../lib/supabase'
import { obterUsuarioAutenticado } from './sessao'

const campos = 'id, descricao, valor, tipo, categoria, data_transacao, criado_em'
const tiposPermitidos = new Set(['receita', 'despesa'])

function normalizarTransacao(transacao) {
  return {
    ...transacao,
    valor: Number(transacao.valor),
  }
}

function validarTransacao(transacao) {
  const descricao = String(transacao.descricao ?? '').trim()
  const categoria = String(transacao.categoria ?? '').trim()
  const valor = Number(transacao.valor)
  const tipo = transacao.tipo
  const data = String(transacao.data ?? '')

  if (!descricao || descricao.length > 120) {
    throw new Error('Informe uma descrição com até 120 caracteres.')
  }

  if (!Number.isFinite(valor) || valor <= 0) {
    throw new Error('Informe um valor maior que zero.')
  }

  if (!tiposPermitidos.has(tipo)) {
    throw new Error('Tipo de transação inválido.')
  }

  if (!categoria || categoria.length > 60) {
    throw new Error('Informe uma categoria válida.')
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new Error('Informe uma data válida.')
  }

  return { descricao, categoria, valor, tipo, data }
}

export async function listarTransacoes() {
  const usuario = await obterUsuarioAutenticado()

  const { data, error } = await supabase
    .from('transacoes')
    .select(campos)
    .eq('usuario_id', usuario.id)
    .order('data_transacao', { ascending: false })
    .order('criado_em', { ascending: false })

  if (error) throw new Error('Não foi possível carregar as transações.')
  return (data ?? []).map(normalizarTransacao)
}

export async function criarTransacao(transacao) {
  const usuario = await obterUsuarioAutenticado()
  const dados = validarTransacao(transacao)

  const { data, error } = await supabase
    .from('transacoes')
    .insert({
      usuario_id: usuario.id,
      descricao: dados.descricao,
      valor: dados.valor,
      tipo: dados.tipo,
      categoria: dados.categoria,
      data_transacao: dados.data,
    })
    .select(campos)
    .single()

  if (error) throw new Error('Não foi possível salvar a transação.')
  return normalizarTransacao(data)
}

export async function excluirTransacao(id) {
  const usuario = await obterUsuarioAutenticado()

  const { data, error } = await supabase
    .from('transacoes')
    .delete()
    .eq('id', id)
    .eq('usuario_id', usuario.id)
    .select('id')
    .maybeSingle()

  if (error) throw new Error('Não foi possível excluir a transação.')
  if (!data) throw new Error('Transação não encontrada ou já excluída.')
}
