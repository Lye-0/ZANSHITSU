import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Puzzle } from './data';
import { GLYPHS } from './data';
import { canSlide, gear, pipeEdges, pour, slide, toggleLights } from './engine';
import { componentPhoto } from './mechanismPhotos';

export function PhotoControls({
  p,
  values,
  disabled,
  change,
  note,
}: {
  p: Puzzle;
  values: number[];
  disabled: boolean;
  change: (v: number[]) => void;
  note: (n: number) => void;
}) {
  const [source, setSource] = useState<number | null>(null);
  const [hand, setHand] = useState<number | null>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean; hand: number } | null>(null);
  const face = useRef<HTMLDivElement>(null);
  const step = (i: number) =>
    change(values.map((v, j) => (j === i ? (v + 1) % (p.modulus ?? 10) : v)));
  const picture = (group: string, name: string | number) => (
    <img src={componentPhoto(group, name)} alt="" draggable={false} />
  );
  if (p.motif === 'clock') {
    const pointHand = (i: number, x: number, y: number) => {
      if (disabled || !face.current) return;
      const b = face.current.getBoundingClientRect();
      const a = Math.atan2(x - (b.x + b.width * 0.49), -(y - (b.y + b.height * 0.388)));
      const value = (Math.round(a / (Math.PI / 6)) + 12) % 12;
      change(values.map((n, j) => (j === i ? value : n)));
    };
    return (
      <div className="photo-clock" ref={face}>
        {values.map((n, i) => (
          <img
            key={i}
            className={`clock-hand clock-hand-${i} ${hand === i ? 'clock-hand-selected' : ''}`}
            src={componentPhoto('hands', i ? 'minute' : 'hour')}
            alt=""
            draggable={false}
            style={{ transform: `rotate(${n * 30}deg)` }}
          />
        ))}
        {values.map((n, i) => (
          <button
            key={i}
            className={`hand-hit hand-hit-${i}`}
            disabled={disabled}
            aria-label={i ? '長針をつかむ' : '短針をつかむ'}
            aria-pressed={hand === i}
            style={{ transform: `rotate(${n * 30}deg)` }}
            onClick={(e) => {
              if (e.detail === 0) setHand(i);
            }}
            onPointerDown={(e) => {
              if (disabled) return;
              const chosen = hand === i && values[0] === values[1] ? 1 - i : i;
              setHand(chosen);
              drag.current = { x: e.clientX, y: e.clientY, moved: false, hand: chosen };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d) return;
              if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) d.moved = true;
              if (d.moved) pointHand(d.hand, e.clientX, e.clientY);
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
          />
        ))}
        {hand !== null &&
          !disabled &&
          Array.from({ length: 12 }, (_, n) => {
            const a = (n * Math.PI) / 6;
            return (
              <button
                key={n}
                className="dial-index-hit"
                aria-label={`文字盤の${n || 12}`}
                style={{
                  left: `${49 + 29 * Math.sin(a) - 4}%`,
                  top: `${38.8 - 29 * Math.cos(a) - 4}%`,
                }}
                onClick={() => {
                  change(values.map((v, i) => (i === hand ? n : v)));
                  setHand(null);
                }}
              />
            );
          })}
      </div>
    );
  }
  return (
    <fieldset disabled={disabled} className={`photo-controls photo-${p.kind}`}>
      {(p.kind === 'dial' || p.kind === 'gears') && (
        <div className="photo-dials">
          {values.map((n, i) => (
            <button
              key={i}
              aria-label={`ダイヤル${i + 1}を進める`}
              onClick={() => (p.kind === 'gears' ? change(gear(values, i)) : step(i))}
            >
              {picture(p.kind === 'gears' ? 'wheels' : 'drums', n)}
            </button>
          ))}
        </div>
      )}
      {p.kind === 'sequence' && (
        <>
          <div
            className="photo-sequence-register"
            aria-label={`${values.length} / ${p.answer.length} 入力済み`}
          >
            {p.answer.map((_, i) => (
              <img key={i} src={componentPhoto('lamps', i < values.length ? 'on' : 'off')} alt="" />
            ))}
          </div>
          <div className="photo-keys">
            {Array.from({ length: p.glyphs ? 6 : 5 }, (_, i) => (
              <button
                key={i}
                aria-label={p.glyphs ? `記号${GLYPHS[i]}` : `音${i + 1}`}
                onClick={() => {
                  note(i);
                  change(values.length < p.answer.length ? [...values, i] : [i]);
                }}
              >
                {p.glyphs && p.id !== 'r1-drawer' ? picture('keys', i) : null}
              </button>
            ))}
          </div>
        </>
      )}
      {p.kind === 'lights' && (
        <div className="photo-grid" style={{ '--columns': p.size } as CSSProperties}>
          {values.map((n, i) => (
            <button
              key={i}
              aria-label={`灯${i + 1}`}
              aria-pressed={!!n}
              onClick={() => change(toggleLights(values, i, p.size!))}
            >
              {picture('lamps', n ? 'on' : 'off')}
            </button>
          ))}
        </div>
      )}
      {p.kind === 'pipes' && (
        <div className="photo-grid pipe-photos" style={{ '--columns': 3 } as CSSProperties}>
          {values.map((_, i) => {
            const edges = pipeEdges(values, i);
            const straight = Math.abs(edges[0] - edges[1]) === 2;
            const orientation = straight
              ? edges.includes(0)
                ? 0
                : 1
              : [0, 1, 2, 3].find((k) => edges.includes(k) && edges.includes((k + 1) % 4))!;
            return (
              <button
                key={i}
                aria-label={`継手${i + 1}を回す`}
                onClick={() => change(values.map((v, j) => (j === i ? (v + 1) % 4 : v)))}
              >
                {picture('pipes', `${straight ? 'straight' : 'elbow'}-${orientation}`)}
              </button>
            );
          })}
        </div>
      )}
      {p.kind === 'water' && (
        <div className="photo-tanks">
          {values.map((n, i) => (
            <button
              key={i}
              aria-label={`計量槽${i + 1} ${n}リットル`}
              aria-pressed={source === i}
              onClick={() => {
                if (source === null) setSource(i);
                else {
                  change(pour(values, source, i));
                  setSource(null);
                }
              }}
            />
          ))}
        </div>
      )}
      {p.kind === 'rings' && (
        <div className="photo-rings">
          {values.map((n, i) => (
            <button
              key={i}
              className={`photo-ring photo-ring-${i}`}
              aria-label={`環${i + 1}を回す`}
              onClick={() => step(i)}
            >
              <img
                src={componentPhoto(
                  'rings',
                  `${p.motif === 'projection' ? 'glass' : 'metal'}-${i}`,
                )}
                style={{ transform: `rotate(${n * 90}deg)` }}
                alt=""
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
      {p.kind === 'slide' && (
        <div className="photo-grid" style={{ '--columns': 3 } as CSSProperties}>
          {values.map((n, i) => (
            <button
              key={i}
              disabled={disabled || !canSlide(values, i)}
              aria-label={n ? `小蓋${n}` : '空き'}
              onClick={() => change(slide(values, i))}
            >
              {n ? picture('tiles', n) : null}
            </button>
          ))}
        </div>
      )}
      {p.kind === 'order' && (
        <div className="photo-films">
          {values.map((n, i) => (
            <button
              key={i}
              aria-label={`フィルム位置${i + 1}`}
              aria-pressed={source === i}
              onClick={() => {
                if (source === null) setSource(i);
                else {
                  const v = [...values];
                  [v[source], v[i]] = [v[i], v[source]];
                  change(v);
                  setSource(null);
                }
              }}
            >
              {picture('films', n)}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  );
}
