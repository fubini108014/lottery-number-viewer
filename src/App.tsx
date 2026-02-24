import React, { useState, useEffect } from 'react';
import { LotteryTable } from './components/LotteryTable';
import { FileSelector } from './components/FileSelector';
import { LoginPage } from './components/LoginPage';
import { Sparkles, LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { LotteryDraw } from './types';
import { motion } from 'motion/react';
import { auth, loginWithGoogle, logout, User, isWhitelisted } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface FileInfo {
  name: string;
  year: string | null;
}

export default function App() {
  const [lotteryData, setLotteryData] = useState<LotteryDraw[]>([]);
  const [year, setYear] = useState<string | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showZoneTable, setShowZoneTable] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (isWhitelisted(currentUser.email)) {
          setUser(currentUser);
          setAuthError(null);
        } else {
          await signOut(auth);
          setUser(null);
          setAuthError("此 Google 帳號不在允許的訪問名單內。");
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return; // Only fetch files if logged in
    const fetchFiles = async () => {
      try {
        // Fetch from static JSON file generated at build time
        const response = await fetch(`${import.meta.env.BASE_URL}files.json`);
        if (response.ok) {
          const data = await response.json();
          setFiles(data);
          if (data.length > 0) {
            handleFileSelect(data[0].name);
          }
        }
      } catch (error) {
        console.error("Failed to fetch files:", error);
      }
    };

    fetchFiles();
  }, [user]); // Add user to dependencies

  const handleFileSelect = async (filename: string) => {
    setSelectedFile(filename);
    setLoading(true);
    try {
      // Fetch JSON file directly from public/data directory
      const response = await fetch(`${import.meta.env.BASE_URL}data/${filename}`);
      if (response.ok) {
        const jsonData = await response.json();
        
        // Parse dates and validate structure
        const parsedData: LotteryDraw[] = jsonData.map((item: any) => ({
          date: new Date(item.date),
          numbers: item.numbers
        })).sort((a: LotteryDraw, b: LotteryDraw) => b.date.getTime() - a.date.getTime());

        // Extract year from filename
        const yearMatch = filename.match(/\d{4}/);
        const year = yearMatch ? yearMatch[0] : null;

        setLotteryData(parsedData);
        setYear(year);
      }
    } catch (error) {
      console.error("Failed to fetch file content:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage error={authError} />;
  }

  return (
    <div className="h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-violet-100 selection:text-violet-900 flex flex-col overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col h-full">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-none flex flex-col md:flex-row items-center justify-between gap-4 mb-4"
        >
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center p-2.5 bg-white rounded-xl shadow-lg shadow-violet-100 ring-1 ring-black/5">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                數據矩陣 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">分析</span>
              </h1>
              <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                {year && (
                  <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                    {year}
                  </span>
                )}
                <span>
                  {lotteryData.length > 0 ? `找到 ${lotteryData.length} 筆記錄` : '請選擇年份'}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto min-w-[260px] flex items-center gap-3">
            {files.length > 0 && (
              <FileSelector 
                files={files} 
                selectedFile={selectedFile} 
                onSelect={handleFileSelect} 
              />
            )}
            
            {user ? (
              <div className="flex items-center min-w-[93px] bg-white/80 backdrop-blur-md p-1 pr-1.5 rounded-2xl shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md hover:ring-black/10 h-11">
                <div className="relative shrink-0 flex items-center justify-center p-1">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-8 h-8 rounded-xl object-cover ring-2 ring-violet-100 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-violet-600" />
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="w-px h-4 bg-zinc-200 mx-1"></div>
                
                <button 
                  onClick={() => logout()}
                  className="group p-2 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 rounded-xl transition-all duration-200 shrink-0 flex items-center justify-center"
                  title={`登出 (${user.displayName})`}
                >
                  <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => loginWithGoogle()}
                className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg shadow-violet-100 transition-all font-medium"
              >
                <LogIn className="w-4 h-4" />
                <span>Google 登入</span>
              </button>
            )}
          </div>
        </motion.header>

        <main className="flex-1 min-h-0 relative flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-zinc-400 font-medium animate-pulse">載入資料中...</p>
            </div>
          ) : (
            lotteryData.length > 0 && (
              <LotteryTable 
                data={lotteryData} 
                year={year} 
                showZoneTable={showZoneTable}
                onToggleZoneTable={() => setShowZoneTable(!showZoneTable)}
              />
            )
          )}
        </main>

        <footer className="flex-none mt-4 text-center text-zinc-400 text-[10px] py-2">
          <p>© {new Date().getFullYear()} 數據矩陣分析。為數據愛好者打造。</p>
        </footer>
      </div>
    </div>
  );
}
