import { ROOMS } from './data';
import type { SceneNode } from './data';
import { STATE_PHOTO_IDS, statePhoto } from './mechanismPhotos';
export const ROOM_FOLDERS = ['01-waiting', '02-washroom', '03-projection', '04-return'];
export const FACES = ['north', 'east', 'south', 'west', 'ceiling', 'floor'];
export const viewPhoto = (
  room: number,
  face: number,
  state?: { solved: string[]; inventory: string[]; installed: string[]; opened?: string[] },
) => {
  const base = `/images/rooms/${ROOM_FOLDERS[room]}`;
  if (room === 3 && face === 4 && state && !state.solved.includes('r4-power'))
    return base + '/states/ceiling-unlit.webp';
  if (room === 0 && face === 3 && state?.opened?.includes('r1-drawer'))
    return base + '/states/west-drawer-open.webp';
  if (room === 0 && face === 2 && state?.opened?.includes('r1-cabinet'))
    return base + '/states/south-cabinet-open.webp';
  if (room === 3 && face === 1 && state?.opened?.includes('r4-memory'))
    return base + '/states/east-box-open.webp';
  if (
    room === 1 &&
    face === 5 &&
    (state?.inventory.includes('wrench') || state?.installed.includes('r2-pipes'))
  )
    return base + '/states/floor-empty.webp';
  return base + `/views/${FACES[face]}.webp`;
};
export type Shape = {
  bounds: [number, number, number, number];
  points?: string;
  ellipse?: boolean;
  path?: string;
};
export const SHAPES: Record<string, Shape> = {
  'r1-clock': { bounds: [14, 17, 12, 13], ellipse: true },
  'r1-exit': { bounds: [34, 16, 32, 60] },
  'r1-print': { bounds: [36, 17, 29, 24] },
  'r1-chairs': {
    bounds: [14, 49, 41, 33],
    points:
      '3,0 46,0 47,42 52,42 53,0 93,0 94,42 100,43 100,100 94,100 93,63 56,63 54,100 48,100 46,64 7,64 5,100 0,100 0,45',
  },
  'r1-cabinet': { bounds: [23, 18, 42, 63] },
  'r1-equation': { bounds: [74, 67, 13, 14], points: '0,2 96,0 100,98 2,100' },
  'r1-entry': { bounds: [72, 60, 18, 14] },
  'r1-drawer': { bounds: [40.5, 55, 16.5, 4.3] },
  'r1-note': { bounds: [44.6, 51.2, 8.5, 1.5], points: '7,0 94,0 100,100 0,100' },
  'r1-power': { bounds: [21, 20, 13, 17] },
  'r1-ceiling': { bounds: [10, 35, 29, 26], points: '8,0 94,5 100,89 89,100 0,93 3,15' },
  'echo-0': { bounds: [63, 64, 15, 15], ellipse: true },
  'r1-floor': { bounds: [29, 41, 25, 28], points: '20,0 80,2 100,87 70,100 0,18' },
  'r2-exit': { bounds: [32, 16, 36, 67] },
  'r2-gauge': { bounds: [75, 30, 10, 12], ellipse: true },
  'r2-locker': { bounds: [27.5, 13.5, 45, 37.3] },
  'r2-water': {
    bounds: [22.5, 14, 54, 34],
    points:
      '0,24 3,13 12,7 18,7 26,13 30,25 34,25 37,12 44,7 52,7 61,14 65,25 69,25 72,13 80,7 87,7 97,15 100,26 100,100 0,100',
  },
  'r2-pipes': { bounds: [22, 49, 55, 11.5] },
  'r2-tub': {
    bounds: [16.5, 57, 68.5, 25],
    points: '4,0 96,0 100,5 97,21 96,64 92,87 86,96 14,96 8,87 4,65 3,21 0,6',
  },
  'echo-1': { bounds: [66, 65, 15, 15], ellipse: true },
  'r2-wrench': {
    bounds: [80, 37, 13, 25],
    points: '57,0 92,2 100,15 76,25 43,72 51,81 41,100 6,97 0,81 22,71 59,22 45,12',
  },
  'r2-drain': { bounds: [40.5, 62.5, 19, 19], ellipse: true },
  'r3-exit': { bounds: [32, 18, 37, 62] },
  'r3-screen': { bounds: [17, 17.5, 66, 42] },
  'r3-order': {
    bounds: [38.5, 25, 24, 30],
    points:
      '0,0 20,0 27,20 30,34 66,34 72,20 78,0 98,0 100,32 83,43 73,40 73,84 79,94 79,100 18,100 18,94 28,84 28,40 17,44 1,34',
  },
  'r3-score': { bounds: [54.5, 42.5, 4.5, 7] },
  'r3-overlay': { bounds: [28, 49.5, 30, 5.3], points: '7,0 96,0 100,100 0,100' },
  'r3-slide': { bounds: [77, 23, 20, 60], points: '0,0 90,0 100,100 0,100' },
  'r3-plan': { bounds: [13, 51.5, 10, 2], points: '7,0 94,0 100,100 0,100' },
  'echo-2': { bounds: [66, 65, 15, 15], ellipse: true },
  'r3-floor': {
    bounds: [0, 0, 100, 100],
    path: 'M59 41 C60 36 67 37 72 39 L77 40 L79 42 L75 43 L69 42 C63 39 60 40 62 44 C64 49 72 55 77 57 L77 60 C68 56 59 48 59 41 Z M76 40 C75 31 76 23 81 19 L87 16 L92 22 L90 24 L86 19 C78 21 78 29 79 37 L100 34 L100 37 L80 42 L80 52 C80 61 75 70 70 74 C64 72 64 65 66 60 L69 53 L71 56 C66 65 67 69 69 71 C73 66 77 59 77 52 Z M100 56 A9.5 9.5 0 1 1 81 56 A9.5 9.5 0 1 1 100 56 Z',
  },
  'r4-exit': { bounds: [26, 21, 40.5, 55] },
  'r4-sockets': { bounds: [69, 37, 23, 5] },
  'r4-memory': { bounds: [77.1, 56.8, 9.5, 5.2] },
  'r4-print': { bounds: [37, 23, 25, 24] },
  'r4-balance': { bounds: [33, 21, 33.5, 56] },
  'r4-equations': { bounds: [72, 61, 13, 14], points: '0,2 96,0 100,98 2,100' },
  'r4-gears': { bounds: [34.3, 18.6, 28.7, 26.3] },
  'r4-paper': { bounds: [58.8, 56.8, 14.7, 4.2] },
  'r4-power': {
    bounds: [24.4, 48.1, 12, 6.3],
    points: '0,80 14,47 21,18 40,2 86,0 97,17 100,40 88,46 77,29 88,91 87,100 14,100 15,84',
  },
  'echo-3': { bounds: [21, 60, 15, 15], ellipse: true },
  'r4-floor': { bounds: [27, 34, 50, 52], points: '7,0 90,2 100,100 0,92' },
};
export const CLOSEUP_FILES: Record<string, string> = {
  'r1-clock': 'clock',
  'r1-drawer': 'drawer',
  'r1-cabinet': 'cabinet',
  'r1-power': 'switchboard',
  'r1-exit': 'door-lock',
  'r1-note': 'desk-paper',
  'r2-pipes': 'pipes',
  'r2-locker': 'mirror',
  'r2-water': 'tanks',
  'r2-drain': 'drain',
  'r2-exit': 'door-lock',
  'r2-tub': 'bathtub',
  'r3-slide': 'tile-drawer',
  'r3-order': 'projector',
  'r3-overlay': 'lightbox',
  'r3-score': 'projector-keys',
  'r3-exit': 'door-lock',
  'r3-screen': 'screen',
  'r3-film-clue': 'screen',
  'r4-power': 'telephone',
  'r4-gears': 'gears',
  'r4-balance': 'cabinet',
  'r4-memory': 'box',
  'r4-exit': 'door-lock',
  'r4-sockets': 'door-lock',
};
export const detailPhoto = (room: number, node: SceneNode) =>
  STATE_PHOTO_IDS.includes(node.id) || node.id.endsWith('-exit') || node.id === 'r4-sockets'
    ? statePhoto(node.id === 'r4-sockets' ? 'r4-exit' : node.id, 'base')
    : node.kind === 'clue' && node.clue !== 'empty' && !node.gate
      ? `/images/clues/${node.id}.webp`
      : `/images/rooms/${ROOM_FOLDERS[room]}/closeups/${CLOSEUP_FILES[node.id] ?? node.id}.webp`;
