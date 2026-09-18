import { publicAsset } from './publicAsset';
export type Projection = 'blank' | 'score' | 'frames';
export function availableProjection(solved: readonly string[]): Projection {
  if (solved.includes('r3-score')) return 'frames';
  return solved.includes('r3-overlay') ? 'score' : 'blank';
}
export function projectionPhoto(projection: Projection) {
  return projection === 'blank'
    ? publicAsset('/images/rooms/03-projection/closeups/screen.webp')
    : publicAsset(`/images/clues/${projection === 'score' ? 'r3-screen' : 'r3-film-clue'}.webp`);
}
