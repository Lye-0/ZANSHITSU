import type { ClueKind } from './data';
import { GLYPHS } from './data';
export function ClueArt({
  kind,
  room = 0,
  active = true,
}: {
  kind: ClueKind;
  room?: number;
  active?: boolean;
}) {
  if (!active)
    return (
      <div className="unreadable">
        <span>···</span>
        <p>{kind === 'tub' ? '水が、底を隠している。' : 'まだ、何も見えない。'}</p>
      </div>
    );
  return (
    <div className={`clue-art clue-${kind}`}>
      {kind === 'constellation' && (
        <svg viewBox="0 0 400 290" role="img" aria-label="足跡から月、三角、四角、丸へ続く線">
          <path
            d="M48 244L80 165 173 82 260 195 342 70"
            fill="none"
            stroke="currentColor"
            strokeDasharray="3 8"
          />
          <g fontSize="43" textAnchor="middle" fill="currentColor">
            <text x="80" y="174">
              ☾
            </text>
            <text x="173" y="93">
              △
            </text>
            <text x="260" y="207">
              □
            </text>
            <text x="342" y="82">
              ○
            </text>
          </g>
          <path d="M41 245l-8 15m20-10-8 15" stroke="currentColor" strokeWidth="5" />
          <path d="M324 103l18-21-3 18" fill="none" stroke="currentColor" />
        </svg>
      )}
      {kind === 'clock' && (
        <>
          <div className="clock-sketch">
            <svg viewBox="0 0 240 240" role="img" aria-label="短い針は8、長い針は3">
              <circle cx="120" cy="120" r="96" fill="none" stroke="currentColor" />
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i * Math.PI) / 6;
                return (
                  <text
                    key={i}
                    x={120 + 78 * Math.sin(a)}
                    y={126 - 78 * Math.cos(a)}
                    textAnchor="middle"
                    fontSize="16"
                    fill="currentColor"
                  >
                    {i === 0 ? 12 : i}
                  </text>
                );
              })}
              <path d="M120 120L84 141M120 120H187" stroke="currentColor" strokeWidth="4" />
              <circle cx="120" cy="120" r="5" fill="currentColor" />
            </svg>
          </div>
          <div className="scratch-rule">短 ━　　長 ━━━</div>
        </>
      )}
      {kind === 'balance' && (
        <div className="equations">
          <p>△ ＋ △ ＝ 8</p>
          <p>△ ＋ ○ ＝ 6</p>
          <p>□ − ○ ＝ 3</p>
          <small>△　○　□</small>
        </div>
      )}
      {kind === 'wiring' && (
        <>
          <div className="cross-diagram">
            　＋　
            <br />＋ ◉ ＋<br />
            　＋　
          </div>
          <div className="scratch-rule">● ⇄ ○</div>
        </>
      )}
      {kind === 'ceiling' && (
        <div className="scratch-numbers">
          {[
            { n: 6, i: 3 },
            { n: 8, i: 1 },
            { n: 2, i: 4 },
            { n: 3, i: 2 },
          ].map(({ n, i }) => (
            <div key={i}>
              <small>{'│'.repeat(i)}</small>
              <strong>{n}</strong>
            </div>
          ))}
        </div>
      )}
      {kind === 'mirror' && (
        <>
          <div className="mirror-code" aria-label="鏡文字の2715">
            2715
          </div>
          <div className="scratch-rule">◩　↔　▯</div>
        </>
      )}
      {kind === 'tub' && (
        <>
          <div className="glyph-trail">
            {[0, 2, 1, 3, 1, 0].map((n, i) => (
              <span key={i}>{GLYPHS[n]}</span>
            ))}
          </div>
          <div className="scratch-rule">→ → →　◎</div>
        </>
      )}
      {kind === 'slide' && (
        <div className="tile-plan">
          {[1, 2, 3, 4, 5, 6, 7, 8, 0].map((n) => (
            <span key={n}>{n || '·'}</span>
          ))}
        </div>
      )}
      {kind === 'score' && (
        <svg viewBox="0 0 400 250" role="img" aria-label="左から1、4、2、5、3、1の高さに光点">
          {[0, 1, 2, 3, 4].map((n) => (
            <line
              key={n}
              x1="25"
              x2="375"
              y1={210 - n * 40}
              y2={210 - n * 40}
              stroke="currentColor"
              opacity=".35"
            />
          ))}
          {[0, 3, 1, 4, 2, 0].map((n, i) => (
            <circle key={i} cx={40 + i * 63} cy={210 - n * 40} r="8" fill="currentColor" />
          ))}
          <path d="M27 234h343m-9-5 9 5-9 5" fill="none" stroke="currentColor" />
        </svg>
      )}
      {kind === 'frames' && (
        <div className="frame-clues">
          {[
            { n: 1, d: 3 },
            { n: 6, d: 4 },
            { n: 3, d: 1 },
            { n: 8, d: 2 },
          ].map(({ n, d }) => (
            <div key={n}>
              <small>{'•'.repeat(d)}</small>
              <strong>{n}</strong>
            </div>
          ))}
        </div>
      )}
      {kind === 'echo' && (
        <div className="echo-clue">
          <small>{['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'][room]}</small>
          <div className="echo-mark">⌾</div>
          <strong>{[1, 3, 5, 3][room]}</strong>
          <span>Ⅰ — Ⅱ — Ⅲ — Ⅳ</span>
        </div>
      )}
      {kind === 'equations' && (
        <div className="equations">
          <p>○ − △ ＝ 2</p>
          <p>□ ＝ ○ ＋ △</p>
          <p>◇ ＋ △ ＝ ○</p>
          <p>○ ＋ △ ＋ □ ＋ ◇ ＝ 10</p>
        </div>
      )}
      {kind === 'memory' && (
        <>
          <div className="memory-paper">
            <span>Ⅰ</span>
            <span>☾ · · ·</span>
            <span>＋</span>
            <span>□ △ ☾ ○</span>
          </div>
        </>
      )}
      {kind === 'seals' && (
        <div className="seal-sockets">
          {['△', '☾', '○', '◇'].map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      )}
      {kind === 'empty' && (
        <div className="unreadable">
          <span>···</span>
          <p>{room === 3 ? 'どこかで、見た気がする。' : '細かな傷だけが残っている。'}</p>
        </div>
      )}
    </div>
  );
}
