import { expect, it } from 'vitest';
import { turnView } from '../src/navigation';
import { freshGame, parseSave } from '../src/engine';
for (let face = 0; face < 4; face++) {
  it(`壁${face}から天井・床を経由して同じ壁に戻る`, () => {
    const v = { room: 0, face, wallFace: face };
    expect(turnView(turnView(v, 'up'), 'down')).toEqual(v);
    expect(turnView(turnView(v, 'down'), 'up')).toEqual(v);
  });
  it(`壁${face}を見上げた状態を保存・復元する`, () => {
    const g = { ...freshGame(), started: true, face, wallFace: face };
    expect(turnView(parseSave(JSON.stringify(turnView(g, 'up')))!, 'down').face).toBe(face);
  });
}
it('天井で上・左右を押しても別の面へ飛ばない', () => {
  const v = { room: 1, face: 4, wallFace: 2 };
  for (const d of ['left', 'right', 'up'] as const) expect(turnView(v, d)).toBe(v);
});
