# TRAINING NOTE 個人別保存

専用Supabase project: cxapbaafffdacfwuuywk。CookShelfとは別プロジェクト。

公開クライアントはpublishable keyのみを利用。training_note_user_stateはRLSで所有者本人に限定。ログイン保持・自動更新を有効にし、記録／オリジナル種目／自作メニューを同期する。CSV分析結果はアカウント別のブラウザ保存のみ。

メール確認は有効。一般部員への新規登録・再設定メールには独自SMTPの設定が必要。現在の標準メール送信は組織メンバーのテスト向け。Site URLは公開サイトに設定済み。

SDK: @supabase/supabase-js 2.117.3 official npm UMD, MIT license.

このschema.sqlはスキーマ参照。リモート適用済みmigrationはtraining_note_private_state、restrict_rls_event_function。
