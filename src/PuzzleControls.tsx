import { useState } from 'react';
import type { Puzzle } from './data';
import { GLYPHS } from './data';
import { gear, pipeEdges, pour, slide, toggleLights } from './engine';
import { Icon } from './Icons';
type Props = {
  puzzle: Puzzle;
  values: number[];
  onChange: (v: number[]) => void;
  onCheck: () => void;
  onReset: () => void;
  onNote: (i: number) => void;
  disabled: boolean;
};
export function PuzzleControls({
  puzzle: p,
  values: v,
  onChange,
  onCheck,
  onReset,
  onNote,
  disabled,
}: Props) {
  const [source, setSource] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  function step(i: number, delta: number) {
    onChange(v.map((n, j) => (j === i ? (n + delta + (p.modulus ?? 10)) % (p.modulus ?? 10) : n)));
  }
  return (
    <div className={`mechanism mechanism-${p.kind}`}>
      <fieldset disabled={disabled}>
        {(p.kind === 'dial' || p.kind === 'gears') && (
          <>
            {p.motif === 'clock' && (
              <svg className="working-clock" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" />
                {Array.from({ length: 12 }, (_, i) => (
                  <line
                    key={i}
                    x1="100"
                    x2="100"
                    y1="17"
                    y2="25"
                    transform={`rotate(${i * 30} 100 100)`}
                    stroke="currentColor"
                  />
                ))}
                <path
                  d="M100 100V53"
                  strokeWidth="4"
                  stroke="currentColor"
                  transform={`rotate(${v[0] * 30} 100 100)`}
                />
                <path
                  d="M100 100V26"
                  strokeWidth="2"
                  stroke="currentColor"
                  transform={`rotate(${v[1] * 30} 100 100)`}
                />
              </svg>
            )}
            {p.motif === 'seals' && <div className="dial-symbols">△　☾　○　◇</div>}
            {p.motif === 'balance' && <div className="dial-symbols">△　○　□</div>}
            {p.motif === 'final-balance' && <div className="dial-symbols">○　△　□　◇</div>}
            {p.kind === 'gears' && (
              <div className="scratch-rule">
                ↻ ── ↻ ── ↻ ── ↻ ┐<br />
                └──────────────────┘
              </div>
            )}
            <div className="dial-row">
              {v.map((n, i) => (
                <div className={`dial ${p.kind === 'gears' ? 'gear-dial' : ''}`} key={i}>
                  <small>
                    {p.motif === 'clock' ? (i === 0 ? '短針' : '長針') : ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'][i]}
                  </small>
                  <button
                    aria-label={`ダイヤル${i + 1}を進める`}
                    onClick={() => (p.kind === 'gears' ? onChange(gear(v, i)) : step(i, 1))}
                  >
                    ⌃
                  </button>
                  <output aria-label={`ダイヤル${i + 1}の値`}>{n}</output>
                  {p.kind !== 'gears' && (
                    <button aria-label={`ダイヤル${i + 1}を戻す`} onClick={() => step(i, -1)}>
                      ⌄
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {p.kind === 'sequence' && (
          <>
            <div
              className="sequence-readout"
              aria-label={`${v.length} / ${p.answer.length} 入力済み`}
            >
              {p.answer.map((_, i) => (
                <span className={i < v.length ? 'filled' : ''} key={i}>
                  {v[i] === undefined ? '·' : p.glyphs ? GLYPHS[v[i]] : v[i] + 1}
                </span>
              ))}
            </div>
            <div className={`symbol-buttons ${p.motif === 'music' ? 'music-keys' : ''}`}>
              {Array.from({ length: p.glyphs ? 6 : 5 }, (_, i) => (
                <button
                  key={i}
                  aria-label={p.glyphs ? `記号${GLYPHS[i]}` : `音${i + 1}`}
                  onClick={() => {
                    onNote(i);
                    if (v.length < p.answer.length) onChange([...v, i]);
                  }}
                >
                  {p.glyphs ? (
                    GLYPHS[i]
                  ) : (
                    <>
                      <span className="note-height" style={{ height: 25 + i * 12 }} />
                      <small>{i + 1}</small>
                    </>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
        {p.kind === 'lights' && (
          <>
            <div className="engraved-rule">＋　⇄　●</div>
            <div className="lights-grid" style={{ gridTemplateColumns: `repeat(${p.size},1fr)` }}>
              {v.map((n, i) => (
                <button
                  key={i}
                  className={n ? 'lit' : ''}
                  aria-label={`灯${i + 1}`}
                  aria-pressed={!!n}
                  onClick={() => onChange(toggleLights(v, i, p.size!))}
                >
                  <span />
                </button>
              ))}
            </div>
            <div className="light-goal">● ● ●</div>
          </>
        )}
        {p.kind === 'pipes' && (
          <div className="pipe-board">
            <span className="pipe-in">→</span>
            <div className="pipe-grid">
              {v.map((_, i) => (
                <button
                  key={i}
                  aria-label={`継手${i + 1}を回す`}
                  onClick={() => onChange(v.map((n, j) => (j === i ? (n + 1) % 4 : n)))}
                >
                  <svg viewBox="0 0 100 100">
                    {pipeEdges(v, i).map((e) => (
                      <path
                        key={e}
                        d={`M50 50L${[50, 100, 50, 0][e]} ${[0, 50, 100, 50][e]}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="13"
                      />
                    ))}
                    <circle cx="50" cy="50" r="11" fill="currentColor" />
                  </svg>
                </button>
              ))}
            </div>
            <span className="pipe-out">→</span>
          </div>
        )}
        {p.kind === 'water' && (
          <>
            <div className="water-target">8　→　4 ＋ 4</div>
            <div className="vessels">
              {v.map((n, i) => (
                <button
                  className={`vessel ${source === i ? 'selected' : ''}`}
                  key={i}
                  aria-label={`計量槽${i + 1} ${n}リットル`}
                  aria-pressed={source === i}
                  onClick={() => {
                    if (source === null) setSource(i);
                    else {
                      onChange(pour(v, source, i));
                      setSource(null);
                    }
                  }}
                >
                  <small>{[8, 5, 3][i]}</small>
                  <div className="vessel-glass">
                    <div
                      className="water-fill"
                      style={{ height: `${(n / [8, 5, 3][i]) * 100}%` }}
                    />
                    {Array.from({ length: [8, 5, 3][i] - 1 }, (_, j) => (
                      <i key={j} style={{ bottom: `${((j + 1) / [8, 5, 3][i]) * 100}%` }} />
                    ))}
                  </div>
                  <output>{n}</output>
                </button>
              ))}
            </div>
            <p className="control-whisper">{source === null ? '移す槽を選ぶ' : '移し先を選ぶ'}</p>
          </>
        )}
        {p.kind === 'rings' && (
          <>
            <div className={`ring-assembly ${p.motif === 'projection' ? 'glass-rings' : ''}`}>
              {v.map((n, i) => (
                <button
                  key={i}
                  className={`ring ring-${i}`}
                  aria-label={`環${i + 1}を回す`}
                  onClick={() => step(i, 1)}
                >
                  <span className="ring-rotor" style={{ transform: `rotate(${n * 90}deg)` }}>
                    <i />
                  </span>
                  <small>{['Ⅰ', 'Ⅱ', 'Ⅲ'][i]}</small>
                </button>
              ))}
            </div>
            <div className="ring-legend">Ⅰ　/　Ⅱ　/　Ⅲ</div>
          </>
        )}
        {p.kind === 'slide' && (
          <div className="slide-grid">
            {v.map((n, i) => (
              <button
                key={i}
                className={n === 0 ? 'empty-tile' : ''}
                disabled={disabled || n === 0}
                aria-label={n === 0 ? '空き' : `小蓋${n}`}
                onClick={() => onChange(slide(v, i))}
              >
                {n || ''}
                {n > 0 && <span className="tile-etch" />}
              </button>
            ))}
          </div>
        )}
        {p.kind === 'order' && (
          <>
            <div className="film-strip">
              {v.map((id, i) => {
                const a = [3, 5, 1, 4, 2][id];
                return (
                  <button
                    key={i}
                    className={picked === i ? 'selected' : ''}
                    aria-label={`フィルム位置${i + 1}`}
                    aria-pressed={picked === i}
                    onClick={() => {
                      if (picked === null) setPicked(i);
                      else {
                        const next = [...v];
                        [next[picked], next[i]] = [next[i], next[picked]];
                        onChange(next);
                        setPicked(null);
                      }
                    }}
                  >
                    <span className="film-perfs">
                      {Array.from({ length: a }, (_, k) => (
                        <i key={k} />
                      ))}
                    </span>
                    <span className="film-center">{['◐', '◑', '◒', '◓', '◉'][id]}</span>
                    <span className="film-perfs">
                      {Array.from({ length: a + 1 }, (_, k) => (
                        <i key={k} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="control-whisper">
              {picked === null ? '二枚を選んで入れ替える' : '入れ替える場所を選ぶ'}
            </p>
          </>
        )}
        <div className="mechanism-actions">
          <button
            className="icon-button reset-control"
            onClick={() => {
              onReset();
              setSource(null);
              setPicked(null);
            }}
            aria-label="仕掛けを初期状態に戻す"
          >
            <Icon name="reset" />
          </button>
          <button className="check-control" onClick={onCheck} aria-label="仕掛けを確かめる">
            <Icon name="check" />
            <span>確かめる</span>
          </button>
        </div>
      </fieldset>
    </div>
  );
}
