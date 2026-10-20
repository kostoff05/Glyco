'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Lock, Mail, ShieldCheck, LogOut, Activity, Calendar, Sparkles } from 'lucide-react' // внасяме икони от библиотеката lucide-react

const supabase = createClient() // старт на връзката с БД

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [totalRecords, setTotalRecords] = useState(0) // тук ще се записва бройката на всички измервания направени някога

    // Състояния за смяна на парола
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [updating, setUpdating] = useState(false) // като се натисне бутона смени парола, състоянието се сменя на true

    useEffect(() => { // start при зареждане 
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession() // извличане на данните за сесията 

            if (!session?.user) {
                router.push('/login') // ако няма сесия, прехвърля на login
                return
            }

            setUser(session.user) // записваме го в user 

            // Взимаме броя записи на потребителя за статистиката
            const { count } = await supabase // чакаме базата да върне отговор 
                .from('glucose_entries')
                .select('*', { count: 'exact', head: true }) // върни точната цифра, вместо да използваме data.length, направо SupaBase ги преброява и ги връща 
                .eq('user_id', session.user.id)


            setTotalRecords(count || 0) // слагаме бройките 
            setLoading(false) // прекратяваме зареждането 
        }

        fetchUserData()
    }, [router])

    // Функция за смяна на парола
    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert('Паролата трябва да е поне 6 символа!')
            return // ако е с по-малко от 6 символа се изпълнява този блок от код 
        }
        if (newPassword !== confirmPassword) {
            alert('Паролите не съвпадат!')
            return // ако паролите не съвпадат се изпълнява тоя код 
        }

        setUpdating(true)// зареждаме натискането от бутона 
        const { error } = await supabase.auth.updateUser({ password: newPassword }) // извършва се заявка към БД за промяна на паролата с newPassword

        if (error) {
            alert('Грешка при обновяване: ' + error.message) // при грешка
        } else { // Ако е готово
            alert('Паролата е променена успешно!') // съобщение
            setNewPassword('') // изперазваме поле  
            setConfirmPassword('') // изпразваме поле 
        }
        setUpdating(false) // изкл индикатора за зареждане 
    }

    // Функция за изход
    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 bg-slate-50/30 dark:bg-zinc-950">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 font-light">Зареждане на профила...</p>
            </div>
        )
    }

    return (
        <div className="min-h-[90vh] bg-slate-50/30 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-500 relative overflow-hidden pb-20">

            {/* Фонови декоративни петна (Glassmorphism blobs) */}
            <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8s]"></div>
            <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[12s]"></div>

            <div className="max-w-4xl mx-auto px-6 pt-10 relative z-10 space-y-8">

                {/* ПРОФИЛЕН ХЕДЪР */}
                <div className="bg-white/70 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 p-8 rounded-3xl shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-600/20">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 px-3 py-0.5 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                <ShieldCheck size={14} /> Потвърден профил
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">{user?.email}</h1>
                            <p className="text-xs text-slate-400 font-light">ID: {user?.id}</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="py-6 px-6 rounded-2xl border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all font-medium flex items-center gap-2"
                    >
                        <LogOut size={16} /> ИЗХОД ОТ ПРОФИЛА
                    </Button>
                </div>

                {/* СТАТИСТИКА ЗА АКАУНТА */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/70 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 p-6 rounded-3xl shadow-xl backdrop-blur-xl flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Activity size={28} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Общо измервания</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-zinc-50 mt-1">{totalRecords}</p>
                        </div>
                    </div>

                    <div className="bg-white/70 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 p-6 rounded-3xl shadow-xl backdrop-blur-xl flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Създаден на</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-zinc-50 mt-1">
                                {new Date(user?.created_at).toLocaleDateString('bg-BG')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* СЕКЦИЯ ЗА СИГУРНОСТ (Смяна на парола) */}
                <div className="bg-white/70 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 p-8 rounded-3xl shadow-xl backdrop-blur-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Lock size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100">Сигурност на акаунта</h2>
                            <p className="text-xs text-slate-400">Промени своята парола за достъп</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 block">Нова парола</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-white/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 rounded-xl py-5"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 block">Повтори нова парола</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-white/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 rounded-xl py-5"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleUpdatePassword}
                            disabled={updating}
                            className="py-6 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {updating ? 'ЗАПИСВАНЕ...' : 'ПРОМЕНИ ПАРОЛАТА'}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}