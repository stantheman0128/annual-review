# 💌 Annual Review - 年度回顧網站

一個給情侶/好友共同記錄回憶與願望的互動式網站。

## ✨ 功能

- **飄浮卡片** - 回憶往下飄、願望往上飄的動態效果
- **使用者區分** - 不同使用者有不同的主題色
- **Emoji 反應** - 可以對卡片按 emoji（單選）
- **留言系統** - 可以在卡片上留言
- **圖片上傳** - 支援照片附加到回憶/願望
- **釘選功能** - 可以把重要的卡片釘選到左側（各自獨立）
- **鎖定願望** - 2026 年的願望可以鎖定到新年才公開

## 🛠 技術棧

- **Frontend**: Next.js 16, React 19, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (照片)
- **Deployment**: Vercel

## 🚀 本地開發

```bash
# 安裝依賴
npm install

# 設定環境變數 (複製 .env.example 或自己建立 .env)
DATABASE_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 同步資料庫
npx prisma db push

# 啟動開發伺服器
npm run dev
```

## 📁 專案結構

```
src/
├── app/
│   ├── api/          # API Routes (entries, reactions, comments, upload)
│   ├── page.tsx      # 主頁面
│   └── globals.css
├── components/
│   ├── CardModal.tsx     # 卡片展開 Modal
│   ├── EntryForm.tsx     # 新增/編輯表單
│   ├── FloatingCard.tsx  # 飄浮卡片
│   └── UserSelect.tsx    # 使用者選擇
└── lib/
    └── db.ts         # Prisma client
```

## 🎨 設計特色

- 筆記本風格的輸入框
- Instagram 風格的灰白按鈕（無 emoji）
- 使用者主題色區分（小瀚=藍、巧巧=粉）
- Optimistic updates 讓新卡片馬上出現

## 📝 License

Private project for personal use.
