# 採用写真の管理

ゲームで使用する決定版だけを `public/images/` に置きます。写真はWebPに統一し、元のPNG、コンタクトシート、試作、再制作で置き換えた画像は現在のツリーに残しません。

```text
public/images/
  shared/           # 複数の場所で共用する紙の材質
  rooms/
    01-waiting/
      views/        # north / east / south / west / ceiling / floor
      closeups/     # clock / drawer / cabinet など対象別
      states/       # drawer-open / west-drawer-open など状態別
    02-washroom/
      views/
      closeups/
      states/
    03-projection/
      views/
      closeups/
    04-return/
      views/
      closeups/
      states/
  items/
    crank/
      front.webp
      back.webp
    …               # 全14種類、同じ構造
```

ファイル名が `r1-note` などの対象IDの場合、`src/data.ts` の同じIDから日本語の対象名を確認できます。同じ写真を使う二つの観察箇所は `src/photography.ts` で一つのファイルへ対応付け、画像を複製しません。

`docs/photographs.json` は決定版の全ファイル、画素数、容量、SHA-256を記録した一覧です。`tests/photography.test.ts` が24方向・44対象・持ち物の表裏・状態写真の存在と輪郭の範囲を検査します。

## 制作と採用

- 部屋の写真を参照画像として使用し、組み込み画像生成ツールで接写と状態差分を制作しました。
- 時計の縁、机の木目、キャビネットの塗装、浴槽、映写機、箱の意匠を比較しました。
- 配管盤と電話の裏の盤面は、操作領域が小さかったため接近した構図を再制作しました。
- 洗面室の錠は、固定つまみが操作と競合したため平らな盤面へ再制作しました。
- 壁の紙は専用の接写を制作し、遠景の紙にも同じ材質を使っています。
- 元の画素をそのまま使える観察箇所は、元写真の対象部分を切り出しています。
- 拡大時の読みやすさのため、一部の接写はさらに対象へ寄った切り取りを採用しました。
- 動く針、水位、ダイヤル、記号は写真の座標に合わせた描画です。文字の正確さとゲーム状態の変化を維持するため、生成写真には焼き込んでいません。

作業中の候補はGit対象外の `work/revision/` に置き、完成時に削除する運用です。今後も採用前の画像を `public/images/` に常設しないでください。
