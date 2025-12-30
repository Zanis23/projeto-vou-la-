import React from 'react';
import { Loader2, Check, CreditCard, Wallet, DollarSign } from 'lucide-react';


interface PayButtonProps {
    onClick: () => void;
    isLoading?: boolean;
    text?: string;
    success?: boolean;
    className?: string;
    disabled?: boolean;
}

export const PayButton: React.FC<PayButtonProps> = ({
    onClick,
    isLoading = false,
    text = "Pagar Agora",
    success = false,
    className = "",
    disabled = false
}) => {

    // We can inject the styles via a style tag or assume they are global. 
    // For encapsulation, we'll put the critical keyframes here or assume title "Pay Button Animation".
    // Given the request was specific CSS, we will try to replicate the structure.

    return (
        <>
            <style>
                {`
                @keyframes iconRotate {
                    0% { opacity: 0; visibility: hidden; transform: translateY(10px) scale(0.5); }
                    5% { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }
                    15% { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }
                    20% { opacity: 0; visibility: hidden; transform: translateY(-10px) scale(0.5); }
                    100% { opacity: 0; visibility: hidden; transform: translateY(-10px) scale(0.5); }
                }
                @keyframes checkmarkAppear {
                    0% { opacity: 0; transform: scale(0.5) rotate(-45deg); }
                    50% { opacity: 0.5; transform: scale(1.2) rotate(0deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                .pay-btn:hover .card-icon { animation: iconRotate 2.5s infinite; animation-delay: 0s; }
                .pay-btn:hover .payment-icon { animation: iconRotate 2.5s infinite; animation-delay: 0.5s; }
                .pay-btn:hover .dollar-icon { animation: iconRotate 2.5s infinite; animation-delay: 1s; }
                .pay-btn:hover .check-icon { animation: iconRotate 2.5s infinite; animation-delay: 1.5s; }
                `}
            </style>

            <button
                onClick={onClick}
                disabled={disabled || isLoading || success}
                className={`pay-btn flex items-center justify-center gap-3 relative px-6 py-4 rounded-xl font-bold bg-[#1a1a1a] text-white border border-white/10 overflow-hidden transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            >
                {/* Icons Container */}
                <div className="icon-container relative w-6 h-6">
                    {/* Default Icon */}
                    <div className={`icon default-icon transition-all duration-300 ${isLoading || success ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
                        <Wallet className="w-6 h-6 text-white" />
                    </div>

                    {/* Hover Animation Icons */}
                    {!isLoading && !success && (
                        <>
                            <div className="icon card-icon text-indigo-400"><CreditCard className="w-6 h-6" /></div>
                            <div className="icon payment-icon text-purple-400"><Wallet className="w-6 h-6" /></div>
                            <div className="icon dollar-icon text-green-400"><DollarSign className="w-6 h-6" /></div>
                            <div className="icon check-icon text-primary-main"><Check className="w-6 h-6" /></div>
                        </>
                    )}

                    {/* Success Icon */}
                    {success && (
                        <div className="absolute inset-0 flex items-center justify-center animate-[checkmarkAppear_0.6s_ease_forwards]">
                            <Check className="w-8 h-8 text-green-500 stroke-[3px]" />
                        </div>
                    )}

                    {/* Loading Spinner */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-primary-main animate-spin" />
                        </div>
                    )}
                </div>

                {/* Text */}
                <span className="btn-text text-sm uppercase tracking-wider">
                    {success ? 'Pago!' : isLoading ? 'Processando...' : text}
                </span>
            </button>
        </>
    );
};
