console.log('Environment keys containing SUPABASE, KEY, ROLE, SECRET:');
Object.keys(process.env).forEach(key => {
  const upper = key.toUpperCase();
  if (upper.includes('SUPABASE') || upper.includes('KEY') || upper.includes('ROLE') || upper.includes('SECRET')) {
    console.log(`  - ${key}`);
  }
});
