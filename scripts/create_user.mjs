import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yhewsytyohwueqlavrbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZXdzeXR5b2h3dWVxbGF2cmJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjIzODcsImV4cCI6MjA5NzUzODM4N30.YONslGhAQMy_fcOsikTIqocxqI6U-tEBi2XK4IegYDo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: 'mukulggn1@gmail.com',
    password: 'mukul@@00',
  });
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success! User created.');
    if (data.session == null && data.user != null) {
      console.log('NOTE: Email confirmation is required. Check your inbox.');
    }
  }
}

main();
