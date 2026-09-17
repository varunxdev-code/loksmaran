from collections import deque
from pathlib import Path
from PIL import Image

src_path = Path(r"C:\Users\varun\Downloads\Loksmaran_ People, Places, Heritage.png")
out_dir = Path(r"C:\Users\varun\Downloads\misa.lol-main-v3.147 (1)\misa.lol-main\sih-local-archives\web\public\brand")
app_icon = Path(r"C:\Users\varun\Downloads\misa.lol-main-v3.147 (1)\misa.lol-main\sih-local-archives\web\app\icon.png")
out_dir.mkdir(parents=True, exist_ok=True)

im = Image.open(src_path).convert("RGBA")
w, h = im.size
pix = im.load()
seen = bytearray(w * h)
q = deque()
for x in range(w):
    q.append((x, 0))
    q.append((x, h - 1))
for y in range(h):
    q.append((0, y))
    q.append((w - 1, y))

while q:
    x, y = q.popleft()
    i = y * w + x
    if seen[i]:
        continue
    seen[i] = 1
    r, g, b, a = pix[x, y]
    if r + g + b >= 42:
        continue
    pix[x, y] = (0, 0, 0, 0)
    if x > 0:
        q.append((x - 1, y))
    if x + 1 < w:
        q.append((x + 1, y))
    if y > 0:
        q.append((x, y - 1))
    if y + 1 < h:
        q.append((x, y + 1))

bbox = im.getbbox()
assert bbox
pad = 12
x0, y0, x1, y1 = bbox
x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
x1, y1 = min(w, x1 + pad), min(h, y1 + pad)
lockup = im.crop((x0, y0, x1, y1))
lockup.thumbnail((900, 900), Image.Resampling.LANCZOS)
lockup.save(out_dir / "logo.png", optimize=True)

# Emblem sits in the upper portion before the wordmark (~y 770 in original).
mark = im.crop((max(0, 240), max(0, 240), min(w, 1010), min(h, 775)))
mb = mark.getbbox()
if mb:
    mark = mark.crop(mb)
mark.thumbnail((420, 420), Image.Resampling.LANCZOS)
mark.save(out_dir / "mark.png", optimize=True)
mark.resize((96, 96), Image.Resampling.LANCZOS).save(app_icon, optimize=True)
print("logo", lockup.size, (out_dir / "logo.png").stat().st_size)
print("mark", mark.size, (out_dir / "mark.png").stat().st_size)
