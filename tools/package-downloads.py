from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from PIL import Image
import hashlib
import json
import shutil

root = Path(__file__).resolve().parents[1]
assets = root / 'assets' / 'marketplace'
delivery = Path(r'D:\Заказы\Продвижение\Портфолио\Инфографика Ренаты 2026-10-14')
delivery.mkdir(parents=True, exist_ok=True)
note = ('Портфолио товарной инфографики — Рената\n'
        'Telegram: @MusicalBlueLotus26\n'
        'https://haevlob.github.io/portfolio/#work\n\n'
        'Три авторские серии по пять слайдов. Формат каждого PNG: 900 × 1200.\n'
        'Дизайн-концепции для портфолио. Товары, бренды и характеристики иллюстративны.\n'
        'Изображения товаров созданы с помощью ИИ; композиции и типографика собраны отдельно.\n')
(delivery / 'О портфолио.txt').write_text(note, encoding='utf-8-sig')
checks = []
for key in ['ember', 'lume', 'aura']:
    source = assets / ('aura-v2' if key == 'aura' else key)
    dest = delivery / key.upper()
    dest.mkdir(exist_ok=True)
    with ZipFile(source / f'{key}-series.zip', 'w', ZIP_DEFLATED) as archive:
        for num in range(1, 6):
            src = source / f'{num:02d}.png'
            with Image.open(src) as im:
                assert im.size == (900, 1200), (src, im.size)
            name = f'Renata-{key}-{num:02d}.png'
            archive.write(src, name)
            shutil.copy2(src, dest / name)
            digest = hashlib.sha256(src.read_bytes()).hexdigest()
            assert digest == hashlib.sha256((dest / name).read_bytes()).hexdigest()
            checks.append({'file': f'{key}/{name}', 'size': [900, 1200], 'sha256': digest})
        archive.writestr('О портфолио.txt', note.encode('utf-8-sig'))
with ZipFile(assets / 'renata-marketplace-portfolio.zip', 'w', ZIP_DEFLATED) as archive:
    for key in ['ember', 'lume', 'aura']:
        for src in sorted((delivery / key.upper()).glob('*.png')):
            archive.write(src, f'{key.upper()}/{src.name}')
    archive.writestr('О портфолио.txt', note.encode('utf-8-sig'))
shutil.copy2(assets / 'renata-marketplace-portfolio.zip', delivery / 'Портфолио Ренаты — 15 карточек.zip')
(delivery / 'verification.json').write_text(json.dumps(checks, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'images': len(checks), 'all_dimensions_verified': True, 'copied_hashes_match': True, 'delivery': str(delivery)}, ensure_ascii=False))
