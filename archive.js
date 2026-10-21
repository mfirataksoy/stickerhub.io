// Renders the sticker archive from data/stickers.json.
// Images live in stickers/<id>.webp; when one is missing the sticker shows its name instead.

const EMOJI_ONLY = /^[\p{Extended_Pictographic}\p{Emoji_Component}\s]+$/u;

function stickerEl(sticker, tag = 'div') {
  const el = document.createElement(tag);
  el.className = 'sticker';

  const fallback = document.createElement('span');
  const name = sticker.name.trim() || '?';
  fallback.className = EMOJI_ONLY.test(name) ? 'fallback emoji' : 'fallback';
  fallback.textContent = name;

  const img = new Image();
  img.loading = 'lazy';
  img.alt = name;
  img.src = `stickers/${sticker.id}.webp`;
  img.addEventListener('error', () => img.replaceWith(fallback));

  el.append(img);
  return el;
}

function renderGrid(grid, stickers) {
  grid.replaceChildren(...stickers.map((s) => {
    const li = document.createElement('li');
    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.textContent = s.name.trim() || 'untitled';
    const meta = document.createElement('small');
    meta.textContent = s.category;
    caption.append(meta);
    li.append(stickerEl(s), caption);
    return li;
  }));
}

function renderChips(chips, stickers, onPick) {
  const counts = new Map();
  stickers.forEach((s) => counts.set(s.category, (counts.get(s.category) || 0) + 1));
  const options = [['All', stickers.length], ...[...counts].sort((a, b) => b[1] - a[1])];

  const buttons = options.map(([name, count]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.setAttribute('aria-pressed', String(name === 'All'));
    b.innerHTML = '<span></span><small></small>';
    b.firstChild.textContent = name;
    b.lastChild.textContent = count;
    b.addEventListener('click', () => {
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onPick(name);
    });
    return b;
  });
  chips.replaceChildren(...buttons);
}

// Swap a chat bubble's emoji for a real sticker once its image is known to load.
function useImage(bubble, sticker) {
  const img = new Image();
  img.alt = sticker.name;
  img.onload = () => bubble.replaceChildren(img);
  img.src = `stickers/${sticker.id}.webp`;
}

async function main() {
  const stickers = await fetch('data/stickers.json').then((r) => r.json());

  const pick = (category) => (category === 'All' ? stickers : stickers.filter((s) => s.category === category));
  const grid = document.getElementById('grid');
  renderChips(document.getElementById('chips'), stickers, (c) => renderGrid(grid, pick(c)));
  renderGrid(grid, stickers);

  // Hero pile: a few favourites, falling back to names until images exist.
  const favourites = ['Wholesome Kermit', 'BADUMTISS', 'weeb life', 'LOL'];
  const pile = favourites.map((n) => stickers.find((s) => s.name.trim() === n)).filter(Boolean);
  document.getElementById('pile').replaceChildren(...pile.map((s) => stickerEl(s)));

  const [a, b] = [stickers.find((s) => s.name.trim() === 'Wholesome Kermit'), stickers.find((s) => s.name.trim() === 'LOL')];
  if (a) useImage(document.getElementById('chat-sticker'), a);
  if (b) useImage(document.getElementById('chat-upload'), b);
}

main();
