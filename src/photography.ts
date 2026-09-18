import { ROOMS } from './data';
import type { SceneNode } from './data';
export const ROOM_FOLDERS = ['01-waiting', '02-washroom', '03-projection', '04-return'];
export const FACES = ['north', 'east', 'south', 'west', 'ceiling', 'floor'];
export const viewPhoto = (
  room: number,
  face: number,
  state?: { solved: string[]; inventory: string[]; installed: string[] },
) => {
  const base = `/images/rooms/${ROOM_FOLDERS[room]}`;
  if (room === 0 && face === 3 && state?.solved.includes('r1-drawer'))
    return base + '/states/west-drawer-open.webp';
  if (room === 0 && face === 2 && state?.solved.includes('r1-cabinet'))
    return base + '/states/south-cabinet-open.webp';
  if (room === 3 && face === 1 && state?.solved.includes('r4-memory'))
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
  'r1-drawer': { bounds: [46, 55, 14, 7] },
  'r1-note': { bounds: [46, 51, 16, 2.8], points: '12,0 94,0 100,100 0,100' },
  'r1-power': { bounds: [21, 20, 13, 17] },
  'r1-ceiling': { bounds: [21, 35, 40, 20] },
  'echo-0': { bounds: [43, 70, 14, 14] },
  'r1-floor': { bounds: [29, 41, 25, 28], points: '20,0 80,2 100,87 70,100 0,18' },
  'r2-exit': { bounds: [32, 16, 36, 67] },
  'r2-gauge': { bounds: [75, 30, 10, 12], ellipse: true },
  'r2-locker': { bounds: [29, 45, 43, 6] },
  'r2-mirror': { bounds: [31, 16, 38, 28], points: '0,0 100,0 100,100 0,100' },
  'r2-water': { bounds: [23, 15, 52, 34] },
  'r2-pipes': { bounds: [24, 52, 51, 30] },
  'r2-tub': { bounds: [16, 55, 73, 27], points: '0,0 100,0 91,86 85,100 15,100 8,89' },
  'echo-1': { bounds: [36, 37, 23, 22] },
  'r2-wrench': {
    bounds: [80, 37, 13, 25],
    points: '57,0 92,2 100,15 76,25 43,72 51,81 41,100 6,97 0,81 22,71 59,22 45,12',
  },
  'r2-drain': { bounds: [42, 61, 21, 21], ellipse: true },
  'r3-exit': { bounds: [32, 18, 37, 62] },
  'r3-screen': { bounds: [19, 20, 63, 36] },
  'r3-film-clue': { bounds: [22, 56, 57, 3] },
  'r3-order': {
    bounds: [31, 31, 32, 22],
    points: '0,12 25,0 55,0 65,12 77,13 78,34 100,50 92,97 37,100 36,66 0,60',
  },
  'r3-score': { bounds: [49, 50, 15, 5] },
  'r3-overlay': { bounds: [28, 46, 32, 7], points: '10,0 93,0 100,100 0,100' },
  'r3-slide': { bounds: [77, 23, 20, 60], points: '0,0 90,0 100,100 0,100' },
  'r3-plan': { bounds: [13, 45, 13, 7] },
  'echo-2': { bounds: [38, 39, 20, 20] },
  'r3-floor': { bounds: [57, 18, 42, 60], points: '40,0 100,10 100,100 27,83 0,26' },
  'r4-exit': { bounds: [26, 22, 38, 53] },
  'r4-sockets': { bounds: [69, 37, 23, 5] },
  'r4-memory': { bounds: [77, 56, 12, 6] },
  'r4-print': { bounds: [37, 23, 25, 24] },
  'r4-balance': { bounds: [33, 21, 27, 56] },
  'r4-equations': { bounds: [72, 61, 13, 14], points: '0,2 96,0 100,98 2,100' },
  'r4-gears': { bounds: [35, 19, 27, 31] },
  'r4-paper': { bounds: [66, 58, 10, 7] },
  'r4-power': { bounds: [27, 48, 17, 7], points: '3,13 16,0 87,0 100,70 99,100 0,100' },
  'echo-3': { bounds: [37, 38, 22, 22] },
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
  'r2-mirror': 'mirror',
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
  'r4-paper': 'desk-paper',
};
export const detailPhoto = (room: number, node: SceneNode) =>
  ['r1-equation', 'r4-equations'].includes(node.id)
    ? '/images/shared/wall-paper.webp'
    : `/images/rooms/${ROOM_FOLDERS[room]}/closeups/${CLOSEUP_FILES[node.id] ?? node.id}.webp`;
export function outline(node: SceneNode) {
  const s = SHAPES[node.id] ?? { bounds: [node.x, node.y, node.w, node.h] };
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
