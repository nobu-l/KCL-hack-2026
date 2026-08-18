<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# プロジェクト開発運用ルール

本プロジェクトでは、学習体験の最大化と安全な運用のために、以下のルールを厳格に遵守してください。

## 1. Git・デプロイ・環境変数の安全運用
- **勝手に `git commit` しないでください。**
- **勝手に `git push` しないでください。**
- **勝手にデプロイしないでください。**
- **`.env` ファイルは編集しないでください。**
- **秘密情報やAPIキーをコードに直接書かないでください。**

## 2. コミュニケーションと実装プロセス
- **大きな変更をする前に、まず変更方針を説明してください。**
- **実装後は、何を変更したのかを説明してください。**
- **判断に迷う場合は、勝手に進めず質問してください。**
- **ステップバイステップの進行**: ユーザーから「次に進んで」と指示があるまで勝手に次の実装を進めず待機し、指示を受けたら次にすることの説明（目的・仕組み・ポイント）を添えて作業してください。
- **データ保存方針**: データの保存方法（LocalStorage等）は模索中のためノータッチとし、React の `useState` で管理してください。
- **AIの役割**: アプリ内のAI機能は学習を補助する付加的・補助的な位置づけとして設計してください。
