'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type FaceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'concerned';

const STATE_COLORS: Record<FaceState, { body: string; cheek: string }> = {
  idle: { body: '#3FCB9C', cheek: '#ABEBD3' },
  listening: { body: '#52AEF5', cheek: '#B6DFFD' },
  thinking: { body: '#3FCB9C', cheek: '#ABEBD3' },
  speaking: { body: '#1FB088', cheek: '#74DDB8' },
  concerned: { body: '#F2940B', cheek: '#FFB23F' },
};

export function AssistantFace({
  state = 'idle',
  className,
}: {
  state?: FaceState;
  className?: string;
}) {
  const colors = STATE_COLORS[state];

  return (
    <div className={cn('relative h-40 w-40 sm:h-48 sm:w-48', className)}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: colors.body, opacity: 0.18 }}
        animate={state === 'listening' ? { scale: [1, 1.18, 1] } : { scale: 1 }}
        transition={{ duration: 1.6, repeat: state === 'listening' ? Infinity : 0, ease: 'easeInOut' }}
      />
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full drop-shadow-glass"
        animate={
          state === 'idle' || state === 'thinking'
            ? { y: [0, -4, 0] }
            : { y: 0 }
        }
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Face base */}
        <motion.circle
          cx="100"
          cy="100"
          r="78"
          fill={colors.body}
          animate={{ fill: colors.body }}
          transition={{ duration: 0.4 }}
        />
        <circle cx="100" cy="100" r="78" fill="white" opacity="0.08" />

        {/* Cheeks */}
        <circle cx="58" cy="118" r="11" fill={colors.cheek} opacity="0.7" />
        <circle cx="142" cy="118" r="11" fill={colors.cheek} opacity="0.7" />

        {/* Eyes */}
        <AnimatePresence mode="wait">
          {state === 'concerned' ? (
            <motion.g key="concerned-eyes" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <line x1="68" y1="86" x2="84" y2="92" stroke="#0B2B2A" strokeWidth="5" strokeLinecap="round" />
              <line x1="132" y1="86" x2="116" y2="92" stroke="#0B2B2A" strokeWidth="5" strokeLinecap="round" />
            </motion.g>
          ) : (
            <motion.g key="normal-eyes" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.ellipse
                cx="76"
                cy="92"
                rx="7"
                ry="9"
                fill="#0B2B2A"
                animate={{ scaleY: [1, 1, 0.1, 1, 1, 1] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.92, 0.95, 0.98, 1, 1] }}
              />
              <motion.ellipse
                cx="124"
                cy="92"
                rx="7"
                ry="9"
                fill="#0B2B2A"
                animate={{ scaleY: [1, 1, 0.1, 1, 1, 1] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.92, 0.95, 0.98, 1, 1] }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Mouth */}
        {state === 'speaking' ? (
          <motion.ellipse
            cx="100"
            cy="132"
            rx="16"
            ry="10"
            fill="#0B2B2A"
            animate={{ ry: [6, 13, 7, 12, 6] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : state === 'concerned' ? (
          <path d="M 82 138 Q 100 126 118 138" stroke="#0B2B2A" strokeWidth="5" fill="none" strokeLinecap="round" />
        ) : state === 'thinking' ? (
          <motion.line
            x1="86"
            y1="132"
            x2="114"
            y2="132"
            stroke="#0B2B2A"
            strokeWidth="5"
            strokeLinecap="round"
            animate={{ x2: [114, 124, 114] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <path d="M 82 128 Q 100 144 118 128" stroke="#0B2B2A" strokeWidth="5" fill="none" strokeLinecap="round" />
        )}

        {/* Listening pulse rings */}
        {state === 'listening' && (
          <motion.circle
            cx="100"
            cy="100"
            r="78"
            fill="none"
            stroke="#2C8FE8"
            strokeWidth="3"
            animate={{ r: [78, 95], opacity: [0.6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.svg>
    </div>
  );
}
