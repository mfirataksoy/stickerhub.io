// Renders the sticker archive from data/stickers.json.
// The original images are lost, so each sticker is drawn from the name its uploader gave it.

const EMOJI_ONLY = /^[\p{Extended_Pictographic}\p{Emoji_Component}\s]+$/u;

function stickerEl(sticker) {
  const el = document.createElement('div');
  el.className = 'sticker';
  const label = document.createElement('span');
  const name = sticker.name.trim() || '?';
  label.className = EMOJI_ONLY.test(name) ? 'fallback emoji' : 'fallback';
  label.textContent = name;
  el.append(label);
  return el;
}

function renderGrid(grid, stickers) {
  grid.replaceChildren(...stickers.map((s) => {
    const li = document.createElement('li');
    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.textContent = s.category;
    if (s.tags.length) {
      const tags = document.createElement('small');
      tags.textContent = s.tags.map((t) => `#${t}`).join(' ');
      caption.append(tags);
    }
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

async function main() {
  const stickers = await fetch('data/stickers.json').then((r) => r.json());

  const pick = (category) => (category === 'All' ? stickers : stickers.filter((s) => s.category === category));
  const grid = document.getElementById('grid');
  renderChips(document.getElementById('chips'), stickers, (c) => renderGrid(grid, pick(c)));
  renderGrid(grid, stickers);

  // Hero pile: a few favourites.
  const favourites = ['Wholesome Kermit', 'BADUMTISS', 'weeb life', 'LOL'];
  const pile = favourites.map((n) => stickers.find((s) => s.name.trim() === n)).filter(Boolean);
  document.getElementById('pile').replaceChildren(...pile.map(stickerEl));
}

main();
