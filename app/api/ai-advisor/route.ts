import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai' // връзка с AI моделите

// Зареждаме ключа
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) { // API Маршрут. Кръщава се само с HTTP метода, който върши. 
    try {
        if (!process.env.GEMINI_API_KEY) { // Проверка за API ключ
            return NextResponse.json({ error: 'Липсва GEMINI_API_KEY в .env.local' }, { status: 400 })
        }

        const { entries } = await request.json() // извличане на масива 
        if (!entries || entries.length === 0) { // ако масива е празени да се спре изпълннеието и да се продължи напред
            return NextResponse.json({ error: 'Няма налични записи за анализ.' }, { status: 400 })
        }

        const entriesText = entries.map((e: any) => // форматиране от JSON към човешки език 
            `- Стойност: ${e.value} mmol/L, Период: ${e.time_of_day}, Час: ${e.entry_time || 'непосочен'}`
        ).join('\n') // използваме jоin за да превърнем стринговете в един цял текст. 


        const model = genAI.getGenerativeModel({
            model: 'gemini-3.8-flash',
            systemInstruction: 'Ти си професионален и адекватен медицински асистент за приложението Glyco. Отговаряш строго на книжовен български език. Използвай само стандартна медицинска терминология. АБСОЛЮТНО ЗАБРАНЕНО е използването на буквални преводи от английски.'
        }) // задаване на модела и системните инструкции към него 

        // Промпт
        const prompt = `Ето последните измервания на потребителя: 
${entriesText}
ЗАДАЧА:
1. Направи кратък, точен и сериозен анализ на тези данни (използвай булети).
2. Дай 2-3 практични съвета за хранене и движение.
3. Завърши точно с това изречение: "Забележка: Това не е официална медицинска диагноза. При нужда се консултирайте с вашия лекуващ лекар."`

        // Пращаме заявката
        const result = await model.generateContent(prompt) // връзката на нашия сървър със сървърите на google 
        const response = await result.response // отговора
        const aiMessage = response.text() // връщаме отговора, форматиран в текст към браузъра

        return NextResponse.json({ result: aiMessage })

    } catch (error: any) { // Ако нещо се счупи
        console.error('Gemini Error Details:', error) // дава грешката към конзолата
        return NextResponse.json({ error: error.message || 'Възникна грешка при връзката с Gemini.' }, { status: 500 }) // връща грешка към потребителв която клиентския компонент улавя. 
    }
}