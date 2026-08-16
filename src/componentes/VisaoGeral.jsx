import './VisaoGeral.css'

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
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${valor}T12:00:00`))
}

function Kpi({ titulo, valor, icone, classe }) {
  return (
    <article className={`overview-kpi ${classe}`}>
      <div className="overview-kpi-icon" aria-hidden="true">{icone}</div>
      <div>
        <span>{titulo}</span>
        <strong>{formatarMoeda(valor)}</strong>
      </div>
    </article>
  )
}

export function VisaoGeral({ transacoes, receitas, despesas, saldo, mesSelecionado, aoAdicionar }) {
  return (
    <>
      <section className="overview-kpis" aria-label={`Resumo financeiro de ${formatarMes(mesSelecionado)}`}>
        <Kpi titulo="Entradas" valor={receitas} icone="↑" classe="entrada" />
        <Kpi titulo="Saídas" valor={despesas} icone="↓" classe="saida" />
        <Kpi titulo="Saldo" valor={saldo} icone="=" classe={saldo < 0 ? 'saldo negativo' : 'saldo'} />
      </section>

      <section className="panel overview-table-panel">
        <div className="panel-header overview-table-header">
          <div>
            <span className="section-kicker">{formatarMes(mesSelecionado)}</span>
            <h2>Registros do mês</h2>
            <p>{transacoes.length} {transacoes.length === 1 ? 'lançamento encontrado' : 'lançamentos encontrados'}</p>
          </div>
          <button className="primary-button small-button" type="button" onClick={aoAdicionar}>＋ Adicionar</button>
        </div>

        {transacoes.length ? (
          <div className="overview-table-scroll">
            <table className="overview-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th className="overview-value-column">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map((transacao) => (
                  <tr key={transacao.id}>
                    <td>{formatarData(transacao.data_transacao)}</td>
                    <td><strong>{transacao.descricao}</strong></td>
                    <td>{transacao.categoria}</td>
                    <td>
                      <span className={`overview-type-badge ${transacao.tipo}`}>
                        {transacao.tipo === 'receita' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className={`overview-value-column ${transacao.tipo === 'receita' ? 'overview-income-value' : 'overview-expense-value'}`}>
                      {transacao.tipo === 'receita' ? '+' : '-'} {formatarMoeda(transacao.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state overview-empty">
            <span>🧾</span>
            <strong>Nenhum registro neste mês</strong>
            <p>Adicione uma entrada ou saída para começar a acompanhar o período.</p>
          </div>
        )}
      </section>
    </>
  )
}
