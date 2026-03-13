'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [asset, setAsset] = useState('')
  const [client, setClient] = useState('')
  const [recommendation, setRecommendation] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    fetchVulnerabilities()
    return () => subscription.unsubscribe()
  }, [])

  async function fetchVulnerabilities() {
    setLoading(true)
    const { data, error } = await supabase.from('vulnerabilities').select('*').order('created_at', { ascending: false })
    if (!error) setVulnerabilities(data || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !client) return alert("Campos obrigatórios: Título e Cliente")
    
    const payload = { title, asset_name: asset, client_name: client, recommendation, severity: 'Média', status: 'Pendente' }

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

  function handlePrint(vuln: any) {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head><title>Relatório CTRL</title></head>
        <body style="font-family:sans-serif; padding:50px; color:#333;">
          <h1 style="color:#2563eb; border-bottom: 2px solid #2563eb;">Relatório de Vulnerabilidade</h1>
          <p><b>Cliente:</b> ${vuln.client_name}</p>
          <p><b>Ativo:</b> ${vuln.asset_name}</p>
          <hr/>
          <h3>Descrição:</h3><p>${vuln.title}</p>
          <div style="background:#f1f5f9; padding:20px; border-radius:10px; border-left:5px solid #22c55e;">
            <h3>🛡️ Recomendação Técnica:</h3>
            <p>${vuln.recommendation || 'Pendente de análise.'}</p>
          </div>
        </body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  if (!session) {
    return (
      <main style={{ backgroundColor: '#020617', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif' }}>
        <form onSubmit={async (e) => { e.preventDefault(); const {error} = await supabase.auth.signInWithPassword({email, password}); if(error) alert(error.message) }} 
              style={{ backgroundColor: '#0f172a', padding: '3.5rem', borderRadius: '24px', border: '1px solid #1e293b', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 0 60px rgba(59, 130, 246, 0.15)' }}>
          <h1 style={{ color: '#3b82f6', marginBottom: '0.5rem', fontWeight: '900', fontSize: '2rem' }}>🛡️ VulnDash</h1>
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '2.5rem', letterSpacing: '1px' }}>CTRL SEGURANÇA DIGITAL | SOC ACCESS</p>
          <input type="email" placeholder="E-mail" onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#1e293b', color: 'white', outline: 'none' }} />
          <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', marginBottom: '25px', borderRadius: '12px', border: '1px solid #334155', background: '#1e293b', color: 'white', outline: 'none' }} />
          <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>Entrar no Sistema</button>
        </form>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', padding: '2.5rem', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#3b82f6', margin: 0 }}>🛡️ VulnDash SOC</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '5px' }}>Monitoramento Ativo: <span style={{color: '#94a3b8'}}>{session.user.email}</span></p>
        </div>
        <button onClick={() => supabase.auth.signOut()} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Encerrar Sessão</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '3rem' }}>
        {/* FORMULÁRIO */}
        <section style={{ backgroundColor: '#0f172a', padding: '2rem', borderRadius: '20px', border: editId ? '2px solid #eab308' : '1px solid #1e293b', height: 'fit-content', boxShadow: editId ? '0 0 20px rgba(234, 179, 8, 0.1)' : 'none' }}>
          <h3 style={{ color: editId ? '#eab308' : '#3b82f6', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.2rem' }}>{editId ? '📝 Editar Registro' : '➕ Novo Registro'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold'}}>CLIENTE</label>
            <input value={client} onChange={e => setClient(e.target.value)} placeholder="Ex: Farmácia Central" style={{ padding: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }} />
            
            <label style={{fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold'}}>TÍTULO</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da vulnerabilidade" style={{ padding: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }} />
            
            <label style={{fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold'}}>ATIVO / HOST</label>
            <input value={asset} onChange={e => setAsset(e.target.value)} placeholder="IP ou Nome do Equipamento" style={{ padding: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }} />
            
            <label style={{fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'bold'}}>RECOMENDAÇÃO TÉCNICA</label>
            <textarea value={recommendation} onChange={e => setRecommendation(e.target.value)} placeholder="Descreva as boas práticas para mitigação..." rows={6} style={{ padding: '12px', background: '#1e293b', color: '#fff', border: '1px solid #3b82f6', borderRadius: '8px', lineHeight: '1.5' }} />
            
            <button type="submit" style={{ marginTop: '10px', padding: '14px', background: editId ? '#eab308' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {editId ? 'ATUALIZAR REGISTRO' : 'SALVAR NO SISTEMA'}
            </button>
            {editId && <button onClick={clearForm} style={{ background: 'none', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Cancelar edição</button>}
          </form>
        </section>

        {/* CARDS */}
        <section>
          {loading ? <p style={{color: '#3b82f6'}}>Sincronizando com SOC...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {vulnerabilities.map((v) => (
                <div key={v.id} style={{ backgroundColor: '#0f172a', padding: '1.8rem', borderRadius: '20px', border: '1px solid #1e293b', borderLeft: '6px solid #3b82f6', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>{v.client_name}</span>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => startEdit(v)} style={{ color: '#eab308', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>EDITAR</button>
                        <button onClick={() => handlePrint(v)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>PDF</button>
                      </div>
                    </div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#f1f5f9', lineHeight: '1.3' }}>{v.title}</h4>
                    <div style={{ background: '#020617', padding: '12px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                      <p style={{ fontSize: '0.6rem', color: '#22c55e', margin: '0 0 6px 0', fontWeight: 'bold', letterSpacing: '1px' }}>SOLUÇÃO SUGERIDA:</p>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>{v.recommendation || 'Análise técnica em andamento...'}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: '#475569', fontWeight: 'bold' }}>
                    HOST: <span style={{color: '#64748b'}}>{v.asset_name || 'N/A'}</span>
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