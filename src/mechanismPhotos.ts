import { publicAsset } from './publicAsset';
export type Rect = [number, number, number, number];
export type MechanismPhoto = {
  controls: Rect;
  installedControls?: Rect;
  fitting?: Rect;
  pull: Rect;
  reward?: Rect;
  reset?: Rect;
  openControls?: Rect;
};
export const PHOTO_MECHANISMS: Record<string, MechanismPhoto> = {
  'r1-drawer': {
    controls: [15, 39, 69, 14],
    pull: [42, 64, 16, 16],
    reward: [38, 36, 26, 25],
    reset: [81, 65, 9, 15],
  },
  'r1-clock': {
    controls: [13, 3, 72, 72],
    fitting: [43, 45, 13, 12],
    pull: [42, 75, 15, 12],
    reward: [38, 79, 24, 11],
    openControls: [13, 3, 72, 72],
  },
  'r1-cabinet': {
    controls: [25, 29, 50, 31],
    fitting: [23, 65, 14, 18],
    pull: [61, 69, 16, 15],
    reward: [44, 58, 29, 14],
    openControls: [25, 22, 50, 24],
  },
  'r1-power': {
    controls: [34, 21, 41, 38],
    fitting: [30, 65, 22, 11],
    pull: [61, 66, 16, 10],
    reward: [61, 65, 16, 19],
    openControls: [34, 21, 41, 38],
  },
  'r1-exit': { controls: [30, 30, 45, 19], pull: [30, 57, 62, 16] },
  'r2-pipes': {
    controls: [32, 23, 43, 41],
    fitting: [24, 66, 12, 13],
    pull: [75, 65, 10, 12],
    reward: [43, 62, 26, 23],
    openControls: [32, 21, 43, 36],
  },
  'r2-locker': {
    controls: [29, 69.2, 42, 6.6],
    installedControls: [30.7, 66.1, 38.4, 4.6],
    fitting: [73, 29, 15, 19],
    pull: [46, 73, 8, 9],
    reward: [42, 69, 17, 11],
    openControls: [30.7, 59.6, 38.4, 4.6],
  },
  'r2-water': {
    controls: [5, 24, 90, 45],
    fitting: [44, 76, 12, 13],
    pull: [75, 80, 14, 10],
    reward: [70, 78, 20, 12],
  },
  'r2-drain': {
    controls: [15, 13, 70, 66],
    fitting: [39, 34, 22, 24],
    pull: [44, 72, 12, 14],
    reward: [34, 60, 31, 23],
  },
  'r2-exit': { controls: [21, 35, 61, 10], pull: [28, 57, 64, 16] },
  'r3-slide': {
    controls: [33, 14.5, 34, 38],
    pull: [30, 63, 33, 23],
    reward: [31, 38, 38, 29],
    reset: [70, 66, 17, 15],
    openControls: [33.5, 9, 33, 21.5],
  },
  'r3-order': {
    controls: [40, 18, 22, 48],
    fitting: [71, 24, 22, 24],
    pull: [44, 75, 12, 11],
    reward: [34, 62, 32, 20],
    openControls: [40, 18, 22, 35],
  },
  'r3-overlay': {
    controls: [17.5, 14, 65, 51],
    fitting: [44, 29, 12, 15],
    pull: [42, 75, 18, 12],
    reward: [30, 64, 46, 17],
  },
  'r3-score': {
    controls: [29, 29, 43, 26],
    fitting: [64, 64, 16, 16],
    pull: [35, 78, 14, 14],
    reward: [30, 61, 24, 20],
  },
  'r3-exit': { controls: [27, 30, 45, 19], pull: [28, 57, 64, 16] },
  'r4-power': { controls: [26, 30, 47, 48], pull: [82, 74, 8, 8], reset: [83, 75, 5, 5] },
  'r4-gears': { controls: [16, 40, 70, 15], pull: [83, 79, 9, 9], reset: [85, 81, 7, 7] },
  'r4-balance': {
    controls: [23, 32.7, 55, 7.7],
    pull: [42, 55, 16, 12],
    reward: [42, 52, 18, 16],
    openControls: [23, 32.7, 55, 7.7],
  },
  'r4-memory': {
    controls: [12, 40, 74, 14],
    pull: [40, 69, 20, 16],
    reset: [13, 63, 7, 7],
    reward: [18, 40, 62, 17],
  },
  'r4-exit': { controls: [15, 44, 66, 13], pull: [43, 65, 47, 13], fitting: [22, 64, 10, 13] },
};
export const STATE_PHOTO_IDS = [
  'r1-drawer',
  'r1-clock',
  'r1-cabinet',
  'r1-power',
  'r2-pipes',
  'r2-locker',
  'r2-water',
  'r2-drain',
  'r3-slide',
  'r3-order',
  'r3-overlay',
  'r3-score',
  'r4-balance',
];
export const componentPhoto = (group: string, name: string | number) =>
  publicAsset(`/images/components/${group}/${name}.webp`);
export const statePhoto = (id: string, state: string) =>
  publicAsset(`/images/mechanisms/${id}/${state}.webp`);
