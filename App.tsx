import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Share2, Copy, RefreshCw, Loader2, Info } from 'lucide-react';
import { getOracleReading } from './services/geminiService';
import { OracleResult, COIN_THEMES, DEFAULT_THEME } from './types';

function Typewriter({ text, delay = 50 }: { text: string; delay?: number }) {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <span>{currentText}</span>;
}

type Screen = 'entry' | 'loading' | 'result';

export default function App() {
  const [screen, setScreen] = useState<Screen | 'error'>('entry');
  const [words, setWords] = useState(['', '', '']);
  const [result, setResult] = useState<OracleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState('Consulting the blockchain orakle...');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const loadingPhrases = [
    "Consulting the blockchain orakle...",
    "Reading your digital aura...",
    "Decrypting personality hashes...",
    "Sifting through the mempool of your soul...",
    "Aligning with the genesis block...",
  ];

  useEffect(() => {
    if (screen === 'loading') {
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % loadingPhrases.length;
        setLoadingText(loadingPhrases[i]);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [screen]);

  const handleInputChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value.slice(0, 20).trim();
    setWords(newWords);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (index < 2) {
        inputRefs[index + 1].current?.focus();
      } else if (words.every(w => w.length > 0)) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    if (words.some(w => w.length === 0)) return;
    if (!hasGeminiKey) {
      setError("Missing GEMINI_API_KEY. Add it to .env.local and restart the server.");
      setScreen('error');
      return;
    }
    
    setScreen('loading');
    setError(null);

    try {
      const data = await getOracleReading(words);
      if (!data.is_valid) {
        setError(data.error_message || "The orakle only reads the soul. Please provide words that describe your inner self.");
        setScreen('error');
        return;
      }
      setResult(data);
      setScreen('result');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "The orakle encountered a network disturbance. Please try again.");
      setScreen('error');
    }
  };

  const getTheme = (coinName: string) => {
    const lower = coinName.toLowerCase();
    const key = Object.keys(COIN_THEMES).find(k => lower.includes(k));
    return key ? COIN_THEMES[key] : DEFAULT_THEME;
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `I typed "${words[0]}", "${words[1]}", "${words[2]}" and the orakle matched me to ${result.coin} (${result.ticker}).\n\n"${result.verdict}"\n\nThe uncomfortable truth: ${result.uncomfortable_truth}\n\nwhat coin are you?`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!result) return;
    const text = `I typed "${words[0]}", "${words[1]}", "${words[2]}" and the orakle matched me to ${result.coin} (${result.ticker}).\n\n"${result.verdict}"\n\nThe uncomfortable truth: ${result.uncomfortable_truth}\n\nwhat coin are you?`;
    if (navigator.share) {
      navigator.share({
        title: "d' orakle",
        text: text,
        url: window.location.href,
      });
    } else {
      handleCopy();
    }
  };

  const theme = result ? getTheme(result.coin) : DEFAULT_THEME;

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const resultVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.15,
      }
    },
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col items-center p-6 sm:p-12"
      style={{
        backgroundColor: '#0A0A0A',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Brand Mark - Moved into flex flow with margin to prevent overlap */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-50 w-full text-center py-12"
      >
        <span
          className="font-serif italic tracking-tight text-white leading-none block fluid-title"
        >
          d' orakle
        </span>
      </motion.div>

      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ x: mousePos.x, y: mousePos.y }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-oracle-gold/5 rounded-full blur-[120px] animate-drift" 
        />
        <motion.div 
          animate={{ x: -mousePos.x, y: -mousePos.y }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-oracle-amber/5 rounded-full blur-[120px] animate-drift" 
          style={{ animationDelay: '-4s' }} 
        />
        
        {/* Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%',
              opacity: Math.random() * 0.3
            }}
            animate={{ 
              y: [null, '-10%'],
              opacity: [null, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
          />
        ))}

        {screen === 'result' && result && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            className="absolute inset-0 transition-colors duration-1000"
            style={{ backgroundColor: theme.color }}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl z-10">
        <AnimatePresence mode="wait">
          {screen === 'entry' && (
            <motion.div
              key="entry"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="w-full max-w-2xl text-center space-y-12"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <h1
                  className="font-serif italic tracking-tight fluid-title"
                >
                  What Coin Are You?
                </h1>
                <p className="text-white/40 font-mono fluid-caption">
                  Three words. One coin. Your uncomfortable truth.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {words.map((word, i) => (
                  <div key={i} className="relative group">
                    <span className="absolute -top-3 left-4 text-[10px] font-mono text-white/20 group-focus-within:text-oracle-gold transition-colors z-20">
                      0{i + 1}
                    </span>
                    <div className="absolute inset-0 bg-oracle-gold/0 group-focus-within:bg-oracle-gold/5 blur-2xl transition-all duration-500 rounded-full" />
                    <input
                      ref={inputRefs[i]}
                      type="text"
                      value={word}
                      onChange={(e) => handleInputChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      placeholder="Describe..."
                      className="relative z-10 w-full bg-white/5 border border-white/10 rounded-xl px-6 py-5 text-lg font-medium transition-all focus:border-oracle-amber focus:bg-white/10 focus:ring-4 focus:ring-oracle-amber/10 placeholder:text-white/10"
                    />
                  </div>
                ))}
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-8">
                <button
                  onClick={handleSubmit}
                  disabled={!hasGeminiKey || words.some(w => w.length === 0)}
                  className="group relative inline-flex items-center gap-3 px-12 py-5 bg-white text-oracle-dark rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className="relative z-10">Consult the orakle</span>
                  <span className="text-xl relative z-10 group-hover:rotate-12 transition-transform duration-500">✧˖°</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-oracle-gold to-oracle-amber opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <p className="text-white/30 text-xs font-mono">
                  No accounts. No data saved. Just you and the orakle.
                </p>
                {!hasGeminiKey && (
                  <div className="flex items-center justify-center gap-2 text-white/60 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 font-mono text-xs">
                    <Info className="w-4 h-4" />
                    <span>Set GEMINI_API_KEY in .env.local and restart the server.</span>
                  </div>
                )}
              </motion.div>

              {error && (
                <motion.p variants={itemVariants} className="text-red-400 text-sm font-mono">
                  {error}
                </motion.p>
              )}
            </motion.div>
          )}

          {screen === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center space-y-12 relative"
            >
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Outer Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-oracle-gold/20 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border border-oracle-amber/10 rounded-full border-dashed"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-12 border border-white/5 rounded-full"
                />
                
                {/* Scanning Line */}
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-oracle-gold to-transparent z-20 opacity-50"
                />

                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center relative overflow-hidden group">
                  <Loader2 className="w-10 h-10 text-oracle-gold animate-spin" />
                  <div className="absolute inset-0 bg-oracle-gold/10 animate-pulse" />
                </div>
              </div>

              <div className="text-center space-y-8 relative z-10">
                <div className="flex justify-center gap-3">
                  {words.map((word, i) => (
                    <motion.span 
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-oracle-gold/80"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
                <div className="h-8 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={loadingText}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="font-serif italic text-white/80 fluid-subtitle"
                    >
                      {loadingText}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {screen === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg text-center space-y-8 glass p-12 rounded-[2.5rem] border-red-500/20"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-3xl font-serif italic">The orakle is clouded</h2>
                <p className="text-white/60 font-mono text-sm leading-relaxed">
                  {error}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleSubmit}
                  className="w-full py-5 bg-white text-oracle-dark rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Retry Reading
                </button>
                <button
                  onClick={() => setScreen('entry')}
                  className="w-full py-4 bg-white/5 border border-white/10 text-white/40 rounded-2xl font-mono text-xs uppercase tracking-widest hover:text-white/60 transition-all"
                >
                  Back to Entry
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'result' && result && (
            <motion.div
              key="result"
              variants={resultVariants}
              initial="hidden"
              animate="visible"
              className="w-full max-w-xl space-y-8"
            >
              <motion.div variants={itemVariants} className="text-center space-y-2">
                <h2 className="text-2xl font-serif italic text-white/40">
                  The orakle has spoken...
                </h2>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="glass rounded-[2.5rem] p-8 sm:p-12 space-y-10 relative overflow-hidden border-white/10"
              >
                {/* Coin Aura */}
                <div 
                  className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-30 transition-colors duration-1000"
                  style={{ backgroundColor: theme.color }}
                />

                <div className="relative z-10 space-y-8">
                  <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <motion.span 
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className="text-5xl filter drop-shadow-lg block"
                      >
                        {theme.emoji}
                      </motion.span>
                      <div className="space-y-1">
                        <h3 className="font-serif italic tracking-tight leading-none fluid-title">
                          {result.coin}
                        </h3>
                        <span 
                          className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.2em] uppercase"
                          style={{ backgroundColor: `${theme.color}20`, color: theme.color }}
                        >
                          {result.ticker}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-6">
                    <div className="font-serif italic leading-tight text-white/90 tracking-tight min-h-[4em] fluid-subtitle">
                      <Typewriter text={`"${result.verdict}"`} delay={30} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {result.traits.map((trait, i) => (
                        <motion.span 
                          key={i} 
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] font-mono text-white/50 uppercase tracking-wider cursor-default transition-colors"
                        >
                          {trait}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={itemVariants}
                    className="p-8 rounded-3xl border-l-[6px] space-y-4 bg-white/[0.03] relative overflow-hidden group"
                    style={{ borderColor: theme.color }}
                  >
                    <div className="flex items-center gap-2 text-white/30">
                      <div className="w-1 h-1 rounded-full bg-current" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.3em]">The Uncomfortable Truth</span>
                    </div>
                    <p className="font-medium leading-snug tracking-tight fluid-body">
                      {result.uncomfortable_truth}
                    </p>
                    {/* Shimmer effect */}
                    <motion.div 
                      animate={{ 
                        x: ['-100%', '200%'],
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "linear",
                        repeatDelay: 2
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
                    />
                    <div 
                      className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 pointer-events-none transition-colors duration-1000"
                      style={{ backgroundColor: theme.color }}
                    />
                  </motion.div>
                </div>

                <motion.div variants={itemVariants} className="relative z-10 pt-4 flex flex-wrap gap-4">
                  <div className="w-full flex gap-3">
                    <button 
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-5 bg-white text-oracle-dark rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-white/10"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Result
                    </button>
                    <button 
                      onClick={handleCopy}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-5 bg-white/10 border border-white/10 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-white/20 relative overflow-hidden"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div
                            key="check"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="flex items-center gap-2 text-oracle-gold"
                          >
                            <Sparkles className="w-4 h-4" />
                            Copied!
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                  
                  <div className="w-full grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        setWords(['', '', '']);
                        setScreen('entry');
                        setResult(null);
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-transparent border border-white/5 text-white/30 rounded-2xl font-mono text-[10px] uppercase tracking-widest hover:text-white/60 hover:border-white/10 transition-all"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset orakle
                    </button>
                    <button 
                      onClick={() => {
                        setWords(['', '', '']);
                        setScreen('entry');
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-transparent border border-white/5 text-white/30 rounded-2xl font-mono text-[10px] uppercase tracking-widest hover:text-white/60 hover:border-white/10 transition-all"
                    >
                      Try Another
                    </button>
                  </div>
                </motion.div>
              </motion.div>

              <motion.p variants={itemVariants} className="text-center text-white/20 text-[10px] font-mono uppercase tracking-[0.3em]">
                Not financial advice. Obviously.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
