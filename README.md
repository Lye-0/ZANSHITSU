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

### 自宅Wi-Fiのスマホから開く

```powershell
pnpm dev:wifi
# または mise run dev:wifi
```

起動したターミナルの `Network:` に出るURLを、同じルーターのWi-Fiに接続したスマホのブラウザで開きます。PCが有線接続でも使えます。確認時の自宅LANは `http://192.168.11.18:5187/` です。IPアドレスは再接続などで変わることがあるため、その場合は `ipconfig` で使用中のアダプターのIPv4アドレスを確認してください。仮想アダプターのアドレスは使いません。

`pnpm dev` はPC内限定、`pnpm dev:wifi` はLAN向けです。同じ5187番を使うため同時には起動できません。起動したターミナルで Ctrl+C を押すと停止します。

Windowsファイアウォールの初回設定は、管理者として開いたPowerShellで行います。以下は確認済みの自宅回線（インターフェース5、192.168.11.0/24）用です。別の回線では `Get-NetConnectionProfile` と `ipconfig` で対象を確認してから値を変更します。

```powershell
Set-NetConnectionProfile -InterfaceIndex 5 -NetworkCategory Private
New-NetFirewallRule -Name 'ZANSHITSU-Dev-WiFi-5187' -DisplayName 'ZANSHITSU development (home LAN)' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5187 -RemoteAddress '192.168.11.0/24' -InterfaceAlias 'イーサネット' -Profile Private
```

同じ規則を作り直す必要はありません。解除するときは管理者PowerShellで `Remove-NetFirewallRule -Name 'ZANSHITSU-Dev-WiFi-5187'` を実行します。ルーターのポート開放は不要です。スマホとPC、localhostとLANのIPアドレスでは保存先が異なるため、進行は共有されません。

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
- 収納: 謎を解き、取っ手を押して開け、中にある物を押して拾う。
- 持ち物: 接写画面で選択し、写真の鍵穴や軸などに使う。再選択で解除。拡大アイコンまたはダブルクリックで表裏を調べる。
- 視点を変えると持ち物の選択は解除される。時計は針を選んで文字盤を押すか、針をドラッグして動かす。
- 時計の針は中央からもつかめる。針が重なる場合は同じ場所をもう一度押して選び分ける。
- 水槽の写真の下に現在量と目標量を表示。手掛かりは「前のヒント」で戻り、見出しを押すと閉じる。
- 扉: 解錠した後、写真のハンドルを押して次の部屋へ。
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
- `src/PhotoControls.tsx`: 写真のダイヤル・針・配管・計量槽などの操作。
- `src/Inventory.tsx`: 接写中も表示する写真の持ち物欄。
- `src/audio.ts`: ユーザー操作で有効になる環境音と効果音。
- `src/navigation.ts`: 天井・床と元の壁の往復。
- `src/photography.ts` / `src/Hotspots.tsx`: 写真の対応表と対象の輪郭。
- `src/PhotoCloseup.tsx` / `src/mechanismPhotos.ts` / `src/photo.css`: 状態写真、取得・設置・開閉の操作位置。
- `src/photoAssets.ts`: 採用写真の参照カタログ。
- `public/images/`: 採用した部屋・接写・状態差分・持ち物の写真。
- `tests/engine.test.ts`: 機構の解法、進行条件、保存の回復。

画像の由来と生成指示は `docs/assets.md`、解法は `docs/walkthrough.md` を参照してください。解法にはネタバレがあります。

写真のディレクトリ規約は `docs/photographs.md`、全ファイルの一覧は `docs/photographs.json` にあります。

実施した検証と未検証の範囲は `docs/verification.md` に記録しています。
