# StickerHub (retired)

Built by Mehmet Firat Aksoy · [mfirataksoy.com](https://mfirataksoy.com), with Bedirhan Celayir.

StickerHub (2021) sent WhatsApp and Telegram stickers through chatbots. This repo holds the retired site: the original 2021 Vue app, with a farewell added to its home page. Its Firestore is replaced by an in-memory mock, and its stickers are redrawn from their names because the images were lost along with the Firebase project.

This is a build output. The source is branch `archive-mock` of the original app repo (rokasta12/whatsapp-Sticker-app), built with:

    npm install --legacy-peer-deps
    NODE_OPTIONS=--openssl-legacy-provider npx vue-cli-service build

`netlify.toml` serves it as a single-page app and redirects the old `/original/*` paths.
