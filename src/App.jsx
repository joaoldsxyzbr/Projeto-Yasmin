import { useEffect, useMemo, useState } from 'react'
import { GestaoCategorias } from './componentes/GestaoCategorias'
import { TelaAutenticacao } from './componentes/TelaAutenticacao'
import { TelaGraficos } from './componentes/TelaGraficos'
import { VisaoGeral } from './componentes/VisaoGeral'
import { supabase } from './lib/supabase'
import { criarCategoria, excluirCategoria, listarCategorias, renomearCategoria } from './servicos/categorias'
import { buscarOrcamentoMensal, salvarOrcamentoMensal } from './servicos/configuracoes'
import { criarTransacao, excluirTransacao, listarTransacoes } from './servicos/transacoes'

const iconesCategoria = {
  Alimentação: '🛒',
  Transporte: '🚗',
  Moradia: '🏠',
  Saúde: '💊',
  Lazer: '🎬',
  Compras: '🛍️',
  Assinaturas: '📱',
  Outros: '✨',
  Receita: '💰',
}

function ordenarCategoriasPorNome(categorias) {
  return [...categorias].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function formatarMes(valor) {
  const [ano, mes] = valor.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(ano, mes - 1, 1))
}

function formatarData(valor) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${valor}T12:00:00`))
}

function obterMesAtual() {
  const agora = new Date()
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`
}

