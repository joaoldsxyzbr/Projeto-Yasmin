import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function TelaAutenticacao() {
  const [modo, setModo] = useState('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  async function enviarFormulario(evento) {
    evento.preventDefault()
    setCarregando(true)
    setErro('')
    setMensagem('')

    try {
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (error) throw error
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (error) throw error

      if (!data.session) {
        setMensagem('Cadastro criado. Confira seu e-mail para confirmar o acesso.')
      }
    } catch (error) {
      setErro(error.message || 'Não foi possível concluir o acesso.')
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
        <p className="texto-autenticacao">Entre para acessar seus lançamentos salvos com segurança.</p>

        <div className="alternador-autenticacao" aria-label="Escolher modo de acesso">
          <button type="button" className={modo === 'entrar' ? 'active' : ''} onClick={() => setModo('entrar')}>Entrar</button>
          <button type="button" className={modo === 'cadastro' ? 'active' : ''} onClick={() => setModo('cadastro')}>Criar acesso</button>
        </div>

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
              autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
              placeholder="Mínimo de 6 caracteres"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
            />
          </label>

          {erro && <div className="aviso erro">{erro}</div>}
          {mensagem && <div className="aviso sucesso">{mensagem}</div>}

          <button className="primary-button" type="submit" disabled={carregando}>
            {carregando ? 'Aguarde...' : modo === 'entrar' ? 'Entrar' : 'Criar acesso'}
          </button>
        </form>
      </section>
    </main>
  )
}
