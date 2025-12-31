
import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função auxiliar para componentes verificarem se a conexão está ativa
export const checkSupabaseConnection = async () => {
  try {
    const { data: _data, error } = await supabase.from('places').select('id').limit(1);
    if (error) return false;
    return true;
  } catch (e) {
    return false;
  }
};

console.log("%cVou Lá: Conexão Supabase configurada! ✅", "color: #ccff00; font-weight: bold;");
