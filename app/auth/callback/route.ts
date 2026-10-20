import { NextResponse } from 'next/server' // използва се за връщане на пренасочвания
import { createClient } from '@/lib/supabaseClient' // вмъкване на потребителя, който трябва да е конфигуриран да работи със сървърни бисквитки 

export async function GET(request: Request) {
    const requestUrl = new URL(request.url) // Превръщаме URL-a в JS obekt  
    const code = requestUrl.searchParams.get('code') // извличаме уникалния код за достъп 
    const origin = requestUrl.origin // взиамаме URL-a на приложението
    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code) // кода се препраща към supabase
        if (!error) {
            return NextResponse.redirect(`${origin}/dashboard`) // Ако няма грешка пренасочваме потребителя към dashboard-а му 
        }
    }

    // При грешка връщаме потребителя към страницата за вход с грешка
    return NextResponse.redirect(`${origin}/login?message=Could not authenticate user`)
}