import { expect, it } from 'vitest';
import { ROOMS, PUZZLES, SCREEN_FRAME_CLUE } from '../src/data';
import { availableProjection, projectionPhoto } from '../src/projection';
import { freshGame, solve, revealCeilingPower } from '../src/engine';
import { viewPhoto } from '../src/photography';
import { turnView } from '../src/navigation';

it('reveals the two projections in puzzle order', () => {
  expect(availableProjection([])).toBe('blank');
  expect(availableProjection(['r3-overlay'])).toBe('score');
  expect(availableProjection(['r3-overlay', 'r3-score'])).toBe('frames');
  expect(projectionPhoto('score')).not.toBe(projectionPhoto('frames'));
});
it('uses one full-screen hotspot and retains a separate journal record for the second clue', () => {
  const nodes = ROOMS[2].views.flat();
  expect(nodes.filter((n) => n.id === 'r3-screen')).toHaveLength(1);
  expect(nodes.some((n) => n.id === 'r3-film-clue')).toBe(false);
  expect(SCREEN_FRAME_CLUE.projection).toBe('frames');
  expect(SCREEN_FRAME_CLUE.gate).toBe('r3-score');
});
it('places the projector on the wall opposite the screen', () => {
  const screen = ROOMS[2].views.findIndex((v) => v.some((n) => n.id === 'r3-screen'));
  const projector = ROOMS[2].views.findIndex((v) => v.some((n) => n.id === 'r3-order'));
  expect((screen + 2) % 4).toBe(projector);
  expect(ROOMS[2].views[2].some((n) => n.id === 'r3-slide')).toBe(true);
});
it('restoring power looks up and preserves the wall to return to', () => {
  const s = { ...freshGame(), room: 3, unlocked: 3, face: 3, wallFace: 3 };
  const powered = solve(s, 'r4-power', PUZZLES['r4-power'].answer);
  expect(powered.face).toBe(4);
  expect(powered.wallFace).toBe(3);
  expect(turnView(powered, 'down').face).toBe(3);
  expect(viewPhoto(3, 4, s)).toContain('ceiling-unlit');
  expect(viewPhoto(3, 4, powered)).toContain('/views/ceiling.webp');
});
it('also guides an existing powered save until its ceiling clue has been observed', () => {
  const s = { ...freshGame(), room: 3, unlocked: 3, face: 1, solved: ['r4-power'] };
  expect(revealCeilingPower(s)).toMatchObject({ face: 4, wallFace: 1 });
  const observed = { ...s, seen: ['echo-3'] };
  expect(revealCeilingPower(observed)).toBe(observed);
  const otherRoom = { ...s, room: 0 };
  expect(revealCeilingPower(otherRoom)).toBe(otherRoom);
});
