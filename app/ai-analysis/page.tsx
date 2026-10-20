'use client' // Client-Component
// import на хукове от react, БД, Бутони, прелистване на страници 
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
// инстанция на supabase клиента, за да се използва при заявките към БД
const supabase = createClient()
// Главната функция(страницата)
export default function AIAnalysisPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true) // следи за зареждането на страницата
    const [analyzing, setAnalyzing] = useState(false) // следи дали в момента ИИ има поставена задача и блокира повторно натискане на бутона 
    const [entries, setEntries] = useState<any[]>([]) // данните от БД за кръвната захар под формата на масив 
    const [insight, setInsight] = useState<string | null>(null) // резултат от режима с ИИ

    useEffect(() => {
        // асинхронна ф-я за проверка за автентикация 
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession() // тук взима състоянието дали е логнат или не 
            if (!session?.user) { // проверка за логването 
                router.push('/login') // връща към страницата на login ако няма активна сесия
                return
            }

            const { data } = await supabase // извличането от БД
                .from('glucose_entries')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(20) // взима до най-новите 20 записа

            if (data) setEntries(data)
            setLoading(false)
        }

        init()
    }, [router])

    // Извикваме нашия собствен бекенд API маршрут вместо директно от браузъра
    const runAnalysis = async () => { // асинхронна функция за проверка дали има съществуващи записи 
        if (entries.length === 0) {
            setInsight('Все още нямаш записани измервания в Dashboard-а, за да направим персонализиран анализ.')
            return
        }

        setAnalyzing(true)
        setInsight(null)

        try { // ! ИЗПРАЩА СЕ ЗАЯВКА КЪМ СОБСТВЕНИЯ router с цел сигурност, за да не изтекат API ключовете 
            const response = await fetch('/api/ai-advisor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ entries }), // изпраща се масив с данни entries
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Възникна грешка при заявката към AI.')
            }

            setInsight(data.result) // при успех взима резултата и го записва в insight 

        } catch (error: any) {
            console.error(error)
            setInsight('Възникна грешка при връзката с AI модела. Провери дали ключовете ти в .env.local са коректни.')
        } finally { // ГАРАНЦИЯ че analysing ще спре независимо от резултата, който е върнал
            setAnalyzing(false)
        }
    }

    if (loading) { // Ако е заредило, връща резултата от анализа
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <p className="text-sm text-slate-500">Зареждане на анализатора...</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <span>🤖</span> AI Персонализиран Анализ
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                        Интелигентен преглед на твоите тенденции и съвети
                    </p>
                </div>
                <Link href="/dashboard" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                    ← Към Dashboard
                </Link>
            </div>

            <Card className="p-6 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-lg">Последен анализ на данните</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                    <p className="text-sm text-slate-600 dark:text-zinc-300">
                        Изкуственият интелект ще анализира последните ти <strong>{entries.length}</strong> записа, за да ти даде полезни насоки.
                    </p>

                    <Button
                        onClick={runAnalysis}
                        disabled={analyzing}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-xl transition-all"
                    >
                        {analyzing ? 'AI мисли и анализира...' : 'Генерирай нов AI анализ'}
                    </Button>

                    {insight && (
                        <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 text-slate-800 dark:text-zinc-200 text-sm whitespace-pre-line leading-relaxed">
                            {insight}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}