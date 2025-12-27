import React from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';

interface QRCodeModuleProps {
    placeId: string;
    placeName: string;
}

export const QRCodeModule: React.FC<QRCodeModuleProps> = ({ placeId, placeName }) => {
    const { trigger } = useHaptic();
    const [copied, setCopied] = React.useState(false);

    // Using a simpler URL for the check-in
    const checkInUrl = `${window.location.origin}/check-in/${placeId}`;

    // SVG QR Code Generator (Simplified)
    // In a real app, we'd use 'qrcode.react' or similar, but for premium feel
    // we can use an API or a custom SVG builder here.
    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkInUrl)}&color=0E1121&bgcolor=FFFFFF&margin=2`;

    const handleCopy = () => {
        navigator.clipboard.writeText(checkInUrl);
        setCopied(true);
        trigger('success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        trigger('light');
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Check-in no ${placeName}`,
                    text: `Estou no ${placeName}! Vá lá também:`,
                    url: checkInUrl,
                });
            } catch (err) {
                console.log('Share failed', err);
            }
        }
    };

    return (
        <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 border border-[var(--border-default)] shadow-2xl relative overflow-hidden glass-card">
            <div className="flex flex-col items-center">
                <div className="mb-6 relative group">
                    <div className="absolute inset-0 bg-[var(--primary-main)] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="p-4 bg-white rounded-3xl shadow-xl relative z-10">
                        <img
                            src={qrImage}
                            alt="QR Code Check-in"
                            className="w-48 h-48"
                        />
                    </div>
                </div>

                <h3 className="text-xl font-black text-[var(--text-primary)] italic uppercase tracking-tight mb-2">QR Code de Check-in</h3>
                <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest text-center mb-8 max-w-[200px]">
                    Imprima e coloque em locais visíveis para seus clientes
                </p>

                <div className="grid grid-cols-2 gap-3 w-full">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopy}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-default)] hover:border-[var(--primary-main)]/30 transition-all group"
                    >
                        {copied ? <Check className="w-5 h-5 text-[var(--status-success)]" /> : <Copy className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--primary-main)]" />}
                        <span className="text-[9px] font-black uppercase text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]">Link</span>
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShare}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-default)] hover:border-[var(--primary-main)]/30 transition-all group"
                    >
                        <Share2 className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--primary-main)]" />
                        <span className="text-[9px] font-black uppercase text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]">Enviar</span>
                    </motion.button>
                </div>

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open(qrImage, '_blank')}
                    className="w-full mt-4 py-4 bg-[var(--primary-main)] text-[var(--primary-text)] rounded-2xl font-black uppercase text-xs shadow-xl shadow-[var(--primary-glow)] flex items-center justify-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Baixar QR Code (PNG)
                </motion.button>
            </div>

            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--primary-main)] opacity-[0.03] rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--primary-main)] opacity-[0.03] rounded-full blur-3xl"></div>
        </div>
    );
};
