'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para o formulário
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState('Média')
  const [asset, setAsset] = useState('')
  const [description, setDescription] = useState('')

  // Função para buscar dados
  async function fetchVulnerabilities() {
    setLoading(true)
    const { data, error } = await supabase
      .from('vulnerabilities')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setVulnerabilities(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchVulnerabilities()
  }, [])

  // Função para cadastrar nova vulnerabilidade
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !asset) return alert("Preencha o título e o ativo!")

    const { error } = await supabase
      .from('vulnerabilities')
      .insert([{ 
        title, 
        severity, 
        asset_name: asset, 
        description, 
        status: 'Pendente' 
      }])

    if (error) {
      alert("Erro ao salvar: " + error.message)
    } else {
      // Limpa o formulário e atualiza a lista
      setTitle('')
      setAsset('')
      setDescription('')
      fetchVulnerabilities()
    }
  }

  return (
    <main style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'sans-serif', padding: '2rem' }}>
      
      {/* HEADER */}
      <header style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#3b82f6', margin: 0 }}>🛡️ VulnDash</h1>
          <p style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>CTRL Segurança Digital | Monitoramento Ativo</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#475569' }}>
          <p>SISTEMA: <span style={{ color: '#22c55e' }}>● ONLINE</span></p>
          <p>LOCAL: BREVES/PA</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
        
        {/* FORMULÁRIO DE CADASTRO */}
        <section style={{ backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1e293b', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>Novo Registro</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Título da Ameaça</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: SQL Injection" style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.6rem', color: 'white', borderRadius: '6px' }} />

            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Severidade</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.6rem', color: 'white', borderRadius: '6px' }}>
              <option>Crítica</option>
              <option>Alta</option>
              <option>Média</option>
              <option>Baixa</option>
            </select>

            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Ativo Afetado</label>
            <input value={asset} onChange={(e) => setAsset(e.target.value)} placeholder="Ex: Servidor Web" style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.6rem', color: 'white', borderRadius: '6px' }} />

            <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.6rem', color: 'white', borderRadius: '6px' }} />

            <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
              Registrar Vulnerabilidade
            </button>
          </form>
        </section>

        {/* LISTA DE CARDS */}
        <section>
          {loading ? (
            <p>Carregando dados do SOC...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {vulnerabilities.map((vuln) => (
                <div key={vuln.id} style={{ 
                  backgroundColor: '#0f172a', 
                  padding: '1.5rem', 
                  borderRadius: '16px', 
                  border: '1px solid #1e293b',
                  borderLeft: `6px solid ${
                    vuln.severity === 'Crítica' ? '#ef4444' : 
                    vuln.severity === 'Alta' ? '#f97316' : 
                    vuln.severity === 'Média' ? '#eab308' : '#22c55e'
                  }`,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ 
                      fontSize: '0.6rem', 
                      fontWeight: 'bold', 
                      padding: '2px 8px', 
                      borderRadius: '10px',
                      backgroundColor: vuln.severity === 'Crítica' ? '#450a0a' : '#431407',
                      color: vuln.severity === 'Crítica' ? '#fecaca' : '#fed7aa'
                    }}>
                      {vuln.severity.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#475569' }}>{new Date(vuln.created_at).toLocaleDateString()}</span>
                  </div>
                  <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: '#f1f5f9' }}>{vuln.title}</h2>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4', marginBottom: '1rem' }}>{vuln.description}</p>
                  <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <p style={{ margin: '0.2rem 0' }}>📍 ATIVO: <strong style={{ color: '#cbd5e1' }}>{vuln.asset_name}</strong></p>
                    <p style={{ margin: '0.2rem 0' }}>🔄 STATUS: <strong style={{ color: vuln.status === 'Pendente' ? '#f87171' : '#4ade80' }}>{vuln.status}</strong></p>
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