// Осъществява връзка на БД с приложението
import { createBrowserClient } from '@supabase/ssr' // готова функция от supabase. Грижи се да запази сесията на потребителя в cookies за да не се налага да се логва на всяко презареждане на страницата. 

export function createClient() { // Прави функцията достъпна с думата export
    return createBrowserClient( // извиква библитоечната ф-я createBrowserClient  и задава 2-те задължителни правила. 
        'https://jhelqslxslgeswmxoicp.supabase.co', // ! казва, че променливата вече е дефинирана в .env.local файла и да се третира като String
        'sb_publishable_hdW7_EbFwig1MAzR1d6asQ_glnOcqhL' // Не е правилно, но нз как да го оправя
    )
}