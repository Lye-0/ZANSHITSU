import { useState } from 'react';
import type { Puzzle } from './data';

export function HintContent({
  puzzle,
  revealed,
  onReveal,
}: {
  puzzle: Puzzle;
  revealed: number;
  onReveal: (level: number) => void;
}) {
  const [page, setPage] = useState(revealed);
  return (
    <div className="hint-content">
      {page > 0 && <p aria-live="polite">{puzzle.hints[page - 1]}</p>}
      <div className="hint-navigation">
        {page > 0 && (
          <button className="text-button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            前のヒント
          </button>
        )}
        {page > 0 && <span aria-label="ヒントの段階">{page} / 3</span>}
        {page < 3 && (
          <button
            className="text-button"
            onClick={() => {
              const next = page + 1;
              setPage(next);
              onReveal(Math.max(revealed, next));
            }}
          >
            {page === 0 ? 'ヒントを見る' : '次のヒント'}
          </button>
        )}
      </div>
    </div>
  );
}
