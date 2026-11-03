import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ resolve: vi.fn(), log: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: { component: () => React.ReactNode }) => ({ options, useParams: () => ({ token: 'direct-test' }) }),
}));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('@/lib/files.functions', () => ({ resolveFile: mocks.resolve, logClientEvent: mocks.log }));
import { Route } from '@/routes/f/$token';

afterEach(() => { cleanup(); sessionStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it.each([3, 5 * 1024 * 1024 * 1024])('starts the original download without prefetch or hash checks at %i bytes', async size => {
  mocks.resolve.mockResolvedValue({ state: 'active', file: { name: 'Original', originalName: 'original.bin', size, mime: 'application/octet-stream', extension: 'bin', preview: 'none' } });
  mocks.log.mockResolvedValue({ ok: true });
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  const Component = Route.options.component;
  if (!Component) throw new Error('Missing download page');
  render(<Component />);
  await screen.findByRole('button', { name: 'تنزيل مباشر' });
  expect(screen.getByRole('button', { name: 'تنزيل مباشر' })).toBeDisabled();
  fireEvent.change(screen.getByRole('textbox', { name: 'اكتب اسمك للتحميل' }), { target: { value: 'المقداد' } });
  fireEvent.click(screen.getByRole('button', { name: 'حفظ' }));
  const link = screen.getByRole('link', { name: 'تنزيل مباشر' });
  const url = new URL(link.getAttribute('href') || '', 'https://example.com');
  expect(url.pathname).toBe('/api/public/d/direct-test');
  expect(url.searchParams.get('l')).toBe('المقداد');
  expect(sessionStorage.getItem('wasl-label-direct-test')).toBe('المقداد');
  expect(fetch).not.toHaveBeenCalled();
  cleanup();
  render(<Component />);
  await waitFor(() => expect(screen.getByRole('link', { name: 'تنزيل مباشر' })).toBeInTheDocument());
  expect(fetch).not.toHaveBeenCalled();
});