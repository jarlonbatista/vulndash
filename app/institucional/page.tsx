'use client'

export default function LandingPage() {
  return (
    <main style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* NAVBAR LIMPA (SEM LINK PARA O SOC) */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 10%', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
        <h2 style={{ color: '#3b82f6', fontWeight: '900', margin: 0 }}>CTRL <span style={{color: '#fff'}}>Segurança Digital</span></h2>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
          <a href="#servicos" style={{ color: '#94a3b8', textDecoration: 'none' }}>Serviços</a>
          <a href="#metodologia" style={{ color: '#94a3b8', textDecoration: 'none' }}>Metodologia</a>
          <a href="mailto:contato@ctrlsegurancadigital.com.br" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>Solicitar Consultoria</a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', padding: '100px 10%' }}>
        <span style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px' }}>Inteligência em Defesa Cibernética</span>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginTop: '1rem', lineHeight: '1.1' }}>
          Protegendo o Ativo Mais <br/> Valioso da sua Empresa: Os Dados.
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: '700px', margin: '2rem auto', fontSize: '1.2rem' }}>
          Consultoria especializada em Pentest, análise de vulnerabilidades e adequação à LGPD. Estratégia de segurança sob medida para o seu negócio.
        </p>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" style={{ padding: '80px 10%', backgroundColor: '#0f172a' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '2rem', borderRadius: '12px', border: '1px solid #1e293b', background: '#020617' }}>
            <h3 style={{ color: '#3b82f6' }}>Auditoria e Pentest</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Identificação proativa de brechas em sistemas e redes antes que sejam exploradas.</p>
          </div>
          <div style={{ padding: '2rem', borderRadius: '12px', border: '1px solid #1e293b', background: '#020617' }}>
            <h3 style={{ color: '#3b82f6' }}>Consultoria Estratégica</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Implementação de políticas de segurança e treinamento de pessoal (Security Awareness).</p>
          </div>
          <div style={{ padding: '2rem', borderRadius: '12px', border: '1px solid #1e293b', background: '#020617' }}>
            <h3 style={{ color: '#3b82f6' }}>Resposta a Incidentes</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Suporte rápido em caso de invasões ou vazamentos, minimizando o impacto operacional.</p>
          </div>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '40px', borderTop: '1px solid #1e293b', fontSize: '0.8rem', color: '#475569' }}>
        © 2026 CTRL Segurança Digital | Breves, Pará.
      </footer>
    </main>
  )
}