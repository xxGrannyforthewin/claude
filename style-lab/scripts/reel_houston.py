"""Houston store tour, after the user's reference reel (restaurant tour): storefront opener with a white script
name and a pin + city line in a light serif, then quiet interior shots with no text and soft music.
Store B-Roll photos get a slow pan; every shot holds 3s (user rule)."""
import sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import round1 as r

P = r.S / "store_photos"
OUT = r.S / "reel_houston"
EMOJI = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"


def title_layer(path, name="Bonita Style", place="Houston", cy=1250):
    img = Image.new("RGBA", (r.W, r.H), (0, 0, 0, 0))
    script = ImageFont.truetype(str(r.S / "fonts/GreatVibes-Regular.ttf"), 132)
    serif = ImageFont.truetype(str(r.S / "fonts/CormorantGaramond[wght].ttf"), 54)
    serif.set_variation_by_axes([500])
    d = ImageDraw.Draw(img)
    b = d.textbbox((0, 0), name, font=script)
    nx, ny = (r.W - (b[2] - b[0])) // 2 - b[0], cy - (b[3] - b[1]) // 2 - b[1]
    pin = Image.new("RGBA", (160, 160)); ImageDraw.Draw(pin).text((0, 0), "📍", font=ImageFont.truetype(EMOJI, 109), embedded_color=True)
    pin = pin.crop(pin.getbbox()).resize((44, 44), Image.LANCZOS)
    pb = d.textbbox((0, 0), place, font=serif)
    gap, pw = 12, pin.width
    line_w = pw + gap + (pb[2] - pb[0])
    lx, ly = (r.W - line_w) // 2, cy + 105
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(shadow)
    sd.text((nx + 2, ny + 3), name, font=script, fill=(0, 0, 0, 140))
    sd.text((lx + pw + gap - pb[0] + 2, ly - pb[1] + 3), place, font=serif, fill=(0, 0, 0, 140))
    img = Image.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(5)), img)
    d = ImageDraw.Draw(img)
    d.text((nx, ny), name, font=script, fill=(255, 255, 255, 255))
    d.text((lx + pw + gap - pb[0], ly - pb[1]), place, font=serif, fill=(255, 255, 255, 255))
    img.alpha_composite(pin, (lx, ly + ((pb[3] - pb[1]) - pin.height) // 2 + 4))
    img.save(path)


def still(i, path, d, move):
    """Slow pan on a photo. Rendered at 2x then scaled down so the motion stays smooth."""
    W2, H2 = 2 * r.W, 2 * r.H
    big = f"scale={int(W2 * 1.12)}:{int(H2 * 1.12)}:force_original_aspect_ratio=increase"
    ex = {"right": ("(iw-ow)*t/{d}", "(ih-oh)/2"), "left": ("(iw-ow)*(1-t/{d})", "(ih-oh)/2"),
          "up": ("(iw-ow)/2", "(ih-oh)*(1-t/{d})"), "down": ("(iw-ow)/2", "(ih-oh)*t/{d}")}[move]
    x, y = (e.format(d=d) for e in ex)
    return ["-loop", "1", "-framerate", "30", "-t", str(d), "-i", str(path)], \
        f"[{i}:v]{big},crop={W2}:{H2}:x='{x}':y='{y}',scale={r.W}:{r.H},setsar=1,fps=30,format=yuv420p[v{i}];"


def video(i, src, st, d):
    return ["-ss", str(st), "-t", str(d), "-i", str(src)], \
        r.base_filter(f"{i}:v") + f",setpts=PTS-STARTPTS,trim=0:{d},setpts=PTS-STARTPTS,format=yuv420p[v{i}];"


def build(shots, track, out_name, music_start=0.0):
    OUT.mkdir(exist_ok=True)
    inputs, fc, total = [], "", 0.0
    for i, s in enumerate(shots):
        a, f = still(i, P / s[1], s[2], s[3]) if s[0] == "photo" else video(i, s[1], s[2], s[3])
        inputs += a; fc += f; total += s[2] if s[0] == "photo" else s[3]
    n = len(shots)
    tl = OUT / "title.png"; title_layer(tl)
    inputs += ["-loop", "1", "-t", str(shots[0][2]), "-i", str(tl)]
    fc += f"[{n}:v]format=rgba[t];[v0][t]overlay=0:0,format=yuv420p[s0];"
    fc += "".join(f"[{'s0' if i == 0 else f'v{i}'}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[v];"
    total = round(total, 2)
    inputs += ["-ss", str(music_start), "-i", str(track)]
    fc += f"[{n + 1}:a]atrim=0:{total},asetpts=PTS-STARTPTS,volume=-2.5dB,afade=t=in:d=0.6,afade=t=out:st={total - 1.5}:d=1.5,alimiter=limit=0.89[a]"
    out = OUT / out_name
    r.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
           "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
           "-movflags", "+faststart", str(out)])
    return out, total


if __name__ == "__main__":
    RACKS = r.clip(3)  # 2026-10-17 store video: racks of thobes on the gold rails
    shots = [  # face-free; storefront first, like the reference
        ("photo", "p02.jpg", 3.5, "up"),      # "Bonita Style · Coming Soon" storefront, title on top
        ("photo", "p07.jpg", 3.0, "right"),   # gold arch racks on marble
        ("photo", "p09.jpg", 3.0, "left"),    # unwrapping the gold rails
        ("photo", "p10.jpg", 3.0, "right"),   # racks going up (installer from behind)
        ("photo", "p06.jpg", 3.0, "down"),    # the rack wall down the room
        ("video", RACKS, 0.0, 3.0),            # racks filled with thobes
        ("video", RACKS, 2.8, 3.0),
    ]
    print(build(shots, r.S / "music/track1.mp3", "bonita_houston_store_tour.mp4"))
