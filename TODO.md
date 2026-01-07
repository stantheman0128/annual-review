# 📋 TODO List

## 🔴 優先處理

### 性能優化
- [ ] 加入 Supabase Realtime，讓對方新增卡片時可以即時看到
- [ ] 解決切換使用者時 loading 太久的問題（可能需要快取或預載入）
- [ ] 考慮把 Supabase region 換到離台灣近的地方（目前是澳洲）

### 資料庫
- [ ] 分開 Dev 和 Prod 的 Supabase Project
- [ ] 清理舊的有多個 reaction 的資料：`TRUNCATE TABLE "Reaction";`

### 安全性
- [ ] 確認 Supabase RLS 已開啟（防止前端直接操作資料庫）
- [ ] Storage bucket `photos` 已設為 Public（否則圖片會裂圖）

---

## 🟡 UI/UX 改進

- [ ] 手機響應式優化（卡片大小、按鈕 hitbox）
- [ ] 手機鍵盤彈出時輸入框不被蓋住
- [ ] 考慮加入 dark mode
- [ ] 加入 loading skeleton 或 spinner

---

## 🟢 未來功能

### Multi-tenancy（給朋友用）
- [ ] 加入 `roomId` 欄位到所有資料表
- [ ] 用 URL query param 區分不同房間（如 `?room=stan-joy`）
- [ ] 或整合 Supabase Auth 做真正的登入系統

### 其他
- [ ] 一年後的提醒功能
- [ ] 匯出所有回憶為 PDF 或圖片
- [ ] 加入更多卡片樣式/背景
- [ ] 年份切換（查看往年回憶）

---

## ✅ 已完成

- [x] 基本 CRUD (新增/編輯/刪除卡片)
- [x] 飄浮卡片動畫
- [x] Emoji 反應（單選 + 使用者顏色）
- [x] 留言系統
- [x] 圖片上傳 (Supabase Storage)
- [x] 釘選功能（localStorage 各自存）
- [x] 鎖定願望到 2026
- [x] Optimistic update（發布後馬上出現）
- [x] Instagram 風格 UI
- [x] 部署到 Vercel
