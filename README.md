# StickerHub (retired)

Farewell page for StickerHub, a 2021 project that sent WhatsApp and Telegram stickers through chatbots.
Plain HTML/CSS/JS, no build step.

- `index.html`, `site.css`, `archive.js`: the farewell page.
- `data/stickers.json`: curated sticker metadata (only stickers marked safe, no political ones). The images were lost with the Firebase project, so the page draws each sticker from its name.
- `original/`: a build of the 2021 Vue site with Firestore replaced by an in-memory mock (source: branch `archive-mock` of the original app repo). `netlify.toml` routes `/original/*` to its `index.html`.
