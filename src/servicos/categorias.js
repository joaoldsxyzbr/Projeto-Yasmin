import { supabase } from '../lib/supabase'
import { obterUsuarioAutenticado } from './sessao'

function ordenarCategorias(categorias) {
  return [...categorias].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

function normalizarNome(nome) {
  const nomeLimpo = String(nome ?? '').trim()

  if (!nomeLimpo || nomeLimpo.length > 60) {
    throw new Error('Informe um nome de categoria com até 60 caracteres.')
  }

  return nomeLimpo
}

export async function listarCategorias() {
  const usuario = await obterUsuarioAutenticado()

  const { data, error } = await supabase
    .from('categorias')
    .select('id, nome, criado_em, atualizado_em')
    .eq('usuario_id', usuario.id)
    .order('nome')

  if (error) throw new Error('Não foi possível carregar as categorias.')
  return ordenarCategorias(data ?? [])
}

export async function criarCategoria(nome) {
  const usuario = await obterUsuarioAutenticado()
  const nomeLimpo = normalizarNome(nome)

  const { data, error } = await supabase
    .from('categorias')
    .insert({ usuario_id: usuario.id, nome: nomeLimpo })
    .select('id, nome, criado_em, atualizado_em')
    .single()

  if (error?.code === '23505') throw new Error('Já existe uma categoria com esse nome.')
  if (error) throw new Error('Não foi possível criar a categoria.')
  return data
}

export async function renomearCategoria(id, nome) {
  const nomeLimpo = normalizarNome(nome)

  if (!id) throw new Error('Categoria inválida.')

  const { error } = await supabase.rpc('renomear_categoria', {
    p_categoria_id: id,
    p_novo_nome: nomeLimpo,
  })

  if (error?.code === '23505') throw new Error('Já existe uma categoria com esse nome.')
  if (error) throw new Error('Não foi possível renomear a categoria.')
}

export async function excluirCategoria(id) {
  const usuario = await obterUsuarioAutenticado()

  const { data, error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id)
    .eq('usuario_id', usuario.id)
    .select('id')
    .maybeSingle()

  if (error) throw new Error('Não foi possível excluir a categoria.')
  if (!data) throw new Error('Categoria não encontrada ou já excluída.')
}
