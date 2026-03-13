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
    supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (session) fetchVulnerabilities()
    })
  }, [])

  async function fetchVulnerabilities() {
    setLoading(true)
    const { data, error } = await supabase.from('vulnerabilities').select('*').order('created_at', { ascending: false })
    if (!error) setVulnerabilities(data || [])
    setLoading(false)
  }

  // ESTATÍSTICAS PROFISSIONAIS COM GRÁFICOS MINIMALISTAS (ABRE EM NOVA ABA)
  function openStats() {
    const total = vulnerabilities.length;
    const uniqueClients = [...new Set(vulnerabilities.map(v => v.client_name))];
    const clientData = uniqueClients.map(name => ({
      name,
      count: vulnerabilities.filter(v => v.client_name === name).length
    })).sort((a, b) => b.count - a.count);

    const statsWin = window.open('', '_blank');
    if (!statsWin) return;
    statsWin.document.write(`
      <html>
        <head>
          <title>CTRL SOC - Analytics Dashboard</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { background: #020617; color: #f8fafc; font-family: 'Inter', sans-serif; padding: 50px; margin: 0; }
            .header-stats { border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 40px; display: flex; align-items: center; gap: 15px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 50px; }
            .kpi-card { background: #0a0a0a; padding: 30px; border-radius: 16px; border: 1px solid #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .kpi-value { font-size: 3rem; font-weight: 900; color: #2563eb; display: block; margin-bottom: 5px; }
            .kpi-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 2px; }
            .chart-section { background: #0a0a0a; padding: 40px; border-radius: 16px; border: 1px solid #1e293b; }
            .chart-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 30px; color: #fff; }
            .bar-row { margin-bottom: 25px; }
            .bar-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; font-weight: 600; }
            .bar-bg { background: #1e293b; height: 12px; border-radius: 6px; overflow: hidden; width: 100%; }
            .bar-fill { background: linear-gradient(90deg, #2563eb, #3b82f6); height: 100%; border-radius: 6px; transition: width 1s ease-in-out; }
            .client-name { color: #94a3b8; }
            .count-val { color: #3b82f6; }
          </style>
        </head>
        <body>
          <div class="header-stats">
            <span style="font-size: 2.5rem;">🛡️</span>
            <div>
              <h1 style="margin: 0; font-size: 1.5rem; letter-spacing: 1px;">CTRL <span style="color:#2563eb">SOC</span> ANALYTICS</h1>
              <p style="margin: 5px 0 0 0; font-size: 0.75rem; color: #475569;">RELATÓRIO DE INTELIGÊNCIA EM TEMPO REAL</p>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <span class="kpi-value">${total}</span>
              <span class="kpi-label">Total de Vulnerabilidades</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-value">${uniqueClients.length}</span>
              <span class="kpi-label">Clientes Ativos</span>
            </div>
          </div>

          <div class="chart-section">
            <div class="chart-title">Distribuição de Ameaças por Cliente</div>
            ${clientData.map(d => {
              const percentage = total > 0 ? (d.count / total) * 100 : 0;
              return `
                <div class="bar-row">
                  <div class="bar-info">
                    <span class="client-name">${d.name.toUpperCase()}</span>
                    <span class="count-val">${d.count} OCORRÊNCIAS</span>
                  </div>
                  <div class="bar-bg">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          
          <p style="margin-top: 50px; text-align: center; color: #1e293b; font-size: 0.7rem;">© CTRL SEGURANÇA DIGITAL - TERMINAL ANALÍTICO</p>
        </body>
      </html>
    `);
    statsWin.document.close();
  }

  // PDF VERSÃO 4 (PADRÃO PROFISSIONAL APROVADO)
  function handlePrint(vuln: any) {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 0; margin: 0; color: #1a202c; background: #fff; }
            .top-bar { background: #000; color: #fff; padding: 40px 60px; display: flex; justify-content: space-between; align-items: center; }
            .logo-pdf { font-size: 24px; font-weight: 800; letter-spacing: 1px; }
            .logo-pdf span { color: #2563eb; }
            .container { padding: 60px; }
            .report-title { font-size: 32px; font-weight: 800; margin: 0 0 40px 0; color: #000; border-bottom: 8px solid #2563eb; display: inline-block; }
            .data-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .data-table td { border: 1px solid #edf2f7; padding: 15px; font-size: 13px; }
            .data-table .label { background: #f8fafc; font-weight: 600; color: #4a5568; width: 30%; }
            .section-header { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #2563eb; margin: 40px 0 15px 0; display: flex; align-items: center; }
            .content-text { font-size: 15px; color: #2d3748; line-height: 1.8; background: #f8fafc; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; }
            footer { position: fixed; bottom: 0; width: 100%; background: #f8fafc; padding: 20px 0; font-size: 9px; text-align: center; color: #a0aec0; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="top-bar"><div class="logo-pdf">🛡️ CTRL <span>SEGURANÇA DIGITAL</span></div><div style="font-size: 10px;">SOC TERMINAL v2.0</div></div>
          <div class="container">
            <h1 class="report-title">Relatório de Vulnerabilidade</h1>
            <table class="data-table">
              <tr><td class="label">CLIENTE</td><td style="font-weight: 800;">${vuln.client_name.toUpperCase()}</td></tr>
              <tr><td class="label">ATIVO MONITORADO</td><td>${vuln.asset_name || 'N/A'}</td></tr>
              <tr><td class="label">DATA</td><td>${new Date().toLocaleDateString('pt-BR')}</td></tr>
            </table>
            <div class="section-header">Descrição Técnica</div>
            <div class="content-text">${vuln.title}</div>
            <div class="section-header">Recomendação Técnica</div>
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-top: 15px; border: 1px solid #bfdbfe; color: #1e40af;">
              ${vuln.recommendation || 'Aguardando parecer técnico.'}
            </div>
          </div>
          <footer>© Todos os direitos reservados. CTRL Segurança Digital.</footer>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !client) return alert("Preencha Cliente e Título.")
    const payload = { title, asset_name: asset, client_name: client, recommendation }
    if (editId) {
      await supabase.from('vulnerabilities').update(payload).eq('id', editId)
      setEditId(null); clearForm(); fetchVulnerabilities();
    } else {
      await supabase.from('vulnerabilities').insert([payload])
      clearForm(); fetchVulnerabilities();
    }
  }

  function startEdit(vuln: any) {
    setEditId(vuln.id); setTitle(vuln.title); setAsset(vuln.asset_name); setClient(vuln.client_name); setRecommendation(vuln.recommendation || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function clearForm() { setEditId(null); setTitle(''); setAsset(''); setClient(''); setRecommendation(''); }

  if (!session) {
    return (
      <main style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '3.5rem', borderRadius: '15px', border: '1px solid #334155', width: '380px', textAlign: 'center' }}>
          <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
             <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🛡️</div>
             <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: 0 }}>CTRL <span style={{color: '#2563eb'}}>SOC</span></h1>
             <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '10px' }}>Acesso Restrito</p>
          </header>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder="E-mail" onChange={e => setEmail(e.target.value)} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} required />
            <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} required />
            <button type="submit" style={{ padding: '14px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>CONECTAR</button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', padding: '2.5rem', fontFamily: 'sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', borderBottom: '1px solid #1a1a1a', paddingBottom: '20px' }}>
        <div>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🛡️</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: 0 }}>CTRL <span style={{color: '#3b82f6'}}>SOC</span></h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px' }}>Analista SOC: Jarlon Batista</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={openStats} style={{ background: '#1e293b', color: '#fff', border: '1px solid #333', padding: '10px 15px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}>ESTATÍSTICAS</button>
          <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: '1px solid #222', color: '#888', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>LOGOUT</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '3rem' }}>
        <section style={{ backgroundColor: '#0a0a0a', padding: '2.5rem', borderRadius: '15px', border: editId ? '2px solid #eab308' : '1px solid #1a1a1a', height: 'fit-content' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: '800', color: editId ? '#eab308' : '#2563eb', marginBottom: '20px', letterSpacing: '1px' }}>
            {editId ? 'ATUALIZAR OCORRÊNCIA' : 'REGISTRAR OCORRÊNCIA TÉCNICA'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input value={client} onChange={e => setClient(e.target.value)} placeholder="Cliente" style={{ padding: '12px', background: '#000', color: '#fff', border: '1px solid #222', borderRadius: '8px' }} />
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da Ocorrência" style={{ padding: '12px', background: '#000', color: '#fff', border: '1px solid #222', borderRadius: '8px' }} />
            <input value={asset} onChange={e => setAsset(e.target.value)} placeholder="Host / IP" style={{ padding: '12px', background: '#000', color: '#fff', border: '1px solid #222', borderRadius: '8px' }} />
            <textarea value={recommendation} onChange={e => setRecommendation(e.target.value)} placeholder="Recomendação..." rows={6} style={{ padding: '12px', background: '#000', color: '#fff', border: '1px solid #1e3a8a', borderRadius: '8px', fontSize: '0.9rem' }} />
            <button type="submit" style={{ padding: '14px', background: editId ? '#eab308' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {editId ? 'ATUALIZAR' : 'SALVAR NO SOC'}
            </button>
          </form>
        </section>

        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {vulnerabilities.map((v) => (
              <div key={v.id} style={{ background: '#0a0a0a', padding: '1.8rem', borderRadius: '15px', border: '1px solid #111', borderLeft: '4px solid #2563eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#eee', fontWeight: 'bold', textTransform: 'uppercase' }}>{v.client_name}</span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={() => startEdit(v)} style={{ color: '#eab308', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 'bold' }}>EDITAR</button>
                    <button onClick={() => handlePrint(v)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 'bold' }}>PDF</button>
                    <button onClick={async () => { if(confirm('Apagar?')) await supabase.from('vulnerabilities').delete().eq('id', v.id); fetchVulnerabilities(); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                  </div>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: '0 0 10px 0' }}>{v.title}</h3>
                <div style={{ background: '#000', padding: '15px', borderRadius: '8px', fontSize: '0.8rem', color: '#888' }}>
                  {v.recommendation || 'Pendente...'}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer style={{ marginTop: '5rem', borderTop: '1px solid #111', paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.7rem', color: '#475569' }}>© Todos os direitos reservados. CTRL Segurança Digital.</p>
      </footer>
    </main>
  )
}