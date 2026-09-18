import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { FACE_NAMES, ITEMS, PUZZLES, ROOMS } from './data';
import type { SceneNode } from './data';
import {
  freshGame,
  install,
  parseSave,
  SAVE_KEY,
  solve,
  take,
  openContainer,
  leaveRoom,
} from './engine';
import type { GameState } from './engine';
import { audioEnabled, sound } from './audio';
import { Icon } from './Icons';
import { Closeup, ItemCloseup } from './PhotoCloseup';
import { Hotspots } from './Hotspots';
import { viewPhoto } from './photography';
import { turnView } from './navigation';
import { Inventory } from './Inventory';

type Panel =
  | { type: 'node'; node: SceneNode; room: number }
  | { type: 'item'; id: string }
  | { type: 'menu' | 'journal' | 'help' | 'restart' | 'hints' }
  | null;
function Modal({
  children,
  label,
  onClose,
}: {
  children: ReactNode;
  label: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <button className="icon-button modal-close" aria-label="閉じる" onClick={onClose}>
          <Icon name="close" />
        </button>
        {children}
      </div>
    </dialog>
  );
}
function getInitial() {
  try {
    return parseSave(localStorage.getItem(SAVE_KEY)) ?? freshGame();
  } catch {
    return freshGame();
  }
}
function formatTime(n: number) {
  return `${Math.floor(n / 3600)
    .toString()
    .padStart(2, '0')}:${Math.floor((n / 60) % 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(n % 60)
    .toString()
    .padStart(2, '0')}`;
}
export default function App() {
  const [game, setGame] = useState<GameState>(getInitial);
  const [playing, setPlaying] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const itemOrigin = useRef<Panel>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [marks, setMarks] = useState(false);
  const [toast, setToast] = useState('');
  const [hover, setHover] = useState('');
  const [hintTarget, setHintTarget] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [assetError, setAssetError] = useState(false);
  const [intro, setIntro] = useState(false);
  const [journalRoom, setJournalRoom] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const room = ROOMS[game.room];
  const close = () => {
    setPanel(panel?.type === 'item' ? itemOrigin.current : null);
    itemOrigin.current = null;
    setSelected(null);
    setFlipped(false);
  };
  const notify = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2800);
  };
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (!game.started) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(game));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [game]);
  useEffect(() => {
    if (!playing || game.finished || panel?.type === 'menu') return;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible')
        setGame((g) => ({ ...g, elapsed: g.elapsed + 1 }));
    }, 1000);
    return () => clearInterval(id);
  }, [playing, game.finished, panel?.type]);
  useEffect(() => {
    const sync = () =>
      void audioEnabled(
        game.sound && playing && !game.finished && document.visibilityState === 'visible',
      ).catch(() => {});
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [game.sound, playing, game.finished]);
  useEffect(() => {
    ROOMS.forEach((r) => {
      const img = new Image();
      img.src = r.image;
    });
  }, []);
  function turn(direction: number) {
    if (panel) return;
    sound('turn', game.sound);
    setHover('');
    setSelected(null);
    const d =
      direction === -1 ? 'left' : direction === 1 ? 'right' : direction === 4 ? 'up' : 'down';
    setGame((g) => turnView(g, d));
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((panel?.type === 'node' || panel?.type === 'item') && e.key === 'ArrowDown') {
        e.preventDefault();
        close();
        return;
      }
      if (!playing || panel || game.finished || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      const directions: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: 4,
        ArrowDown: 5,
      };
      if (e.key in directions) {
        e.preventDefault();
        turn(directions[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  function begin() {
    setPlaying(true);
    setGame((g) => ({ ...g, started: true }));
    if (!game.started) setIntro(true);
    void audioEnabled(game.sound).catch(() => {});
  }
  function visit(index: number) {
    if (index > game.unlocked) return;
    setGame((g) => ({ ...g, room: index, face: 0, wallFace: 0 }));
    close();
    setSelected(null);
    setHover('');
    setAssetError(false);
    sound('open', game.sound);
  }
  function openNode(node: SceneNode) {
    setIntro(false);
    sound('tap', game.sound);
    if (node.kind === 'travel') {
      visit(node.room!);
      return;
    }
    setSelected(null);
    if (
      node.kind === 'clue' &&
      (!node.gate || game.solved.includes(node.gate)) &&
      (node.id !== 'r2-mirror' || game.installed.includes('r2-locker'))
    )
      setGame((g) => ({ ...g, seen: [...new Set([...g.seen, node.id])] }));
    setPanel({ type: 'node', node, room: game.room });
  }
  function updatePuzzle(id: string, values: number[]) {
    const changed = { ...game, values: { ...game.values, [id]: values } };
    const next = solve(changed, id, values);
    setGame(next);
    if (next.solved.length > game.solved.length) {
      sound('open', game.sound);
      notify('かちり。');
      if (next.finished) close();
    } else sound('tap', game.sound);
  }
  const showItem = (id: string) => {
    itemOrigin.current = panel?.type === 'node' ? panel : null;
    setSelected(null);
    setPanel({ type: 'item', id });
    setFlipped(false);
  };
  const style = {
    '--room-image': `url(${viewPhoto(game.room, game.face, game)})`,
    '--brightness': game.brightness,
  } as CSSProperties;
  const nodes = room.views[game.face] as readonly SceneNode[];
  const foundClues = ROOMS.flatMap((r, i) =>
    r.views.flatMap((v) =>
      (v as readonly SceneNode[])
        .filter((n) => n.kind === 'clue' && game.seen.includes(n.id) && n.clue !== 'empty')
        .map((n) => ({ node: n, room: i })),
    ),
  );
  return (
    <div
      className={`app ${game.motion ? '' : 'reduced-motion'} tone-${room.tone} ${panel?.type === 'node' || panel?.type === 'item' ? 'has-closeup' : ''}`}
      style={style}
    >
      {!playing ? (
        <main className="title-screen">
          <div className="title-image" />
          <div className="title-grain" />
          <div className="title-frame">
            <h1>
              残<span>室</span>
            </h1>
            <div className="title-roman">Z A N S H I T S U</div>
            <div className="title-actions">
              <button className="start-button" onClick={begin}>
                {game.started ? (game.finished ? '扉の向こうへ' : 'つづきから') : 'はじめる'}
                <Icon name="arrow" />
              </button>
              {game.started && (
                <button className="text-button" onClick={() => setPanel({ type: 'restart' })}>
                  はじめから
                </button>
              )}
            </div>
            <div className="title-rule" />
          </div>
          <footer className="title-footer">
            <span aria-hidden="true">Ⅰ — Ⅳ</span>
            <button
              className="icon-button"
              aria-label={game.sound ? '音を消す' : '音を出す'}
              onClick={() => setGame((g) => ({ ...g, sound: !g.sound }))}
            >
              <Icon name={game.sound ? 'sound' : 'muted'} />
            </button>
          </footer>
        </main>
      ) : game.finished ? (
        <main className="ending">
          <div className="end-door" />
          <span className="ending-small">Ⅳ / Ⅳ</span>
          <h1>外へ。</h1>
          <p>振り返らない。</p>
          <div className="ending-record">
            {formatTime(game.elapsed)}
            <span>見た手掛かり　{Object.values(game.hints).reduce((a, b) => a + b, 0)}</span>
          </div>
          <button
            className="text-button"
            onClick={() => {
              setPlaying(false);
              setPanel({ type: 'restart' });
            }}
          >
            もう一度
          </button>
          <small className="ending-signature">残室　/　ZANSHITSU</small>
        </main>
      ) : (
        <main className="game-shell">
          <header className="game-header">
            <button
              className="wordmark"
              aria-label="設定を開く"
              onClick={() => setPanel({ type: 'menu' })}
            >
              残室<span>ZANSHITSU</span>
            </button>
            <nav className="room-path" aria-label="部屋を移動">
              {ROOMS.map((r, i) => (
                <button
                  key={r.roman}
                  disabled={i > game.unlocked}
                  aria-label={`第${i + 1}室へ移動`}
                  aria-current={i === game.room ? 'location' : undefined}
                  onClick={() => visit(i)}
                >
                  {i <= game.unlocked ? r.roman : '·'}
                </button>
              ))}
            </nav>
            <div className="header-tools">
              <button
                className="icon-button"
                aria-label="記録を見る"
                onClick={() => {
                  setJournalRoom(game.room);
                  setPanel({ type: 'journal' });
                }}
              >
                <Icon name="book" />
              </button>
              <button
                className="icon-button"
                aria-label="設定"
                onClick={() => setPanel({ type: 'menu' })}
              >
                <Icon name="menu" />
              </button>
            </div>
          </header>
          <div className="room-surround">
            <div className="side-inscription">
              <i />
            </div>
            <section
              className={`room-stage face-${game.face} ${marks ? 'show-marks' : ''}`}
              aria-label={`第${game.room + 1}室 ${FACE_NAMES[game.face]}`}
            >
              <div key={`${game.room}-${game.face}`} className="room-picture" />
              <img
                className="asset-check"
                src={viewPhoto(game.room, game.face, game)}
                onError={() => setAssetError(true)}
                onLoad={() => setAssetError(false)}
                alt=""
              />
              <div className="room-vignette" />
              <div className="dust" />
              {game.face === 4 && <div className="ceiling-light" />}
              {game.face === 3 && game.room === 2 && (
                <div className="scene-plan-paper" aria-hidden="true" />
              )}
              {game.face === 2 && game.room === 0 && (
                <div
                  className="scene-paper first-equation"
                  aria-hidden="true"
                  style={{ backgroundImage: 'url(/images/clues/r1-equation.webp)' }}
                />
              )}
              {game.face === 2 && game.room === 3 && (
                <div
                  className="scene-paper last-equation"
                  aria-hidden="true"
                  style={
                    game.solved.includes('r4-gears')
                      ? { backgroundImage: 'url(/images/clues/r4-equations.webp)' }
                      : undefined
                  }
                />
              )}
              {game.face === 0 && game.solved.includes(`r${game.room + 1}-exit`) && (
                <div className="door-light" />
              )}
              {game.face === 4 && game.solved.includes('r4-power') && (
                <div
                  className="ceiling-echo"
                  style={{
                    left: `${[68, 71, 71, 26][game.room]}%`,
                    top: `${[67, 68, 68, 63][game.room]}%`,
                  }}
                  aria-hidden="true"
                >
                  <img src={`/images/clues/echo-${game.room}.webp`} alt="" />
                </div>
              )}
              <Hotspots
                nodes={nodes}
                solved={game.opened}
                open={openNode}
                hover={setHover}
                marks={marks}
                taken={(n) =>
                  n.kind === 'take' &&
                  (game.inventory.includes(n.target!) || game.installed.includes('r2-pipes'))
                }
              />
              {game.face < 4 && (
                <>
                  <button className="direction left" aria-label="左を向く" onClick={() => turn(-1)}>
                    <span />
                  </button>
                  <button className="direction right" aria-label="右を向く" onClick={() => turn(1)}>
                    <span />
                  </button>
                </>
              )}
              {game.face !== 4 && (
                <button
                  className="direction up"
                  aria-label={game.face === 5 ? '壁へ戻る' : '天井を見る'}
                  onClick={() => turn(4)}
                >
                  <span />
                </button>
              )}
              {game.face !== 5 && (
                <button
                  className="direction down"
                  aria-label={game.face === 4 ? '壁へ戻る' : '床を見る'}
                  onClick={() => turn(5)}
                >
                  <span />
                </button>
              )}
              <div className="view-marker" aria-hidden="true">
                {[0, 1, 2, 3].map((n) => (
                  <i className={game.face === n ? 'active' : ''} key={n} />
                ))}
                <span>{game.face === 4 ? '↑' : game.face === 5 ? '↓' : ''}</span>
              </div>
              {intro && (
                <button className="intro-note" onClick={() => setIntro(false)}>
                  三角で向きを変える。
                  <br />
                  気になるものに、触れる。<small>タップして閉じる</small>
                </button>
              )}
              {assetError && (
                <div className="asset-error">
                  部屋を読み込めませんでした。
                  <button onClick={() => location.reload()}>再読み込み</button>
                </div>
              )}
            </section>
            <div className="side-inscription right-inscription">
              <i />
              <span>ROOM {room.roman}</span>
            </div>
          </div>
          <div className="under-scene">
            <button
              className={`icon-button ${marks ? 'active' : ''}`}
              aria-label="調べられる場所を表示"
              aria-pressed={marks}
              onClick={() => setMarks(!marks)}
            >
              <Icon name="eye" size={20} />
            </button>
            <span className="hover-caption">{hover || ' '}</span>
            <button
              className="icon-button"
              aria-label={game.sound ? '音を消す' : '音を出す'}
              onClick={() => setGame((g) => ({ ...g, sound: !g.sound }))}
            >
              <Icon name={game.sound ? 'sound' : 'muted'} size={20} />
            </button>
          </div>
          <Inventory
            items={game.inventory}
            selected={selected}
            onSelect={setSelected}
            onInspect={showItem}
          />
        </main>
      )}
      {playing && panel?.type === 'node' && (
        <Closeup
          key={panel.node.id}
          node={panel.node}
          room={panel.room}
          game={game}
          selected={selected}
          onBack={close}
          onValues={updatePuzzle}
          onReset={(id) =>
            setGame((g) => ({ ...g, values: { ...g.values, [id]: [...PUZZLES[id].initial] } }))
          }
          onInsert={(id, item) => {
            const next = install(game, id, item);
            if (next !== game) {
              setGame(next);
              setSelected(null);
              sound('open', game.sound);
            } else notify('合わない。');
          }}
          onTake={(id) => {
            const next = take(game, id);
            if (next !== game) {
              setGame(next);
              setSelected(null);
              notify(ITEMS[id].name);
            }
          }}
          onOpen={(id) => setGame((g) => openContainer(g, id))}
          onDoor={() => {
            setGame((g) => leaveRoom(g));
            close();
          }}
          onNote={(i) => sound('note', game.sound, i)}
          onInspect={showItem}
        />
      )}
      {playing && panel?.type === 'item' && (
        <ItemCloseup
          id={panel.id}
          flipped={flipped}
          onFlip={() => setFlipped(!flipped)}
          onBack={close}
        />
      )}
      {playing && panel?.type === 'node' && (
        <Inventory
          closeup
          items={game.inventory}
          selected={selected}
          onSelect={setSelected}
          onInspect={showItem}
        />
      )}
      <div className="toast" role="status" aria-live="polite">
        {toast}
      </div>
      {saveError && (
        <div className="save-warning" role="alert">
          保存できません。この画面を閉じると進行が失われます。
        </div>
      )}
      {panel && panel.type !== 'node' && panel.type !== 'item' && (
        <Modal key={panel.type} label="メニュー" onClose={close}>
          {panel.type === 'hints' && (
            <div className="hints-menu">
              <h2>手掛かり</h2>
              {Object.values(PUZZLES)
                .filter((p) => p.room === game.room && !game.solved.includes(p.id))
                .map((p) => (
                  <div key={p.id}>
                    <button className="menu-link" onClick={() => setHintTarget(p.id)}>
                      {p.title}
                    </button>
                    {hintTarget === p.id && (
                      <div className="hint-content">
                        {(game.hints[p.id] ?? 0) > 0 && (
                          <p>{p.hints[(game.hints[p.id] ?? 1) - 1]}</p>
                        )}
                        {(game.hints[p.id] ?? 0) < 3 && (
                          <button
                            className="text-button"
                            onClick={() =>
                              setGame((g) => ({
                                ...g,
                                hints: { ...g.hints, [p.id]: (g.hints[p.id] ?? 0) + 1 },
                              }))
                            }
                          >
                            もう少し見る
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
          {panel.type === 'journal' && (
            <div className="journal-panel">
              <div className="panel-kicker">TRACES</div>
              <h2>記録</h2>
              <nav className="journal-tabs">
                {ROOMS.map((r, i) => (
                  <button
                    key={r.roman}
                    disabled={i > game.unlocked}
                    className={journalRoom === i ? 'active' : ''}
                    onClick={() => setJournalRoom(i)}
                  >
                    {r.roman}
                  </button>
                ))}
              </nav>
              {foundClues.filter((c) => c.room === journalRoom).length === 0 ? (
                <p className="empty-journal">まだ、何もない。</p>
              ) : (
                <div className="journal-grid">
                  {foundClues
                    .filter((c) => c.room === journalRoom)
                    .map(({ node, room: ri }) => (
                      <button
                        key={node.id}
                        onClick={() => {
                          setSelected(null);
                          setPanel({ type: 'node', node, room: ri });
                        }}
                      >
                        <img
                          className="journal-photo"
                          src={
                            node.id === 'r2-mirror'
                              ? '/images/mechanisms/r2-locker/installed.webp'
                              : node.id === 'r4-sockets'
                                ? '/images/mechanisms/r4-exit/base.webp'
                                : `/images/clues/${node.id}.webp`
                          }
                          alt={node.label}
                        />
                        <span>{node.label}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
          {panel.type === 'menu' && (
            <div className="settings-panel">
              <div className="panel-kicker">ZANSHITSU</div>
              <h2>静けさの中で</h2>
              <div className="settings-time">{formatTime(game.elapsed)}</div>
              <label className="setting-row">
                <span>音</span>
                <input
                  type="checkbox"
                  checked={game.sound}
                  onChange={(e) => setGame((g) => ({ ...g, sound: e.target.checked }))}
                />
              </label>
              <label className="setting-row">
                <span>明るさ</span>
                <input
                  aria-label="明るさ"
                  type="range"
                  min=".8"
                  max="1.5"
                  step=".05"
                  value={game.brightness}
                  onChange={(e) => setGame((g) => ({ ...g, brightness: Number(e.target.value) }))}
                />
              </label>
              <label className="setting-row">
                <span>動き</span>
                <input
                  type="checkbox"
                  checked={game.motion}
                  onChange={(e) => setGame((g) => ({ ...g, motion: e.target.checked }))}
                />
              </label>
              <button className="menu-link" onClick={() => setPanel({ type: 'hints' })}>
                手掛かり
                <Icon name="hint" size={16} />
              </button>
              <button className="menu-link" onClick={() => setPanel({ type: 'help' })}>
                操作について
                <Icon name="arrow" size={16} />
              </button>
              <button
                className="menu-link"
                onClick={() => {
                  close();
                  setPlaying(false);
                }}
              >
                タイトルへ
                <Icon name="arrow" size={16} />
              </button>
              <button
                className="text-button danger-link"
                onClick={() => setPanel({ type: 'restart' })}
              >
                はじめから
              </button>
              <small className="autosave-note">このブラウザに、自動で保存されます。</small>
            </div>
          )}
          {panel.type === 'help' && (
            <div className="help-panel">
              <div className="panel-kicker">HOW TO TOUCH</div>
              <h2>操作</h2>
              <p>画面端の三角で、壁・天井・床へ。天井からは下、床からは上で戻ります。</p>
              <p>物に触れると、その場所へ近づきます。下の三角で元の視点へ。</p>
              <p>
                持ち物を選んで、使いたい場所へ。
                <br />
                もう一度選ぶと、裏側まで調べられます。
              </p>
              <p>
                目の印で、調べられる場所を表示。
                <br />
                本の印で、見つけた手掛かりを確認。
              </p>
              <p>上のⅠ〜Ⅳで、訪れた部屋へ戻れます。</p>
              <p>PCでは矢印キーでも向きを変えられます。</p>
              <button className="primary-button" onClick={close}>
                戻る
              </button>
            </div>
          )}
          {panel.type === 'restart' && (
            <div className="restart-panel">
              <div className="panel-kicker">BEGIN AGAIN</div>
              <h2>最初の部屋へ？</h2>
              <p>今の記録は、消えます。</p>
              <button
                className="primary-button"
                onClick={() => {
                  const next = {
                    ...freshGame(),
                    started: true,
                    sound: game.sound,
                    brightness: game.brightness,
                    motion: game.motion,
                  };
                  setGame(next);
                  setPlaying(true);
                  setSelected(null);
                  setIntro(true);
                  setMarks(false);
                  close();
                }}
              >
                はじめから
              </button>
              <button className="text-button" onClick={close}>
                戻る
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
