# 残室 — ZANSHITSU

四つの部屋、六方向の固定視点、二十の仕掛け。物を調べ、道具を使い、静かな建物から出る一人用の脱出ゲームです。

## 開発

Node.js と pnpm は `mise.toml` に固定しています。

```powershell
mise trust
mise install
mise run install
mise run dev
```

開発URL: http://127.0.0.1:5187/

```powershell
mise run test
mise run build
mise run preview
```

公開用ビルドのローカル確認URL: http://127.0.0.1:4187/

`dist/` を静的ホスティングに配置できます。URLのルート `/` に配信してください。ユーザー登録、バックエンド、APIキーは不要です。

## 操作

- 左右の三角 / 矢印キー: 四方の壁へ。
- 上で天井へ、下で床へ。天井からは下、床からは上でもとの壁へ戻ります。
- 物に触れる: その場所の接写写真へ。写真内の部品を直接操作します。
- 接写中の下の三角: 接写に入った直前の壁・天井・床へ戻ります。
- 持ち物: 選択して対象に使う。同じ物をもう一度選ぶと拡大・裏面確認。
- 本のアイコン: 見つけた手掛かりを記録。
- 目のアイコン: 調べられる範囲を表示。
- 上のローマ数字: 一度訪れた部屋に戻る。
- 部屋の設定内の「手掛かり」: 観察場所、考え方、解法の三段階。

保存先はブラウザの localStorage (`zanshitsu:save:v1`) です。同じURL・ブラウザで再開できます。保存できない場合は画面上に知らせます。「はじめから」は確認画面の後に記録をリセットします。

難易度は観察・対応関係・機構の理解を中心に設計しています。主要な謎は20個。目標プレイ時間は60〜90分ですが、初見プレイヤーによる計測は未実施です。

## 構成

- `src/data.ts`: 部屋、接触領域、道具、謎、ヒント。
- `src/engine.ts`: 状態遷移、条件判定、機構のルール、保存検証。
- `src/App.tsx`: 探索、拡大画面、持ち物、記録、設定、結末。
- `src/PuzzleControls.tsx`: ダイヤル・配電盤・配管・計量槽などの操作。
- `src/Clues.tsx`: 正確な記号・図形の手掛かり。
- `src/audio.ts`: ユーザー操作で有効になる環境音と効果音。
- `src/navigation.ts`: 天井・床と元の壁の往復。
- `src/photography.ts` / `src/Hotspots.tsx`: 写真の対応表と対象の輪郭。
- `src/Closeup.tsx` / `src/closeup.css`: 写真内の機構・刻印・取得・下の三角。
- `public/images/`: 採用した部屋・接写・状態差分・持ち物の写真。
- `tests/engine.test.ts`: 機構の解法、進行条件、保存の回復。

画像の由来と生成指示は `docs/assets.md`、解法は `docs/walkthrough.md` を参照してください。解法にはネタバレがあります。

写真のディレクトリ規約は `docs/photographs.md`、全ファイルの一覧は `docs/photographs.json` にあります。

実施した検証と未検証の範囲は `docs/verification.md` に記録しています。
