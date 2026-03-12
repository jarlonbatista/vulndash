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

  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState('Média')
  const [asset, setAsset] = useState('')
  const [description, setDescription] = useState('')

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
    const { data, error } = await supabase
      .from('vulnerabilities')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setVulnerabilities(data || [])
    setLoading(false)
  }

  // NOVA FUNÇÃO: EXCLUIR REGISTRO
  async function handleDelete(id: string) {
    if (!confirm("⚠️ ATENÇÃO: Deseja realmente remover este registro do SOC?")) return

    const { error } = await supabase
      .from('vulnerabilities')
      .delete()
      .eq('id', id)

    if (error) {
      alert("Erro ao excluir: " + error.message)
    } else {
      fetchVulnerabilities() // Atualiza a lista na hora
    }
  }

  const listaFiltrada = vulnerabilities.filter(v => 
    filtro === 'Todas' ? true : v.severity === filtro
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert("Erro no acesso: " + error.message)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !asset) return alert("Preencha o título e o ativo!")

    const { error } = await supabase
      .from('vulnerabilities')
      .insert([{ title, severity, asset_name: asset, description, status: 'Pendente' }])

    if (error) {
      alert("Erro ao salvar: " + error.message)
    } else {
      setTitle(''); setAsset(''); setDescription('');
      fetchVulnerabilities()
    }
  }

  if (!session) {
    return (
      <main style={{ backgroundColor: '#020617', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#0f172a', padding: '3rem', borderRadius: '20px', border: '1px solid #1e293b', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 0 50px rgba(59, 130, 246, 0.1)' }}>
          <h1 style={{ color: '#3b82f6', marginBottom: '0.5rem', fontWeight: '900' }}>🛡️ VulnDash</h1>
          <p style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '2rem', letterSpacing: '1px' }}>CTRL SEGURANÇA DIGITAL | ACESSO RESTRITO</p>
          <input type="email" placeholder="E-mail" onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} />
          <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white' }} />
          <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Entrar no SOC</button>
        </form>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'sans-serif', padding: '2rem' }}>
      
      <header style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#3b82f6', margin: 0 }}>🛡️ VulnDash</h1>
          <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Operador: {session.user.email}</p>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {['Todas', 'Crítica', 'Alta', 'Média'].map(nivel => (
              <button key={nivel} onClick={() => setFiltro(nivel)} style={{ padding: '5px 15px', borderRadius: '20px', border: '1px solid #3b82f6', backgroundColor: filtro === nivel ? '#3b82f6' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.7rem' }}>
                {nivel}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Sair do Sistema</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
        <section style={{ backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1e293b', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', color: '#3b82f6' }}>Novo Registro</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da Ameaça" style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.6rem', color: 'white', borderRadius: '6px' }} />
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.6rem', color: 'white', borderRadius: '6px' }}>
              <option>Crítica</option><option>Alta</option><option>Média</option>
            </select>
            <input value={asset} onChange={(e) => setAsset(e.target.value)} placeholder="Ativo (Ex: Servidor)" style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.6rem', color: 'white', borderRadius: '6px' }} />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" rows={3} style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.6rem', color: 'white', borderRadius: '6px' }} />
            <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Registrar</button>
          </form>
        </section>

        <section>
          {loading ? (
            <p>Sincronizando banco de dados...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {listaFiltrada.map((vuln) => (
                <div key={vuln.id} style={{ 
                  backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '16px', border: '1px solid #1e293b',
                  borderLeft: `6px solid ${vuln.severity === 'Crítica' ? '#ef4444' : vuln.severity === 'Alta' ? '#f97316' : '#eab308'}`,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' }}>
                        {vuln.severity.toUpperCase()}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: '#f1f5f9' }}>{vuln.title}</h2>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>{vuln.description}</p>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #1e293b', fontSize: '0.7rem', color: '#475569' }}>
                      Ativo: <span style={{ color: '#94a3b8' }}>{vuln.asset_name}</span>
                    </div>
                  </div>
                  
                  {/* BOTÃO DE EXCLUIR */}
                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleDelete(vuln.id)}
                      style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '0.65rem', textDecoration: 'underline', opacity: 0.7 }}
                    >
                      Remover Registro
                    </button>
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