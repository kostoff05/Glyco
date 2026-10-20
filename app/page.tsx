'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'day' | 'week'>('day')
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user || null)
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <div className="min-h-[90vh] bg-slate-50/30 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-500 overflow-hidden relative">

      {/* ДИНАМИЧЕН И МОДЕРЕН ФОН - Дикроични цветни петна, които не дразнят, а стоят в дъното */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8s]"></div>
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[12s]"></div>

      {/* ОСНОВЕН ДВУКОЛОНЕН ЛЕЙАУТ */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh] relative z-10 pt-10 lg:pt-0">

        {/* ЛЯВА КОЛОНА: Модерен Текст и Бутони (Анимирани с fade-in) */}
        <div className="space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 backdrop-blur-md">
            ✨ Твоят нов интелигентен асистент
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-slate-900 dark:text-zinc-50">
            Контролирай нивата на{' '}
            <span className="text-transparent bg-clip-text animate-laser">
              захарта си
            </span>{' '}
            с лекота.
          </h1>

          <p className="text-lg text-slate-500 dark:text-zinc-400 font-light max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Създаден с мисъл за твоя комфорт и яснота. Лесен за ползване, достъпен в реално време и винаги под ръка.
          </p>

          <div className="flex gap-4 justify-center lg:justify-start items-center pt-4">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="px-8 py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-2xl shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Към Dashboard ➔
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="px-8 py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-2xl shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Започни Безплатно
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ДЯСНА КОЛОНА: ИНТЕРАКТИВЕН И ДИНАМИЧЕН ДИЗАЙН (Имитация на Dashboard) */}
        <div className="w-full max-w-md mx-auto lg:max-w-none animate-in fade-in zoom-in-95 duration-1000 delay-150">
          <div className="bg-white/70 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">

            {/* ЯСНО ВИДИМ ИНФОРМАЦИОНЕН БАНЕР */}
            <div className="bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-3 flex items-center gap-3">
              <span className="text-lg">💡</span>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                <strong className="font-bold">Примерен изглед:</strong> Тази графика показва демонстрачни данни и не отразява реални измервания.
              </p>
            </div>


            {/* Декоративни стъклени картички вътре */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-medium text-slate-400">Последно измерване</h3>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">5.4 mmol/L</p>
              </div>
              <div className="flex gap-2 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200/40 dark:border-zinc-700/40">
                <button
                  onClick={() => setActiveTab('day')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${activeTab === 'day' ? 'bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}
                >
                  Днес
                </button>
                <button
                  onClick={() => setActiveTab('week')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${activeTab === 'week' ? 'bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}
                >
                  Седмица
                </button>
              </div>
            </div>

            {/* ДИНАМИЧНА ВИЗУАЛИЗАЦИЯ НА ГРАФИКА ЧРЕЗ ЧИСТ CSS (Mock Графика) */}
            <div className="h-48 flex items-end justify-between gap-2 pt-6 border-b border-slate-100 dark:border-zinc-800 relative">

              {/* Линии за референция */}
              <div className="absolute top-1/4 left-0 right-0 border-t border-dashed border-red-400/30 dark:border-red-500/20 before:content-['Висока'] before:text-[10px] before:text-red-400 before:absolute before:-top-4"></div>
              <div className="absolute bottom-1/4 left-0 right-0 border-t border-dashed border-emerald-400/30 dark:border-emerald-500/20 before:content-['Нормална'] before:text-[10px] before:text-emerald-500 before:absolute before:-top-4"></div>

              {/* Стълбчетата на графиката варират спрямо активния таб */}
              {activeTab === 'day' ? (
                <>
                  <div className="w-full bg-slate-200 dark:bg-zinc-800 h-[40%] rounded-t-lg transition-all duration-500 relative group"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 bg-slate-950 text-white p-1 rounded">4.2</div></div>
                  <div className="w-full bg-emerald-500 h-[55%] rounded-t-lg transition-all duration-500 relative group"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 bg-slate-950 text-white p-1 rounded">5.4</div></div>
                  <div className="w-full bg-red-400 h-[85%] rounded-t-lg transition-all duration-500 relative group"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 bg-slate-950 text-white p-1 rounded">8.9</div></div>
                  <div className="w-full bg-emerald-500 h-[60%] rounded-t-lg transition-all duration-500 relative group"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 bg-slate-950 text-white p-1 rounded">5.9</div></div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-800 h-[45%] rounded-t-lg transition-all duration-500 relative group"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 bg-slate-950 text-white p-1 rounded">4.7</div></div>
                </>
              ) : (
                <>
                  <div className="w-full bg-emerald-500 h-[50%] rounded-t-lg transition-all duration-500"></div>
                  <div className="w-full bg-emerald-500 h-[52%] rounded-t-lg transition-all duration-500"></div>
                  <div className="w-full bg-emerald-500 h-[58%] rounded-t-lg transition-all duration-500"></div>
                  <div className="w-full bg-red-400 h-[75%] rounded-t-lg transition-all duration-500"></div>
                  <div className="w-full bg-emerald-500 h-[62%] rounded-t-lg transition-all duration-500"></div>
                </>
              )}
            </div>

            {/* Обозначения отдолу под стълбчетата */}
            <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium px-1">
              <span>Сутрин</span>
              <span>Обед</span>
              <span>Вечер</span>
            </div>

            {/* Малка плаваща картичка (Интуитивен детайл) */}
            <div className="mt-6 flex items-center gap-3 bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 animate-bounce duration-[3s]">
              <span className="text-xl">📈</span>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                Захарта ти е стабилна в 84% от времето през изминалите дни!
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* СЕКЦИЯ ФУНКЦИИ (FEATURES GRID) */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-slate-200/50 dark:border-zinc-800/50 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">

        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
            Всичко, от което имаш нужда за твоя контрол
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 font-light text-base">
            Модерни инструменти, създадени да улеснят ежедневието ти и да ти дадат пълна яснота.
          </p>
        </div>

        {/* МРЕЖА С КАРТИЧКИ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Картичка 1: Роботче ( AI Анализ ) - Светва / пулсира */}
          <Link
            href="/ai-analysis"
            className="group block bg-white/50 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-md cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl mb-4 transition-all duration-500 group-hover:scale-110 group-hover:bg-purple-500/20 group-hover:shadow-lg group-hover:shadow-purple-500/30">
              <span className="transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">🤖</span>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              AI Персонализиран Анализ
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-light leading-relaxed">
              Изкуствен интелект анализира твоите тенденции и ти дава интуитивни съвети за храненето и нивата ти.
            </p>
          </Link>

          {/* Картичка 2: PDF Доклади (Лист хартия) - Премества се / плъзга се */}
          <Link
            href="/reports"
            className="group block bg-white/50 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-md cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-xl mb-4 transition-all duration-300 group-hover:bg-rose-500/20">
              <span className="transition-transform duration-300 group-hover:translate-x-1.5 group-hover:-translate-y-1 group-hover:rotate-12">📄</span>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              PDF Доклади за Лекаря
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-light leading-relaxed">
              Генерирай чисти, професионални PDF репорти за избрани от теб периоди и ги сподели директно с твоя ендокринолог.
            </p>
          </Link>

          {/* Картичка 3: Филтри (Лупа) - Приближава се и се връща */}
          <div className="group bg-white/50 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-md cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl mb-4 transition-all duration-300 group-hover:bg-emerald-500/20">
              <span className="transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12">🔍</span>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-zinc-100">Мулти-критерийни Филтри</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-light leading-relaxed">
              Следи захарта си по периоди — сутрин, обед или вечер. Сортирай по стойност бързо и безпроблемно.
            </p>
          </div>

          {/* Картичка 4: Сигурност (Катинар) - Опитва се да се отвори (разклащане/накланяне) */}
          {/* Картичка 4: Сигурност (Катинар с истинско разклащане) */}
          <div className="group bg-white/50 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-md cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl mb-4 transition-all duration-300 group-hover:bg-blue-500/20">
              <span className="shake-icon inline-block">🔒</span>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-zinc-100">Пълна Сигурност</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-light leading-relaxed">
              Твоите здравни показатели се съхраняват в сигурна, криптирана облачна база данни с достъп по всяко време.
            </p>
          </div>

        </div>
      </section>

      {/* НОВА СЕКЦИЯ: КАК РАБОТИ В 3 СТЪПКИ */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-zinc-800/50 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
            КАК РАБОТИ GLYCO?
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 font-light text-base">
            Само в три прости стъпки поемаш пълен контрол над своето ежедневие.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Стъпка 1 */}
          <div className="group bg-white/50 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60 p-8 rounded-3xl backdrop-blur-md relative transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-600/5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 cursor-pointer">
            <div className="text-4xl font-black text-emerald-600/20 dark:text-emerald-400/20 mb-4 transition-colors group-hover:text-emerald-600/40">01</div>
            <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Регистрирай се бързо</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-light leading-relaxed">
              Създай си безплатен акаунт за секунди и защити здравните си данни на едно място.
            </p>
          </div>

          {/* Стъпка 2 */}
          <div className="group bg-white/50 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60 p-8 rounded-3xl backdrop-blur-md relative transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-600/5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 cursor-pointer">
            <div className="text-4xl font-black text-emerald-600/20 dark:text-emerald-400/20 mb-4 transition-colors group-hover:text-emerald-600/40">02</div>
            <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Въвеждай измерванията</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-light leading-relaxed">
              Записвай стойностите си сутрин, на обяд или вечер и ги филтрирай лесно по критерии.
            </p>
          </div>

          {/* Стъпка 3 */}
          <div className="group bg-white/50 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60 p-8 rounded-3xl backdrop-blur-md relative transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-600/5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 cursor-pointer">
            <div className="text-4xl font-black text-emerald-600/20 dark:text-emerald-400/20 mb-4 transition-colors group-hover:text-emerald-600/40">03</div>
            <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Следи тенденциите</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-light leading-relaxed">
              Получавай интелигентни анализи и готов PDF доклад за твоя личен лекар.
            </p>
          </div>
        </div>
      </section>

      {/* ФИНАЛЕН БАНЕР С ПРИЗИВ ЗА ДЕЙСТВИЕ (BOTTOM CTA) */}
      {!user && (
        <section className="max-w-5xl mx-auto px-6 py-12 relative z-10 mb-16">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-10 md:p-14 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Готов ли си да поемеш контрол над здравето си?
            </h2>
            <p className="text-emerald-100 font-light max-w-xl mx-auto mb-8 text-base">
              Присъедини се към Glyco днес и направи първата крачка към по-спокоен и организиран живот.
            </p>
            <Link href="/register">
              <Button size="lg" className="px-8 py-6 bg-white text-emerald-800 hover:bg-slate-100 font-bold rounded-2xl shadow-lg transition-all hover:scale-105">
                СЪЗДАЙ БЕЗПЛАТЕН АКАУНТ СЕГА
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* ФУТЪР НАЙ-ОТДОЛУ */}
      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-slate-200/50 dark:border-zinc-800/50 text-center text-xs text-slate-400 dark:text-zinc-500 relative z-10">
        <p>© 2026 Glyco. Всички права са запазени. Създадено с грижа за твоето здраве.</p>
      </footer>

    </div>
  )
}