const OPEN_SHAPES: Record<string, Shape> = {
  'r1-drawer': { bounds: [41, 55, 19, 9], points: '9,0 91,0 100,48 100,100 0,100 0,48' },
  'r1-cabinet': {
    bounds: [23.4, 17, 50, 64],
    points: '0,0 14,3 14,0 83,0 83,4 100,0 100,93 85,85 83,100 13,100 13,96 0,100',
  },
  'r4-memory': {
    bounds: [74.1, 48.5, 9, 10.2],
    points: '0,0 100,0 96,45 100,55 98,100 0,100 4,53',
  },
};
export function outline(node: SceneNode, solved: readonly string[] = []) {
  const s = (solved.includes(node.id) && OPEN_SHAPES[node.id]) ||
    SHAPES[node.id] || { bounds: [node.x, node.y, node.w, node.h] };
  const [x, y, w, h] = s.bounds;
  const points = s.points
    ?.split(' ')
    .map((p) => {
      const [a, b] = p.split(',').map(Number);
      return `${(x + (a / 100) * w) * 10},${(y + (b / 100) * h) * 10}`;
    })
    .join(' ');
  return { ...s, x: x * 10, y: y * 10, w: w * 10, h: h * 10, polygon: points };
}
export const nodeLocation = (id: string) => {
  for (let room = 0; room < ROOMS.length; room++)
    for (let face = 0; face < 6; face++) {
      const node = (ROOMS[room].views[face] as readonly SceneNode[]).find((n) => n.id === id);
      if (node) return { room, face, node };
    }
  return undefined;
};
