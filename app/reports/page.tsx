'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import jsPDF from 'jspdf' // JS библиотека за създаване на PDF файлове от 0-лата
import autoTable from 'jspdf-autotable' // JS библиотека за чертаене на таблицата в PDF

const supabase = createClient()

export default function ReportsPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [entries, setEntries] = useState<any[]>([])
    const [generating, setGenerating] = useState(false) // отговаря за показване на текста "Генериране..."
    const [selectedPeriod, setSelectedPeriod] = useState('all') // Пази избор от падащо меню 

    useEffect(() => {
        const fetchUserAndEntries = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.user) {
                router.push('/login')
                return
            }

            setUser(session.user)

            const { data } = await supabase
                .from('glucose_entries')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })

            if (data) setEntries(data)
            setLoading(false)
        }

        fetchUserAndEntries()
    }, [router])

    // Помощна функция за транслитерация на кирилица към латиница за перфектен PDF вид
    const transliterate = (text: string) => {
        if (!text) return '—';
        const map: { [key: string]: string } = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya',
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y', 'Ю': 'Yu', 'Я': 'Ya'
        };
        return text.split('').map(char => map[char] || char).join('');
    };
    // Подготовка за генериране на PDF
    const generatePDF = () => {
        setGenerating(true)

        const filteredEntries = entries.filter((entry) => {
            if (selectedPeriod === 'all') return true // ako e избрано, взимаме всички записи 
            const entryDate = new Date(entry.created_at) // днешна дата 
            const now = new Date() // 
            const diffTime = Math.abs(now.getTime() - entryDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (selectedPeriod === '7days') return diffDays <= 7
            if (selectedPeriod === '30days') return diffDays <= 30
            return true
        })

        if (filteredEntries.length === 0) {
            alert('Няма записи за избрания период.')
            setGenerating(false)
            return
        }

        const doc = new jsPDF() // празен бял лист в паметта на браузъра 

        // Чертаене на PDF документа  
        doc.setFillColor(16, 185, 129)
        doc.rect(0, 0, 210, 15, 'F')

        // Заглавие
        doc.setFontSize(20)
        doc.setTextColor(15, 23, 42)
        doc.text('GLYCO - MEDICAL REPORT', 14, 28)

        doc.setFontSize(10)
        doc.setTextColor(100, 116, 139)
        doc.text(`Patient Email: ${user?.email}`, 14, 36)
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 42)

        const avg = (
            filteredEntries.reduce((acc, curr) => acc + Number(curr.value), 0) / filteredEntries.length
        ).toFixed(1)

        // Статистическо блокче
        doc.setFillColor(241, 245, 249)
        doc.roundedRect(14, 48, 182, 18, 3, 3, 'F')

        doc.setFontSize(10)
        doc.setTextColor(30, 41, 59)
        doc.text(`Total Records: ${filteredEntries.length}`, 20, 59)
        doc.text(`Average Glucose: ${avg} mmol/L`, 110, 59)

        // Данни в таблицата с транслитерация за перфектна четливост
        const tableData = filteredEntries.map((item) => [
            new Date(item.created_at).toLocaleDateString('en-GB'),
            transliterate(item.time_of_day || '—'),
            item.entry_time || '—',
            `${item.value} mmol/L`,
            transliterate(item.notes || '—')
        ])

        autoTable(doc, {
            startY: 72,
            head: [['Date', 'Period', 'Time', 'Value', 'Notes']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [16, 185, 129],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                halign: 'center',
                fontSize: 9
            },
            columnStyles: {
                4: { halign: 'left' }
            },
            styles: { cellPadding: 4 },
        })

        const pageCount = (doc as any).internal.getNumberOfPages()
        doc.setFontSize(8)
        doc.setTextColor(150)
        // Проверка колко странции са се генерирали 
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.text('Glyco Health App - Official Medical Review Report', 14, 290)
        }

        doc.save(`glyco-medical-report-${new Date().toISOString().slice(0, 10)}.pdf`) // сваляне на файла 
        setGenerating(false) // изключваме индикатора за зареждане 
    }

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <p className="text-sm text-slate-500">Зареждане на докладите...</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <span>📄</span> Медицински Доклади
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                        Експортирай дневника на измерванията си в готов PDF за твоя лекар
                    </p>
                </div>
                <Link href="/dashboard" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                    ← Към Dashboard
                </Link>
            </div>

            <Card className="p-6 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-lg">Настройки на отчета</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                            Избери период за експорт:
                        </label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="w-full p-2.5 text-sm border rounded-xl bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 cursor-pointer"
                        >
                            <option value="all">Всички налични измервания</option>
                            <option value="7days">Последните 7 дни</option>
                            <option value="30days">Последните 30 дни</option>
                        </select>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 text-sm text-slate-600 dark:text-zinc-400">
                        Отчетът ще бъде генериран с професионално медицинско оформление, перфектна таблична подредба и ясни латински символи за безпроблемно четене от лекар.
                    </div>

                    <Button
                        onClick={generatePDF}
                        disabled={generating || entries.length === 0}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-xl transition-all cursor-pointer"
                    >
                        {generating ? 'Генериране...' : '📥 Свали професионален PDF отчет'}
                    </Button>

                    {entries.length === 0 && (
                        <p className="text-xs text-center text-red-500">
                            Нямаш налични измервания. Въведи стойности в Dashboard-а първо.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}