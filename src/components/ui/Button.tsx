import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import { motion } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type MotionButtonProps = Omit<HTMLMotionProps<'button'>, 'children'>;

interface ButtonProps extends MotionButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30',
  secondary: 'bg-secondary text-on-secondary hover:bg-secondary/90',
  outline: 'border border-outline text-on-surface hover:bg-surface-container',
  ghost: 'text-on-surface hover:bg-surface-container',
  danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className = '', ...props }, ref) => {
    const isPrimary = variant === 'primary' || variant === 'danger';

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, boxShadow: isPrimary ? "0 20px 40px -10px rgba(37, 99, 235, 0.35)" : undefined }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Shine effect for primary/danger buttons */}
        {isPrimary && !isLoading && !props.disabled && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut",
            }}
          />
        )}

        <span className="relative flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <motion.span
                className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Loading...
            </>
          ) : children}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
