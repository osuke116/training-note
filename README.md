# TRAINING NOTE

スマホ向け筋トレ記録Webアプリ。最初の画面で種目・重量・回数／秒数を入力し、1セットを記録できます。

公開アプリ: https://training-note-tier-2026.kfhkw.chatgpt.site/

## 機能

- 即時記録、最近使った種目、記録履歴、JSONバックアップと復元
- 今日の種目を左右フリックで未着手・実施中・完了へ変更。ボタン／矢印キー／取消にも対応
- 白基調のLiquid Glass、動きのある画面遷移、全画面スケルトン、動きを減らす設定への対応
- 部位・器具からの種目検索、参考TIER、41種目×3枚の姿勢図と解説、オリジナル種目
- メニュー構築、端末内Hevy CSV分析、構成レビュー、相談文生成
- Cloudflare Workers + D1による個人別保存と更新競合の検出
- ChatGPT認証。Google / Apple OAuthは設定後に利用可能。メール・パスワード入力は廃止
- Workers AIの保護されたレビューAPI。Cloudflare Freeプランで日本語のレビュー生成を確認

## 実装

`app/training.html` がクライアント画面、`public/liquid.css` がデザイン、`app/api/` がWorker側APIです。既存の記録形式とJSONを維持しています。

`lib/state.ts` は入力検証、`lib/auth.ts` は認証検証、`db/schema.ts` と `drizzle/` はD1のスキーマ／マイグレーションです。

SitesのVinextスターターを使用。既存の公開URLを保ち、Cloudflare Workers/D1へ配信します。依存はpackage-lock.jsonに固定しています。

## 開発

Node.js >=22.13.0。

```sh
npm run install:ci
npm run db:generate # スキーマを変えたときのみ
npm run build
npm run dev
```

ローカルD1に未適用のSQLを、生成済み `dist/server/wrangler.json` のDBバインディングへ順番に適用してください。ローカル認証はSitesの開発用ユーザーです。本番認証の検証とは区別します。

## 外部設定

詳細は [技術選定と接続設定](docs/architecture.md) を参照してください。秘密鍵・APIトークンはリポジトリに保存せず、Sitesの実行環境へ設定します。Supabaseのpublishable keyは公開クライアント識別用で、秘密鍵ではありません。

本リポジトリに実ユーザーの記録、CSV、パスワードは含みません。既存Supabaseデータは削除せず、明示的に引き継ぐ方式です。

## 図版

ユーザー提供の41種目イラスト／開始／終点画像と、一部のRepDB図版を使用。RepDBの表示・帰属を維持しています。第三者の図版の再利用は各提供元の条件を確認してください。
