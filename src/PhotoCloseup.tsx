import { publicAsset } from './publicAsset';
import { useState, type CSSProperties } from 'react';
import { ITEMS, PUZZLES } from './data';
import type { SceneNode } from './data';
import { canAccess } from './engine';
import type { GameState } from './engine';
import { detailPhoto } from './photography';
import { PHOTO_MECHANISMS, STATE_PHOTO_IDS, statePhoto } from './mechanismPhotos';
import type { Rect } from './mechanismPhotos';
import { PhotoControls } from './PhotoControls';
import { availableProjection, projectionPhoto } from './projection';
export const photoRect = ([x, y, w, h]: Rect): CSSProperties => ({
  left: `${x}%`,
  top: `${y}%`,
  width: `${w}%`,
  height: `${h}%`,
});
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
  onOpen,
  onDoor,
  onNote,
  onInspect,
  onReference,
  onObserve,
}: {
  node: SceneNode;
  room: number;
  game: GameState;
  selected: string | null;
  onBack: () => void;
  onValues: (id: string, v: number[]) => void;
  onReset: (id: string) => void;
  onInsert: (id: string, item: string) => void;
  onTake: (id: string) => void;
  onOpen: (id: string) => void;
  onDoor: () => void;
  onNote: (n: number) => void;
  onInspect: (id: string) => void;
  onReference: (id: string) => void;
  onObserve: (id: string) => void;
}) {
  const isScreen = ['r3-screen', 'r3-film-clue'].includes(node.id);
  const available = availableProjection(game.solved);
  const [projection, setProjection] = useState<'score' | 'frames'>(
    node.projection ?? (available === 'frames' ? 'frames' : 'score'),
  );
  const p =
    node.kind === 'puzzle'
      ? PUZZLES[node.target!]
      : node.id === 'r4-sockets' && room === game.room
        ? PUZZLES['r4-exit']
        : null;
  const solved = !!p && game.solved.includes(p.id),
    opened = !!p && game.opened.includes(p.id);
  const installed = !!p && game.installed.includes(p.id),
    collected = !!p?.reward && game.collected.includes(p.reward);
  const gated = !!p?.requires?.some((id) => !game.solved.includes(id));
  const allowed = !!p && canAccess(game, p) && !solved;
  const values = p ? (game.values[p.id] ?? p.initial) : [];
  const conf = p ? PHOTO_MECHANISMS[p.id] : null;
  let photo = detailPhoto(room, node);
  if (p && STATE_PHOTO_IDS.includes(p.id))
    photo = statePhoto(
      p.id,
      opened ? (collected ? 'empty' : 'reward') : installed ? 'installed' : 'base',
    );
  if (p?.id === 'r2-water' && installed)
    photo = statePhoto('r2-water', `levels/${values.join('-')}`);
  if (p?.id === 'r3-overlay' && !opened) photo = statePhoto(p.id, 'base');
  if (p?.id === 'r4-exit') photo = statePhoto('r4-exit', installed ? 'installed' : 'base');
  if (p?.id === 'r4-memory' && opened)
    photo = statePhoto('r4-memory', collected ? 'empty' : 'reward');
  if (
    !p &&
    node.kind === 'clue' &&
    node.id !== 'r4-sockets' &&
    node.clue !== 'empty' &&
    (!node.gate || game.solved.includes(node.gate))
  )
    photo = publicAsset(`/images/clues/${node.id}.webp`);
  if (node.clue === 'tub' && !game.solved.includes('r2-drain'))
    photo = publicAsset('/images/clues/bathtub-full.webp');
  if (node.kind === 'take' && game.collected.includes(node.target!))
    photo = publicAsset('/images/rooms/02-washroom/states/wrench-taken.webp');
  if (isScreen)
    photo = projectionPhoto(
      available === 'blank' ? 'blank' : available === 'frames' ? projection : 'score',
    );
  const use = (id: string) => {
    if (selected) onInsert(id, selected);
  };
  return (
    <section
      className={`closeup-view photo-closeup detail-${node.id} ${isScreen && available === 'frames' ? 'has-projection-choice' : ''} ${opened ? 'container-open' : ''} ${installed ? 'part-installed' : ''}`}
      aria-label={`${node.label}の接写`}
      style={{ '--detail-photo': `url(${photo})` } as CSSProperties}
    >
      <div className="closeup-bleed" />
      <div className="closeup-plane">
        <img className="closeup-photo" src={photo} alt={`${node.label}を近くで見た写真`} />
        {p?.id === 'r2-locker' && installed && (
          <img
            className="mirror-number-photo"
            src={publicAsset('/images/components/markings/mirror-number.webp')}
            alt="鏡に刻まれた四つの数字"
          />
        )}
        {p && opened && p.id === 'r2-water' && (
          <img
            className="photo-reveal-patch"
            src={statePhoto(p.id, `${collected ? 'empty' : 'reward'}-detail`)}
            alt=""
            style={photoRect([66, 75, 32, 25])}
          />
        )}
        {p && conf?.openControls && opened && (
          <div
            className={`photo-mechanism ${p.motif === 'clock' ? 'clock-mechanism' : ''}`}
            style={p.motif === 'clock' ? undefined : photoRect(conf.openControls)}
          >
            <PhotoControls p={p} values={values} disabled change={() => {}} note={onNote} />
          </div>
        )}
        {p && conf && !opened && (
          <>
            {(installed || !['r2-pipes', 'r3-order', 'r3-overlay'].includes(p.id)) && (
              <div
                className={`photo-mechanism ${p.motif === 'clock' ? 'clock-mechanism' : ''}`}
                style={
                  p.motif === 'clock'
                    ? undefined
                    : photoRect(
                        installed && conf.installedControls
                          ? conf.installedControls
                          : conf.controls,
                      )
                }
              >
                <PhotoControls
                  key={`${p.id}-${installed}`}
                  p={p}
                  values={values}
                  disabled={!allowed}
                  change={(v) => allowed && onValues(p.id, v)}
                  note={onNote}
                />
              </div>
            )}
            {p.item && !installed && !gated && conf.fitting && (
              <button
                className="photo-hit fitting-hit"
                style={photoRect(conf.fitting)}
                aria-label={`${ITEMS[p.item].name}を使う場所`}
                onClick={() => use(p.id)}
              />
            )}
            {p.reward && (
              <button
                className="photo-hit pull-hit"
                style={photoRect(conf.pull)}
                disabled={!solved}
                aria-label={p.id === 'r4-memory' ? '小箱を開ける' : '収納を開ける'}
                onClick={() => onOpen(p.id)}
              />
            )}
            {p.id.endsWith('exit') && (
              <button
                className="photo-hit"
                style={photoRect(conf.pull)}
                disabled={!solved}
                aria-label="扉を開ける"
                onClick={onDoor}
              />
            )}
            {conf.reset && allowed && (
              <button
                className="photo-hit reset-hit"
                style={photoRect(conf.reset)}
                aria-label="仕掛けを初期状態に戻す"
                onClick={() => onReset(p.id)}
              />
            )}
          </>
        )}
        {p?.reward && opened && !collected && conf?.reward && (
          <button
            className="photo-hit reward-hit"
            style={photoRect(conf.reward)}
            aria-label={`${ITEMS[p.reward].name}を拾う`}
            onClick={() => onTake(p.reward!)}
          />
        )}
        {p?.id === 'r4-exit' &&
          ['seal4', 'seal1', 'seal3', 'seal2'].map((id, i) => (
            <button
              key={id}
              className="photo-hit seal-placement"
              style={photoRect([15.2 + i * 17.8, 25, 12.5, 13])}
              aria-label={`${ITEMS[id].name}の窪み`}
              onClick={() =>
                game.mounted.includes(id) ? onInspect(id) : selected === id && onInsert(p.id, id)
              }
            >
              {game.mounted.includes(id) && (
                <img src={publicAsset(`/images/items/${id}/front.webp`)} alt="" />
              )}
            </button>
          ))}
        {node.kind === 'take' && !game.collected.includes(node.target!) && (
          <button
            className="photo-hit take-in-photo"
            aria-label={`${ITEMS[node.target!].name}を拾う`}
            onClick={() => onTake(node.target!)}
          />
        )}
      </div>
      {isScreen && available === 'frames' && (
        <nav className="projection-choice" aria-label="スクリーンの投影">
          <button
            aria-pressed={projection === 'score'}
            onClick={() => {
              setProjection('score');
              onObserve('r3-screen');
            }}
          >
            光点
          </button>
          <button
            aria-pressed={projection === 'frames'}
            onClick={() => {
              setProjection('frames');
              onObserve('r3-film-clue');
            }}
          >
            数字
          </button>
        </nav>
      )}
      {p?.id === 'r3-slide' && (
        <div className="slide-guide">
          <span>{solved ? '解錠済み' : '空きの隣の板を動かす'}</span>
          <button onClick={() => onReference('r3-plan')}>完成図を見る</button>
        </div>
      )}
      {node.id === 'r3-plan' && <div className="reference-caption">完成図</div>}
      {p?.id === 'r2-water' && (
        <div className="water-status" aria-label="計量槽の水量">
          <span aria-hidden="true" />
          {[8, 5, 3].map((capacity, i) => (
            <span key={i} className="water-capacity">
              {capacity} L槽
            </span>
          ))}
          <span>現在</span>
          {values.map((n, i) => (
            <output key={i} aria-label={`計量槽${i + 1}の現在量`} aria-live="polite">
              {n} L
            </output>
          ))}
          <span>目標</span>
          {p.answer.map((n, i) => (
            <span key={i} aria-label={`計量槽${i + 1}の目標量`}>
              {n} L
            </span>
          ))}
        </div>
      )}
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
  const photo = publicAsset(`/images/items/${id}/${flipped ? 'back' : 'front'}.webp`);
  return (
    <section
      className="closeup-view photo-item"
      aria-label={`${ITEMS[id].name}の接写`}
      style={{ '--detail-photo': `url(${photo})` } as CSSProperties}
    >
      <div className="closeup-bleed" />
      <div className="closeup-plane">
        <img
          className="closeup-photo"
          src={photo}
          alt={`${ITEMS[id].name}の${flipped ? '裏' : '表'}`}
        />
        <button className="photo-hit flip-in-photo" aria-label="持ち物を裏返す" onClick={onFlip} />
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
