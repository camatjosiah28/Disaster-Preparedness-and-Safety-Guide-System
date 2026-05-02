import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

supabase.from('users').select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) console.error('Supabase connection error:', error)
    else console.log('✅ Supabase connected!')
  })