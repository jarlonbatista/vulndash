'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Estados do Formulário
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
    setErrorMessage('')
    const { data, error } = await supabase.from('vulnerabilities').select('*').order('created_at', { ascending: false })
    
    if (error) {
      setErrorMessage("Erro no Banco: " + error.message)
    } else {
      setVulnerabilities(data || [])
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !client) return alert("Preencha Título e Cliente!")
    
    const payload = { title, asset_name: asset, client_name: client, recommendation, severity: 'Média', status: 'Pendente' }

    if (editId) {
      const { error } = await supabase.from('vulnerabilities').update(payload).eq('id', editId)
      if (error) alert("Erro ao editar: " + error.message)
      else { setEditId(null); clearForm(); fetchVulnerabilities(); }
    } else {
      const { error } = await supabase.from('vulnerabilities').insert([payload])
      if (error) alert("Erro ao salvar: " + error.message)
      else { clearForm(); fetchVulnerabilities(); }
    }
  }

  function startEdit(vuln: any) {
    setEditId(vuln.id)
    setTitle(vuln.title)
    setAsset(vuln.asset_name)
    setClient(vuln.client_name)
    setRecommendation(vuln.recommendation || '')
    window.scrollTo(0,0)
  }

  function clearForm() {
    setEditId(null); setTitle(''); setAsset(''); setClient(''); setRecommendation('');
  }

  if (!session) {
    return (
      <main style={{ backgroundColor: '#020617', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif' }}>
        <form onSubmit={async (e) => { e.preventDefault(); const {error} = await supabase.auth.signInWithPassword({email, password}); if(error) alert(error.message) }} style={{ background: '#0f172a', padding: '2rem', borderRadius: '10px', border: '1px solid #1e293b' }}>
          <h2 style={{ textAlign: 'center', color: '#3b82f6' }}>🛡️ CTRL SOC</h2>
          <input type="email" placeholder="E-mail" onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }} />
          <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }} />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Entrar</button>
        </form>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', padding: '2rem', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
        <h1 style={{ color: '#3b82f6', margin: 0 }}>🛡️ VulnDash SOC</h1>
        <button onClick={() => supabase.auth.signOut()} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>Sair</button>
      </header>

      {errorMessage && <div style={{ background: '#ef4444', color: 'white', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>{errorMessage}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
        {/* FORMULÁRIO */}
        <section style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '10px', border: editId ? '2px solid #eab308' : '1px solid #1e293b', height: 'fit-content' }}>
          <h3 style={{ color: editId ? '#eab308' : '#3b82f6', marginTop: 0 }}>{editId ? '📝 Modo Edição' : '➕ Novo Registro'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input value={client} onChange={e => setClient(e.target.value)} placeholder="Cliente" style={{ padding: '8px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }} />
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Vulnerabilidade" style={{ padding: '8px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }} />
            <input value={asset} onChange={e => setAsset(e.target.value)} placeholder="Ativo (Ex: IP, Servidor)" style={{ padding: '8px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }} />
            <textarea value={recommendation} onChange={e => setRecommendation(e.target.value)} placeholder="🛡️ Recomendação Técnica" rows={5} style={{ padding: '8px', background: '#1e293b', color: '#fff', border: '1px solid #3b82f6' }} />
            <button type="submit" style={{ padding: '12px', background: editId ? '#eab308' : '#2563eb', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              {editId ? 'ATUALIZAR DADOS' : 'SALVAR NO SOC'}
            </button>
            {editId && <button onClick={clearForm} style={{ background: 'none', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>Cancelar</button>}
          </form>
        </section>

        {/* LISTA */}
        <section>
          {loading ? <p>Sincronizando...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {vulnerabilities.map((v) => (
                <div key={v.id} style={{ background: '#0f172a', padding: '1.2rem', borderRadius: '12px', border: '1px solid #1e293b', borderLeft: '5px solid #3b82f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase' }}>{v.client_name}</span>
                    <button onClick={() => startEdit(v)} style={{ color: '#eab308', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', borderBottom: '1px solid #eab308' }}>EDITAR</button>
                  </div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>{v.title}</h4>
                  <div style={{ background: '#020617', padding: '8px', borderRadius: '5px', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <strong>Solução:</strong> {v.recommendation || 'Pendente...'}
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