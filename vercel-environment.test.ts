import { describe, expect, it } from 'vitest';
import { validateVercelEnvironment } from '../../scripts/check-vercel-env.mjs';
const environment = {
  VITE_SUPABASE_URL: 'https://backend.example.com',
  SUPABASE_URL: 'https://backend.example.com',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'test-public',
  SUPABASE_PUBLISHABLE_KEY: 'test-public',
  SUPABASE_SERVICE_ROLE_KEY: 'test-private',
};
describe('external deployment requirements', () => {
  it('rejects public-only credentials for privileged file endpoints', () => {
    expect(validateVercelEnvironment({ ...environment, SUPABASE_SERVICE_ROLE_KEY: '' })).toContain('Missing SUPABASE_SERVICE_ROLE_KEY');
  });
  it('accepts complete server and browser configuration', () => {
    expect(validateVercelEnvironment(environment)).toEqual([]);
  });
  it('rejects different browser and server backends', () => {
    expect(validateVercelEnvironment({ ...environment, SUPABASE_URL: 'https://other.example.com' })).toContain('Browser and server must use the same backend URL');
  });
});