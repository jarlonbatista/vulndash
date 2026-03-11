'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('Todas')
  
  // Estados de Login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Estados do Formulário
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState('Média')
  const [asset, setAsset] = useState('')

  useEffect(() => {
    // Verifica se tem alguém logado
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    fetchVulnerabilities()
    return () => subscription.unsubscribe()
  }, [])

  async function fetchVulnerabilities() {
    const { data } = await supabase.from('vulnerabilities').select('*').order('created_at', { ascending: false })
    if (data) setVulnerabilities(data)
    setLoading(false)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert("Erro no acesso: " + error.message)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (!session) {
    return (
      <main style={{ backgroundColor: '#020617', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#0f172a', padding: '3rem', borderRadius: '20px', border: '1px solid #1e293b', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 0 50px rgba(59, 130, 246, 0.1)' }}>
          <h1 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>🛡️ VulnDash</h1>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '2rem' }}>CTRL SEGURANÇA DIGITAL | ACESSO RESTRITO</p>
          
          <input type="email" placeholder="E-mail" onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} />
          <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} />
          
          <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Entrar no SOC</button>
        </form>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'sans-serif', padding: '2rem' }}>
      {/* O conteúdo do Dashboard que já fizemos vai aqui, mas agora com um botão de Sair */}
      <button onClick={handleLogout} style={{ float: 'right', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>Sair do Sistema</button>
      
      <h1 style={{ color: '#3b82f6' }}>🛡️ Painel de Controle</h1>
      <p>Bem-vindo, Operador.</p>
      
      {/* Aqui continua o resto do seu código de filtros e lista que já funciona */}
    </main>
  )
}