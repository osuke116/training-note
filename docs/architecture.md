# 技術選定と接続設定

## 選定理由

|技術|用途|採用理由・限界|
|---|---|---|
|HTML + Vanilla JavaScript|スマホ画面と操作|既存の検索・図版・CSV処理を維持し、記録フォームをReactの読み込み待ちなく表示できる。フロントの追加依存を抑える|
|CSS backdrop-filter / gradient|白基調Liquid Glass|半透明、背景ぼかし、内側のハイライトをWeb標準で実装。非対応ブラウザには白背景を用意|
|CSS transitions / keyframes|画面遷移、フリック、スケルトン|ランタイム依存が不要。prefers-reduced-motionでは動きを抑える。準備完了後に意図的な待ち時間を入れない|
|Pointer Events|フリック|タッチとマウスを共通処理。縦スクロールと区別し、60px以上の横移動で確定。ボタンと左右キーでも操作可能|
|Vinext / Vite / TypeScript|APIとWorkerビルド|Sitesの対応スターターで既存URLを維持し、Cloudflare Workers用の正規成果物を作れる。Vinextはbetaのためバージョンを固定しビルド・ブラウザで検証|
|Cloudflare Workers|バックエンド|Sites経由で配信し、認証・保存・AIのAPIを同じオリジンへまとめる|
|Cloudflare D1 + Drizzle|個人別の永続保存|SQLの所有者条件とrevision付き更新で、他人の記録参照と端末間の無言の上書きを防ぐ。認証のない読み書きは拒否|
|localStorage|端末保存と未同期データ|開いてすぐ記録でき、通信失敗時にも残せる。ブラウザ削除で消えるのでJSONバックアップも提供。アカウント別に分離|
|Zod|サーバー入力検証|回数・秒数・重量・配列数・文字数を入口で検査。クラウドの内容を信用して画面にそのまま挿入しない|
|SitesのChatGPT認証|GPTログイン|ホストがOAuthとセッションを管理。安定したSite内IDを所有者キーに使う。認証経路の自作を避ける|
|Supabase OAuth|Google / Appleログインの接続先|既存プロジェクトを認証ブリッジとして利用。データ本体はD1へ保存。Google/Appleのみをサーバーで許可し、メールアドレスを所有者キーにしない|
|Workers AI|メニューのAIレビュー|指定されたCloudflare上の推論。サーバー経由のみ、認証必須、1人1日10回、入力5000文字上限。接続前は通常のルール型レビューと明確に区別|
|Gemma 4 26B A4B|AIレビューの接続候補|現在のCloudflare公式導入ガイドのモデルIDを採用。実アカウント接続後に日本語応答と費用・レイテンシを確認する。未接続を生成成功として扱わない|
|WebP / lazy loading|123枚の姿勢図|提供画像の画素を保った変換済み素材を継続使用。開いた種目の画像のみ読み込み、記録画面の初期ロードを圧迫しない|
|GitHub|ソースバックアップ|実ユーザーデータを含めず、変更履歴を保持。データベースのバックアップはソースバックアップとは別|

## 接続の現在地

- Workers / D1: Sites経由で接続する。
- ChatGPT: ホストが用意する `/signin-with-chatgpt` / `/signout-with-chatgpt` を利用。
- Google: Google Cloud OAuth client ID/secretと許可済みリダイレクトURIをSupabaseに設定する必要がある。
- Apple: Apple Developer側のService ID、Key、Team ID等を設定する必要がある。鍵の有効期限・更新も運営が管理する。
- Google/AppleはSupabase設定を照会し、有効でないものを「準備中」として無効化する。機能しているように見せるダミーログインは作らない。
- Workers AI: ユーザーにCloudflareアカウントがまだないため推論接続待ち。アカウント作成後、実行環境に `CF_AI_ACCOUNT_ID` と秘密値 `CF_AI_API_TOKEN` を設定する。Workers AIの実行権限だけを付ける。Sites上ではREST API経由で呼び出せる。直接Cloudflareへ配信する場合はAIバインディング `AI` も利用できる。
- `CF_AI_API_TOKEN` はブラウザやGitHubへ送らない。未設定時はAPIが503を返し、画面は「接続準備中」を表示する。
- 通常のメニュー構成チェックとCSV分析は端末内で動き、AIサービスへ自動送信しない。AIは利用者がボタンを押したとき、入力したメニューだけを送る。

## データの引き継ぎ

元のゲストlocalStorageキーと旧Supabaseテーブルは保持。ログイン後の「この端末のデータを引き継ぐ」でゲストの記録／メニュー／種目／タスクをコピーする。旧セッションが残っていれば「以前のアカウントから引き継ぐ」で旧Supabaseから本人の記録だけを取得する。セッションがなければ、旧JSONを「履歴」で読み込む。

ChatGPT・Google・Appleの異なるアカウント同士を、メールアドレスが同じという理由だけで自動結合しない。

## 参照

- [Cloudflare Workers AIの導入](https://developers.cloudflare.com/workers-ai/get-started/workers-wrangler/)
- [Sitesの保存と認証](https://learn.chatgpt.com/docs/sites/data-and-connections)
- [Google OAuth / Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Apple OAuth / Supabase](https://supabase.com/docs/guides/auth/social-login/auth-apple)
