
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://raabdjrlkappxwpyihkf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhYWJkanJsa2FwcHh3cHlpaGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTQ4MjUsImV4cCI6MjA4MDgzMDgyNX0._JtfZCepSwhtbunT4UaI-mmZu3QTQdh82AEID-VgMRM'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)