# Guiter Fretboard Trainer

## 概要
- ギターの fretboard を学ぶのに役立つアプリです。
- 対象：スマホ向けWebアプリ（PWA/レスポンシブ）
- 実装手段：GoogleAntiGravity
- 全て英語で表記する

## スコープ
- 対応端末：iOS / Android
- 対応ブラウザ：Safari/Chrome
- 画面向き：横持ち固定
- ネットワーク：完全オンライン
- 外部サービス：なし

## 画面構造
### デザインコンセプト
- モダンでシンプル
- レスポンシブ
- 背景は白ベース
- アイコンは丸みを帯びたシンプルなもの
- 指板を表示する場合はリアルかつシンプルに表現する
- スマホの横画面でスクロール無しで全てのコンテンツの表示と操作が可能とする（Reference画面は除く）


### ナビゲーション
- Home画面,Reference画面へ誘導するナビゲーションを画面左に固定表示
- ハンバーガーメニューで表示、非表示を切り替えられる

### 画面一覧

| 画面名 | 概要 | 
|---|---|
|Same Note Finder|指板上の同じ音を見つけるゲーム| 
|Guess The Note|ランダムにポイントされた指板の音名を充てるゲーム|
|Reference|様々な参考資料へのリンクをまとめたランディングページ|
|Chord Formulas|和音の公式をまとめたページ|
|Fretboard Note Map|指板の音をまとめたページ|
|Diatonic Chord (5th String)|Cメジャースケールのダイアトニックコードをまとめたページ。5弦をルートとした押さえ方で表現する|

### 画面遷移図
<pre>
Home
├── Same Note Finder
├── Guess The Note
├── Reference
    ├── Chord Formulas
    ├── Fretboard Note Map
    ├── Diatonic Chord (5th String)
</pre>

### 画面仕様
#### Home
- Same Note Finder, Guess The Note, Referenceの3つの画面へ誘導する

#### Same Note Finder
##### 概要
- 11フレットまで指板を表示する
- ランダムに１つのポイントをハイライトする。
- ハイライトしたポイントには音階は表示しない。
- ユーザはハイライトされたポイントと音階が同じすべての箇所を指板上で指す。
- 出題後の待機時間はゲーム開始前にユーザが選択する（デフォルトは１０秒）
- 待機時間内に正解を指すと回答時間を表示して正解としてカウントする。
- 待機時間を超えた場合は不正解を表示して、正解の箇所を指板上で表示する。
- 正解の箇所を指板上で表示する際に音階もあわせて表示する。
- 出題数はゲーム開始前にユーザが選択する（デフォルトは10問）
- 問題終了後、結果を表示する
- 結果は正解数、平均回答時間、グレードを表示する

##### レベル
- 12フレットまで表示
- 

#### Guess The Note
- 実装中の文言を表示

#### Reference
- Chord Formulas, Fretboard Note Map, Diatonic Chord (5th String)の3つの画面へ誘導する

#### Chord Formulas
- 実装中の文言を表示

#### Fretboard Note Map
- 実装中の文言を表示

#### Diatonic Chord (5th String)
- 実装中の文言を表示
