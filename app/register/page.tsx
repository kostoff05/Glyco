'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X, Mail, Lock, UserPlus } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient()

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isRegistered, setIsRegistered] = useState(false) // следи за състонието дали е преминала успешно регистрацията 

    const forbiddenPatterns = ['123', '0000', '1111', 'qwerty'] // Забранени пароли 
    const rules = [
        { label: 'Минимум 8 знака', test: password.length >= 8 },
        { label: 'Главна буква', test: /[A-Z]/.test(password) },
        { label: 'Малка буква', test: /[a-z]/.test(password) },
        { label: 'Цифра', test: /[0-9]/.test(password) },
        { label: 'Без лесни комбинации', test: !forbiddenPatterns.some(p => password.includes(p)) && password.length > 0 }, // изисквания 
    ]

    const strength = rules.filter(r => r.test).length // тук филтрира обектите чиито тест е true и взима дължината на паролата 
    const strengthColor = strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-emerald-500' // с проверки оцветява лента 

    const handleRegister = async () => { // ф-я за регистрация когато се натисне бутона за регистриране
        if (password !== confirmPassword) return alert('Паролите не съвпадат!') // правила
        if (strength < 5) return alert('Паролата е слаба!') // правила

        const { error } = await supabase.auth.signUp({ // Процеса за изпращане на имейл за потвърждение
            email,
            password,
            options: {
                emailRedirectTo: 'http://localhost:3000/auth/callback'
            }
        })

        if (error) alert(error.message) // при греешка
        else setIsRegistered(true) // ако всичко е наред
    }

    // Екран след успешна регистрация (също с модерен стъклен дизайн)
    if (isRegistered) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center px-4 relative overflow-hidden bg-slate-50/30 dark:bg-zinc-950">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-md w-full bg-white/70 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Провери пощата си!</h1>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 font-light leading-relaxed">
                        Изпратихме линк за потвърждение на <strong className="text-slate-900 dark:text-white">{email}</strong>. Моля, отвори го, за да активираш акаунта си.
                    </p>
                    <Link href="/login" className="block w-full">
                        <Button variant="outline" className="w-full py-6 rounded-2xl border-slate-200 dark:border-zinc-800 font-medium">
                            НАЗАД КЪМ ВХОД
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-50/30 dark:bg-zinc-950 transition-colors duration-500">

            {/* Фонови цветни петна като на началната страница */}
            <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8s]"></div>
            <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[12s]"></div>

            {/* Основна стъклена форма */}
            <div className="max-w-md w-full bg-white/70 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 p-8 md:p-10 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-700">

                <div className="space-y-2 text-center">
                    <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 mb-2">
                        <UserPlus size={24} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">СЪЗДАЙ НОВ АКАУНТ</h1>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
                        Въведи данните си, за да започнеш да следиш захарта си.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 block">Имейл адрес</label>
                        <Input
                            placeholder="name@example.com"
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 rounded-xl py-5"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 block">Парола</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 rounded-xl py-5"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 block">Повтори парола</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-white/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 rounded-xl py-5"
                        />
                    </div>
                </div>

                {/* Индикатор за сила на паролата */}
                <div className="space-y-2 bg-slate-100/50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-slate-200/40 dark:border-zinc-700/40">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-500 dark:text-zinc-400">Сила на паролата:</span>
                        <span className="font-bold uppercase text-slate-700 dark:text-zinc-300">
                            {strength < 2 ? 'Много слаба' : strength < 3 ? 'Слаба' : strength < 5 ? 'Добра' : 'Силна'}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${(strength / 5) * 100}%` }} />
                    </div>
                </div>

                {/* Правила за парола */}
                <div className="grid grid-cols-1 gap-2 text-xs">
                    {rules.map((rule, i) => (
                        <div key={i} className={`flex items-center gap-2 transition-colors ${rule.test ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-zinc-500'}`}>
                            {rule.test ? <Check size={16} /> : <X size={16} />}
                            <span>{rule.label}</span>
                        </div>
                    ))}
                </div>

                <Button
                    className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleRegister}
                >
                    РЕГИСТРИРАЙ СЕ
                </Button>

                <div className="text-center text-xs text-slate-500 dark:text-zinc-400">
                    Вече имаш акаунт?{' '}
                    <Link href="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                        Влез оттук
                    </Link>
                </div>

            </div>
        </div>
    )
}