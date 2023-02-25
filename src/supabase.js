
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://syaejopewlblmtsvugec.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5YWVqb3Bld2xibG10c3Z1Z2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzcxMDEwNjIsImV4cCI6MTk5MjY3NzA2Mn0.hUoqyI9u1eHV-sMtwurO6lsFgin9BiyqNiNB2gkczWE"
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;