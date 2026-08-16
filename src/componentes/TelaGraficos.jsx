import { useMemo } from 'react'
import './TelaGraficos.css'

const coresGrafico = ['#C97C8D', '#B8A1D9', '#F2B8A2', '#7FAF91', '#D97979', '#D7A7B4', '#A9B7D8', '#E7C38F']

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

export function TelaGraficos({ transacoes, receitas, despesas, mesSelecionado }) {
  const categorias = useMemo(() => {
    const totais = transacoes
      .filter((transacao) => transacao.tipo === 'despesa')
      .reduce((acumulado, transacao) => {
        acumulado[transacao.categoria] = (acumulado[transacao.categoria] || 0) + transacao.valor
        return acumulado
      }, {})

    return Object.entries(totais)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
  }, [transacoes])

  const gradientePizza = useMemo(() => {
    if (!despesas || !categorias.length) return '#f3ecef'

    let inicio = 0
    const partes = categorias.map((categoria, indice) => {
      const percentual = (categoria.valor / despesas) * 100
      const fim = inicio + percentual
      const parte = `${coresGrafico[indice % coresGrafico.length]} ${inicio}% ${fim}%`
      inicio = fim
      return parte
    })

    return `conic-gradient(${partes.join(', ')})`
  }, [categorias, despesas])

  const maiorFluxo = Math.max(receitas, despesas, 1)
  const alturaEntradas = (receitas / maiorFluxo) * 100
  const alturaSaidas = (despesas / maiorFluxo) * 100

  return (
    <section className="charts-page">
      <div className="charts-heading">
        <div>
          <span className="section-kicker">{formatarMes(mesSelecionado)}</span>
          <h2>Análise visual do mês</h2>
          <p>Distribuição das despesas e comparação entre entradas e saídas do período filtrado.</p>
        </div>
      </div>

      <div className="charts-grid">
        <article className="panel chart-card">
          <div className="chart-card-header">
            <div>
              <span className="section-kicker">Despesas</span>
              <h2>Por categoria</h2>
            </div>
            <strong>{formatarMoeda(despesas)}</strong>
          </div>

          {categorias.length ? (
            <div className="pie-layout">
              <div
                className="pie-chart"
                role="img"
                aria-label={`Gráfico de pizza com ${categorias.length} categorias de despesas`}
                style={{ background: gradientePizza }}
              />

              <div className="pie-legend">
                {categorias.map((categoria, indice) => (
                  <div className="pie-legend-row" key={categoria.nome}>
                    <span
                      className="pie-legend-color"
                      aria-hidden="true"
                      style={{ background: coresGrafico[indice % coresGrafico.length] }}
                    />
                    <span className="pie-legend-name">{categoria.nome}</span>
                    <strong>{formatarMoeda(categoria.valor)}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state chart-empty">
              <span>🥧</span>
              <strong>Sem despesas para exibir</strong>
              <p>O gráfico de pizza aparece quando houver saídas no mês selecionado.</p>
            </div>
          )}
        </article>

        <article className="panel chart-card">
          <div className="chart-card-header">
            <div>
              <span className="section-kicker">Fluxo financeiro</span>
              <h2>Entradas x saídas</h2>
            </div>
          </div>

          {receitas || despesas ? (
            <div className="bar-chart" role="img" aria-label="Gráfico de barras comparando entradas e saídas">
              <div className="bar-chart-column">
                <strong>{formatarMoeda(receitas)}</strong>
                <div className="bar-chart-track">
                  <div className="bar-chart-fill entrada" style={{ height: `${alturaEntradas}%` }} />
                </div>
                <span>Entradas</span>
              </div>

              <div className="bar-chart-column">
                <strong>{formatarMoeda(despesas)}</strong>
                <div className="bar-chart-track">
                  <div className="bar-chart-fill saida" style={{ height: `${alturaSaidas}%` }} />
                </div>
                <span>Saídas</span>
              </div>
            </div>
          ) : (
            <div className="empty-state chart-empty">
              <span>📊</span>
              <strong>Sem movimentações para comparar</strong>
              <p>Adicione registros ao mês para visualizar o gráfico de barras.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  )
}
