import React, { SVGProps } from 'react';
import { motion } from 'framer-motion';

export const Logo: React.FC<SVGProps<SVGSVGElement>> = ({ className, ...props }) => {
  const motionProps = props as any;
  return (
    <motion.svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...motionProps}
    >
      {/* Base V Shape */}
      <motion.path
        d="M25 25 L50 80 L75 25"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* Neon Accent */}
      <motion.path
        d="M50 80 L75 25"
        stroke="var(--primary-main)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: [0.3, 1, 0.3],
          filter: [
            "drop-shadow(0 0 2px var(--primary-main))",
            "drop-shadow(0 0 12px var(--primary-main))",
            "drop-shadow(0 0 2px var(--primary-main))"
          ]
        }}
        transition={{
          pathLength: { duration: 1, delay: 0.5 },
          opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          filter: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      />
    </motion.svg>
  );
};
