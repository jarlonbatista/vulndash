'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [session, setSession] = useState<any>(null)
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [asset, setAsset] = useState('')
  const [client, setClient] = useState('')
  const [recommendation, setRecommendation] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (session) fetchVulnerabilities()
    })
  }, [])

  async function fetchVulnerabilities() {
    const { data, error } = await supabase.from('vulnerabilities').select('*').order('created_at', { ascending: false })
    if (!error) setVulnerabilities(data || [])
  }

  // ESTATÍSTICAS
  function openStats() {
    const total = vulnerabilities.length;
    const statsWin = window.open('', '_blank');
    if (!statsWin) return;
    statsWin.document.write(`<html><body style="background:#020617;color:white;font-family:sans-serif;padding:40px;"><h1>📊 Inteligência SOC</h1><div style="background:#0f172a;padding:20px;border-radius:10px;border:1px solid #1e293b;"><h2>Total: ${total} Vulnerabilidades</h2></div></body></html>`);
    statsWin.document.close();
  }

  // PDF VERSÃO APROVADA
  function handlePrint(vuln: any) {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 50px; color: #1a202c; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #000; padding-bottom: 20px; }
            .logo { font-size: 22px; font-weight: 800; }
            .logo span { color: #2563eb; }
            .table-box { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .table-box td { border: 1px solid #edf2f7; padding: 14px; font-size: 13px; }
            .label { background: #f7fafc; font-weight: bold; width: 30%; }
            .content-area { font-size: 15px; color: #2d3748; margin-top: 15px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
            footer { position: fixed; bottom: 40px; width: 85%; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 10px; text-align: center; color: #a0aec0; }
          </style>
        </head>
        <body>
          <div class="header"><div class="logo">🛡️ CTRL <span>SEGURANÇA DIGITAL</span></div><div style="font-size: 11px;">#${vuln.id.substring(0,8).toUpperCase()}</div></div>
          <h1 style="font-size: 26px; font-weight: 800; margin-top: 40px;">Relatório de Vulnerabilidade</h1>
          <table class="table-box">
            <tr><td class="label">CLIENTE</td><td style="font-weight:bold;">${vuln.client_name}</td></tr>
            <tr><td class="label">ATIVO</td><td>${vuln.asset_name || 'N/A'}</td></tr>
            <tr><td class="label">DATA</td><td>${new Date().toLocaleDateString('pt-BR')}</td></tr>
          </table>
          <div class="content-area"><strong>Descrição:</strong><br/>${vuln.title}</div>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-top: 15px; border: 1px solid #bbf7d0; color: #166534;">
            <strong>Mitigação:</strong><br/>${vuln.recommendation || 'Aguardando parecer.'}
          </div>
          <footer>Confidencial - CTRL Segurança Digital</footer>
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
    if (!title || !client) return alert("Preencha os campos!")
    const payload = { title, asset_name: asset, client_name: client, recommendation }
    if (editId) {
      await supabase.from('vulnerabilities').update(payload).eq('id', editId)
      setEditId(null); clearForm(); fetchVulnerabilities();
    } else {
      await supabase.from('vulnerabilities').insert([payload])
      clearForm(); fetchVulnerabilities();
    }
  }

  function clearForm() { setEditId(null); setTitle(''); setAsset(''); setClient(''); setRecommendation(''); }

  if (!session) {
    return (
      <main style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '3.5rem', borderRadius: '15px', border: '1px solid #334155', width: '380px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🛡️</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>CTRL <span style={{color: '#3b82f6'}}>SOC</span></h1>
          <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2rem' }}>Acesso Restrito</p>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder="E-mail" onChange={e => setEmail(e.target.value)} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} required />
            <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white' }} required />
            <button type="submit" style={{ padding: '14px', borderRadius: '8px', background: '#2563eb', color: 'white', fontWeight: 'bold', border: 'none' }}>CONECTAR</button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', padding: '2.5rem', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🛡️</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: 0 }}>CTRL <span style={{color: '#3b82f6'}}>SOC</span></h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px' }}>Analista SOC: Jarlon Batista</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={openStats} style={{ background: '#1e293b', color: '#fff', border: '1px solid #333', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem' }}>ESTATÍSTICAS</button>
          <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: '1px solid #222', color: '#888', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem' }}>LOGOUT</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '3rem' }}>
        <section style={{ backgroundColor: '#1e293b', padding: '2.5rem', borderRadius: '20px', border: editId ? '2px solid #eab308' : '1px solid #334155', height: 'fit-content' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: '900', color: editId ? '#eab308' : '#2563eb', marginBottom: '25px', textTransform: 'uppercase' }}>
            {editId ? 'Atualizar Ocorrência' : 'Registrar Ocorrência Técnica'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input value={client} onChange={e => setClient(e.target.value)} placeholder="Cliente" style={{ padding: '12px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }} />
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" style={{ padding: '12px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px' }} />
            <textarea value={recommendation} onChange={e => setRecommendation(e.target.value)} placeholder="Recomendação..." rows={6} style={{ padding: '12px', background: '#0f172a', color: '#fff', border: '1px solid #3b82f6', borderRadius: '8px' }} />
            <button type="submit" style={{ padding: '14px', background: editId ? '#eab308' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>SALVAR</button>
          </form>
        </section>

        <section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {vulnerabilities.map((v) => (
              <div key={v.id} style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '20px', border: '1px solid #334155', borderLeft: '4px solid #3b82f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#eee', fontWeight: 'bold' }}>{v.client_name}</span>
                  <div style={{ gap: '12px', display: 'flex' }}>
                    <button onClick={() => {setEditId(v.id); setTitle(v.title); setClient(v.client_name); setRecommendation(v.recommendation || '')}} style={{ color: '#eab308', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>EDIT</button>
                    <button onClick={() => handlePrint(v)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>PDF</button>
                    <button onClick={async () => { if(confirm('Apagar?')) await supabase.from('vulnerabilities').delete().eq('id', v.id); fetchVulnerabilities(); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                  </div>
                </div>
                <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{v.title}</h3>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer style={{ marginTop: '5rem', borderTop: '1px solid #1e293b', paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.7rem', color: '#475569' }}>© Todos os direitos reservados. CTRL Segurança Digital.</p>
      </footer>
    </main>
  )
}