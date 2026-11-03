const required = [
  'VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY',
];

export function validateVercelEnvironment(env) {
  const errors = required.filter(name => !env[name]?.trim()).map(name => `Missing ${name}`);
  for (const name of ['VITE_SUPABASE_URL', 'SUPABASE_URL']) {
    if (!env[name]) continue;
    try {
      if (new URL(env[name]).protocol !== 'https:') errors.push(`${name} must use HTTPS`);
    } catch {
      errors.push(`${name} must be an absolute HTTPS URL`);
    }
  }
  if (env.VITE_SUPABASE_URL && env.SUPABASE_URL && env.VITE_SUPABASE_URL !== env.SUPABASE_URL) {
    errors.push('Browser and server must use the same backend URL');
  }
  return errors;
}

// Importable by tests without reading or printing credentials.
if (process.argv[1]?.endsWith('/check-vercel-env.mjs')) {
  const errors = validateVercelEnvironment(process.env);
  if (errors.length) {
    console.error(`Vercel deployment blocked:\n${errors.join('\n')}`);
    console.error('See DEPLOY_VERCEL.md. Lovable Cloud does not expose its service-role key; an independently managed backend is required for these external server operations.');
    process.exitCode = 1;
  } else {
    console.log('Required Vercel backend environment settings are present.');
    if (!process.env.LOVABLE_API_KEY) console.warn('AI analysis is not configured on this external host.');
  }
}