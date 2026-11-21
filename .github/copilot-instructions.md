# Copilot 專案指令

## 技術限制

- 這是純前端專案，只使用 HTML、CSS 與原生 JavaScript。
- 禁止引入任何框架或套件，不要建立 `package.json`，不要執行 `npm install`。
- 不要引用任何外部 CDN；網頁必須能離線運作。
- 檔案結構固定為專案根目錄的 `index.html`、`styles.css` 與 `app.js`。

## 程式風格

- 所有程式碼註解一律使用繁體中文。
- 變數與函式命名使用英文 camelCase。
- CSS 顏色一律使用 `:root` 定義的 CSS 變數，不要在各處直接寫死色碼。
- JavaScript 使用 `const` 或 `let` 宣告變數，不要使用 `var`。
- 產生 DOM 內容時，使用 `textContent` 或 `createElement`，不要使用 `innerHTML` 組字串。

## 協作方式

- 動手修改之前，先條列說明打算修改哪些檔案以及預計做哪些變動，等待使用者確認後才開始修改。
- 一次只處理一件事，不要順手進行沒有要求的重構或其他額外修改。
- 修改完成後，說明要如何在瀏覽器中驗證變更結果。
