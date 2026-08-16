import { supabase } from '../lib/supabase'

async function obterUsuario() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Não foi possível identificar o usuário.')
  }

  return user
}

function ordenarCategorias(categorias) {
  return [...categorias].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export async function listarCategorias() {
  const usuario = await obterUsuario()

  const { data, error } = await supabase
    .from('categorias')
    .select('id, nome, criado_em, atualizado_em')
    .eq('usuario_id', usuario.id)
    .order('nome')

  if (error) throw new Error('Não foi possível carregar as categorias.')
  return ordenarCategorias(data)
}

export async function criarCategoria(nome) {
  const usuario = await obterUsuario()
  const nomeLimpo = nome.trim()

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
  const { error } = await supabase.rpc('renomear_categoria', {
    p_categoria_id: id,
    p_novo_nome: nome.trim(),
  })

  if (error?.code === '23505') throw new Error('Já existe uma categoria com esse nome.')
  if (error) throw new Error('Não foi possível renomear a categoria.')
}

export async function excluirCategoria(id) {
  const usuario = await obterUsuario()

  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id)
    .eq('usuario_id', usuario.id)

  if (error) throw new Error('Não foi possível excluir a categoria.')
}
