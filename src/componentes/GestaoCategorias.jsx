import { useState } from 'react'

export function GestaoCategorias({ categorias, salvando, aoCriar, aoRenomear, aoExcluir }) {
  const [novaCategoria, setNovaCategoria] = useState('')
  const [categoriaEmEdicao, setCategoriaEmEdicao] = useState(null)
  const [nomeEmEdicao, setNomeEmEdicao] = useState('')

  async function criar(evento) {
    evento.preventDefault()
    const nome = novaCategoria.trim()
    if (!nome) return

    const criada = await aoCriar(nome)
    if (criada) setNovaCategoria('')
  }

  function iniciarEdicao(categoria) {
    setCategoriaEmEdicao(categoria.id)
    setNomeEmEdicao(categoria.nome)
  }

  function cancelarEdicao() {
    setCategoriaEmEdicao(null)
    setNomeEmEdicao('')
  }

  async function salvarEdicao(evento, categoria) {
    evento.preventDefault()
    const nome = nomeEmEdicao.trim()
    if (!nome || nome === categoria.nome) {
      cancelarEdicao()
      return
    }

    const renomeada = await aoRenomear(categoria, nome)
    if (renomeada) cancelarEdicao()
  }

  async function excluir(categoria) {
    const confirmado = window.confirm(
      `Excluir a categoria "${categoria.nome}"? As transações antigas continuarão com esse nome no histórico.`,
    )
    if (!confirmado) return
    await aoExcluir(categoria)
  }

  return (
    <section className="panel page-panel gestao-categorias">
      <div className="panel-header gestao-categorias-header">
        <div>
          <span className="section-kicker">Organização</span>
          <h2>Gestão de categorias</h2>
          <p>Crie e organize as categorias disponíveis ao registrar novas despesas.</p>
        </div>
      </div>

      <form className="nova-categoria-form" onSubmit={criar}>
        <label className="field">
          <span>Nova categoria</span>
          <input
            required
            maxLength="60"
            placeholder="Ex.: Pets"
            value={novaCategoria}
            onChange={(evento) => setNovaCategoria(evento.target.value)}
          />
        </label>
        <button className="primary-button small-button" type="submit" disabled={salvando || !novaCategoria.trim()}>
          ＋ Criar categoria
        </button>
      </form>

      <div className="categorias-gerenciadas">
        {categorias.length ? categorias.map((categoria) => (
          <div className="categoria-gerenciada" key={categoria.id}>
            {categoriaEmEdicao === categoria.id ? (
              <form className="categoria-edicao" onSubmit={(evento) => salvarEdicao(evento, categoria)}>
                <input
                  autoFocus
                  required
                  maxLength="60"
                  value={nomeEmEdicao}
                  onChange={(evento) => setNomeEmEdicao(evento.target.value)}
                />
                <div className="categoria-acoes">
                  <button className="text-button" type="submit" disabled={salvando}>Salvar</button>
                  <button className="text-button muted-button" type="button" onClick={cancelarEdicao} disabled={salvando}>Cancelar</button>
                </div>
              </form>
            ) : (
              <>
                <div className="categoria-gerenciada-nome">
                  <span className="categoria-bolinha" aria-hidden="true">✨</span>
                  <strong>{categoria.nome}</strong>
                </div>
                <div className="categoria-acoes">
                  <button className="text-button" type="button" onClick={() => iniciarEdicao(categoria)} disabled={salvando}>Editar</button>
                  <button className="text-button danger-button" type="button" onClick={() => excluir(categoria)} disabled={salvando}>Excluir</button>
                </div>
              </>
            )}
          </div>
        )) : (
          <div className="empty-state">
            <span>🏷️</span>
            <strong>Nenhuma categoria cadastrada</strong>
            <p>Crie uma categoria para poder registrar novas despesas.</p>
          </div>
        )}
      </div>

      <p className="nota-categorias">
        Ao renomear uma categoria, o histórico acompanha o novo nome. Ao excluir, os lançamentos antigos são preservados.
      </p>
    </section>
  )
}
