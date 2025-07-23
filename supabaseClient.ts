import { createClient } from '@supabase/supabase-js'

// 아래 두 값을 아까 복사해 둔 값으로 바꿔주세요.
const supabaseUrl = 'https://znixozrpthqcrvgdkgry.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuaXhvenJwdGhxY3J2Z2RrZ3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxODU0MjIsImV4cCI6MjA2ODc2MTQyMn0.YIxAe9FHqaFSUk7uIqtKf9jgR5tzUoA6bhIq9QyEepI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)