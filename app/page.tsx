'use client'

export default function LandingPage() {
  return (
    <main style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 10%', alignItems: 'center', borderBottom: '1px solid #1e293b', backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🛡️</span>
          <h2 style={{ color: '#fff', fontWeight: '900', margin: 0, fontSize: '1.3rem', letterSpacing: '-1px' }}>
            CTRL <span style={{color: '#3b82f6'}}>Segurança Digital</span>
          </h2>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', alignItems: 'center' }}>
          <a href="#servicos" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500' }}>SERVIÇOS</a>
          <a href="/dashboard" style={{ padding: '8px 16px', border: '1px solid #3b82f6', borderRadius: '6px', color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.75rem' }}>ACESSO RESTRITO</a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', padding: '120px 10% 80px 10%', background: 'radial-gradient(circle at center, #1e293b 0%, #020617 70%)' }}>
        <div style={{ marginBottom: '20px' }}>
          <span style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '4px', border: '1px solid #3b82f6', padding: '5px 15px', borderRadius: '20px' }}>
            Inteligência Cibernética Avançada
          </span>
        </div>
        <h1 style={{ fontSize: '3.8rem', fontWeight: '900', marginTop: '1.5rem', lineHeight: '1.1', letterSpacing: '-2px' }}>
          Blindamos o seu negócio <br/> contra ameaças digitais.
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: '750px', margin: '2.5rem auto', fontSize: '1.25rem', lineHeight: '1.6' }}>
          Consultoria especializada em <b>Segurança da Informação</b>. Pentests, auditorias e monitoramento SOC liderados pelo Analista Jarlon Batista.
        </p>
        <div style={{ marginTop: '3rem' }}>
           <a href="mailto:contato@ctrlsegurancadigital.com.br" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '18px 35px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem' }}>
             SOLICITAR CONSULTORIA
           </a>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer style={{ backgroundColor: '#000', padding: '60px 10% 30px 10%', borderTop: '1px solid #1e293b' }}>
        <div style={{ borderTop: '1px solid #0f172a', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#475569', letterSpacing: '1px' }}>
            © Todos os direitos reservados. CTRL Segurança Digital.
          </p>
        </div>
      </footer>
    </main>
  )
}