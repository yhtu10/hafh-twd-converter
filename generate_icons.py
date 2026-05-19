"""生成 HafH Coin 樣式圖示：金色硬幣 + H 形狀 + TWD 標籤"""
import struct, zlib

FONT_5X7 = {
    'T': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    'W': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
    'D': [[1,1,1,0,0],[1,0,0,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,1,0],[1,1,1,0,0]],
}

DARK    = (52, 45, 62, 255)     # #342D3E
GOLD_LT = (252, 248, 221, 255)  # #FCF8DD
GOLD    = (240, 225, 121, 255)  # #F0E179
PURPLE  = (113, 73, 206, 255)   # #7149CE
WHITE   = (255, 255, 255, 255)
CLEAR   = (0, 0, 0, 0)

def make_icon(size, show_twd):
    img = [[CLEAR] * size for _ in range(size)]

    def px(x, y, c):
        if 0 <= x < size and 0 <= y < size:
            img[y][x] = c

    def rect(x1, y1, x2, y2, c):
        for y in range(y1, y2):
            for x in range(x1, x2):
                px(x, y, c)

    coin_h = int(size * 0.74) if show_twd else size
    cx, cy = size // 2, coin_h // 2
    ro = coin_h // 2 - 1      # outer radius
    ri = int(ro * 0.88)        # inner (gold) radius
    ri2 = int(ro * 0.80)       # inner gold with depth offset

    for y in range(coin_h):
        for x in range(size):
            dx, dy = x - cx, y - cy
            d2 = dx*dx + dy*dy
            if d2 > ro*ro:
                continue
            if d2 > ri*ri:
                px(x, y, DARK)
            else:
                # depth offset like SVG ellipse
                dx2, dy2 = x - cx - ro//8, y - cy - ro//8
                if dx2*dx2 + dy2*dy2 <= ri2*ri2:
                    px(x, y, GOLD)
                else:
                    px(x, y, GOLD_LT)

    # H shape scaled from 24×24 SVG
    s = (coin_h - 2) / 24.0
    ox = (size - coin_h) // 2

    def sv(v): return int(v * s) + ox
    def sy(v): return int(v * s)

    rect(sv(8), sy(7), sv(10), sy(17), DARK)   # left pillar
    rect(sv(14), sy(7), sv(16), sy(17), DARK)  # right pillar
    rect(sv(10), sy(11), sv(14), sy(13), DARK) # crossbar

    if show_twd:
        bar_y = coin_h + 1
        bar_h = size - bar_y

        for y in range(bar_y, size):
            for x in range(size):
                px(x, y, PURPLE)

        fs = max(1, bar_h // 9)
        cw = (5 + 1) * fs
        tw = 3 * cw - fs
        lx = (size - tw) // 2
        ly = bar_y + (bar_h - 7 * fs) // 2

        for ci, ch in enumerate('TWD'):
            bx = lx + ci * cw
            for ri2, row in enumerate(FONT_5X7[ch]):
                for cj, bit in enumerate(row):
                    if bit:
                        for sy2 in range(fs):
                            for sx2 in range(fs):
                                px(bx + cj*fs + sx2, ly + ri2*fs + sy2, WHITE)

    raw = b''
    for row in img:
        raw += b'\x00' + b''.join(bytes(p) for p in row)

    def chunk(t, d):
        c = t + d
        return struct.pack('>I', len(d)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    compressed = zlib.compress(raw, 9)
    png  = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')
    return png

for sz, name, twd in [(16, 'icon16', False), (48, 'icon48', True), (128, 'icon128', True)]:
    with open(f'/Users/yenhua_tu/hafh-twd-converter/{name}.png', 'wb') as f:
        f.write(make_icon(sz, twd))
    print(f'Created {name}.png ({sz}x{sz})')
