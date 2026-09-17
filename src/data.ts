export const GLYPHS = ['○', '△', '□', '☾', '◇', '✳'];
export type PuzzleKind =
  | 'sequence'
  | 'dial'
  | 'lights'
  | 'pipes'
  | 'water'
  | 'rings'
  | 'slide'
  | 'order'
  | 'gears';
export type Puzzle = {
  id: string;
  room: number;
  title: string;
  kind: PuzzleKind;
  answer: number[];
  initial: number[];
  size?: number;
  modulus?: number;
  glyphs?: boolean;
  requires?: string[];
  item?: string;
  reward?: string;
  hints: [string, string, string];
  motif?: string;
};
export type Item = { id: string; name: string; icon: string; back?: string; description?: string };
export const ITEMS: Record<string, Item> = {
  crank: {
    id: 'crank',
    name: '巻き鍵',
    icon: '⚿',
    back: 'Ⅷ · Ⅲ',
    description: '角穴のある、小さな鍵。',
  },
  key: { id: 'key', name: '真鍮の鍵', icon: '⚿', back: '□', description: '歯が三つ。' },
  fuse: {
    id: 'fuse',
    name: 'ヒューズ',
    icon: '⊟',
    back: '+',
    description: '細い線は、まだ切れていない。',
  },
  seal1: { id: 'seal1', name: '月の銘板', icon: '☾', back: '6' },
  wrench: { id: 'wrench', name: 'レンチ', icon: '⌁', back: '↻', description: '配管の径と同じ。' },
  shard: {
    id: 'shard',
    name: '鏡の欠片',
    icon: '◩',
    back: '↔',
    description: '裏側は黒く塗られている。',
  },
  vessel: { id: 'vessel', name: '計量槽の栓', icon: '⊙', back: '8 → 4 + 4' },
  float: { id: 'float', name: '浮き輪の部品', icon: '◎', back: 'Ⅰ →   Ⅱ ↓   Ⅲ ←' },
  seal2: { id: 'seal2', name: '滴の銘板', icon: '◇', back: '4' },
  lens: { id: 'lens', name: '投影レンズ', icon: '◉', back: '1 ··· 6' },
  glass: { id: 'glass', name: '三枚の透過板', icon: '▱', back: 'Ⅰ →   Ⅱ ←   Ⅲ ↓' },
  handle: {
    id: 'handle',
    name: '映写機のハンドル',
    icon: '⤴',
    back: '♪',
    description: '軸に差し込めそうだ。',
  },
  seal3: { id: 'seal3', name: '眼の銘板', icon: '○', back: '9' },
  seal4: { id: 'seal4', name: '角の銘板', icon: '△', back: '2' },
};
export const PUZZLES: Record<string, Puzzle> = Object.fromEntries(
  (
    [
      {
        id: 'r1-drawer',
        room: 0,
        title: '机の引き出し',
        kind: 'sequence',
        answer: [3, 1, 2, 0],
        initial: [],
        glyphs: true,
        reward: 'crank',
        hints: ['椅子の上の額を。', '足跡の向きに、四つの形をたどる。', '☾ → △ → □ → ○'],
      },
      {
        id: 'r1-clock',
        room: 0,
        title: '止まった時計',
        kind: 'dial',
        answer: [8, 3],
        initial: [0, 0],
        modulus: 12,
        item: 'crank',
        reward: 'key',
        motif: 'clock',
        hints: [
          '机の紙には、長さの違う針がある。',
          '短針は八。長針は三。巻き鍵を先に差す。',
          '左を8、右を3に合わせる。',
        ],
      },
      {
        id: 'r1-cabinet',
        room: 0,
        title: '薬品棚の秤',
        kind: 'dial',
        answer: [4, 2, 5],
        initial: [0, 0, 0],
        modulus: 10,
        item: 'key',
        reward: 'fuse',
        motif: 'balance',
        hints: ['棚の下の紙を。', '同じ形は同じ重さ。△+△=8、△+○=6、□−○=3。', '△=4、○=2、□=5。'],
      },
      {
        id: 'r1-power',
        room: 0,
        title: '配電盤',
        kind: 'lights',
        answer: Array(9).fill(1),
        initial: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        size: 3,
        item: 'fuse',
        reward: 'seal1',
        hints: [
          '棚から取り出した部品を、空いた場所へ。',
          '押した灯と、その上下左右が反転する。全灯を点ける。',
          '初期状態から、四隅と中央を一度ずつ押す。',
        ],
      },
      {
        id: 'r1-exit',
        room: 0,
        title: '鉄扉の錠',
        kind: 'dial',
        answer: [8, 3, 6, 2],
        initial: [0, 0, 0, 0],
        modulus: 10,
        requires: ['r1-power'],
        hints: [
          '電気が戻ったら、天井を見上げる。',
          '傷の横の短い線は、読む順番。',
          '天井の傷を一から四の順に読む。8362。',
        ],
      },
      {
        id: 'r2-pipes',
        room: 1,
        title: '配管の継手',
        kind: 'pipes',
        answer: [1, 1, 2, 1, 1, 3, 0, 1, 1],
        initial: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        item: 'wrench',
        reward: 'shard',
        hints: [
          '床に工具が落ちている。',
          '左上の入口から、右下の出口まで。全ての継手を通す。',
          '上段は右へ、中段は左へ、下段は右へ進む蛇行した経路。',
        ],
      },
      {
        id: 'r2-locker',
        room: 1,
        title: '鏡の奥の箱',
        kind: 'dial',
        answer: [2, 7, 1, 5],
        initial: [0, 0, 0, 0],
        modulus: 10,
        item: 'shard',
        requires: ['r2-pipes'],
        reward: 'vessel',
        hints: [
          '洗面台の鏡には、欠けた場所がある。',
          '欠片をはめると、映った傷を読める。',
          '鏡の中では、2715。',
        ],
      },
      {
        id: 'r2-water',
        room: 1,
        title: '三つの計量槽',
        kind: 'water',
        answer: [4, 4, 0],
        initial: [8, 0, 0],
        item: 'vessel',
        requires: ['r2-pipes'],
        reward: 'float',
        hints: [
          '栓の裏の刻印を。',
          '容量は8・5・3。槽を二つ選ぶと、空か満杯になるまで移せる。',
          '8→5、5→3、3→8、5→3、8→5、5→3、3→8。',
        ],
      },
      {
        id: 'r2-drain',
        room: 1,
        title: '排水口の三重環',
        kind: 'rings',
        answer: [1, 2, 3],
        initial: [0, 0, 0],
        modulus: 4,
        item: 'float',
        reward: 'seal2',
        hints: [
          '計量槽で浮かんだ物を裏返す。',
          '外からⅠ・Ⅱ・Ⅲ。切り欠きを矢印の方向へ。',
          '外環は右、中環は下、内環は左。',
        ],
      },
      {
        id: 'r2-exit',
        room: 1,
        title: '濡れた扉',
        kind: 'sequence',
        answer: [0, 2, 1, 3, 1, 0],
        initial: [],
        glyphs: true,
        requires: ['r2-drain'],
        hints: [
          '水が引いた浴槽をもう一度。',
          '底の六つの形。排水口から遠い側が始まり。',
          '○ → □ → △ → ☾ → △ → ○',
        ],
      },
      {
        id: 'r3-slide',
        room: 2,
        title: '九枚の小蓋',
        kind: 'slide',
        answer: [1, 2, 3, 4, 5, 6, 7, 8, 0],
        initial: [1, 3, 6, 5, 0, 2, 4, 7, 8],
        reward: 'lens',
        hints: [
          '机の端の小さな完成図を。',
          '空いた場所へ隣の蓋を滑らせる。一から八を順に。',
          '一段目123、二段目456、三段目78と空白。',
        ],
      },
      {
        id: 'r3-order',
        room: 2,
        title: '切れたフィルム',
        kind: 'order',
        answer: [2, 4, 0, 3, 1],
        initial: [0, 1, 2, 3, 4],
        item: 'lens',
        reward: 'glass',
        hints: [
          'レンズを入れ、フィルムの継ぎ目を見る。',
          '右端と次の左端で、穴の数が一致する。始まりは一つ。',
          '一→二、二→三、三→四、四→五、五→六の順。',
        ],
      },
      {
        id: 'r3-overlay',
        room: 2,
        title: '透過板のホルダー',
        kind: 'rings',
        answer: [1, 3, 2],
        initial: [0, 0, 0],
        modulus: 4,
        item: 'glass',
        reward: 'handle',
        motif: 'projection',
        hints: [
          '三枚の板を裏返して調べる。',
          'Ⅰ・Ⅱ・Ⅲの切り欠きを合わせる。重ねる順は外から。',
          'Ⅰは右、Ⅱは左、Ⅲは下。',
        ],
      },
      {
        id: 'r3-score',
        room: 2,
        title: '五音の機構',
        kind: 'sequence',
        answer: [0, 3, 1, 4, 2, 0],
        initial: [],
        item: 'handle',
        requires: ['r3-overlay'],
        reward: 'seal3',
        motif: 'music',
        hints: [
          'スクリーンの光点を見る。',
          '左から順に読む。高さは下から一、二、三、四、五。',
          '下から数えて、1 → 4 → 2 → 5 → 3 → 1。',
        ],
      },
      {
        id: 'r3-exit',
        room: 2,
        title: '映写室の錠',
        kind: 'dial',
        answer: [3, 8, 1, 6],
        initial: [0, 0, 0, 0],
        modulus: 10,
        requires: ['r3-score'],
        hints: [
          '音が止まったあとのスクリーンを。',
          '四コマの数字を、穿孔の少ない順に。',
          '一つ穴は3、二つ穴は8、三つ穴は1、四つ穴は6。3816。',
        ],
      },
      {
        id: 'r4-power',
        room: 3,
        title: '帰室の配電盤',
        kind: 'lights',
        answer: Array(16).fill(1),
        initial: [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0],
        size: 4,
        hints: [
          '最初の配電盤と同じ仕組み。',
          '上下左右と自分の灯が反転する。全て点ける。',
          '初期状態から、上段左端、二段目左から三番目、三段目左から二番目、下段左端と右端。',
        ],
      },
      {
        id: 'r4-gears',
        room: 3,
        title: '連動輪',
        kind: 'gears',
        answer: [1, 3, 5, 3],
        initial: [0, 0, 0, 0],
        modulus: 8,
        requires: ['r4-power'],
        hints: [
          '電気を戻すと、四つの部屋の天井に同じ印が現れる。',
          '部屋の順に読む。輪を回すと、右隣も一つ進む。',
          '目標は1・3・5・3。初期状態から一つ目を1回、二つ目を2回、三つ目を3回。',
        ],
      },
      {
        id: 'r4-balance',
        room: 3,
        title: '四つの秤',
        kind: 'dial',
        answer: [3, 1, 4, 2],
        initial: [0, 0, 0, 0],
        modulus: 7,
        requires: ['r4-gears'],
        reward: 'seal4',
        motif: 'final-balance',
        hints: [
          '棚の裏に、新しい式がある。',
          '○−△=2、□=○+△、◇+△=○、合計は10。',
          '○=3、△=1、□=4、◇=2。',
        ],
      },
      {
        id: 'r4-memory',
        room: 3,
        title: '覚えている形',
        kind: 'sequence',
        answer: [3, 1, 2, 0, 2, 1, 3, 0],
        initial: [],
        glyphs: true,
        requires: ['r4-balance'],
        hints: [
          '机に残った紙と、最初の部屋の額を。',
          '初めの四つに、紙の四つを続ける。',
          '☾ △ □ ○、続けて □ △ ☾ ○。',
        ],
      },
      {
        id: 'r4-exit',
        room: 3,
        title: '最後の扉',
        kind: 'dial',
        answer: [2, 6, 9, 4],
        initial: [0, 0, 0, 0],
        modulus: 10,
        requires: ['r4-memory'],
        motif: 'seals',
        hints: [
          '四枚の銘板を裏返す。',
          '扉の並びは、角・月・眼・滴。',
          '△=2、☾=6、○=9、◇=4。2694。',
        ],
      },
    ] satisfies Puzzle[]
  ).map((p) => [p.id, p]),
);

