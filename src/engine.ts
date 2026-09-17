import { ITEMS, PUZZLES } from './data';
import type { Puzzle } from './data';
export const SAVE_KEY = 'zanshitsu:save:v1';
export type GameState = {
  version: 1;
  started: boolean;
  room: number;
  face: number;
  unlocked: number;
  solved: string[];
  inventory: string[];
  installed: string[];
  values: Record<string, number[]>;
  seen: string[];
  hints: Record<string, number>;
  elapsed: number;
  finished: boolean;
  sound: boolean;
  brightness: number;
  motion: boolean;
};
export function freshGame(): GameState {
  return {
    version: 1,
    started: false,
    room: 0,
    face: 0,
    unlocked: 0,
    solved: [],
    inventory: [],
    installed: [],
    values: {},
    seen: [],
    hints: {},
    elapsed: 0,
    finished: false,
    sound: false,
    brightness: 1,
    motion: true,
  };
}
export const same = (a: number[], b: number[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);
export function toggleLights(values: number[], index: number, size: number) {
  const next = [...values];
  for (let i = 0; i < values.length; i++)
    if (
      Math.abs(Math.floor(i / size) - Math.floor(index / size)) +
        Math.abs((i % size) - (index % size)) <=
      1
    )
      next[i] = 1 - next[i];
  return next;
}
export function pour(values: number[], from: number, to: number) {
  const caps = [8, 5, 3];
  const next = [...values];
  if (from === to || from < 0 || to < 0 || from > 2 || to > 2) return next;
  const amount = Math.min(next[from], caps[to] - next[to]);
  next[from] -= amount;
  next[to] += amount;
  return next;
}
export function slide(values: number[], index: number) {
  const empty = values.indexOf(0);
  if (
    Math.abs(Math.floor(empty / 3) - Math.floor(index / 3)) +
      Math.abs((empty % 3) - (index % 3)) !==
    1
  )
    return values;
  const next = [...values];
  [next[index], next[empty]] = [next[empty], next[index]];
  return next;
}
export function gear(values: number[], index: number) {
  return values.map((v, i) => (v + (i === index || i === (index + 1) % values.length ? 1 : 0)) % 8);
}
export const PIPE_SHAPES = [
  [0, 2],
  [0, 2],
  [0, 1],
  [0, 1],
  [0, 2],
  [0, 1],
  [0, 1],
  [0, 2],
  [0, 2],
];
export function pipeEdges(values: number[], i: number) {
  return PIPE_SHAPES[i].map((n) => (n + values[i]) % 4);
}
export function pipesConnected(values: number[]) {
  if (values.length !== 9 || !pipeEdges(values, 0).includes(3) || !pipeEdges(values, 8).includes(1))
    return false;
  let index = 0,
    incoming = 3;
  const seen = new Set<number>();
  while (!seen.has(index)) {
    seen.add(index);
    const edges = pipeEdges(values, index);
    if (!edges.includes(incoming)) return false;
    const out = edges.find((e) => e !== incoming)!;
    if (index === 8 && out === 1) return seen.size === 9;
    const row = Math.floor(index / 3),
      col = index % 3;
    const nr = row + [-1, 0, 1, 0][out],
      nc = col + [0, 1, 0, -1][out];
    if (nr < 0 || nr > 2 || nc < 0 || nc > 2) return false;
    index = nr * 3 + nc;
    incoming = (out + 2) % 4;
  }
  return false;
}
export function isAnswer(p: Puzzle, values: number[]) {
  return p.kind === 'pipes' ? pipesConnected(values) : same(values, p.answer);
}
export function canAccess(s: GameState, p: Puzzle) {
  return (
    p.room <= s.unlocked &&
    (!p.requires || p.requires.every((id) => s.solved.includes(id))) &&
    (!p.item || s.installed.includes(p.id)) &&
    (p.id !== 'r4-exit' ||
      ['seal1', 'seal2', 'seal3', 'seal4'].every((id) => s.inventory.includes(id)))
  );
}
export function install(s: GameState, id: string, item: string): GameState {
  const p = PUZZLES[id];
  if (
    !p ||
    p.room > s.unlocked ||
    p.item !== item ||
    !s.inventory.includes(item) ||
    (p.requires && !p.requires.every((k) => s.solved.includes(k)))
  )
    return s;
  return {
    ...s,
    installed: [...new Set([...s.installed, id])],
    inventory: s.inventory.filter((k) => k !== item),
  };
}
export function solve(s: GameState, id: string, values: number[]): GameState {
  const p = PUZZLES[id];
  if (!p || !canAccess(s, p) || s.solved.includes(id) || !isAnswer(p, values)) return s;
  return {
    ...s,
    solved: [...s.solved, id],
    values: { ...s.values, [id]: values },
    inventory: p.reward ? [...new Set([...s.inventory, p.reward])] : s.inventory,
    unlocked: id.endsWith('exit') ? Math.max(s.unlocked, Math.min(3, p.room + 1)) : s.unlocked,
    finished: id === 'r4-exit' || s.finished,
  };
}
export function take(s: GameState, id: string): GameState {
  if (
    id !== 'wrench' ||
    s.unlocked < 1 ||
    s.inventory.includes(id) ||
    s.installed.includes('r2-pipes')
  )
    return s;
  return { ...s, inventory: [...s.inventory, id] };
}
function validValues(p: Puzzle, v: unknown): v is number[] {
  if (!Array.isArray(v) || !v.every((n) => Number.isInteger(n) && n >= 0)) return false;
  if (p.kind === 'sequence')
    return v.length <= p.answer.length && v.every((n) => n < (p.glyphs ? 6 : 5));
  if (v.length !== p.initial.length) return false;
  if (p.kind === 'water')
    return v.reduce((a, b) => a + b, 0) === 8 && v.every((n, i) => n <= [8, 5, 3][i]);
  if (p.kind === 'slide')
    return same(
      [...v].sort((a, b) => a - b),
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
    );
  if (p.kind === 'order')
    return same(
      [...v].sort((a, b) => a - b),
      [0, 1, 2, 3, 4],
    );
  return v.every((n) => n < (p.kind === 'lights' ? 2 : p.kind === 'pipes' ? 4 : (p.modulus ?? 10)));
}
export function parseSave(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    const x = JSON.parse(raw);
    if (
      !x ||
      x.version !== 1 ||
      typeof x.started !== 'boolean' ||
      !Number.isInteger(x.room) ||
      x.room < 0 ||
      x.room > 3 ||
      !Number.isInteger(x.unlocked) ||
      x.unlocked < x.room ||
      x.unlocked > 3 ||
      !Number.isInteger(x.face) ||
      x.face < 0 ||
      x.face > 5
    )
      return null;
    for (const k of ['solved', 'inventory', 'installed', 'seen'])
      if (!Array.isArray(x[k]) || !x[k].every((n: unknown) => typeof n === 'string')) return null;
    if (
      !x.solved.every((k: string) => PUZZLES[k]) ||
      !x.inventory.every((k: string) => ITEMS[k]) ||
      !x.installed.every((k: string) => PUZZLES[k]?.item) ||
      !x.values ||
      typeof x.values !== 'object'
    )
      return null;
    if (!Object.entries(x.values).every(([k, v]) => PUZZLES[k] && validValues(PUZZLES[k], v)))
      return null;
    return {
      ...freshGame(),
      ...x,
      finished: x.solved.includes('r4-exit'),
      elapsed: Number.isFinite(x.elapsed) ? Math.max(0, x.elapsed) : 0,
      brightness: typeof x.brightness === 'number' ? Math.max(0.8, Math.min(1.5, x.brightness)) : 1,
      sound: x.sound === true,
      motion: x.motion !== false,
      hints:
        typeof x.hints === 'object' && x.hints
          ? Object.fromEntries(
              Object.entries(x.hints).filter(
                ([k, v]) => PUZZLES[k] && Number.isInteger(v) && Number(v) >= 0 && Number(v) <= 3,
              ),
            )
          : {},
    };
  } catch {
    return null;
  }
}
