import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '6rem', margin: 0, fontWeight: 'bold' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginTop: '1rem', marginBottom: '1rem' }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        href="/"
        style={{
          padding: '1rem 2rem',
          background: 'white',
          color: '#667eea',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '1rem',
          transition: 'transform 0.2s'
        }}
      >
        Return Home
      </Link>
    </div>
  );
}
