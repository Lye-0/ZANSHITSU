import { publicAsset } from './publicAsset';
import { ITEMS } from './data';
import { Icon } from './Icons';
export function Inventory({
  items,
  selected,
  onSelect,
  onInspect,
  installedItem,
  closeup = false,
}: {
  items: string[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  onInspect: (id: string, back?: boolean) => void;
  installedItem?: string;
  closeup?: boolean;
}) {
  return (
    <div className={closeup ? 'inventory-dock' : 'inventory-home'}>
      <footer className="inventory" aria-label="持ち物">
        <div className="inventory-label">
          持ち物<span>{items.length.toString().padStart(2, '0')}</span>
        </div>
        <div className="inventory-slots">
          {items.map((id) => (
            <button
              key={id}
              className={`inventory-slot ${selected === id ? 'selected' : ''}`}
              aria-label={ITEMS[id].name}
              aria-pressed={selected === id}
              onClick={() => onSelect(selected === id ? null : id)}
              onDoubleClick={() => onInspect(id)}
            >
              <img
                src={publicAsset(`/images/items/${id}/front.webp`)}
                alt=""
                draggable={false}
                width={47}
                height={47}
              />
            </button>
          ))}
          {Array.from({ length: Math.max(0, (installedItem ? 4 : 5) - items.length) }, (_, i) => (
            <span key={i} className="inventory-slot empty-slot" />
          ))}
        </div>
        {installedItem && (
          <div className="installed-item" role="group" aria-label="設置済みの部品">
            <span>設置済み</span>
            <button
              aria-label={`${ITEMS[installedItem].name}の刻印を確認`}
              onClick={() => onInspect(installedItem, true)}
            >
              <img
                src={publicAsset(`/images/items/${installedItem}/back.webp`)}
                alt=""
                draggable={false}
              />
              <Icon name="expand" size={12} />
            </button>
          </div>
        )}
        <button
          className="inspect-button"
          disabled={!selected}
          aria-label="選んだ持ち物を調べる"
          onClick={() => selected && onInspect(selected)}
        >
          <Icon name="expand" size={19} />
        </button>
      </footer>
      <div className="selected-caption">
        {selected && (
          <button onClick={() => onSelect(null)}>
            {ITEMS[selected].name}
            <span>×</span>
          </button>
        )}
      </div>
    </div>
  );
}
