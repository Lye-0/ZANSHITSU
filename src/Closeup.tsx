import type { CSSProperties } from 'react';
import { ITEMS, PUZZLES } from './data';
import type { SceneNode } from './data';
import type { GameState } from './engine';
import { canAccess } from './engine';
import { detailPhoto } from './photography';
import { ClueArt } from './Clues';
import { PuzzleControls } from './PuzzleControls';

const FRAMES: Record<string, number[]> = {
  'r1-clock': [11, 7, 78, 78],
  'r1-drawer': [11, 32, 78, 28],
  'r1-cabinet': [22, 35, 52, 33],
  'r1-power': [31, 21, 48, 51],
  'r1-exit': [27, 43, 55, 23],
  'r2-pipes': [28, 27, 45, 44],
  'r2-locker': [23, 74, 54, 6],
  'r2-water': [5, 23, 91, 47],
  'r2-drain': [20, 17, 60, 60],
  'r2-exit': [16, 30, 70, 37],
  'r3-slide': [10, 20, 75, 51],
  'r3-order': [37, 20, 28, 53],
  'r3-overlay': [17, 22, 68, 52],
  'r3-score': [28, 34, 42, 24],
  'r3-exit': [28, 40, 42, 13],
  'r4-power': [26, 30, 47, 48],
  'r4-gears': [16, 40, 70, 15],
  'r4-balance': [24, 50, 57, 12],
  'r4-memory': [12, 30, 74, 32],
  'r4-exit': [9, 34, 82, 17],
};
// Coordinates belong to the photographed fitting, not to the screen corner.
const FITTINGS: Record<string, number[]> = {
  'r1-clock': [64, 63, 6, 6],
  'r1-cabinet': [78, 75, 6, 6],
  'r1-power': [81, 79, 6, 6],
  'r2-pipes': [73, 72, 6, 6],
  'r2-locker': [87, 72, 6, 6],
  'r2-water': [78, 83, 7, 7],
  'r2-drain': [48, 46, 5, 5],
  'r3-order': [58, 87, 6, 6],
  'r3-overlay': [83, 74, 6, 6],
  'r3-score': [64, 72, 7, 7],
};
const RESETS: Record<string, number[]> = {
  'r1-drawer': [81, 72, 5, 5],
  'r2-exit': [11, 54, 5, 5],
  'r3-slide': [77, 85, 5, 5],
  'r4-power': [83, 75, 5, 5],
  'r4-gears': [86, 82, 5, 5],
  'r4-memory': [12, 58, 5, 5],
};
function SurfaceFilters() {
  return (
    <svg className="surface-filters" aria-hidden="true">
      <defs>
        <filter id="surface-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            seed="17"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0.65"
          />
          <feComposite in="SourceGraphic" operator="in" />
          <feGaussianBlur stdDeviation="0.22" />
        </filter>
      </defs>
    </svg>
  );
}
function frameStyle(f: number[]): CSSProperties {
  return { left: `${f[0]}%`, top: `${f[1]}%`, width: `${f[2]}%`, height: `${f[3]}%` };
}
export function Closeup({
  node,
  room,
  game,
  selected,
  onBack,
  onValues,
  onReset,
  onInsert,
  onTake,
  onDoor,
  onNote,
}: {
  node: SceneNode;
  room: number;
  game: GameState;
  selected: string | null;
  onBack: () => void;
  onValues: (id: string, values: number[]) => void;
  onReset: (id: string) => void;
  onInsert: (id: string, item: string) => void;
  onTake: (id: string) => void;
  onDoor: () => void;
  onNote: (i: number) => void;
}) {
  const p = node.kind === 'puzzle' ? PUZZLES[node.target!] : null;
  const solved = !!p && game.solved.includes(p.id);
  const values = p ? (game.values[p.id] ?? p.initial) : [];
  const allowed = !!p && canAccess(game, p) && !solved;
  const missing = p?.item && !game.installed.includes(p.id);
  const gate = !!p?.requires?.some((id) => !game.solved.includes(id));
  const openPhoto: Record<string, string> = {
    'r1-drawer': '01-waiting/states/drawer-open.webp',
    'r1-cabinet': '01-waiting/states/cabinet-open.webp',
    'r4-memory': '04-return/states/box-open.webp',
  };
  const hasOpenPhoto = solved && !!openPhoto[node.id];
  const pickedUp =
    node.kind === 'take' &&
    (game.inventory.includes(node.target!) || game.installed.includes('r2-pipes'));
  const photo = pickedUp
    ? '/images/rooms/02-washroom/states/wrench-taken.webp'
    : hasOpenPhoto
      ? '/images/rooms/' + openPhoto[node.id]
      : detailPhoto(room, node);
  const style = { '--detail-photo': `url(${photo})` } as CSSProperties;
  const change = (v: number[]) => {
    if (p && allowed) onValues(p.id, v);
  };
  return (
    <section
      className={`closeup-view ${p ? 'physical-' + p.kind : 'physical-clue'} detail-${node.id} ${solved ? 'is-solved' : ''}`}
      style={style}
      aria-label={`${node.label}の接写`}
    >
      <SurfaceFilters />
      <div className="closeup-bleed" />
      <div className="closeup-plane">
        <img className="closeup-photo" src={photo} alt={`${node.label}を近くで見た写真`} />
        {p && !hasOpenPhoto && (
          <>
            {allowed && p.kind !== 'dial' && (
              <button
                className="physical-reset"
                style={frameStyle(RESETS[p.id] ?? FITTINGS[p.id] ?? [82, 80, 5, 5])}
                aria-label="仕掛けを初期状態に戻す"
                onClick={() => onReset(p.id)}
              />
            )}
            {p.motif === 'clock' ? (
              <div className="physical-clock" style={frameStyle(FRAMES[p.id])}>
                <svg viewBox="0 0 200 200" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, i) => {
                    const a = (i * Math.PI) / 6;
                    return (
                      <text
                        key={i}
                        x={100 + 78 * Math.sin(a)}
                        y={106 - 78 * Math.cos(a)}
                        textAnchor="middle"
                      >
                        {i || 12}
                      </text>
                    );
                  })}
                  <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="51"
                    transform={`rotate(${values[0] * 30} 100 100)`}
                    strokeWidth="1.8"
                  />
                  <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="23"
                    transform={`rotate(${values[1] * 30} 100 100)`}
                    strokeWidth="1"
                  />
                  <circle cx="100" cy="100" r="2.8" />
                </svg>
                <div className="clock-winders">
                  {[0, 1].map((i) => (
                    <button
                      key={i}
                      disabled={!allowed}
                      aria-label={`ダイヤル${i + 1}を進める`}
                      onClick={() => change(values.map((n, j) => (j === i ? (n + 1) % 12 : n)))}
                    >
                      {i ? '長' : '短'}
                    </button>
                  ))}
                </div>
              </div>
            ) : p.kind === 'dial' || p.kind === 'gears' ? (
              <div
                className={`physical-dials ${p.kind === 'gears' || p.motif === 'final-balance' ? 'round-dials' : ''}`}
                style={frameStyle(FRAMES[p.id])}
              >
                {values.map((n, i) => (
                  <button
                    key={i}
                    aria-label={`ダイヤル${i + 1}を進める`}
                    disabled={!allowed}
                    onClick={() =>
                      change(
                        values.map(
                          (v, j) =>
                            (v +
                              (p.kind === 'gears'
                                ? j === i || j === (i + 1) % 4
                                  ? 1
                                  : 0
                                : j === i
                                  ? 1
                                  : 0)) %
                            (p.modulus ?? 10),
                        ),
                      )
                    }
                  >
                    <span>{n}</span>
                    {['balance', 'final-balance', 'seals'].includes(p.motif ?? '') && (
                      <small className="dial-etch-label">
                        {
                          (p.motif === 'balance'
                            ? ['△', '○', '□']
                            : p.motif === 'final-balance'
                              ? ['○', '△', '□', '◇']
                              : ['△', '☾', '○', '◇'])[i]
                        }
                      </small>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div
                className={`physical-controls controls-${p.id}`}
                style={frameStyle(FRAMES[p.id] ?? [20, 20, 60, 60])}
              >
                <PuzzleControls
                  puzzle={p}
                  values={values}
                  onChange={change}
                  onReset={() => onReset(p.id)}
                  onCheck={() => onValues(p.id, values)}
                  onNote={onNote}
                  disabled={!allowed}
                />
              </div>
            )}
            {missing && !gate && (
              <button
                className={`physical-socket ${selected ? 'has-object' : ''}`}
                style={frameStyle(FITTINGS[p.id])}
                aria-label="差し込み口に持ち物を使う"
                onClick={() => {
                  if (selected) onInsert(p.id, selected);
                }}
              >
                <span />
                <i>{selected ? ITEMS[selected].icon : ''}</i>
              </button>
            )}
            {solved && p.id.endsWith('exit') && (
              <button className="physical-door-handle" aria-label="扉を開ける" onClick={onDoor}>
                <span />
              </button>
            )}
            {solved && !p.id.endsWith('exit') && (
              <span className="mechanism-released" aria-label="解除済み">
                ●
              </span>
            )}
            {p.id === 'r2-locker' && game.solved.includes('r2-pipes') && (
              <div className="mirror-engraving">2715</div>
            )}
          </>
        )}
        {node.kind === 'clue' &&
          (!node.gate || game.solved.includes(node.gate)) &&
          node.clue !== 'empty' && (
            <div className={`physical-writing writing-${node.clue}`}>
              <ClueArt kind={node.clue!} room={room} />
            </div>
          )}
        {node.kind === 'clue' &&
          node.clue === 'tub' &&
          node.gate &&
          !game.solved.includes(node.gate) && <div className="bath-water" />}
        {node.kind === 'take' &&
          !game.inventory.includes(node.target!) &&
          !game.installed.includes('r2-pipes') && (
            <button
              className="take-in-photo"
              aria-label={`${ITEMS[node.target!].name}を拾う`}
              onClick={() => onTake(node.target!)}
            />
          )}
      </div>
      <button
        className="direction down closeup-return"
        aria-label="元の視点に戻る"
        onClick={onBack}
      >
        <span />
      </button>
    </section>
  );
}
export function ItemCloseup({
  id,
  flipped,
  onFlip,
  onBack,
}: {
  id: string;
  flipped: boolean;
  onFlip: () => void;
  onBack: () => void;
}) {
  const photo = `/images/items/${id}/${flipped ? 'back' : 'front'}.webp`;
  return (
    <section
      className={`closeup-view item-photograph item-${id}`}
      style={{ '--detail-photo': `url(${photo})` } as CSSProperties}
      aria-label={`${ITEMS[id].name}の接写`}
    >
      <SurfaceFilters />
      <div className="closeup-bleed" />
      <div className="closeup-plane">
        <img
          className="closeup-photo"
          src={photo}
          alt={`${ITEMS[id].name}の${flipped ? '裏' : '表'}`}
        />
        <button className="flip-in-photo" aria-label="持ち物を裏返す" onClick={onFlip} />
        {flipped &&
          (id === 'float' ? (
            <svg
              className="object-ring-engraving"
              viewBox="0 0 100 100"
              aria-label={ITEMS[id].back}
            >
              <defs>
                <path id="float-inscription" d="M19 49 A30 30 0 0 1 79 49" />
              </defs>
              <text textAnchor="middle">
                <textPath href="#float-inscription" startOffset="50%">
                  {ITEMS[id].back}
                </textPath>
              </text>
            </svg>
          ) : (
            <span className="object-engraving">{ITEMS[id].back}</span>
          ))}
      </div>
      <button
        className="direction down closeup-return"
        aria-label="元の視点に戻る"
        onClick={onBack}
      >
        <span />
      </button>
    </section>
  );
}
