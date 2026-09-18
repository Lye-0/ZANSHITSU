import { ITEMS } from './data';
import { Icon } from './Icons';
export function Inventory({
  items,
  selected,
  onSelect,
  onInspect,
  closeup = false,
}: {
  items: string[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  onInspect: (id: string) => void;
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
                src={`/images/items/${id}/front.webp`}
                alt=""
                draggable={false}
                width={47}
                height={47}
              />
            </button>
          ))}
          {Array.from({ length: Math.max(0, 5 - items.length) }, (_, i) => (
            <span key={i} className="inventory-slot empty-slot" />
          ))}
        </div>
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
