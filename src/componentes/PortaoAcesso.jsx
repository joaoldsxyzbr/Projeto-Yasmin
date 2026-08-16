import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { verificarAcessoAutorizado } from '../servicos/acesso'
import { TelaAutenticacao } from './TelaAutenticacao'

export function PortaoAcesso({ children }) {
  const [sessao, setSessao] = useState(undefined)
  const [autorizado, setAutorizado] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [mensagemAcesso, setMensagemAcesso] = useState('')

  useEffect(() => {
    let ativo = true

    async function validarSessao(novaSessao) {
      if (!ativo) return

      if (!novaSessao) {
        setSessao(null)
        setAutorizado(false)
        setVerificando(false)
        return
      }

      setVerificando(true)

      try {
        const acessoAutorizado = await verificarAcessoAutorizado()
        if (!ativo) return

        if (!acessoAutorizado) {
          setSessao(null)
          setAutorizado(false)
          setMensagemAcesso('Esta conta não está autorizada a acessar o aplicativo.')
          await supabase.auth.signOut()
          return
        }

        setSessao(novaSessao)
        setAutorizado(true)
        setMensagemAcesso('')
      } catch {
        if (!ativo) return
        setSessao(null)
        setAutorizado(false)
        setMensagemAcesso('Não foi possível validar o acesso. Tente novamente.')
        await supabase.auth.signOut()
      } finally {
        if (ativo) setVerificando(false)
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      validarSessao(data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      window.setTimeout(() => validarSessao(novaSessao), 0)
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [])

  if (verificando) {
    return <div className="estado-carregamento">Verificando acesso...</div>
  }

  if (!sessao || !autorizado) {
    return <TelaAutenticacao mensagemAcesso={mensagemAcesso} />
  }

  return children
}
