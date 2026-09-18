import { existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { expect, it } from 'vitest';
import { ITEMS, ROOMS } from '../src/data';
import type { SceneNode } from '../src/data';
import { detailPhoto, outline, SHAPES, viewPhoto } from '../src/photography';
import { freshGame } from '../src/engine';
import { photographPaths } from '../src/photoAssets';
it('every selectable photo including all water states exists', () => {
  for (const path of photographPaths())
    expect(existsSync(resolve('public', '.' + path)), path).toBe(true);
});
it('参照されない写真や候補を配信フォルダに残さない', () => {
  const walk = (p: string): string[] =>
    readdirSync(p, { withFileTypes: true }).flatMap((d) =>
      d.isDirectory()
        ? walk(join(p, d.name))
        : [
            join(p, d.name)
              .replaceAll('\\', '/')
              .replace(/^public/, ''),
          ],
    );
  expect(walk('public/images').sort()).toEqual(photographPaths());
});
it('全24方向と42対象の採用写真・輪郭がそろっている', () => {
  for (let room = 0; room < 4; room++)
    for (let face = 0; face < 6; face++) {
      expect(existsSync(resolve('public', '.' + viewPhoto(room, face)))).toBe(true);
      for (const node of ROOMS[room].views[face] as readonly SceneNode[]) {
        expect(SHAPES[node.id], node.id).toBeDefined();
        const shape = outline(node);
        expect(shape.x).toBeGreaterThanOrEqual(0);
        expect(shape.y).toBeGreaterThanOrEqual(0);
        expect(shape.x + shape.w).toBeLessThanOrEqual(1000);
        expect(shape.y + shape.h).toBeLessThanOrEqual(1000);
        expect(existsSync(resolve('public', '.' + detailPhoto(room, node))), node.id).toBe(true);
      }
    }
});
it('14種類の持ち物の表と裏が実在する', () => {
  for (const id of Object.keys(ITEMS))
    for (const side of ['front', 'back'])
      expect(existsSync(resolve('public/images/items', id, side + '.webp'))).toBe(true);
});
it('開閉と道具取得が写真選択に反映される', () => {
  const s = {
    ...freshGame(),
    solved: ['r1-drawer', 'r1-cabinet', 'r4-memory'],
    opened: ['r1-drawer', 'r1-cabinet', 'r4-memory'],
    inventory: ['wrench'],
  };
  for (const [r, f, end] of [
    [0, 3, 'west-drawer-open.webp'],
    [0, 2, 'south-cabinet-open.webp'],
    [3, 1, 'east-box-open.webp'],
    [1, 5, 'floor-empty.webp'],
  ] as const) {
    expect(viewPhoto(r, f, s)).toContain(end);
    expect(existsSync(resolve('public', '.' + viewPhoto(r, f, s)))).toBe(true);
  }
});
it('配信用写真フォルダにはWebPの決定版だけを置く', () => {
  const walk = (p: string): string[] =>
    readdirSync(p, { withFileTypes: true }).flatMap((d) =>
      d.isDirectory() ? walk(join(p, d.name)) : [join(p, d.name)],
    );
  const files = walk('public/images');
  expect(files.length).toBeGreaterThan(90);
  expect(files.every((p) => p.endsWith('.webp'))).toBe(true);
});
