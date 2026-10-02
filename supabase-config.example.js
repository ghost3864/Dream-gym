const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabasePublishableKey = 'YOUR_SUPABASE_PUBLISHABLE_KEY';
const supabaseStorageKey = 'dream-gym-auth-token';

const supabaseClient = window.supabase.createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
        storage: sessionStorage,
        storageKey: supabaseStorageKey,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});
