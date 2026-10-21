# StickerHub (retired)

Archive page for StickerHub, a 2021 project that sent WhatsApp and Telegram stickers through chatbots.
Plain HTML/CSS/JS, no build step.

- `data/stickers.json`: curated sticker list (only stickers marked safe, no political ones).
- `stickers/<id>.webp`: sticker images. Missing images fall back to the sticker's name.
- `scripts/fetch-stickers.py`: rebuilds both from a Firestore export (needs billing active on the Firebase project to download images).

Preview locally: `python3 -m http.server 5178`
