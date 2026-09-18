import { describe, expect, it } from 'vitest';
import { PUZZLES, ROOMS } from '../src/data';
import {
  canAccess,
  beginPuzzle,
  canSlide,
  freshGame,
  gear,
  install,
  openContainer,
  leaveRoom,
  isAnswer,
  parseSave,
  pipesConnected,
  pour,
  slide,
  solve,
  take,
  toggleLights,
  WATER_STATES,
} from '../src/engine';

describe('physical mechanisms', () => {
  it('saves the slide arrangement before the first reference visit and preserves it on resume', () => {
    const fresh = { ...freshGame(), started: true, room: 2, unlocked: 2 };
    const opened = beginPuzzle(fresh, 'r3-slide');
    expect(opened.values['r3-slide']).toEqual(PUZZLES['r3-slide'].initial);
    expect(opened.values['r3-slide']).not.toBe(PUZZLES['r3-slide'].initial);
    const readPaper = { ...opened, seen: ['r3-plan'] };
    expect(beginPuzzle(readPaper, 'r3-slide').values['r3-slide']).toEqual(
      opened.values['r3-slide'],
    );
    const changed = slide(opened.values['r3-slide'], 7);
    const saved = parseSave(JSON.stringify({ ...readPaper, values: { 'r3-slide': changed } }));
    expect(beginPuzzle(saved!, 'r3-slide').values['r3-slide']).toEqual(changed);
  });
  it('makes the same adjacent tiles movable before and after reading the reference', () => {
    const v = PUZZLES['r3-slide'].initial;
    expect(v.map((_, i) => canSlide(v, i))).toEqual([
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
    ]);
    const state = { ...freshGame(), room: 2, unlocked: 2 };
    expect(canAccess(state, PUZZLES['r3-slide'])).toBe(true);
    expect(canAccess({ ...state, seen: ['r3-plan'] }, PUZZLES['r3-slide'])).toBe(true);
  });
  it('water photographs cover all 16 reachable states and reject impossible saves', () => {
    expect(WATER_STATES).toHaveLength(16);
    for (const state of WATER_STATES)
      for (let from = 0; from < 3; from++)
        for (let to = 0; to < 3; to++) expect(WATER_STATES).toContainEqual(pour(state, from, to));
    expect(
      parseSave(JSON.stringify({ ...freshGame(), values: { 'r2-water': [4, 2, 2] } })),
    ).toBeNull();
  });
  it('the twenty-move slide hint solves the more demanding initial arrangement', () => {
    let values = [...PUZZLES['r3-slide'].initial];
    for (const tile of [3, 1, 6, 3, 5, 7, 2, 4, 3, 5, 1, 8, 7, 1, 4, 2, 1, 4, 5, 6]) {
      const next = slide(values, values.indexOf(tile));
      expect(next).not.toBe(values);
      values = next;
    }
    expect(values).toEqual(PUZZLES['r3-slide'].answer);
  });
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
  it('all twenty puzzles require explicit collection, installation and door opening', () => {
    let s = { ...freshGame(), started: true };
    for (const p of Object.values(PUZZLES)) {
      if (p.id === 'r2-pipes') s = take({ ...s, face: 5 }, 'wrench');
      if (p.id === 'r4-exit')
        for (const seal of ['seal1', 'seal2', 'seal3', 'seal4']) s = install(s, p.id, seal);
      if (p.item) {
        expect(s.inventory).toContain(p.item);
        s = install(s, p.id, p.item);
      }
      expect(canAccess(s, p), p.id).toBe(true);
      s = solve(s, p.id, p.answer);
      expect(s.solved, p.id).toContain(p.id);
      if (p.reward) {
        expect(s.inventory).not.toContain(p.reward);
        s = openContainer(s, p.id);
        s = take(s, p.reward);
        expect(s.inventory).toContain(p.reward);
      }
      if (p.id.endsWith('exit')) s = leaveRoom(s);
    }
    expect(s.finished).toBe(true);
    expect(s.unlocked).toBe(3);
    expect(s.solved).toHaveLength(20);
    for (const id of ['seal1', 'seal2', 'seal3', 'seal4']) expect(s.mounted).toContain(id);
    expect(s.inventory).toContain('wrench');
  });
  it('wrong answers and repeated solves never duplicate rewards', () => {
    let s = freshGame();
    const p = PUZZLES['r1-drawer'];
    expect(solve(s, p.id, [0, 0, 0, 0])).toBe(s);
    s = solve(s, p.id, p.answer);
    expect(solve(s, p.id, p.answer)).toBe(s);
    expect(s.inventory).not.toContain('crank');
    s = take(openContainer(s, p.id), 'crank');
    expect(take(s, 'crank')).toBe(s);
    expect(s.inventory.filter((n) => n === 'crank')).toHaveLength(1);
  });
  it('installed consumables remain installed after resume', () => {
    let s = solve({ ...freshGame(), started: true }, 'r1-drawer', PUZZLES['r1-drawer'].answer);
    s = take(openContainer(s, 'r1-drawer'), 'crank');
    s = install(s, 'r1-clock', 'crank');
    const saved = parseSave(JSON.stringify(s));
    expect(saved?.installed).toContain('r1-clock');
    expect(saved?.inventory).not.toContain('crank');
    expect(canAccess(saved!, PUZZLES['r1-clock'])).toBe(true);
  });
});

