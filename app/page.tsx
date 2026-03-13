'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('Todas')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Novos Estados do Formulário
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState('Média')
  const [asset, setAsset] = useState('')
  const [client, setClient] = useState('') // Novo
  const [description, setDescription] = useState('')
  const [recommendation, setRecommendation] = useState('') // Novo

  useEffect(() => {
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
    setLoading(true)
    const { data, error } = await supabase.from('vulnerabilities').select('*').order('created_at', { ascending: false })
    if (!error) setVulnerabilities(data || [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("⚠️ Confirmar remoção?")) return
    const { error } = await supabase.from('vulnerabilities').delete().eq('id', id)
    if (!error) fetchVulnerabilities()
  }

  const listaFiltrada = vulnerabilities.filter(v => filtro === 'Todas' ? true : v.severity === filtro)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert("Erro: " + error.message)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !client) return alert("Título e Cliente são obrigatórios!")
    
    const { error } = await supabase.from('vulnerabilities').insert([{ 
      title, 
      severity, 
      asset_name: asset, 
      client_name: client, // Novo
      description, 
      recommendation, // Novo
      status: 'Pendente' 
    }])

    if (error) alert(error.message)
    else { 
      setTitle(''); setAsset(''); setClient(''); setDescription(''); setRecommendation('');
      fetchVulnerabilities() 
    }
  }

  if (!session) {
    return (
      <main style={{ backgroundColor: '#020617', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#0f172a', padding: '3rem', borderRadius: '20px', border: '1px solid #1e293b', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h1 style={{ color: '#3b82f6', marginBottom: '1rem' }}>🛡️ CTRL SOC</h1>
          <input type="email" placeholder="E-mail" onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} />
          <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} />
          <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Acessar</button>
        </form>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'sans-serif', padding: '2rem' }}>
      <header style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#3b82f6', margin: 0 }}>🛡️ VulnDash SOC</h1>
          <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Gestão de Consultoria | {session.user.email}</p>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem' }}>Sair</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
        <section style={{ backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <h3 style={{ color: '#3b82f6', marginTop: 0 }}>Novo Registro</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nome do Cliente (Ex: Farmácia X)" style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.6rem', color: 'white', borderRadius: '6px' }} />
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da Vulnerabilidade" style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.6rem', color: 'white', borderRadius: '6px' }} />
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.6rem', color: 'white', borderRadius: '6px' }}>
              <option>Crítica</option><option>Alta</option><option>Média</option>
            </select>
            <input value={asset} onChange={(e) => setAsset(e.target.value)} placeholder="Ativo (Ex: Servidor, IP, App)" style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.6rem', color: 'white', borderRadius: '6px' }} />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição técnica do problema" rows={2} style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.6rem', color: 'white', borderRadius: '6px' }} />
            <textarea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} placeholder="Recomendação / Boas Práticas" rows={3} style={{ background: '#1e293b', border: '1px solid #3b82f6', padding: '0.6rem', color: 'white', borderRadius: '6px' }} />
            <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '6px', fontWeight: 'bold' }}>Registrar no SOC</button>
          </form>
        </section>

        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {listaFiltrada.map((vuln) => (
              <div key={vuln.id} style={{ backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '16px', border: '1px solid #1e293b', borderLeft: `6px solid ${vuln.severity === 'Crítica' ? '#ef4444' : vuln.severity === 'Alta' ? '#f97316' : '#eab308'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#3b82f6', fontSize: '0.7rem', fontWeight: 'bold' }}>CLIENTE: {vuln.client_name}</span>
                  <span style={{ fontSize: '0.6rem', background: '#1e293b', padding: '2px 5px', borderRadius: '4px' }}>{vuln.severity}</span>
                </div>
                <h2 style={{ fontSize: '1.1rem', color: '#f1f5f9', margin: '0.5rem 0' }}>{vuln.title}</h2>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>{vuln.description}</p>
                
                <div style={{ backgroundColor: '#020617', padding: '10px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <p style={{ fontSize: '0.7rem', color: '#22c55e', margin: '0 0 5px 0', fontWeight: 'bold' }}>🛡️ RECOMENDAÇÃO:</p>
                  <p style={{ fontSize: '0.75rem', color: '#f8fafc', margin: 0 }}>{vuln.recommendation || 'Pendente de análise...'}</p>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: '#475569' }}>
                  <span>Ativo: {vuln.asset_name}</span>
                  <button onClick={() => handleDelete(vuln.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}