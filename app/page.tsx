'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'login' | 'signup' | 'reset' | 'update_password'>('login')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [asset, setAsset] = useState('')
  const [client, setClient] = useState('')
  const [recommendation, setRecommendation] = useState('')

  useEffect(() => {
    // Detecta se o usuário veio de um link de recuperação de senha
    supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (event === 'PASSWORD_RECOVERY') setView('update_password')
      if (session) fetchVulnerabilities()
    })
  }, [])

  async function fetchVulnerabilities() {
    setLoading(true)
    const { data, error } = await supabase.from('vulnerabilities').select('*').order('created_at', { ascending: false })
    if (!error) setVulnerabilities(data || [])
    setLoading(false)
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    if (view === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert(error.message)
    } else if (view === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) alert(error.message)
      else alert("Cadastro realizado! Verifique seu e-mail.")
    } else if (view === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      if (error) alert(error.message)
      else alert("E-mail de recuperação enviado!")
    } else if (view === 'update_password') {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) alert(error.message)
      else { alert("Senha atualizada!"); setView('login'); }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("⚠️ Confirmar exclusão?")) return
    const { error } = await supabase.from('vulnerabilities').delete().eq('id', id)
    if (!error) setVulnerabilities(prev => prev.filter(v => v.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !client) return alert("Preencha os campos obrigatórios.")
    const payload = { title, asset_name: asset, client_name: client, recommendation, severity: 'Média', status: 'Pendente' }
    if (editId) {
      const { error } = await supabase.from('vulnerabilities').update(payload).eq('id', editId)
      if (!error) { setEditId(null); clearForm(); fetchVulnerabilities(); }
    } else {
      const { error } = await supabase.from('vulnerabilities').insert([payload])
      if (!error) { clearForm(); fetchVulnerabilities(); }
    }
  }

  function startEdit(vuln: any) {
    setEditId(vuln.id); setTitle(vuln.title); setAsset(vuln.asset_name); setClient(vuln.client_name); setRecommendation(vuln.recommendation || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function clearForm() { setEditId(null); setTitle(''); setAsset(''); setClient(''); setRecommendation(''); }

  // RELATÓRIO PDF MINIMALISTA COM LOGO
  function handlePrint(vuln: any) {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 60px; color: #000; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: 800; letter-spacing: -1px; }
            .logo span { color: #2563eb; }
            .metadata { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 40px; }
            .content { margin-bottom: 40px; }
            .title { font-size: 28px; font-weight: 800; margin-bottom: 10px; }
            .recommendation { background: #f4f4f4; padding: 30px; border-radius: 8px; border-left: 4px solid #2563eb; }
            footer { position: fixed; bottom: 40px; width: 100%; font-size: 10px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🛡️ CTRL <span>SEGURANÇA DIGITAL</span></div>
            <div style="font-size: 10px; text-align: right;">RELATÓRIO TÉCNICO<br/>#${vuln.id.substring(0,8)}</div>
          </div>
          <div class="metadata">
            Cliente: ${vuln.client_name} <br/>
            Ativo: ${vuln.asset_name || 'N/A'} <br/>
            Data: ${new Date().toLocaleDateString('pt-BR')}
          </div>
          <div class="content">
            <div class="title">${vuln.title}</div>
            <p style="font-size: 14px; color: #444;">Vulnerabilidade identificada durante monitoramento de rotina pelo SOC.</p>
          </div>
          <div class="recommendation">
            <div style="font-weight: 800; font-size: 12px; margin-bottom: 10px; color: #2563eb;">PLANO DE MITIGAÇÃO:</div>
            <div style="font-size: 15px; line-height: 1.6;">${vuln.recommendation || 'Análise detalhada pendente.'}</div>
          </div>
          <footer>Propriedade Confidencial - CTRL Segurança Digital</footer>
        </body>
      </html>
    `)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  if (!session && view !== 'update_password' && view !== 'reset' && view !== 'signup') {
     // Renderização simplificada para o login (já está no código abaixo)
  }

  // LOGO REUTILIZÁVEL
  const Logo = () => (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛡️</div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '2px' }}>CTRL <span style={{ color: '#2563eb' }}>SOC</span></h1>
    </div>
  )

  if (!session || view === 'update_password' || view === 'reset' || view === 'signup') {
    if (!session || ['signup', 'reset', 'update_password'].includes(view)) {
        return (
          <main style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif' }}>
            <div style={{ backgroundColor: '#0a0a0a', padding: '3.5rem', borderRadius: '12px', border: '1px solid #1a1a1a', width: '100%', maxWidth: '400px' }}>
              <Logo />
              <form onSubmit={handleAuth}>
                <input type="email" placeholder="E-mail" onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #222', background: '#000', color: 'white' }} required />
                {view !== 'reset' && (
                  <input type="password" placeholder={view === 'update_password' ? "Nova Senha" : "Senha"} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #222', background: '#000', color: 'white' }} required />
                )}
                <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                  {view === 'login' ? 'ENTRAR' : view === 'signup' ? 'CADASTRAR' : view === 'reset' ? 'ENVIAR LINK' : 'ATUALIZAR SENHA'}
                </button>
              </form>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#666' }}>
                <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>{view === 'login' ? 'Criar conta' : 'Voltar'}</button>
                {view === 'login' && <button onClick={() => setView('reset')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>Esqueci a senha</button>}
              </div>
            </div>
          </main>
        )
    }
  }

  return (
    <main style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#eee', padding: '2rem', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid #111', paddingBottom: '15px' }}>
        <div style={{ fontWeight: '800', letterSpacing: '1px' }}>🛡️ CTRL <span style={{ color: '#2563eb' }}>SOC</span></div>
        <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>SAIR</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '3rem' }}>
        <section style={{ backgroundColor: '#0a0a0a', padding: '2rem', borderRadius: '12px', border: editId ? '1px solid #eab308' : '1px solid #1a1a1a', height: 'fit-content' }}>
          <h2 style={{ fontSize: '0.8rem', marginBottom: '2rem', color: editId ? '#eab308' : '#2563eb', fontWeight: '800' }}>{editId ? 'EDITAR OCORRÊNCIA' : 'NOVA ENTRADA'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input value={client} onChange={e => setClient(e.target.value)} placeholder="Cliente" style={{ padding: '12px', background: '#000', color: '#fff', border: '1px solid #222', borderRadius: '6px' }} />
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Vulnerabilidade" style={{ padding: '12px', background: '#000', color: '#fff', border: '1px solid #222', borderRadius: '6px' }} />
            <input value={asset} onChange={e => setAsset(e.target.value)} placeholder="Host/IP" style={{ padding: '12px', background: '#000', color: '#fff', border: '1px solid #222', borderRadius: '6px' }} />
            <textarea value={recommendation} onChange={e => setRecommendation(e.target.value)} placeholder="Recomendação..." rows={6} style={{ padding: '12px', background: '#000', color: '#fff', border: '1px solid #1e3a8a', borderRadius: '6px', fontSize: '0.9rem' }} />
            <button type="submit" style={{ padding: '12px', background: editId ? '#eab308' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{editId ? 'CONFIRMAR' : 'REGISTRAR'}</button>
          </form>
        </section>

        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {vulnerabilities.map((v) => (
              <div key={v.id} style={{ backgroundColor: '#0a0a0a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #111', borderLeft: '4px solid #2563eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.6rem', color: '#444', fontWeight: 'bold' }}>{v.client_name}</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => startEdit(v)} style={{ color: '#eab308', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.6rem' }}>EDIT</button>
                    <button onClick={() => handlePrint(v)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.6rem' }}>PDF</button>
                    <button onClick={() => handleDelete(v.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.6rem' }}>✕</button>
                  </div>
                </div>
                <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 12px 0', fontWeight: '700' }}>{v.title}</h3>
                <div style={{ background: '#000', padding: '15px', borderRadius: '6px', fontSize: '0.8rem', color: '#888', lineHeight: '1.5' }}>
                  {v.recommendation || 'Aguardando mitigação...'}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}