describe('save recovery', () => {
  it.each([1, 2])(
    'previous version %s can collect the newly supplied box key and finish',
    (version) => {
      const before = {
        ...freshGame(),
        version,
        started: true,
        room: 3,
        unlocked: 3,
        solved: ['r4-power', 'r4-gears', 'r4-balance', 'r4-memory'],
        opened: ['r4-memory'],
        mounted: ['seal1', 'seal2', 'seal3', 'seal4'],
        inventory: ['seal1', 'seal2', 'seal3', 'seal4'],
      };
      let s = parseSave(JSON.stringify(before))!;
      expect(s.collected).not.toContain('exitKey');
      expect(canAccess(s, PUZZLES['r4-exit'])).toBe(false);
      s = take(s, 'exitKey');
      expect(s.inventory).toContain('exitKey');
      for (const seal of ['seal1', 'seal2', 'seal3', 'seal4']) s = install(s, 'r4-exit', seal);
      s = install(s, 'r4-exit', 'exitKey');
      const resumed = parseSave(JSON.stringify(s))!;
      expect(resumed.inventory).not.toContain('exitKey');
      expect(resumed.installed).toContain('r4-exit');
      expect(take(resumed, 'exitKey')).toBe(resumed);
      expect(leaveRoom(solve(resumed, 'r4-exit', [2, 6, 9, 4])).finished).toBe(true);
    },
  );
  it('the final key is collected only from the unlocked open box in room four', () => {
    const locked = { ...freshGame(), room: 3, unlocked: 3 };
    expect(take(locked, 'exitKey')).toBe(locked);
    const solved = { ...locked, solved: ['r4-memory'] };
    expect(take(solved, 'exitKey')).toBe(solved);
    const open = openContainer(solved, 'r4-memory');
    expect(open.inventory).not.toContain('exitKey');
    expect(take({ ...open, room: 2 }, 'exitKey').inventory).not.toContain('exitKey');
    const taken = take(open, 'exitKey');
    expect(taken.inventory).toEqual(['exitKey']);
    expect(take(taken, 'exitKey')).toBe(taken);
  });
  it('migrates automatically awarded legacy items without respawning used items', () => {
    const legacy = {
      ...freshGame(),
      version: 1,
      started: true,
      solved: ['r1-drawer', 'r1-clock'],
      inventory: ['key'],
      installed: ['r1-clock'],
    };
    delete (legacy as Partial<typeof legacy>).opened;
    delete (legacy as Partial<typeof legacy>).collected;
    delete (legacy as Partial<typeof legacy>).mounted;
    const migrated = parseSave(JSON.stringify(legacy))!;
    expect(migrated.version).toBe(2);
    expect(migrated.collected).toEqual(expect.arrayContaining(['crank', 'key']));
    expect(migrated.opened).toContain('r1-drawer');
    expect(take(migrated, 'crank')).toBe(migrated);
    expect(migrated.inventory).toEqual(['key']);
  });
  it('persists a solved but unopened reward and collects only after opening', () => {
    const solved = solve(freshGame(), 'r1-drawer', PUZZLES['r1-drawer'].answer);
    expect(take(solved, 'crank')).toBe(solved);
    const resumed = parseSave(JSON.stringify(solved))!;
    const opened = openContainer(resumed, 'r1-drawer');
    expect(opened.inventory).toHaveLength(0);
    const collected = take(opened, 'crank');
    expect(collected.inventory).toEqual(['crank']);
    expect(take(parseSave(JSON.stringify(collected))!, 'crank').inventory).toEqual(['crank']);
  });
  it('does not accept another room, wrong object, or repeat installation', () => {
    let s = { ...freshGame(), inventory: ['crank'] };
    expect(install(s, 'r1-clock', 'key')).toBe(s);
    expect(install({ ...s, room: 1, unlocked: 1 }, 'r1-clock', 'crank').installed).toHaveLength(0);
    s = install(s, 'r1-clock', 'crank');
    expect(install(s, 'r1-clock', 'crank')).toBe(s);
  });
  it('cannot pick up a hidden reward or leave a locked room', () => {
    const s = freshGame();
    expect(take(s, 'crank')).toBe(s);
    expect(openContainer(s, 'r1-drawer')).toBe(s);
    expect(take({ ...s, unlocked: 1 }, 'wrench')).toEqual({ ...s, unlocked: 1 });
    expect(leaveRoom(s)).toBe(s);
  });
  it('rejects malformed or incompatible saves', () => {
    for (const raw of [
      '{',
      'null',
      '[]',
      '{}',
      JSON.stringify({ ...freshGame(), version: 99 }),
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
