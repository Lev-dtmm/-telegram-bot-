import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function StatusPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#fff',
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Business Advisor AI
        </h1>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          borderRadius: '999px',
          padding: '0.4rem 1.2rem',
          marginBottom: '1.5rem',
        }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 8px #22c55e',
            display: 'inline-block',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: '0.9rem', color: '#86efac' }}>Bot en ligne</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
          Ton assistant business IA est actif sur Telegram 24h/24.
          Retrouve-le pour des conseils en entrepreneuriat, stratégie, marketing et ventes.
        </p>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusPage />
    </QueryClientProvider>
  );
}
