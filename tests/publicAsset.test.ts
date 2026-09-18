import { afterEach, expect, it, vi } from 'vitest';
import { publicAsset } from '../src/publicAsset';
import { photographPaths } from '../src/photoAssets';

afterEach(() => vi.unstubAllEnvs());

it('preserves the local root and follows the Pages project path', () => {
  vi.stubEnv('BASE_URL', '/');
  expect(publicAsset('/images/items/seal3/front.webp')).toBe('/images/items/seal3/front.webp');
  vi.stubEnv('BASE_URL', '/ZANSHITSU/');
  expect(publicAsset('/images/items/seal3/front.webp')).toBe(
    '/ZANSHITSU/images/items/seal3/front.webp',
  );
});

it('includes all photographs under the deployment base without root-only references', () => {
  const local = photographPaths();
  vi.stubEnv('BASE_URL', '/ZANSHITSU/');
  expect(photographPaths()).toEqual(local.map((path) => '/ZANSHITSU' + path));
});
