'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados de Login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Estados do Formulário e Edição
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [asset, setAsset] = useState('')
  const [client, setClient] = useState('')
  const [recommendation, setRecommendation] = useState('')

  // Monitoramento de Sessão e Carregamento de Dados
  useEffect(() => {
    const getSessionAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (session) fetchVulnerabilities()
    }

    getSessionAndData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchVulnerabilities()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchVulnerabilities() {
    setLoading(true)
    const { data, error } = await supabase
      .from('vulnerabilities')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setVulnerabilities(data || [])
    setLoading(false)
  }

  // FUNÇÃO DE EXCLUSÃO
  async function handleDelete(id: string) {
    if (!confirm("⚠️ Tem certeza que deseja remover este registro do SOC?")) return
    const { error } = await supabase.from('vulnerabilities').delete().eq('id', id)
    if (error) alert("Erro ao excluir: " + error.message)
    else fetchVulnerabilities()
  }

  // FUNÇÃO DE SUBMISSÃO (SALVAR OU ATUALIZAR)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !client) return alert("Campos obrigatórios: Cliente e Vulnerabilidade")
    
    const payload = { 
      title, 
      asset_name: asset, 
      client_name: client, 
      recommendation, 
      severity: 'Média', 
      status: 'Pendente' 
    }

    if (editId) {
      const { error } = await supabase.from('vulnerabilities').update(payload).eq('id', editId)
      if (error) alert(error.message)
      else { setEditId(null); clearForm(); fetchVulnerabilities(); }
    } else {
      const { error } = await supabase.from('vulnerabilities').insert([payload])
      if (error) alert(error.message)
      else { clearForm(); fetchVulnerabilities(); }
    }
  }

  function startEdit(vuln: any) {
    setEditId(vuln.id)
    setTitle(vuln.title)
    setAsset(vuln.asset_name)
    setClient(vuln.client_name)
    setRecommendation(vuln.recommendation || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function clearForm() {
    setEditId(null); setTitle(''); setAsset(''); setClient(''); setRecommendation('');
  }

  // FUNÇÃO DE IMPRESSÃO PROFISSIONAL
  function handlePrint(vuln: any) {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Relatório CTRL - ${vuln.client_name}</title>
          <style>
            body { font-family: sans-serif; padding: 50px; color: #1e293b; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 40px; }
            .logo-text { font-size: 1.5rem; font-weight: 900; margin: 0; }
            .logo-text span { color: #2563eb; }
            .content-box { background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 25px; }
            .recommendation-box { background: #f0fdf4; padding: 25px; border-radius: 12px; border-left: 6px solid #22c55e; margin-top: 30px; }
            footer { margin-top: 60px; font-size: 0.75rem; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="logo-text">🛡️ CTRL <span>Segurança Digital</span></h1>
            <div style="text-align: right; font-size: 0.8rem;">RELATÓRIO TÉCNICO SOC</div>
          </div>
          <p><strong>CLIENTE:</strong> ${vuln.client_name}</p>
          <p><strong>ATIVO:</strong> ${vuln.asset_name || 'N/A'}</p>
          <div class="content-box">
            <h2>${vuln.title}</h2>
          </div>
          <div class="recommendation-box">
            <h3>🛡️ Recomendação Técnica</h3>
            <p>${vuln.recommendation || 'Pendente de análise.'}</p>
          </div>
          <footer>Gerado por VulnDash SOC - CTRL Segurança Digital</footer>
        </body>
      </html>
    `)
    win.document.close()
    setTimeout(() => { win.print() }, 500)
  }

  if (!session) {
    return (
      <main style={{ backgroundColor: '#020617', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif' }}>
        <form onSubmit={async (e) => { e.preventDefault(); const {error} = await supabase.auth.signInWithPassword({email, password}); if(error) alert(error.message) }} 
              style={{ backgroundColor: '#0f172a', padding: '3.5rem', borderRadius: '24px', border: '1px solid #1e293b', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 0 60px rgba(59, 130, 246, 0.15)' }}>
          <h1 style={{ color: '#3b82f6', marginBottom: '0.5rem', fontWeight: '900' }}>🛡️ VulnDash</h1>
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '2.5rem' }}>CTRL SEGURANÇA DIGITAL | SOC ACCESS</p>
          <input type="email" placeholder="E-mail" onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} />
          <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', marginBottom: '25px', borderRadius: '12px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} />
          <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Entrar no Sistema</button>
        </form>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', padding: '2.5rem', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#3b82f6', margin: 0 }}>🛡️ VulnDash SOC</h1>
        <button onClick={() => supabase.auth.signOut()} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Encerrar Sessão</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '3rem' }}>
        {/* FORMULÁRIO */}
        <section style={{ backgroundColor: '#0f172a', padding: '2rem', borderRadius: '20px', border: editId ? '2px solid #eab308' : '1px solid #1e293b', height: 'fit-content' }}>
          <h3 style={{ color: editId ? '#eab308' : '#3b82f6', marginTop: 0, marginBottom: '1.5rem' }}>{editId ? '📝 Editar Registro' : '➕ Novo Registro'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input value={client} onChange={e => setClient(e.target.value)} placeholder="Nome do Cliente" style={{ padding: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }} />
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Vulnerabilidade" style={{ padding: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }} />
            <input value={asset} onChange={e => setAsset(e.target.value)} placeholder="Ativo / IP" style={{ padding: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }} />
            <textarea value={recommendation} onChange={e => setRecommendation(e.target.value)} placeholder="🛡️ Recomendação Técnica" rows={6} style={{ padding: '12px', background: '#1e293b', color: '#fff', border: '1px solid #3b82f6', borderRadius: '8px' }} />
            <button type="submit" style={{ padding: '14px', background: editId ? '#eab308' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {editId ? 'ATUALIZAR' : 'SALVAR NO SOC'}
            </button>
            {editId && <button onClick={clearForm} style={{ background: 'none', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>Cancelar</button>}
          </form>
        </section>

        {/* CARDS */}
        <section>
          {loading ? <p style={{color: '#3b82f6'}}>Sincronizando...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {vulnerabilities.map((v) => (
                <div key={v.id} style={{ backgroundColor: '#0f172a', padding: '1.8rem', borderRadius: '20px', border: '1px solid #1e293b', borderLeft: '6px solid #3b82f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: '900', textTransform: 'uppercase' }}>{v.client_name}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => startEdit(v)} style={{ color: '#eab308', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>EDITAR</button>
                      <button onClick={() => handlePrint(v)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>PDF</button>
                      <button onClick={() => handleDelete(v.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
                    </div>
                  </div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#f1f5f9' }}>{v.title}</h4>
                  <div style={{ background: '#020617', padding: '12px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <p style={{ fontSize: '0.6rem', color: '#22c55e', margin: '0 0 6px 0', fontWeight: 'bold' }}>RECOMENDAÇÃO:</p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{v.recommendation || 'Pendente...'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}