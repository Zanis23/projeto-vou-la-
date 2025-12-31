import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    background: 'var(--bg-default)',
                    color: 'var(--text-primary)',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😔</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary-main)' }}>
                        Algo deu errado
                    </h1>
                    <p style={{ marginBottom: '2rem', opacity: 0.7 }}>
                        Estamos trabalhando para resolver o problema.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '1rem 2rem',
                            background: 'var(--primary-main)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Recarregar Página
                    </button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <pre style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            background: 'rgba(255,0,0,0.1)',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            textAlign: 'left',
                            maxWidth: '100%',
                            overflow: 'auto'
                        }}>
                            {this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
