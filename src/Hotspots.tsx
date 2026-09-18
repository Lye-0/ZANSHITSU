import type { SceneNode } from './data';
import { outline } from './photography';
export function Hotspots({
  nodes,
  open,
  hover,
  taken,
  marks,
}: {
  nodes: readonly SceneNode[];
  open: (n: SceneNode) => void;
  hover: (label: string) => void;
  taken: (n: SceneNode) => boolean;
  marks: boolean;
}) {
  return (
    <svg
      className={`object-map ${marks ? 'reveal-objects' : ''}`}
      viewBox="0 0 1000 1000"
      aria-label="調べられるもの"
    >
      {nodes
        .filter((n) => !taken(n))
        .sort((a, b) => {
          const x = outline(a),
            y = outline(b);
          return y.w * y.h - x.w * x.h;
        })
        .map((n) => {
          const s = outline(n);
          const props = {
            role: 'button',
            tabIndex: 0,
            'aria-label': n.label,
            onClick: () => open(n),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(n);
              }
            },
            onMouseEnter: () => hover(n.label),
            onMouseLeave: () => hover(''),
            onFocus: () => hover(n.label),
            onBlur: () => hover(''),
            className: 'object-outline',
          };
          return s.ellipse ? (
            <ellipse
              key={n.id}
              {...props}
              cx={s.x + s.w / 2}
              cy={s.y + s.h / 2}
              rx={s.w / 2}
              ry={s.h / 2}
            />
          ) : s.polygon ? (
            <polygon key={n.id} {...props} points={s.polygon} />
          ) : (
            <rect key={n.id} {...props} x={s.x} y={s.y} width={s.w} height={s.h} />
          );
        })}
    </svg>
  );
}
