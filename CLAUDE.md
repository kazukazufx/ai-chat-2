# AI Chat Bot - 個人アシスタント

## 概要

個人利用向けのAIチャットボットWebアプリケーション。ChatGPT風のUIで、Claude APIを使用したストリーミング応答に対応。

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js (App Router) |
| フロントエンド | React |
| バックエンド | Next.js API Routes |
| AIモデル | Claude API (Anthropic) |
| データベース | SQLite + Prisma |
| スタイリング | Tailwind CSS |

## 機能要件

### 基本機能

- [ ] チャット機能（ユーザーとAIの会話）
- [ ] ストリーミング応答（リアルタイムで文字が流れる）
- [ ] 会話履歴の保存（SQLite）

### UI機能

- [ ] ChatGPT風のチャットUI
- [ ] サイドバーに過去の会話一覧を表示
- [ ] 新規会話ボタン
- [ ] 会話の削除機能
- [ ] ダークモード対応

### 非機能要件

- 認証なし（自分専用）
- レスポンシブデザイン

## ディレクトリ構成

```
ai-chat-2/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # メインページ
│   ├── globals.css         # グローバルスタイル
│   └── api/
│       ├── chat/
│       │   └── route.ts    # チャットAPI（ストリーミング）
│       └── conversations/
│           └── route.ts    # 会話履歴CRUD API
├── components/
│   ├── Chat/
│   │   ├── ChatContainer.tsx    # チャットメインコンテナ
│   │   ├── MessageList.tsx      # メッセージ一覧
│   │   ├── MessageItem.tsx      # 個別メッセージ
│   │   └── ChatInput.tsx        # 入力フォーム
│   ├── Sidebar/
│   │   ├── Sidebar.tsx          # サイドバーコンテナ
│   │   ├── ConversationList.tsx # 会話一覧
│   │   └── ConversationItem.tsx # 個別会話アイテム
│   └── UI/
│       ├── Button.tsx
│       ├── ThemeToggle.tsx      # ダークモード切替
│       └── Icons.tsx
├── lib/
│   ├── prisma.ts           # Prismaクライアント
│   └── claude.ts           # Claude API クライアント
├── hooks/
│   ├── useChat.ts          # チャット状態管理
│   ├── useConversations.ts # 会話履歴管理
│   └── useTheme.ts         # テーマ管理
├── types/
│   └── index.ts            # 型定義
├── prisma/
│   └── schema.prisma       # DBスキーマ
├── .env.local              # 環境変数
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## データベーススキーマ

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Conversation {
  id        String    @id @default(uuid())
  title     String    @default("新しい会話")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  messages  Message[]
}

model Message {
  id             String       @id @default(uuid())
  role           String       // "user" | "assistant"
  content        String
  createdAt      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  conversationId String
}
```

## API エンドポイント

### POST /api/chat

チャットメッセージを送信し、ストリーミング応答を返す。

**Request:**
```json
{
  "conversationId": "string",
  "message": "string"
}
```

**Response:** Server-Sent Events (SSE) でストリーミング

### GET /api/conversations

会話一覧を取得。

### POST /api/conversations

新規会話を作成。

### DELETE /api/conversations/[id]

会話を削除。

## 環境変数

```env
# .env.local
ANTHROPIC_API_KEY=your_api_key_here
```

## セットアップ手順

```bash
# 依存関係インストール
npm install

# Prisma セットアップ
npx prisma generate
npx prisma db push

# 開発サーバー起動
npm run dev
```

## 使用パッケージ

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "@anthropic-ai/sdk": "latest",
    "@prisma/client": "latest",
    "tailwindcss": "^3"
  },
  "devDependencies": {
    "prisma": "latest",
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18"
  }
}
```
