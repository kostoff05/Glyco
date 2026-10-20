'use client'

import { useState, useEffect } from 'react' // UseState ни позволява да създаваме променливи, които да бъдат следени от React, a UseEffect позволява да стартираме някакъв код автоматично 
import { useRouter } from 'next/navigation' // рутер
import { createClient } from '@/lib/supabaseClient' // връзка с БД
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, PlusCircle, Filter, ArrowUpDown, Trash2, Sparkles, AlertCircle, Clock, FileText, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient()

export default function DashboardPage() { // главната ф-я
    const router = useRouter() // активираме рутера 

    const [user, setUser] = useState<any>(null) //пази данните на потребителя. Първоначално е null, но чрез setUser ще се запълнят данните 
    const [loading, setLoading] = useState(true) // Пази инфо дали страницата все още се зарежда

    const [glucose, setGlucose] = useState('')
    const [timeOfDay, setTimeOfDay] = useState('сутрин')
    const [time, setTime] = useState('')
    const [notes, setNotes] = useState('')
    // Горните 4 са реално формата ни за попълване на данните 
    const [entries, setEntries] = useState<any[]>([]) // тук се събират всички данни от БД-то и се показват във формата на таблица 

    // Филтри
    const [filterTimeOfDay, setFilterTimeOfDay] = useState('all')
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

    // Състояние за табовете на графиката: 'day' | 'week' | 'month'
    const [chartRange, setChartRange] = useState<'day' | 'week' | 'month'>('week')

    // Взимане на записите САМО за текущия потребител
    const fetchEntries = async (userId: string) => { // асинхронна ф-я, която изисква да и се подаде userId
        const { data } = await supabase // изчакай базата данни да отговори и вземи само data 
            // Команди към БД
            .from('glucose_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })


        if (data) setEntries(data) // Ако е минало наред, записваме data в entries
    }

    // Проверка дали потребителят е вписан + слушалка
    useEffect(() => { // Изпълни този код автоматично, веднага щом екранът се появи пред потребителя
        const checkUserAndFetch = async () => { // Асинхронна ф-я, която взима даните от текущата сесия 
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.user) { // Проверка ако няма сесия, да го пренасочи към страницата за login
                router.push('/login')
                return
            }

            setUser(session.user) // записва потребителя в user
            await fetchEntries(session.user.id) // изчаква да се вземе ф-ята за теглене на записи 
            setLoading(false) // приключваме зареждането 
        }

        checkUserAndFetch() // Старт на ф-ята

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { // слушалка, която следи дали потребителя е логнат 
            if (!session?.user) {
                router.push('/login') // ако няма сесия, пренасочва към login 
            } else {
                setUser(session.user) // като влезне
                fetchEntries(session.user.id) // Изтегля данните 
            }
        })

        return () => subscription.unsubscribe()
    }, [router]) // При затваряне на таба, тая слушалка спира да работи за да не се товари браузъра 

    // Запазване на запис. ИЗПЪЛНЯВА СЕ ПРИ НАТИКСАНЕ НА БУТОНА 'ЗАПИШИ ИЗМЕРВАНЕТО'
    const handleSave = async () => {
        if (!user) return router.push('/login') // Ако няма user, върни го към login
        if (!glucose) return alert("Моля, въведи стойност!") // ako няма въведена стойност на кръвна захар, да се въведе и се извежда съобщението

        const { error } = await supabase // подаване на данните към БД-то 
            .from('glucose_entries')
            .insert([{
                value: parseFloat(glucose), // parseFloat прави число с плаваща запетая
                time_of_day: timeOfDay,
                entry_time: time,
                notes: notes,
                user_id: user.id
            }])

        if (error) {
            alert("Грешка: " + error.message) // Ако възникне грешка се изпълнява този код 
        } else {
            setGlucose(''); setNotes(''); setTime(''); fetchEntries(user.id)
        }
    }

    // Изтриване на запис
    const handleDelete = async (id: string) => {
        const confirmDelete = confirm("Сигурен ли си, че искаш да изтриеш този запис?")
        if (!confirmDelete) return

        const { error } = await supabase
            .from('glucose_entries')
            .delete()
            .eq('id', id) // използваме .eq за да изтрие на конкретния потребител, а не на някой друг!
            .eq('user_id', user.id)

        if (!error) {
            setEntries(entries.filter(entry => entry.id !== id)) // Филтрирай записите и остави само тези, чието ID НЕ Е равно на изтритото"
        } else {
            alert("Грешка при изтриването: " + error.message)
        }
    }

    const filteredAndSortedEntries = entries
        .filter((entry) => { // филтрираме конкретното entry 
            if (filterTimeOfDay === 'all') return true // ako сме всички, да остави записа в списъка 
            return entry.time_of_day === filterTimeOfDay
        })
        .sort((a, b) => { // сортитане
            const valA = parseFloat(a.value) //  превеъща ги в числа
            const valB = parseFloat(b.value) // превеъща ги в числа
            return sortOrder === 'desc' ? valB - valA : valA - valB // ако сме desc, вадим от valB-valA, ако е asc е обратното 
        })

    // ФИЛТРИРАНЕ НА ЗАПИСИТЕ ЗА ГРАФИКАТА СПРЯМО ИЗБРАНИЯ ПЕРИОД (Ден, Седмица, Месец)
    const getChartEntries = () => {
        const now = new Date() // взиамме текуща дата и час

        return entries.filter(entry => {
            const entryDate = new Date(entry.created_at) // превръщаме entry-тата от текст в истинска дата

            if (chartRange === 'day') {
                // Само от днешния ден
                return entryDate.toDateString() === now.toDateString()
            } else if (chartRange === 'week') {
                // От последните 7 дни
                const weekAgo = new Date()
                weekAgo.setDate(now.getDate() - 7)
                return entryDate >= weekAgo
            } else if (chartRange === 'month') {
                // От последните 30 дни
                const monthAgo = new Date()
                monthAgo.setDate(now.getDate() - 30)
                return entryDate >= monthAgo
            }
            return true
        }).reverse() // Хронологичен ред за графиката, защото се чете отляво надясно
    }

    const chartEntriesData = getChartEntries()
    const latestValue = entries.length > 0 ? entries[0].value : '—' //Намираме най-последната измерена стойност. Ако има записи, взимаме стойността на първия (най-новия). Ако няма нито един запис, показваме тире '—'.

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 bg-slate-50/30 dark:bg-zinc-950">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 font-light">Зареждане на твоя профил...</p>
            </div>
        )
    }

    return (
        <div className="min-h-[90vh] bg-slate-50/30 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-500 relative overflow-hidden pb-20">

            {/* ДЕКОРАТИВНИ ФОНОВИ ПЕТНА */}
            <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8s]"></div>
            <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-[12s]"></div>

            <div className="max-w-6xl mx-auto px-6 pt-10 relative z-10 space-y-8">

                {/* ХЕДЪР НА ТАБЛОТО С AI И PDF БУТОНИ */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/70 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 p-6 md:p-8 rounded-3xl shadow-xl backdrop-blur-xl">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            <Sparkles size={12} /> Интелигентен здравен панел
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
                            Здравей, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">{user?.email?.split('@')[0]}</span> !
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <Link href="/ai-analysis" className="flex-1 sm:flex-none">
                            <Button className="w-full sm:w-auto py-5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-600/20 text-xs font-medium flex items-center gap-2">
                                <Sparkles size={16} /> AI Здравен съветник
                            </Button>
                        </Link>
                        <Link href="/reports" className="flex-1 sm:flex-none">
                            <Button variant="outline" className="w-full sm:w-auto py-5 px-4 rounded-2xl border-slate-200 dark:border-zinc-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2">
                                <FileText size={16} className="text-emerald-600" /> Изтегли PDF доклад
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* ДИНАМИЧНА ВИЗУАЛИЗАЦИЯ (ГРАФИКА С ТАБОБЕ ДЕН / СЕДМИЦА / МЕСЕЦ) */}
                <div className="bg-white/70 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 p-6 md:p-8 rounded-3xl shadow-xl backdrop-blur-xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                <TrendingUp size={14} className="text-emerald-500" /> Динамични тенденции
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
                                Последно измерване: <span className="text-emerald-600 dark:text-emerald-400">{latestValue} {latestValue !== '—' ? 'mmol/L' : ''}</span>
                            </h3>
                        </div>

                        {/* ТАБОВЕ ЗА ПРЕВКЛЮЧВАНЕ: Ден, Седмица, Месец */}
                        <div className="flex gap-1 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl border border-slate-200/40 dark:border-zinc-700/40">
                            <button
                                onClick={() => setChartRange('day')}
                                className={`px-4 py-1.5 text-xs font-medium rounded-xl transition-all ${chartRange === 'day' ? 'bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                            >
                                Ден
                            </button>
                            <button
                                onClick={() => setChartRange('week')}
                                className={`px-4 py-1.5 text-xs font-medium rounded-xl transition-all ${chartRange === 'week' ? 'bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                            >
                                Седмица
                            </button>
                            <button
                                onClick={() => setChartRange('month')}
                                className={`px-4 py-1.5 text-xs font-medium rounded-xl transition-all ${chartRange === 'month' ? 'bg-white dark:bg-zinc-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                            >
                                Месец
                            </button>
                        </div>
                    </div>

                    {/* СТЪЛБОВИДНА ГРАФИКА */}
                    <div className="h-52 flex items-end justify-between gap-3 pt-8 pb-2 border-b border-slate-100 dark:border-zinc-800 relative">
                        {/* Референтни линии */}
                        <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-red-400/30 dark:border-red-500/20 before:content-['Висока_(7.0)'] before:text-[10px] before:text-red-400 before:absolute before:-top-4"></div>
                        <div className="absolute bottom-1/3 left-0 right-0 border-t border-dashed border-emerald-400/30 dark:border-emerald-500/20 before:content-['Нормална'] before:text-[10px] before:text-emerald-500 before:absolute before:-top-4"></div>

                        {chartEntriesData.length > 0 ? (
                            chartEntriesData.map((entry, index) => {
                                const val = parseFloat(entry.value)
                                const heightPercent = Math.min(Math.max((val / 15) * 100, 15), 100) // за вскяо стълбче делим стойноста на зхаарта на 15  и * по 100
                                const isHigh = val > 7.0 // Проверка дали захарта е висока 

                                return (
                                    <div key={entry.id || index} className="w-full flex flex-col items-center gap-2 h-full justify-end group relative">
                                        {/* Тултип при задържане */}
                                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg shadow-lg pointer-events-none z-20 whitespace-nowrap">
                                            {entry.value} mmol/L ({entry.time_of_day})
                                        </div>

                                        {/* Стълбче */}
                                        <div
                                            style={{ height: `${heightPercent}%` }}
                                            className={`w-full rounded-t-xl transition-all duration-500 ${isHigh ? 'bg-red-400 dark:bg-red-500/80' : 'bg-emerald-500 dark:bg-emerald-500'}`}
                                        ></div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                                Няма въведени записи за избрания период ({chartRange === 'day' ? 'днес' : chartRange === 'week' ? 'тази седмица' : 'този месец'}).
                            </div>
                        )}
                    </div>

                    {/* Етикети долу под графиката */}
                    <div className="flex justify-between text-[11px] text-slate-400 mt-3 font-medium px-1">
                        <span>← Начало на периода</span>
                        <span className="capitalize">Изглед: {chartRange === 'day' ? 'Ден' : chartRange === 'week' ? 'Седмица' : 'Месец'} ({chartEntriesData.length} записа)</span>
                        <span>Край →</span>
                    </div>
                </div>

                {/* ОСНОВЕН ДВУКОЛОНЕН ЛЕЙАУТ (Форма и История) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ЛЯВА КОЛОНА: Форма за нов запис */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/70 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 p-6 rounded-3xl shadow-xl backdrop-blur-xl sticky top-6 space-y-6">

                            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <PlusCircle size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100">Нов запис</h2>
                                    <p className="text-xs text-slate-400">Въведи текущо измерване</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 block">Стойност (mmol/L)</label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="напр. 5.6"
                                        value={glucose}
                                        onChange={(e) => setGlucose(e.target.value)}
                                        className="bg-white/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 rounded-xl py-5 text-lg font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 block">Период от деня</label>
                                    <select
                                        className="w-full bg-white/50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                        value={timeOfDay}
                                        onChange={(e) => setTimeOfDay(e.target.value)}
                                    >
                                        {['сутрин', 'преди обед', 'обед', 'следобед', 'вечер', 'преди лягане'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 block">Точен час</label>
                                    <Input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="bg-white/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 rounded-xl py-5 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 block">Бележки</label>
                                    <Input
                                        placeholder="напр. след хранене, разходка..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="bg-white/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 rounded-xl py-5 text-sm"
                                    />
                                </div>

                                <Button
                                    onClick={handleSave}
                                    className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    ЗАПИШИ ИЗМЕРВАНЕТО
                                </Button>
                            </div>

                        </div>
                    </div>

                    {/* ДЯСНА КОЛОНА: Филтри и История на записите */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Лента с филтри и сортиране */}
                        <div className="bg-white/70 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 p-6 rounded-3xl shadow-xl backdrop-blur-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                    <Filter size={14} /> Филтър по период:
                                </label>
                                <select
                                    value={filterTimeOfDay}
                                    onChange={(e) => setFilterTimeOfDay(e.target.value)}
                                    className="bg-white/50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-zinc-300 outline-none"
                                >
                                    <option value="all">Всички периоди</option>
                                    {['сутрин', 'преди обед', 'обед', 'следобед', 'вечер', 'преди лягане'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                    <ArrowUpDown size={14} /> Сортиране по стойност:
                                </label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                                    className="bg-white/50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-zinc-300 outline-none"
                                >
                                    <option value="desc">Най-висока захар (Низходящо)</option>
                                    <option value="asc">Най-ниска захар (Възходящо)</option>
                                </select>
                            </div>
                        </div>

                        {/* Таблица с историята */}
                        <div className="bg-white/70 dark:bg-zinc-900/70 border border-slate-200/60 dark:border-zinc-800/60 rounded-3xl shadow-xl backdrop-blur-xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Activity size={20} className="text-emerald-600" /> История на записите
                                </h3>
                                <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-bold">
                                    {filteredAndSortedEntries.length} записа
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50/50 dark:bg-zinc-800/40 uppercase text-[11px] font-semibold text-slate-400 tracking-wider">
                                        <tr>
                                            <th className="p-4">Захар</th>
                                            <th className="p-4">Период / Време</th>
                                            <th className="p-4">Бележка</th>
                                            <th className="p-4 text-right">Действие</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                        {filteredAndSortedEntries.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                                                <td className="p-4">
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl text-xs border border-emerald-500/20">
                                                        {entry.value} mmol/L
                                                    </span>
                                                </td>
                                                <td className="p-4 capitalize text-slate-700 dark:text-zinc-300">
                                                    {entry.time_of_day} {entry.entry_time ? <span className="text-xs text-slate-400">({entry.entry_time})</span> : ''}
                                                </td>
                                                <td className="p-4 text-slate-500 dark:text-zinc-400 max-w-[200px] truncate text-xs font-light">
                                                    {entry.notes || '—'}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(entry.id)}
                                                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-red-500 hover:bg-red-500/10 inline-flex items-center justify-center transition-all"
                                                        title="Изтрий записа"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredAndSortedEntries.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-12 text-center">
                                                    <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-3">
                                                        <AlertCircle size={24} />
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-zinc-400 font-light">Няма намерени записи по избраните критерии.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    )
}