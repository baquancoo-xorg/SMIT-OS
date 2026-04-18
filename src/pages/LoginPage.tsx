import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Shield, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Floating orb component for background
const FloatingOrb = ({
  size,
  color,
  initialX,
  initialY,
  duration
}: {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  duration: number;
}) => (
  <motion.div
    className="absolute rounded-full blur-3xl opacity-40"
    style={{
      width: size,
      height: size,
      background: color,
      left: `${initialX}%`,
      top: `${initialY}%`,
    }}
    animate={{
      x: [0, 100, -50, 0],
      y: [0, -80, 50, 0],
      scale: [1, 1.2, 0.9, 1],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Animated grid lines for background
const GridPattern = () => (
  <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, #2563EB 1px, transparent 1px),
          linear-gradient(to bottom, #2563EB 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  </div>
);

// Feature item component
const FeatureItem = ({
  icon: Icon,
  text,
  delay
}: {
  icon: React.ElementType;
  text: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5, ease: "easeOut" }}
    className="flex items-center gap-3 text-white/80"
  >
    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-sm font-medium">{text}</span>
  </motion.div>
);

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (!result.success) {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      {/* Left Panel - Welcome Section */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-12 flex-col justify-between overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <FloatingOrb size={400} color="rgba(99, 102, 241, 0.6)" initialX={-10} initialY={20} duration={20} />
          <FloatingOrb size={300} color="rgba(59, 130, 246, 0.5)" initialX={60} initialY={60} duration={25} />
          <FloatingOrb size={200} color="rgba(147, 197, 253, 0.4)" initialX={80} initialY={10} duration={18} />
          <FloatingOrb size={150} color="rgba(199, 210, 254, 0.3)" initialX={30} initialY={80} duration={22} />
        </div>

        <GridPattern />

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "easeInOut",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">SMIT OS</span>
          </motion.div>
        </div>

        <motion.div
          className="relative z-10 space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate={isPageLoaded ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              The Kinetic
              <br />
              <span className="bg-gradient-to-r from-blue-200 via-cyan-200 to-white bg-clip-text text-transparent">
                Workspace
              </span>
            </h1>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-lg text-white/70 max-w-md leading-relaxed"
          >
            Nền tảng quản lý dự án thông minh, giúp team của bạn làm việc hiệu quả và sáng tạo hơn mỗi ngày.
          </motion.p>

          <motion.div variants={itemVariants} className="space-y-4 pt-4">
            <FeatureItem icon={Zap} text="Quản lý task thông minh với AI" delay={0.6} />
            <FeatureItem icon={Sparkles} text="Dashboard thời gian thực" delay={0.7} />
            <FeatureItem icon={ArrowRight} text="Tích hợp đa nền tảng" delay={0.8} />
          </motion.div>
        </motion.div>

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p className="text-white/40 text-sm">© 2026 SMIT OS. All rights reserved.</p>
        </motion.div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
        {/* Decorative floating shapes */}
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 rounded-full bg-gradient-to-br from-primary/5 to-indigo-500/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-gradient-to-tr from-cyan-500/5 to-blue-500/5 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Subtle background pattern for right panel */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #2563EB 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <motion.div
          className="w-full max-w-md relative z-10"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo & Branding - Responsive */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 mb-5 shadow-xl shadow-primary/30 relative"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 20px 40px -10px rgba(37, 99, 235, 0.3)",
                  "0 25px 50px -10px rgba(37, 99, 235, 0.4)",
                  "0 20px 40px -10px rgba(37, 99, 235, 0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Shield className="w-10 h-10 text-white" />
              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-white/20"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            </motion.div>
            <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SMIT OS
            </h1>
            <p className="text-slate-500 mt-1 text-sm lg:hidden">The Kinetic Workspace</p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-white/50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
              <p className="text-slate-500 text-sm mt-2">Sign in to continue your workspace</p>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-4"
                >
                  <p className="text-red-600 text-sm font-medium text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Username
                </label>
                <motion.input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white transition-all duration-200"
                  required
                  autoComplete="username"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <motion.input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white transition-all duration-200"
                    required
                    autoComplete="current-password"
                    whileFocus={{ scale: 1.01 }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="pt-2"
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed group"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(37, 99, 235, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Shine effect on button */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={!loading ? { x: '200%' } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  />

                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <motion.div
                          initial={{ x: 0 }}
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight size={18} />
                        </motion.div>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>

          {/* Footer for desktop */}
          <motion.p
            className="hidden lg:block text-center text-xs text-slate-400 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Need help? Contact Admin
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
