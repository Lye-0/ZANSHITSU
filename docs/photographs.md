# 採用写真の管理

`public/images/` には採用したWebPだけを置く。現在215点。元PNG・候補・生成アトラス・検証画面は配信フォルダに含めない。

```text
public/images/
  rooms/<room>/views/       # 4部屋 × 6方向
  rooms/<room>/closeups/    # 観察専用、未解放の状態
  rooms/<room>/states/      # 遠景の開閉、工具取得後
  mechanisms/<puzzle>/     # base / installed / reward / empty
    levels/                # 水槽のみ、8-0-0など到達可能な16状態
  components/
    drums/                 # 0〜9の実物の数字ドラム
    hands/                 # 透明背景の長針・短針
    lamps/                 # 点灯・消灯
    pipes/                 # 直線と曲がり継手
    rings/                 # 金属・ガラスの回転部品
    wheels/                # 0〜7の連動輪
    films/                 # 穴の数でつながる5枚
    keys/                  # 6種類の刻印ボタン
    tiles/                 # 1〜8の小蓋
  clues/                   # 紙・壁・投影などに手掛かりが含まれる写真
  items/<item>/            # 14種類の front / back
  shared/                  # 未解放の紙など共用材質
```

各仕掛けに必要な状態だけを残す。アイテムは解錠だけでは入手せず、収納を開いて写真の実物を押す。設置後も部品・数字・フィルムの状態が継続して見えるようにする。

写真の光、視点、材質、記号と数を確認し、誤ったコマは再生成して置換した。水面は状態写真、静的な文字や図は写真に含める。可変部品は透明背景または実際の窪みに合った切り出しで重ねる。

`src/photoAssets.ts` が全選択可能な写真のカタログ。`tests/photography.test.ts` がファイルの存在、未参照ファイル、24方向・42対象の輪郭を検証する。`docs/photographs.json` は全写真の寸法・容量・SHA-256。

作業中の候補フォルダはGit対象外とし、改修完了時に削除する。画像生成ツールがユーザーの画像出力領域へ保存する原本は、リポジトリの配信素材とは別に扱う。
