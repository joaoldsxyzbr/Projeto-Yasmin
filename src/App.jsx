import { useEffect, useMemo, useState } from 'react'

const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Compras', 'Assinaturas', 'Outros']

const categoryIcons = {
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

const storageKeys = {
  transactions: 'yasmin-transactions',
  budget: 'yasmin-budget',
}

function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem(storageKeys.transactions)) || []
  } catch {
    return []
  }
}

function loadBudget() {
  const value = Number(localStorage.getItem(storageKeys.budget))
  return Number.isFinite(value) && value > 0 ? value : 5000
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatMonth(value) {
  const [year, month] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${value}T12:00:00`))
}

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function NavButton({ active, icon, label, onClick }) {
  return (
    <button className={`nav-item${active ? ' active' : ''}`} onClick={onClick}>
      <span className="nav-icon" aria-hidden="true">{icon}</span>
      {label}
    </button>
  )
}

function TransactionList({ items, onDelete, compact = false }) {
  if (!items.length) {
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
      {items.map((transaction) => (
        <div className="transaction" key={transaction.id}>
          <div className="transaction-icon">{categoryIcons[transaction.category] || '✨'}</div>
          <div className="transaction-copy">
            <strong>{transaction.description}</strong>
            <span>{transaction.category} · {formatDate(transaction.date)}</span>
          </div>
          <strong className={`transaction-value${transaction.type === 'income' ? ' income-text' : ''}`}>
            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
          </strong>
          {!compact && (
            <button
              className="delete-button"
              type="button"
              aria-label={`Excluir ${transaction.description}`}
              title="Excluir transação"
              onClick={() => onDelete(transaction.id)}
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
  const [transactions, setTransactions] = useState(loadTransactions)
  const [budget, setBudget] = useState(loadBudget)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth)
  const [view, setView] = useState('overview')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: 'expense',
    description: '',
    amount: '',
    category: 'Alimentação',
    date: getToday(),
  })

  useEffect(() => {
    localStorage.setItem(storageKeys.transactions, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem(storageKeys.budget, String(budget))
  }, [budget])

  const monthTransactions = useMemo(
    () => transactions
      .filter((transaction) => transaction.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id),
    [transactions, selectedMonth],
  )

  const income = useMemo(
    () => monthTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0),
    [monthTransactions],
  )

  const expenses = useMemo(
    () => monthTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0),
    [monthTransactions],
  )

  const balance = income - expenses
  const availablePercent = income > 0 ? Math.max(0, Math.min(100, Math.round((balance / income) * 100))) : 0
  const budgetPercent = budget > 0 ? Math.min(100, Math.round((expenses / budget) * 100)) : 0

  const categories = useMemo(() => {
    const totals = monthTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
        return acc
      }, {})

    const highest = Math.max(...Object.values(totals), 1)

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
        percent: Math.round((value / highest) * 100),
      }))
      .sort((a, b) => b.value - a.value)
  }, [monthTransactions])

  function openForm() {
    setForm({
      type: 'expense',
      description: '',
      amount: '',
      category: 'Alimentação',
      date: selectedMonth === getCurrentMonth() ? getToday() : `${selectedMonth}-01`,
    })
    setShowForm(true)
  }

  function handleTypeChange(type) {
    setForm((current) => ({
      ...current,
      type,
      category: type === 'income' ? 'Receita' : 'Alimentação',
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const amount = Number(form.amount)

    if (!form.description.trim() || !Number.isFinite(amount) || amount <= 0 || !form.date) {
      return
    }

    setTransactions((current) => [
      ...current,
      {
        id: Date.now(),
        description: form.description.trim(),
        amount,
        type: form.type,
        category: form.type === 'income' ? 'Receita' : form.category,
        date: form.date,
      },
    ])
    setSelectedMonth(form.date.slice(0, 7))
    setShowForm(false)
  }

  function deleteTransaction(id) {
    const transaction = transactions.find((item) => item.id === id)
    if (!transaction || !window.confirm(`Excluir "${transaction.description}"?`)) return
    setTransactions((current) => current.filter((item) => item.id !== id))
  }

  function changeView(nextView) {
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pageTitles = {
    overview: 'Visão geral',
    transactions: 'Transações',
    categories: 'Categorias',
    settings: 'Configurações',
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
          <NavButton active={view === 'overview'} icon="⌂" label="Visão geral" onClick={() => changeView('overview')} />
          <NavButton active={view === 'transactions'} icon="↕" label="Transações" onClick={() => changeView('transactions')} />
          <NavButton active={view === 'categories'} icon="◫" label="Categorias" onClick={() => changeView('categories')} />
        </nav>

        <div className="sidebar-footer">
          <NavButton active={view === 'settings'} icon="⚙" label="Configurações" onClick={() => changeView('settings')} />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">{pageTitles[view]}</p>
            <h1>{view === 'overview' ? `${greeting()}, Yasmin 🌷` : pageTitles[view]}</h1>
          </div>
          <div className="topbar-actions">
            <label className="month-control">
              <span className="sr-only">Selecionar mês</span>
              <input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} />
            </label>
            <div className="avatar">Y</div>
          </div>
        </header>

        {view === 'overview' && (
          <>
            <section className="hero-grid" aria-label="Resumo financeiro">
              <article className="balance-card">
                <div className="balance-header">
                  <span>Saldo do mês</span>
                  <span className="balance-badge">{formatMonth(selectedMonth)}</span>
                </div>
                <strong className="balance-value">{formatCurrency(balance)}</strong>
                <p>
                  {income > 0
                    ? `${availablePercent}% da renda do mês ainda está disponível.`
                    : 'Adicione uma receita para acompanhar o saldo do mês.'}
                </p>
                <div className="balance-progress">
                  <span style={{ width: `${availablePercent}%` }} />
                </div>
              </article>

              <div className="stats-grid">
                <article className="stat-card">
                  <div className="stat-icon income">↑</div>
                  <div>
                    <span>Receitas</span>
                    <strong>{formatCurrency(income)}</strong>
                  </div>
                </article>
                <article className="stat-card">
                  <div className="stat-icon expense">↓</div>
                  <div>
                    <span>Despesas</span>
                    <strong>{formatCurrency(expenses)}</strong>
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
                  <button className="text-button" onClick={() => changeView('transactions')}>Ver todas</button>
                </div>
                <TransactionList items={monthTransactions.slice(0, 4)} onDelete={deleteTransaction} compact />
              </article>

              <article className="panel quick-panel">
                <span className="section-kicker">Atalho</span>
                <h2>Registrar movimento</h2>
                <p>Adicione uma despesa ou receita e o resumo será atualizado na hora.</p>
                <button className="primary-button" onClick={openForm}><span>＋</span> Nova transação</button>
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

                {categories.length ? (
                  <div className="category-list">
                    {categories.slice(0, 5).map((category) => (
                      <div className="category-row" key={category.name}>
                        <div className="category-label">
                          <span>{categoryIcons[category.name]} {category.name}</span>
                          <strong>{formatCurrency(category.value)}</strong>
                        </div>
                        <div className="category-track">
                          <span style={{ width: `${category.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-mini">As categorias aparecem aqui quando houver despesas.</div>
                )}
              </article>

              <article className="panel budget-panel">
                <div>
                  <span className="section-kicker">Planejamento</span>
                  <h2>Orçamento do mês</h2>
                </div>
                <div
                  className="budget-ring"
                  style={{ '--budget-percent': `${budgetPercent}%` }}
                  aria-label={`${budgetPercent}% do orçamento utilizado`}
                >
                  <div><strong>{budgetPercent}%</strong><span>usado</span></div>
                </div>
                <p><strong>{formatCurrency(expenses)}</strong> de {formatCurrency(budget)}</p>
              </article>
            </section>
          </>
        )}

        {view === 'transactions' && (
          <section className="panel page-panel">
            <div className="panel-header">
              <div>
                <span className="section-kicker">{formatMonth(selectedMonth)}</span>
                <h2>Todas as transações</h2>
              </div>
              <button className="primary-button small-button" onClick={openForm}>＋ Adicionar</button>
            </div>
            <TransactionList items={monthTransactions} onDelete={deleteTransaction} />
          </section>
        )}

        {view === 'categories' && (
          <section className="panel page-panel">
            <div className="panel-header">
              <div>
                <span className="section-kicker">{formatMonth(selectedMonth)}</span>
                <h2>Gastos por categoria</h2>
              </div>
            </div>
            {categories.length ? (
              <div className="category-list expanded">
                {categories.map((category) => (
                  <div className="category-row" key={category.name}>
                    <div className="category-label">
                      <span>{categoryIcons[category.name]} {category.name}</span>
                      <strong>{formatCurrency(category.value)}</strong>
                    </div>
                    <div className="category-track">
                      <span style={{ width: `${category.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span>📊</span>
                <strong>Ainda não há despesas neste mês</strong>
                <p>Quando você registrar gastos, eles serão agrupados automaticamente.</p>
              </div>
            )}
          </section>
        )}

        {view === 'settings' && (
          <section className="panel page-panel settings-panel">
            <div>
              <span className="section-kicker">Planejamento</span>
              <h2>Orçamento mensal</h2>
              <p>Defina quanto pretende gastar por mês. O valor fica salvo somente neste navegador.</p>
            </div>
            <label className="field budget-field">
              <span>Limite mensal</span>
              <div className="money-input">
                <span>R$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={budget}
                  onChange={(event) => setBudget(Math.max(1, Number(event.target.value) || 1))}
                />
              </div>
            </label>
          </section>
        )}
      </main>

      <nav className="mobile-nav" aria-label="Navegação móvel">
        <button className={view === 'overview' ? 'active' : ''} onClick={() => changeView('overview')}><span>⌂</span>Início</button>
        <button className={view === 'transactions' ? 'active' : ''} onClick={() => changeView('transactions')}><span>↕</span>Transações</button>
        <button className="mobile-add" aria-label="Nova transação" onClick={openForm}>＋</button>
        <button className={view === 'categories' ? 'active' : ''} onClick={() => changeView('categories')}><span>◫</span>Categorias</button>
        <button className={view === 'settings' ? 'active' : ''} onClick={() => changeView('settings')}><span>⚙</span>Ajustes</button>
      </nav>

      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowForm(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="transaction-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="section-kicker">Movimentação</span>
                <h2 id="transaction-title">Nova transação</h2>
              </div>
              <button className="close-button" type="button" aria-label="Fechar" onClick={() => setShowForm(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="type-toggle">
                <button type="button" className={form.type === 'expense' ? 'active expense-choice' : ''} onClick={() => handleTypeChange('expense')}>Despesa</button>
                <button type="button" className={form.type === 'income' ? 'active income-choice' : ''} onClick={() => handleTypeChange('income')}>Receita</button>
              </div>

              <label className="field">
                <span>Descrição</span>
                <input
                  autoFocus
                  required
                  maxLength="60"
                  placeholder={form.type === 'income' ? 'Ex.: Salário' : 'Ex.: Mercado'}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
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
                      value={form.amount}
                      onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                    />
                  </div>
                </label>

                <label className="field">
                  <span>Data</span>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  />
                </label>
              </div>

              {form.type === 'expense' && (
                <label className="field">
                  <span>Categoria</span>
                  <select
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  >
                    {expenseCategories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
              )}

              <button className="primary-button submit-button" type="submit">Salvar transação</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