export type ClueKind =
  | 'constellation'
  | 'clock'
  | 'balance'
  | 'wiring'
  | 'ceiling'
  | 'mirror'
  | 'tub'
  | 'slide'
  | 'score'
  | 'frames'
  | 'echo'
  | 'equations'
  | 'memory'
  | 'seals'
  | 'empty';
export type SceneNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'puzzle' | 'clue' | 'take' | 'travel';
  target?: string;
  clue?: ClueKind;
  gate?: string;
  room?: number;
};
const puzzle = (
  id: string,
  label: string,
  x: number,
  y: number,
  w: number,
  h: number,
): SceneNode => ({ id, label, x, y, w, h, kind: 'puzzle', target: id });
const clue = (
  id: string,
  label: string,
  type: ClueKind,
  x: number,
  y: number,
  w: number,
  h: number,
  gate?: string,
): SceneNode => ({ id, label, x, y, w, h, kind: 'clue', clue: type, gate });
export const ROOMS = [
  {
    name: '待合室',
    roman: 'Ⅰ',
    image: '/assets/waiting.webp',
    tone: 'green',
    views: [
      [puzzle('r1-clock', '壁の時計', 17, 18, 21, 25), puzzle('r1-exit', '鉄扉', 40, 26, 23, 61)],
      [
        clue('r1-print', '椅子の上の額', 'constellation', 28, 18, 40, 34),
        clue('r1-chairs', '椅子の座面', 'empty', 14, 58, 49, 28),
      ],
      [
        puzzle('r1-cabinet', '薬品棚', 30, 22, 40, 60),
        clue('r1-equation', '棚の下の紙', 'balance', 72, 66, 17, 16),
        {
          id: 'r1-entry',
          label: '閉ざされた入口',
          kind: 'clue',
          clue: 'empty',
          x: 8,
          y: 30,
          w: 15,
          h: 30,
        },
      ],
      [
        puzzle('r1-drawer', '机の引き出し', 41, 55, 23, 14),
        clue('r1-note', '机の上の紙', 'clock', 43, 49, 18, 8),
        puzzle('r1-power', '配電盤', 22, 20, 17, 18),
      ],
      [
        clue('r1-ceiling', '天井の傷', 'ceiling', 20, 25, 60, 40, 'r1-power'),
        clue('echo-0', '天井の刻印', 'echo', 38, 69, 24, 17, 'r4-power'),
      ],
      [clue('r1-floor', '床の擦れた跡', 'wiring', 31, 40, 39, 35)],
    ],
  },
  {
    name: '洗面室',
    roman: 'Ⅱ',
    image: '/assets/washroom.webp',
    tone: 'blue',
    views: [
      [
        puzzle('r2-exit', '濡れた扉', 34, 20, 30, 68),
        clue('r2-gauge', '圧力計', 'empty', 73, 28, 16, 20),
      ],
      [
        puzzle('r2-locker', '洗面台の鏡', 24, 20, 53, 40),
        clue('r2-mirror', '鏡の傷', 'mirror', 34, 62, 34, 21, 'r2-pipes'),
      ],
      [
        puzzle('r2-water', '計量槽', 16, 20, 67, 47),
        puzzle('r2-pipes', '配管の継手', 23, 68, 53, 22),
      ],
      [clue('r2-tub', '浴槽の底', 'tub', 18, 49, 69, 35, 'r2-drain')],
      [clue('echo-1', '天井の刻印', 'echo', 35, 36, 30, 25, 'r4-power')],
      [
        {
          id: 'r2-wrench',
          label: '床の工具',
          kind: 'take',
          target: 'wrench',
          x: 75,
          y: 28,
          w: 18,
          h: 22,
        },
        puzzle('r2-drain', '排水口', 42, 60, 26, 26),
      ],
    ],
  },
  {
    name: '映写室',
    roman: 'Ⅲ',
    image: '/assets/projection.webp',
    tone: 'amber',
    views: [
      [puzzle('r3-exit', '映写室の扉', 37, 20, 29, 70)],
      [
        clue('r3-screen', 'スクリーン', 'score', 17, 18, 70, 49, 'r3-overlay'),
        clue('r3-film-clue', 'スクリーンの下端', 'frames', 23, 68, 58, 17, 'r3-score'),
      ],
      [
        puzzle('r3-order', '映写機', 34, 39, 38, 32),
        puzzle('r3-score', '映写機の側面', 65, 57, 21, 22),
      ],
      [
        puzzle('r3-overlay', '透過板の台', 19, 45, 38, 22),
        puzzle('r3-slide', '小引き出し', 70, 31, 20, 49),
        clue('r3-plan', '机の端の紙', 'slide', 16, 72, 37, 17),
      ],
      [clue('echo-2', '天井の刻印', 'echo', 35, 36, 30, 25, 'r4-power')],
      [clue('r3-floor', 'フィルムの切れ端', 'empty', 26, 49, 48, 30)],
    ],
  },
  {
    name: '帰室',
    roman: 'Ⅳ',
    image: '/assets/return.webp',
    tone: 'green',
    views: [
      [
        puzzle('r4-exit', '最後の扉', 35, 17, 32, 71),
        clue('r4-sockets', '扉の四つの窪み', 'seals', 68, 37, 24, 27),
      ],
      [
        puzzle('r4-memory', '小箱', 65, 59, 22, 22),
        clue('r4-print', '色褪せた額', 'empty', 28, 18, 40, 34),
      ],
      [
        puzzle('r4-balance', '棚の四つの秤', 29, 22, 42, 56),
        clue('r4-equations', '棚の裏の刻印', 'equations', 70, 60, 17, 17, 'r4-gears'),
      ],
      [
        puzzle('r4-gears', '机の上の連動輪', 25, 18, 52, 35),
        clue('r4-paper', '机の引き出しの紙', 'memory', 33, 66, 40, 20, 'r4-balance'),
        puzzle('r4-power', '電話の下の配電盤', 20, 49, 35, 18),
      ],
      [clue('echo-3', '天井の刻印', 'echo', 35, 36, 30, 25, 'r4-power')],
      [clue('r4-floor', '扉へ向かう擦れ跡', 'empty', 23, 29, 50, 48)],
    ],
  },
] as const;
export const ROOM_PUZZLES = ROOMS.map((_, room) =>
  Object.values(PUZZLES).filter((p) => p.room === room),
);
export const FACE_NAMES = ['正面', '右の壁', '背面', '左の壁', '天井', '床'];
