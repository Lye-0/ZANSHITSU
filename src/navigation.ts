export type Viewpoint = { room: number; face: number; wallFace: number };
export function turnView<T extends Viewpoint>(
  view: T,
  direction: 'left' | 'right' | 'up' | 'down',
): T {
  const wall = view.face < 4 ? view.face : view.wallFace;
  if (view.face === 4) return direction === 'down' ? { ...view, face: wall } : view;
  if (view.face === 5) return direction === 'up' ? { ...view, face: wall } : view;
  if (direction === 'up') return { ...view, face: 4, wallFace: wall };
  if (direction === 'down') return { ...view, face: 5, wallFace: wall };
  const face = (wall + (direction === 'left' ? 3 : 1)) % 4;
  return { ...view, face, wallFace: face };
}
