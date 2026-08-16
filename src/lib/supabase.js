import { createClient } from '@supabase/supabase-js'

const urlSupabase = 'https://vsqzwemlpnsffhfvtjai.supabase.co'
const chavePublicavel = 'sb_publishable_MNAykD6Rj7qW5v9d2wHVpA_WE4hwqS6'

export const supabase = createClient(urlSupabase, chavePublicavel)