function obterHoje() {
  const agora = new Date()
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`
}

function obterSaudacao() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function BotaoNavegacao({ ativo, icone, rotulo, aoClicar }) {
  return (
    <button className={`nav-item${ativo ? ' active' : ''}`} onClick={aoClicar}>
      <span className="nav-icon" aria-hidden="true">{icone}</span>
      {rotulo}
    </button>
  )
}

function ListaTransacoes({ itens, aoExcluir, compacta = false }) {
  if (!itens.length) {
    return (
      <div className="empty-state">
        <span>🌷</span>
        <strong>Nenhuma movimentação por aqui</strong>
        <p>Adicione a primeira transação para começar o controle.</p>
      </div>
    )
  }

  return (
    <div className="transaction-list">
      {itens.map((transacao) => (
        <div className="transaction" key={transacao.id}>
          <div className="transaction-icon">{iconesCategoria[transacao.categoria] || '✨'}</div>
          <div className="transaction-copy">
            <strong>{transacao.descricao}</strong>
            <span>{transacao.categoria} · {formatarData(transacao.data_transacao)}</span>
          </div>
          <strong className={`transaction-value${transacao.tipo === 'receita' ? ' income-text' : ''}`}>
            {transacao.tipo === 'receita' ? '+' : '-'} {formatarMoeda(transacao.valor)}
          </strong>
          {!compacta && (
            <button
              className="delete-button"
              type="button"
              aria-label={`Excluir ${transacao.descricao}`}
              title="Excluir transação"
              onClick={() => aoExcluir(transacao.id)}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function App() {
  const [sessao, setSessao] = useState(null)
  const [verificandoSessao, setVerificandoSessao] = useState(true)
  const [carregandoDados, setCarregandoDados] = useState(false)
  const [erro, setErro] = useState('')
  const [transacoes, setTransacoes] = useState([])
  const [categoriasGerenciadas, setCategoriasGerenciadas] = useState([])
  const [orcamento, setOrcamento] = useState(5000)
  const [orcamentoRascunho, setOrcamentoRascunho] = useState('5000')
  const [mesSelecionado, setMesSelecionado] = useState(obterMesAtual)
  const [tela, setTela] = useState('visao-geral')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [formulario, setFormulario] = useState({
    tipo: 'despesa',
    descricao: '',
    valor: '',
    categoria: '',
    data: obterHoje(),
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      setVerificandoSessao(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao)
      setVerificandoSessao(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!sessao?.user?.id) {
      setTransacoes([])
      setCategoriasGerenciadas([])
      return
    }

    let ativo = true

    async function carregarDados() {
      setCarregandoDados(true)
      setErro('')

      try {
        const [transacoesSalvas, orcamentoSalvo, categoriasSalvas] = await Promise.all([
          listarTransacoes(),
          buscarOrcamentoMensal(),
          listarCategorias(),
        ])

        if (!ativo) return
        setTransacoes(transacoesSalvas)
        setCategoriasGerenciadas(categoriasSalvas)
        setOrcamento(orcamentoSalvo)
        setOrcamentoRascunho(String(orcamentoSalvo))
      } catch (error) {
        if (ativo) setErro(error.message || 'Não foi possível carregar os dados.')
      } finally {
        if (ativo) setCarregandoDados(false)
      }
    }

    carregarDados()

    return () => {
      ativo = false
    }
  }, [sessao?.user?.id])

  const transacoesDoMes = useMemo(
    () => transacoes
      .filter((transacao) => transacao.data_transacao.startsWith(mesSelecionado))
      .sort((a, b) => b.data_transacao.localeCompare(a.data_transacao) || b.criado_em.localeCompare(a.criado_em)),
    [transacoes, mesSelecionado],
  )

  const receitas = useMemo(
    () => transacoesDoMes
      .filter((transacao) => transacao.tipo === 'receita')
      .reduce((total, transacao) => total + transacao.valor, 0),
    [transacoesDoMes],
  )

  const despesas = useMemo(
    () => transacoesDoMes
      .filter((transacao) => transacao.tipo === 'despesa')
      .reduce((total, transacao) => total + transacao.valor, 0),
    [transacoesDoMes],
  )

  const saldo = receitas - despesas

  function abrirFormulario() {
    setFormulario({
      tipo: 'despesa',
      descricao: '',
      valor: '',
      categoria: categoriasGerenciadas[0]?.nome || '',
      data: mesSelecionado === obterMesAtual() ? obterHoje() : `${mesSelecionado}-01`,
    })
    setMostrarFormulario(true)
  }

  function alterarTipo(tipo) {
    setFormulario((atual) => ({
      ...atual,
      tipo,
      categoria: tipo === 'receita' ? 'Receita' : categoriasGerenciadas[0]?.nome || '',
    }))
  }

  async function enviarTransacao(evento) {
    evento.preventDefault()
    const valor = Number(formulario.valor)

    if (
      !formulario.descricao.trim()
      || !Number.isFinite(valor)
      || valor <= 0
      || !formulario.data
      || (formulario.tipo === 'despesa' && !formulario.categoria)
    ) {
      if (formulario.tipo === 'despesa' && !formulario.categoria) {
        setErro('Crie uma categoria antes de registrar uma despesa.')
      }
      return
    }

    setSalvando(true)
    setErro('')

    try {
      const novaTransacao = await criarTransacao({
        descricao: formulario.descricao.trim(),
        valor,
        tipo: formulario.tipo,
        categoria: formulario.tipo === 'receita' ? 'Receita' : formulario.categoria,
        data: formulario.data,
      })

      setTransacoes((atuais) => [novaTransacao, ...atuais])
      setMesSelecionado(formulario.data.slice(0, 7))
      setMostrarFormulario(false)
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar a transação.')
    } finally {
      setSalvando(false)
    }
  }

  async function removerTransacao(id) {
    const transacao = transacoes.find((item) => item.id === id)
    if (!transacao || !window.confirm(`Excluir "${transacao.descricao}"?`)) return

    setErro('')

    try {
      await excluirTransacao(id)
      setTransacoes((atuais) => atuais.filter((item) => item.id !== id))
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir a transação.')
    }
  }

  async function adicionarCategoria(nome) {
    setSalvando(true)
    setErro('')

    try {
      const novaCategoria = await criarCategoria(nome)
      setCategoriasGerenciadas((atuais) => ordenarCategoriasPorNome([...atuais, novaCategoria]))
      return true
    } catch (error) {
      setErro(error.message || 'Não foi possível criar a categoria.')
      return false
    } finally {
      setSalvando(false)
    }
  }

  async function editarCategoria(categoria, novoNome) {
    setSalvando(true)
    setErro('')

    try {
      await renomearCategoria(categoria.id, novoNome)

      setCategoriasGerenciadas((atuais) => ordenarCategoriasPorNome(
        atuais.map((item) => item.id === categoria.id
          ? { ...item, nome: novoNome, atualizado_em: new Date().toISOString() }
          : item),
      ))
      setTransacoes((atuais) => atuais.map((transacao) => (
        transacao.tipo === 'despesa' && transacao.categoria === categoria.nome
          ? { ...transacao, categoria: novoNome }
          : transacao
      )))
      setFormulario((atual) => atual.categoria === categoria.nome
        ? { ...atual, categoria: novoNome }
        : atual)
      return true
    } catch (error) {
      setErro(error.message || 'Não foi possível renomear a categoria.')
      return false
    } finally {
      setSalvando(false)
    }
  }

  async function removerCategoria(categoria) {
    setSalvando(true)
    setErro('')

    try {
      await excluirCategoria(categoria.id)

      setCategoriasGerenciadas((atuais) => {
        const restantes = atuais.filter((item) => item.id !== categoria.id)

        setFormulario((formularioAtual) => formularioAtual.categoria === categoria.nome
          ? { ...formularioAtual, categoria: restantes[0]?.nome || '' }
          : formularioAtual)

        return restantes
      })
      return true
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir a categoria.')
      return false
    } finally {
      setSalvando(false)
    }
  }

  async function salvarOrcamento(evento) {
    evento.preventDefault()
    const valor = Number(orcamentoRascunho)
    if (!Number.isFinite(valor) || valor < 0) return

    setSalvando(true)
    setErro('')

    try {
      await salvarOrcamentoMensal(valor)
      setOrcamento(valor)
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar o orçamento.')
    } finally {
      setSalvando(false)
    }
  }

  function mudarTela(proximaTela) {
    setTela(proximaTela)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function sair() {
    setErro('')
    const { error } = await supabase.auth.signOut()
    if (error) setErro(error.message || 'Não foi possível sair.')
  }

  if (verificandoSessao) {
    return <div className="estado-carregamento">Carregando...</div>
  }

  if (!sessao) {
    return <TelaAutenticacao />
  }

  const titulos = {
    'visao-geral': 'Visão geral',
    transacoes: 'Transações',
    graficos: 'Gráficos',
    categorias: 'Gestão de categorias',
    configuracoes: 'Configurações',
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">Y</div>
          <div>
            <strong>Yasmin</strong>
            <span>meu controle</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Navegação principal">
          <BotaoNavegacao ativo={tela === 'visao-geral'} icone="⌂" rotulo="Visão geral" aoClicar={() => mudarTela('visao-geral')} />
          <BotaoNavegacao ativo={tela === 'transacoes'} icone="↕" rotulo="Transações" aoClicar={() => mudarTela('transacoes')} />
          <BotaoNavegacao ativo={tela === 'graficos'} icone="◒" rotulo="Gráficos" aoClicar={() => mudarTela('graficos')} />
          <BotaoNavegacao ativo={tela === 'categorias'} icone="◫" rotulo="Categorias" aoClicar={() => mudarTela('categorias')} />
        </nav>

        <div className="sidebar-footer">
          <BotaoNavegacao ativo={tela === 'configuracoes'} icone="⚙" rotulo="Configurações" aoClicar={() => mudarTela('configuracoes')} />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">{titulos[tela]}</p>
            <h1>{tela === 'visao-geral' ? `${obterSaudacao()}, Yasmin 🌷` : titulos[tela]}</h1>
          </div>
          <div className="topbar-actions">
            <label className="month-control">
              <span className="sr-only">Selecionar mês</span>
              <input type="month" value={mesSelecionado} onChange={(evento) => setMesSelecionado(evento.target.value)} />
            </label>
            <div className="avatar">Y</div>
          </div>
        </header>

        {erro && <div className="aviso erro aviso-app">{erro}</div>}
        {carregandoDados && <div className="aviso aviso-app">Sincronizando dados...</div>}

        {tela === 'visao-geral' && (
          <VisaoGeral
            transacoes={transacoesDoMes}
            receitas={receitas}
            despesas={despesas}
            saldo={saldo}
            mesSelecionado={mesSelecionado}
            aoAdicionar={abrirFormulario}
          />
        )}

        {tela === 'transacoes' && (
          <section className="panel page-panel">
            <div className="panel-header">
              <div>
                <span className="section-kicker">{formatarMes(mesSelecionado)}</span>
                <h2>Todas as transações</h2>
              </div>
              <button className="primary-button small-button" onClick={abrirFormulario}>＋ Adicionar</button>
            </div>
            <ListaTransacoes itens={transacoesDoMes} aoExcluir={removerTransacao} />
          </section>
        )}

        {tela === 'graficos' && (
          <TelaGraficos
            transacoes={transacoesDoMes}
            receitas={receitas}
            despesas={despesas}
            mesSelecionado={mesSelecionado}
          />
        )}

        {tela === 'categorias' && (
          <GestaoCategorias
            categorias={categoriasGerenciadas}
            salvando={salvando}
            aoCriar={adicionarCategoria}
            aoRenomear={editarCategoria}
            aoExcluir={removerCategoria}
          />
        )}

        {tela === 'configuracoes' && (
          <section className="panel page-panel settings-panel">
            <div>
              <span className="section-kicker">Planejamento</span>
              <h2>Orçamento mensal</h2>
              <p>Defina quanto pretende gastar por mês. O valor fica salvo na sua conta.</p>
            </div>

            <form className="formulario-configuracoes" onSubmit={salvarOrcamento}>
              <label className="field budget-field">
                <span>Limite mensal</span>
                <div className="money-input">
                  <span>R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={orcamentoRascunho}
                    onChange={(evento) => setOrcamentoRascunho(evento.target.value)}
                  />
                </div>
              </label>
              <button className="primary-button small-button" type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar orçamento'}
              </button>
            </form>

            <div className="conta-configuracoes">
              <div>
                <span className="section-kicker">Conta</span>
                <strong>{sessao.user.email}</strong>
              </div>
              <button className="secondary-button" type="button" onClick={sair}>Sair</button>
            </div>
          </section>
        )}
      </main>

      <nav className="mobile-nav" aria-label="Navegação móvel">
        <button className={tela === 'visao-geral' ? 'active' : ''} onClick={() => mudarTela('visao-geral')}><span>⌂</span>Início</button>
        <button className={tela === 'transacoes' ? 'active' : ''} onClick={() => mudarTela('transacoes')}><span>↕</span>Transações</button>
        <button className="mobile-add" aria-label="Nova transação" onClick={abrirFormulario}>＋</button>
        <button className={tela === 'graficos' ? 'active' : ''} onClick={() => mudarTela('graficos')}><span>◒</span>Gráficos</button>
        <button className={tela === 'categorias' ? 'active' : ''} onClick={() => mudarTela('categorias')}><span>◫</span>Categorias</button>
        <button className={tela === 'configuracoes' ? 'active' : ''} onClick={() => mudarTela('configuracoes')}><span>⚙</span>Ajustes</button>
      </nav>

      {mostrarFormulario && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setMostrarFormulario(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="transaction-title" onMouseDown={(evento) => evento.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="section-kicker">Movimentação</span>
                <h2 id="transaction-title">Nova transação</h2>
              </div>
              <button className="close-button" type="button" aria-label="Fechar" onClick={() => setMostrarFormulario(false)}>×</button>
            </div>

            <form onSubmit={enviarTransacao}>
              <div className="type-toggle">
                <button type="button" className={formulario.tipo === 'despesa' ? 'active expense-choice' : ''} onClick={() => alterarTipo('despesa')}>Despesa</button>
                <button type="button" className={formulario.tipo === 'receita' ? 'active income-choice' : ''} onClick={() => alterarTipo('receita')}>Receita</button>
              </div>

              <label className="field">
                <span>Descrição</span>
                <input
                  autoFocus
                  required
                  maxLength="120"
                  placeholder={formulario.tipo === 'receita' ? 'Ex.: Salário' : 'Ex.: Mercado'}
                  value={formulario.descricao}
                  onChange={(evento) => setFormulario((atual) => ({ ...atual, descricao: evento.target.value }))}
                />
              </label>

              <div className="form-row">
                <label className="field">
                  <span>Valor</span>
                  <div className="money-input">
                    <span>R$</span>
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0,00"
                      value={formulario.valor}
                      onChange={(evento) => setFormulario((atual) => ({ ...atual, valor: evento.target.value }))}
                    />
                  </div>
                </label>

                <label className="field">
                  <span>Data</span>
                  <input
                    required
                    type="date"
                    value={formulario.data}
                    onChange={(evento) => setFormulario((atual) => ({ ...atual, data: evento.target.value }))}
                  />
                </label>
              </div>

              {formulario.tipo === 'despesa' && (
                <label className="field">
                  <span>Categoria</span>
                  <select
                    required
                    value={formulario.categoria}
                    onChange={(evento) => setFormulario((atual) => ({ ...atual, categoria: evento.target.value }))}
                  >
                    {categoriasGerenciadas.length ? (
                      categoriasGerenciadas.map((categoria) => (
                        <option key={categoria.id} value={categoria.nome}>{categoria.nome}</option>
                      ))
                    ) : (
                      <option value="">Crie uma categoria primeiro</option>
                    )}
                  </select>
                </label>
              )}

              <button
                className="primary-button submit-button"
                type="submit"
                disabled={salvando || (formulario.tipo === 'despesa' && !formulario.categoria)}
              >
                {salvando ? 'Salvando...' : 'Salvar transação'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
