import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function TelaAutenticacao({ mensagemAcesso = '' }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function enviarFormulario(evento) {
    evento.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      })

      if (error) throw error
    } catch {
      setErro('Não foi possível entrar. Verifique o e-mail e a senha.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="tela-autenticacao">
      <section className="cartao-autenticacao">
        <div className="marca-autenticacao">Y</div>
        <span className="section-kicker">Projeto Yasmin</span>
        <h1>Meu controle financeiro 🌷</h1>
        <p className="texto-autenticacao">
          Acesso restrito. Entre com a conta autorizada para continuar.
        </p>

        <form className="formulario-autenticacao" onSubmit={enviarFormulario}>
          <label className="field">
            <span>E-mail</span>
            <input
              required
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              required
              minLength="6"
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
            />
          </label>

          {(erro || mensagemAcesso) && (
            <div className="aviso erro">{erro || mensagemAcesso}</div>
          )}

          <button className="primary-button" type="submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
