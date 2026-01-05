// API Configuration
// Set this to true to use mock API (local storage), false to use Supabase
const USE_MOCK_API_RAW = import.meta.env.VITE_USE_MOCK_API === 'true';

// Check if we have Supabase environment variables
const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

// If USE_MOCK_API is false but we don't have Supabase config, force mock mode
const FINAL_USE_MOCK_API = USE_MOCK_API_RAW || !hasSupabaseConfig;

if (FINAL_USE_MOCK_API) {
  console.log('Using mock API for development');
} else {
  console.log('Using Supabase API');
}

export { FINAL_USE_MOCK_API as USE_MOCK_API };