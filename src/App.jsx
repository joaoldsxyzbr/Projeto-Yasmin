const transactions = [
  { icon: '🛒', name: 'Mercado', category: 'Alimentação', value: '- R$ 186,40', date: 'Hoje' },
  { icon: '🚗', name: 'Combustível', category: 'Transporte', value: '- R$ 120,00', date: '12 ago' },
  { icon: '💼', name: 'Salário', category: 'Receita', value: '+ R$ 6.250,00', date: '10 ago', income: true },
]

const categories = [
  { name: 'Alimentação', value: 'R$ 620', percent: 62 },
  { name: 'Transporte', value: 'R$ 310', percent: 44 },
  { name: 'Lazer', value: 'R$ 245', percent: 35 },
]

function Icon({ children }) {
  return <span className="nav-icon" aria-hidden="true">{children}</span>
}

function App() {
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
          <button className="nav-item active"><Icon>⌂</Icon>Visão geral</button>
          <button className="nav-item"><Icon>↕</Icon>Transações</button>
          <button className="nav-item"><Icon>◫</Icon>Categorias</button>
          <button className="nav-item"><Icon>◎</Icon>Metas</button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item"><Icon>⚙</Icon>Configurações</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Quinta-feira, 13 de agosto</p>
            <h1>Boa tarde, Yasmin 🌷</h1>
          </div>
          <div className="topbar-actions">
            <button className="month-button">Agosto 2026⌄</button>
            <div className="avatar">Y</div>
          </div>
        </header>

        <section className="hero-grid" aria-label="Resumo financeiro">
          <article className="balance-card">
            <div className="balance-header">
              <span>Saldo disponível</span>
              <span className="balance-badge">este mês</span>
            </div>
            <strong className="balance-value">R$ 4.580,20</strong>
            <p>Você ainda tem 73% da sua renda disponível.</p>
            <div className="balance-progress"><span /></div>
          </article>

          <div className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon income">↑</div>
              <div>
                <span>Receitas</span>
                <strong>R$ 6.250,00</strong>
              </div>
            </article>
            <article className="stat-card">
              <div className="stat-icon expense">↓</div>
              <div>
                <span>Despesas</span>
                <strong>R$ 1.669,80</strong>
              </div>
            </article>
          </div>
        </section>

        <section className="content-grid">
          <article className="panel transactions-panel">
            <div className="panel-header">
              <div>
                <span className="section-kicker">Movimentações</span>
                <h2>Transações recentes</h2>
              </div>
              <button className="text-button">Ver todas</button>
            </div>

            <div className="transaction-list">
              {transactions.map((transaction) => (
                <div className="transaction" key={`${transaction.name}-${transaction.date}`}>
                  <div className="transaction-icon">{transaction.icon}</div>
                  <div className="transaction-copy">
                    <strong>{transaction.name}</strong>
                    <span>{transaction.category} · {transaction.date}</span>
                  </div>
                  <strong className={transaction.income ? 'transaction-value income-text' : 'transaction-value'}>
                    {transaction.value}
                  </strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel quick-panel">
            <span className="section-kicker">Atalho</span>
            <h2>Registrar movimento</h2>
            <p>Adicione uma despesa ou receita sem sair da tela inicial.</p>
            <button className="primary-button"><span>＋</span> Nova transação</button>
          </article>
        </section>

        <section className="content-grid lower-grid">
          <article className="panel categories-panel">
            <div className="panel-header">
              <div>
                <span className="section-kicker">Por categoria</span>
                <h2>Onde você mais gastou</h2>
              </div>
            </div>

            <div className="category-list">
              {categories.map((category) => (
                <div className="category-row" key={category.name}>
                  <div className="category-label">
                    <span>{category.name}</span>
                    <strong>{category.value}</strong>
                  </div>
                  <div className="category-track">
                    <span style={{ width: `${category.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel budget-panel">
            <div>
              <span className="section-kicker">Planejamento</span>
              <h2>Orçamento do mês</h2>
            </div>
            <div className="budget-ring" aria-label="34% do orçamento utilizado">
              <div><strong>34%</strong><span>usado</span></div>
            </div>
            <p><strong>R$ 1.669,80</strong> de R$ 5.000,00</p>
          </article>
        </section>
      </main>

      <nav className="mobile-nav" aria-label="Navegação móvel">
        <button className="active"><span>⌂</span>Início</button>
        <button><span>↕</span>Transações</button>
        <button className="mobile-add" aria-label="Nova transação">＋</button>
        <button><span>◫</span>Categorias</button>
        <button><span>⚙</span>Ajustes</button>
      </nav>
    </div>
  )
}

export default App
