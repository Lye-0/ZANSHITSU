import { describe, expect, it } from 'vitest';
import { PUZZLES, ROOMS } from '../src/data';
import {
  canAccess,
  freshGame,
  gear,
  install,
  isAnswer,
  parseSave,
  pipesConnected,
  pour,
  slide,
  solve,
  take,
  toggleLights,
} from '../src/engine';

describe('physical mechanisms', () => {
  it('conserves water, respects capacity, and can split eight into four and four', () => {
    let v = [8, 0, 0];
    for (const [a, b] of [
      [0, 1],
      [1, 2],
      [2, 0],
      [1, 2],
      [0, 1],
      [1, 2],
      [2, 0],
    ]) {
      v = pour(v, a, b);
      expect(v.reduce((a, b) => a + b, 0)).toBe(8);
      v.forEach((n, i) => expect(n).toBeLessThanOrEqual([8, 5, 3][i]));
    }
    expect(v).toEqual([4, 4, 0]);
  });
  it('lights only flip at manhattan distance one, never wrapping rows', () => {
    expect(toggleLights(Array(9).fill(0), 2, 3)).toEqual([0, 1, 1, 0, 0, 1, 0, 0, 0]);
  });
  it.each([
    ['r1-power', [0, 2, 4, 6, 8]],
    ['r4-power', [0, 6, 9, 12, 15]],
  ] as const)('the published hint solves %s', (id, steps) => {
    const p = PUZZLES[id];
    let v = [...p.initial];
    for (const n of steps) v = toggleLights(v, n, p.size!);
    expect(isAnswer(p, v)).toBe(true);
  });
  it('pipe connection requires all nine tiles with no leaking edges', () => {
    expect(pipesConnected(PUZZLES['r2-pipes'].answer)).toBe(true);
    expect(pipesConnected(Array(9).fill(0))).toBe(false);
    expect(pipesConnected([1, 1, 1, 1, 1, 1, 1, 1, 1])).toBe(false);
  });
  it('gear hint reaches the target via linked neighbor movement', () => {
    let v = [0, 0, 0, 0];
    for (const n of [0, 1, 1, 2, 2, 2]) v = gear(v, n);
    expect(v).toEqual(PUZZLES['r4-gears'].answer);
  });
  it('slide puzzle is solvable and never allows a diagonal move', () => {
    const p = PUZZLES['r3-slide'];
    const a = p.initial.filter((n) => n);
    let inversions = 0;
    for (let i = 0; i < a.length; i++)
      for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) inversions++;
    expect(inversions % 2).toBe(0);
    expect(slide([1, 2, 3, 4, 0, 5, 6, 7, 8], 0)).toEqual([1, 2, 3, 4, 0, 5, 6, 7, 8]);
  });
});

describe('complete progression', () => {
  it('every puzzle has a reachable in-room hotspot', () => {
    for (const p of Object.values(PUZZLES))
      expect(ROOMS[p.room].views.flat().some((n) => n.kind === 'puzzle' && n.target === p.id)).toBe(
        true,
      );
  });
  it('cannot unlock a later room or skip prerequisites with a known answer', () => {
    const s = freshGame();
    expect(solve(s, 'r4-exit', PUZZLES['r4-exit'].answer)).toBe(s);
    expect(solve(s, 'r1-exit', PUZZLES['r1-exit'].answer)).toBe(s);
    expect(install(s, 'r1-clock', 'crank')).toBe(s);
  });
  it('all twenty puzzles and item gates lead to a finish, retaining four seals', () => {
    let s = { ...freshGame(), started: true };
    for (const p of Object.values(PUZZLES)) {
      if (p.id === 'r2-pipes') s = take(s, 'wrench');
      if (p.item) {
        expect(s.inventory).toContain(p.item);
        s = install(s, p.id, p.item);
      }
      expect(canAccess(s, p), p.id).toBe(true);
      s = solve(s, p.id, p.answer);
      expect(s.solved, p.id).toContain(p.id);
    }
    expect(s.finished).toBe(true);
    expect(s.unlocked).toBe(3);
    expect(s.solved).toHaveLength(20);
    for (const id of ['seal1', 'seal2', 'seal3', 'seal4']) expect(s.inventory).toContain(id);
  });
  it('wrong answers and repeated solves never duplicate rewards', () => {
    let s = freshGame();
    const p = PUZZLES['r1-drawer'];
    expect(solve(s, p.id, [0, 0, 0, 0])).toBe(s);
    s = solve(s, p.id, p.answer);
    expect(solve(s, p.id, p.answer)).toBe(s);
    expect(s.inventory.filter((n) => n === 'crank')).toHaveLength(1);
  });
  it('installed consumables remain installed after resume', () => {
    let s = solve({ ...freshGame(), started: true }, 'r1-drawer', PUZZLES['r1-drawer'].answer);
    s = install(s, 'r1-clock', 'crank');
    const saved = parseSave(JSON.stringify(s));
    expect(saved?.installed).toContain('r1-clock');
    expect(saved?.inventory).not.toContain('crank');
    expect(canAccess(saved!, PUZZLES['r1-clock'])).toBe(true);
  });
});

describe('save recovery', () => {
  it('rejects malformed or incompatible saves', () => {
    for (const raw of [
      '{',
      'null',
      '[]',
      '{}',
      JSON.stringify({ ...freshGame(), version: 2 }),
      JSON.stringify({ ...freshGame(), room: 19 }),
      JSON.stringify({ ...freshGame(), values: { 'r2-water': [100, 0, 0] } }),
      JSON.stringify({ ...freshGame(), values: { 'r3-slide': [1, 1, 1, 1, 1, 1, 1, 1, 0] } }),
    ])
      expect(parseSave(raw)).toBeNull();
  });
  it('round trips an in-progress game without losing settings or a partial sequence', () => {
    const s = {
      ...freshGame(),
      started: true,
      sound: true,
      brightness: 1.2,
      values: { 'r1-drawer': [3, 1] },
      seen: ['r1-print'],
      hints: { 'r1-drawer': 2 },
    };
    expect(parseSave(JSON.stringify(s))).toEqual(s);
  });
});
