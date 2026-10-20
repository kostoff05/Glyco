'use client' // Директива, която позволява на компонентите да са "живи" чрез JS (ще се изпълняват от клиента). ПРАВИ СЕ ЗАДЪЛЖИТЕЛНО, иначе next.js гърми. 

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// 1. Изнеси клиента извън тялото на функцията, за да не се пресъздава постоянно
const supabase = createClient(); // Изпълнява се само вендъж преди зареждане на файла, защото ако е в компонента, ще се прави нова рефернция всеки път. 

export default function RootLayout({ children }: { children: React.ReactNode }) { // Компонента. {children} е пропс, в който се инжектира активната страница а React.ReactNode казва че може да има всякакви JSX елеемнти, които са валидни. 
  const pathname = usePathname(); // подчертване на активния път
  const router = useRouter(); // използва се когато прогрмаата сама трябва да премести потребителя някъде си след определено действие. докато Link се контролира от потребителя и едва след него действие, нещата се прехвърлят. 
  const [user, setUser] = useState<any>(null); // пази се потребителя. начална стойност null, за да знае прогрмата дали ако не се появи стойност да го накра да се логне. 
  const [darkMode, setDarkMode] = useState(false); // паметта за темата. 


  useEffect(() => { // отговаря за показването на страница. 
    const savedTheme = localStorage.getItem('theme'); // взима избраната тема
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }

    const checkUser = async () => { // проверка дали има логнат потребител
      const { data } = await supabase.auth.getSession(); // дали има активна сесия 
      setUser(data.session?.user || null); // ако има сесия я вземи, ако не остави я null. 
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { //следи за вход и изход
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe(); // ДА НЕ СЕ ХАБИ ram се спира ф-ята
  }, []); // в масива се се записват имената, които като се променят, карат useEffect да се изпълни отново. При изпълнение на прогрмата НЕ СЕ ПРОМЕНЯ, тъй като React ще гръмне. Най- добре е да бъде оставено празно. 
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // ф-я за зиход 
  };

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('theme', nextMode ? 'dark' : 'light'); // превключвател за темата 
  };

  const getLinkClass = (path: string) => { // отговаря за това да свети в опрделен цвят страницата, на която се намираме. 
    const isActive = pathname === path;
    return `font-bold transition-all duration-300 hover:text-emerald-600 dark:hover:text-emerald-400 ${isActive ? 'text-emerald-700 border-b-2 border-emerald-700 dark:text-emerald-400 dark:border-emerald-400' : 'text-gray-600 dark:text-gray-400'
      }`;
  };

  return (
    <html
      lang="bg"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${darkMode ? 'dark' : ''}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white text-gray-900 flex flex-col dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300"
      >
        <nav className="sticky top-0 z-50 flex items-center justify-between w-full px-8 py-4 border-b border-gray-200/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md dark:border-zinc-800">

          {/* ЛЯВА ЧАСТ: Залепено най-вляво */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black tracking-wider text-emerald-800 dark:text-emerald-400 hover:opacity-80 transition-opacity">
              GLYCO
            </Link>


            {user && (
              <>
                <Link href="/dashboard" className={`${getLinkClass('/dashboard')} uppercase text-xs tracking-wider font-semibold`}>
                  DASHBOARD
                </Link>
                <Link href="/profile" className={`${getLinkClass('/profile')} uppercase text-xs tracking-wider font-semibold`}>
                  МОЯТ ПРОФИЛ
                </Link>
              </>
            )}
          </div>

          {/* ДЯСНА ЧАСТ: Залепено най-вдясно без празни пространства в средата */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="text-xs uppercase tracking-wider font-medium border px-3 py-2 rounded-xl border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
            >
              {darkMode ? '☀️ ТЕМА' : '🌙 ТЕМА'}
            </button>

            {user ? (
              <button
                onClick={handleLogout}
                className="text-xs uppercase tracking-wider text-red-600 font-bold hover:underline px-3 py-2"
              >
                ИЗХОД
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-xs uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 px-3 py-2 transition-colors">
                  ВХОД
                </Link>
                <Link href="/register" className="text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm">
                  РЕГИСТРАЦИЯ
                </Link>
              </div>
            )}
          </div>

        </nav>

        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}