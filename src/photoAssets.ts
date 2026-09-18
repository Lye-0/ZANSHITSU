import { ITEMS, PUZZLES, ROOMS, type SceneNode } from './data';
import { WATER_STATES } from './engine';
import { detailPhoto, viewPhoto } from './photography';
import { STATE_PHOTO_IDS, statePhoto, componentPhoto } from './mechanismPhotos';

/** Delivery catalogue: every selectable photograph, including hidden states. */
export function photographPaths() {
  const paths = new Set<string>();
  for (let room = 0; room < 4; room++) {
    for (let face = 0; face < 6; face++) {
      paths.add(viewPhoto(room, face));
      for (const node of ROOMS[room].views[face] as readonly SceneNode[]) {
        paths.add(detailPhoto(room, node));
        if (node.kind === 'clue' && node.clue !== 'empty' && node.id !== 'r4-sockets')
          paths.add(`/images/clues/${node.id}.webp`);
      }
    }
  }
  for (const id of Object.keys(ITEMS))
    for (const side of ['front', 'back']) paths.add(`/images/items/${id}/${side}.webp`);
  for (const id of STATE_PHOTO_IDS)
    for (const state of [
      'base',
      ...(PUZZLES[id].item && !['r2-water', 'r3-overlay'].includes(id) ? ['installed'] : []),
      ...(id === 'r2-water' ? [] : ['reward', 'empty']),
    ])
      paths.add(statePhoto(id, state));
  paths.add(statePhoto('r4-exit', 'base'));
  for (const state of WATER_STATES) paths.add(statePhoto('r2-water', `levels/${state.join('-')}`));
  for (const state of ['reward-detail', 'empty-detail']) paths.add(statePhoto('r2-water', state));
  for (const [group, names] of Object.entries({
    drums: Array.from({ length: 10 }, (_, i) => String(i)),
    wheels: Array.from({ length: 8 }, (_, i) => String(i)),
    films: Array.from({ length: 5 }, (_, i) => String(i)),
    keys: Array.from({ length: 6 }, (_, i) => String(i)),
    tiles: Array.from({ length: 8 }, (_, i) => String(i + 1)),
    lamps: ['off', 'on'],
    hands: ['hour', 'minute'],
    pipes: ['straight-0', 'straight-1', 'elbow-0', 'elbow-1', 'elbow-2', 'elbow-3'],
    rings: ['metal-0', 'metal-1', 'metal-2', 'glass-0', 'glass-1', 'glass-2'],
  }))
    for (const name of names) paths.add(componentPhoto(group, name));
  for (const path of [
    '01-waiting/states/west-drawer-open.webp',
    '01-waiting/states/south-cabinet-open.webp',
    '02-washroom/states/floor-empty.webp',
    '02-washroom/states/wrench-taken.webp',
    '04-return/states/box-open.webp',
    '04-return/states/east-box-open.webp',
  ])
    paths.add('/images/rooms/' + path);
  paths.add('/images/clues/bathtub-full.webp');
  paths.add('/images/components/markings/mirror-number.webp');
  paths.add('/images/clues/r3-film-clue.webp');
  paths.add('/images/rooms/04-return/states/ceiling-unlit.webp');
  return [...paths].sort();
}
