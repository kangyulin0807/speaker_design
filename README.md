# Speaker Design Atlas — 音響設計百科

以互動剖面圖認識密閉式、倒相式與傳輸線式（迷宮式）音箱，並理解單體、功放、DSP 如何組成播放系統。

- [線上網站](https://kangyulin0807.github.io/speaker_design/)
- [GitHub Repository](https://github.com/kangyulin0807/speaker_design)

## 本機預覽

在專案根目錄執行 `python -m http.server 8000`，開啟 `http://localhost:8000`。檢查資料格式：`node scripts/validate.mjs`。

## 新增內容

先讀 [AGENTS.md](AGENTS.md)，再於 `content/enclosures.json` 新增結構資料。頁面導覽、參數、優缺點會自動由資料產生；新的剖面幾何類型則需在 `app.js` 加入 SVG 圖解。

## GitHub Pages

將整個專案推送到 GitHub，在 Repository Settings → Pages 選擇 `Deploy from a branch`、`main`、`/ (root)`。網站會位於 `https://<使用者名稱>.github.io/<repository名稱>/`。

頻率互動是教學示意，並非箱體聲學模擬或可用於製造的設計數值。
