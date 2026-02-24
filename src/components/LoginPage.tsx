import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { loginWithGoogle } from '../firebase';

interface LoginPageProps {
  error?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ error: externalError }) => {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 當外部錯誤改變時（例如 App.tsx 傳來的白名單錯誤），更新內部顯示
  useEffect(() => {
    if (externalError) {
      setInternalError(externalError);
      setLoading(false);
    }
  }, [externalError]);

  const handleLogin = async () => {
    setInternalError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      // 注意：成功登入後的跳轉由 App.tsx 的 onAuthStateChanged 處理
    } catch (err: any) {
      setLoading(false);
      setInternalError("登入過程中發生錯誤，請稍後再試。");
    }
  };

  const displayError = internalError || externalError;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-200/40 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-fuchsia-200/40 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-8 py-12 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-violet-100 ring-1 ring-black/5 border border-white/50"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-lg shadow-violet-100 ring-1 ring-black/5">
            <Sparkles className="w-8 h-8 text-violet-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              數據矩陣 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">分析</span>
            </h1>
            <p className="text-zinc-500 font-medium">請先登入以存取您的數據儀表板</p>
          </div>

          <AnimatePresence mode="wait">
            {displayError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 flex-none" />
                <p>{displayError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full pt-4">
            <button 
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-700 text-white rounded-2xl transition-all shadow-xl shadow-zinc-200 group relative overflow-hidden"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <span className="font-semibold text-lg">透過 Google 帳號登入</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-zinc-400">
            登入即表示您同意本系統的數據使用與分析規範
          </p>
        </div>
      </motion.div>

      <footer className="relative z-10 mt-8 text-zinc-400 text-xs">
        <p>© {new Date().getFullYear()} 數據矩陣分析。為數據愛好者打造。</p>
      </footer>
    </div>
  );
};
