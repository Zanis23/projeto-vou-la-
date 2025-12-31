import { useRegisterSW } from 'virtual:pwa-register/react';
import { X, RefreshCw } from 'lucide-react';

export function PWAUpdateNotification() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('[PWA] Service Worker registered:', r);
        },
        onRegisterError(error) {
            console.error('[PWA] Service Worker registration error:', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    const handleUpdate = () => {
        updateServiceWorker(true);
    };

    if (!offlineReady && !needRefresh) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                left: '20px',
                maxWidth: '400px',
                margin: '0 auto',
                background: 'linear-gradient(135deg, #0E1121 0%, #1a1d35 100%)',
                border: '2px solid #ccff00',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                zIndex: 9999,
                animation: 'slideUp 0.3s ease-out',
            }}
        >
            <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                    {offlineReady && (
                        <>
                            <div style={{ color: '#ccff00', fontWeight: 'bold', marginBottom: '4px' }}>
                                ✅ App pronto para funcionar offline!
                            </div>
                            <div style={{ color: '#e0e0e0', fontSize: '14px' }}>
                                Você pode usar o app mesmo sem internet agora.
                            </div>
                        </>
                    )}

                    {needRefresh && (
                        <>
                            <div style={{ color: '#ccff00', fontWeight: 'bold', marginBottom: '4px' }}>
                                🎉 Nova versão disponível!
                            </div>
                            <div style={{ color: '#e0e0e0', fontSize: '14px', marginBottom: '12px' }}>
                                Clique em atualizar para obter as últimas melhorias.
                            </div>
                            <button
                                onClick={handleUpdate}
                                style={{
                                    background: '#ccff00',
                                    color: '#0E1121',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '14px',
                                }}
                            >
                                <RefreshCw size={16} />
                                Atualizar Agora
                            </button>
                        </>
                    )}
                </div>

                <button
                    onClick={close}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#999',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
