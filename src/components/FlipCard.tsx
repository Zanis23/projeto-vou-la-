import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FlipCardProps {
    front: React.ReactNode;
    back: React.ReactNode;
    width?: string | number;
    height?: string | number;
    className?: string;
    trigger?: 'hover' | 'click';
}

export const FlipCard: React.FC<FlipCardProps> = ({
    front,
    back,
    width = '100%',
    height = '100%',
    className = '',
    trigger = 'hover'
}) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        if (trigger === 'click') {
            setIsFlipped(!isFlipped);
        }
    };

    const handleMouseEnter = () => {
        if (trigger === 'hover') setIsFlipped(true);
    };

    const handleMouseLeave = () => {
        if (trigger === 'hover') setIsFlipped(false);
    };

    // Card dimensions styles
    const containerStyle = {
        width,
        height,
        perspective: '1000px',
    };

    // Determine rotation based on state
    // We use a CSS class approach for the user's requested style, 
    // but here we can use framer-motion or inline styles for the "flip" logic 
    // to keep it compatible with the requested CSS model.
    // The user provided CSS uses: transform: rotateY(180deg);

    return (
        <div
            className={`flip-card-container relative group ${className}`}
            style={containerStyle}
            onClick={handleFlip}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                className="w-full h-full relative"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut", type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    {front}
                </div>

                {/* Back */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    {back}
                </div>
            </motion.div>
        </div>
    );
};
