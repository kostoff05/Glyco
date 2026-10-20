'use client'

import { useState } from 'react' // пазим това, което потребителя пише в момента
import { useRouter } from 'next/navigation' // за препратки из приложението 
import { createClient } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FaGoogle, FaFacebook } from 'react-icons/fa'

const supabase = createClient()

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false) // първоначално е false и като цъкнем "вход" ще стане true 
    const [error, setError] = useState<string | null>(null) // тук ще запишем съобщението за грешка

    // Обикновен вход с имейл и парола
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault() // командата спира стандартното презареждане на цялата страница
        setLoading(true) // влизаме
        setError(null) // няма грешка

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        }) // взима имейл парола от базата 

        if (error) {
            setError(error.message)
            setLoading(false) // ако има грешка, изписва съответното съобщение 
        } else {
            router.push('/dashboard') // пренасочва към страницата dashboard
        }
    }

    // Вход с външен доставчик (Google / Facebook)
    const handleSocialLogin = async (provider: 'google' | 'facebook') => { // обща ф-я за 2та бутона 
        const { error } = await supabase.auth.signInWithOAuth({ // използвай ОAuth 
            provider, // доставичка е провайдър
            options: { // опцията е ако всичко е успешно да го пренасочиш към dashboard 
                redirectTo: `${window.location.origin}/dashboard`,
            },
        })

        if (error) {
            setError(error.message) // ако има грешка, да се изведе съответното съобщение
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl rounded-2xl">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl font-bold">ВХОД В GLYCO</CardTitle>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        Въведи своите данни за достъп до твоя акаунт.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 text-xs text-red-500 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                                ИМЕЙЛ АДРЕС
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                className="w-full p-2.5 text-sm border rounded-xl bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                                ПАРОЛА
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full p-2.5 text-sm border rounded-xl bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                        >
                            {loading ? 'Влизане...' : 'Вход'}
                        </Button>
                    </form>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
                        <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase">или</span>
                        <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
                    </div>

                    {/* Бутони за социален вход */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            variant="outline"
                            className="w-full py-2.5 rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium cursor-pointer flex items-center justify-center gap-2"
                        >
                            {/* Оригиналната многоцветна икона на Google */}
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Google</span>
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleSocialLogin('facebook')}
                            variant="outline"
                            className="w-full py-2.5 rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium cursor-pointer flex items-center justify-center gap-2"
                        >
                            <FaFacebook className="w-4 h-4 text-blue-600" />
                            <span>Facebook</span>
                        </Button>
                    </div>

                    <div className="text-center pt-2">
                        <Link href="/register" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font- large">
                            Създай нов акаунт
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}