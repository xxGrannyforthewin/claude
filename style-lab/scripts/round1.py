"""Render Style Lab round 1 for Bonita Style: hook text looks, hook lines, text motion, transitions.

Every option is real Bonita footage with a text layer drawn in PIL (brand fonts) and composited by ffmpeg.
Outputs per option: <id>_full.mp4 (1080x1920, silent track, music added in app) and <id>_prev.mp4 (360x640, muted loop).
"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

S = Path("/tmp/claude-0/-home-user-claude/34b7f42a-4512-59de-af5e-4a26168c30d7/scratchpad")
OUT = S / "round1"; OUT.mkdir(exist_ok=True)
LAY = OUT / "layers"; LAY.mkdir(exist_ok=True)
F = S / "fonts"
FONT = {
    "tt_reg": F / "TikTokSans12pt-Regular.otf",
    "tt_med": F / "TikTokSans12pt-Medium.otf",
    "tt_semi": F / "TikTokSans12pt-SemiBold.otf",
    "proxima": F / "Proxima Nova Regular.ttf",
}
BERRY, GOLD, CREAM = (160, 52, 80), (220, 182, 131), (250, 244, 236)
W, H = 1080, 1920
TEXT_X = 620  # centre of the plain black dress, clear of the mirror
TEXT_Y = 800  # on the plain black dress back; inside Instagram's safe zone (y 237-997, x 91-990)

index = [l.split("|")[0] for l in (S / "raw/index.txt").read_text().splitlines()]
clip = lambda n: S / "raw" / f"{index[n - 1]}.mp4"
GARDEN, MIRROR = clip(16), clip(15)  # both face-free in the ranges used below


def wrap(draw, text, font, maxw):
    """One line if it fits, else the most even split into the fewest lines."""
    words = text.split()
    if draw.textlength(text, font=font) <= maxw:
        return [text]
    best = None
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        m = max(draw.textlength(a, font=font), draw.textlength(b, font=font))
        if m <= maxw and (best is None or m < best[0]):
            best = (m, [a, b])
    if best:
        return best[1]
    lines, cur = [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=font) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    return lines + [cur]


def layer(text, look, path, words_upto=None):
    """Draw one full-frame transparent text layer. words_upto shows only the first n words (layout fixed)."""
    font = ImageFont.truetype(str(FONT[look.get("font", "tt_med")]), look.get("size", 58))
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    lines = wrap(d, text, font, look.get("maxw", 700))
    lh = int(font.size * 1.28)
    asc = font.getbbox("Hg")[1]
    shown = None if words_upto is None else words_upto
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(shadow)
    boxes = Image.new("RGBA", (W, H), (0, 0, 0, 0)); bd = ImageDraw.Draw(boxes)
    txt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); td = ImageDraw.Draw(txt)
    count = 0
    for i, line in enumerate(lines):
        lw = d.textlength(line, font=font)
        x0, y0 = TEXT_X - lw / 2, TEXT_Y + i * lh
        if look.get("box"):
            px, py = int(font.size * .42), int(font.size * .2)
            bd.rounded_rectangle([x0 - px, y0 - py + asc * .3, x0 + lw + px, y0 + lh - py * .4], radius=int(font.size * .28), fill=look["box"])
        x = x0
        for w in line.split():
            count += 1
            if shown is not None and count > shown:
                break
            colour = look.get("accent_color") if look.get("accent_word") == w else look.get("color", (255, 255, 255))
            if look.get("shadow", True) and not look.get("box"):
                sd.text((x, y0 + 3), w, font=font, fill=(0, 0, 0, 190))
            td.text((x, y0), w, font=font, fill=colour)
            x += d.textlength(w + " ", font=font)
    shadow = shadow.filter(ImageFilter.GaussianBlur(5))
    img = Image.alpha_composite(Image.alpha_composite(Image.alpha_composite(img, shadow), boxes), txt)
    img.save(path)
    return len(text.split())


def base_filter(src_label="0:v"):
    return f"[{src_label}]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps=30"


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr[-2000:])


def finish(cid, inputs, fc, dur):
    full = OUT / f"{cid}_full.mp4"
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, "-f", "lavfi", "-t", str(dur), "-i", "anullsrc=r=44100:cl=stereo",
         "-filter_complex", fc, "-map", "[v]", "-map", f"{inputs.count('-i')}:a", "-t", str(dur),
         "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", str(full)])
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(full), "-an", "-vf", "scale=360:640", "-c:v", "libx264", "-preset", "medium",
         "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUT / f"{cid}_prev.mp4")])


def text_on_clip(cid, src, start, dur, text, look, motion="appear", t0=0.4):
    """Composite a text layer over a clip with a given entrance."""
    if motion == "words":
        n = len(text.split())
        paths = []
        for k in range(1, n + 1):
            p = LAY / f"{cid}_w{k}.png"; layer(text, look, p, words_upto=k); paths.append(p)
        inputs = ["-ss", str(start), "-t", str(dur), "-i", str(src)]
        for p in paths:
            inputs += ["-loop", "1", "-t", str(dur), "-i", str(p)]
        fc = base_filter() + "[b0];"
        step = 0.32
        for k in range(n):
            st = t0 + k * step
            fc += f"[{k + 1}:v]format=rgba,fade=in:st={st}:d=0.22:alpha=1[t{k}];[b{k}][t{k}]overlay=0:0:enable='gte(t,{st})'[b{k + 1}];"
        fc += f"[b{n}]null[v]"
        return finish(cid, inputs, fc, dur)
    p = LAY / f"{cid}.png"; layer(text, look, p)
    inputs = ["-ss", str(start), "-t", str(dur), "-i", str(src), "-loop", "1", "-t", str(dur), "-i", str(p)]
    if motion == "appear":
        ov = f"[1:v]format=rgba[t];[b][t]overlay=0:0:enable='gte(t,{t0})'[v]"
    elif motion == "slow":  # slow and graceful: 0.9s fade with a 14px drift up
        ov = f"[1:v]format=rgba,fade=in:st={t0}:d=0.9:alpha=1[t];[b][t]overlay=0:'14*max(0,1-(t-{t0})/0.9)':enable='gte(t,{t0})'[v]"
    elif motion == "smooth":  # smooth and confident: 0.35s ease-out rise of 36px
        ov = (f"[1:v]format=rgba,fade=in:st={t0}:d=0.3:alpha=1[t];"
              f"[b][t]overlay=0:'36*pow(max(0,1-(t-{t0})/0.35),3)':enable='gte(t,{t0})'[v]")
    fc = base_filter() + "[b];" + ov
    finish(cid, inputs, fc, dur)


def cut_between(cid, a, a_start, b, b_start, seg, xfade):
    inputs = ["-ss", str(a_start), "-t", str(seg + xfade), "-i", str(a), "-ss", str(b_start), "-t", str(seg + xfade), "-i", str(b)]
    fa = base_filter("0:v") + f",trim=0:{seg + xfade},setpts=PTS-STARTPTS[a]"
    fb = base_filter("1:v") + f",trim=0:{seg + xfade},setpts=PTS-STARTPTS[c]"
    if xfade == 0:
        fc = f"{fa};{fb};[a][c]concat=n=2:v=1:a=0[v]"
    else:
        fc = f"{fa};{fb};[a][c]xfade=transition=fade:duration={xfade}:offset={seg}[v]"
    finish(cid, inputs, fc, round(2 * seg + xfade, 2))


BASE = {"font": "tt_med", "size": 64, "color": (255, 255, 255)}
CARDS = []

def card(cid, section, label, desc, order):
    CARDS.append({"id": cid, "section": section, "label": label, "desc": desc, "order": order})

if __name__ == "__main__":
    only = set(sys.argv[1:])
    want = lambda c: not only or c in only
    HOOK = "henna night outfit"
    # A. How the hook looks (same words, same shot, appears with no animation)
    looks = [
        ("r1-a1", "In-app white", "TikTok Sans Medium in white with a soft shadow, like text typed in the app.", BASE),
        ("r1-a2", "White bubble", "Same font, black on a white rounded box, like TikTok's background text.", {**BASE, "color": (20, 20, 20), "box": (255, 255, 255, 235)}),
        ("r1-a3", "Cream and berry", "Same bubble in your logo colours: berry text on a soft cream box.", {**BASE, "color": BERRY, "box": CREAM + (235,)}),
        ("r1-a4", "Proxima, lighter", "Proxima Nova Regular in white, a touch larger and lighter in weight.", {**BASE, "font": "proxima", "size": 70}),
        ("r1-a5", "Gold accent word", "In-app white, with the occasion word picked out in your logo gold.", {**BASE, "accent_word": "henna", "accent_color": GOLD}),
    ]
    for i, (cid, label, desc, look) in enumerate(looks):
        card(cid, "r1-looks", label, desc, i + 1)
        if want(cid): text_on_clip(cid, MIRROR, 0.0, 4.0, HOOK, look, "appear", 0.0)
    # B. Hook lines (same look and shot, different words)
    lines = [
        ("r1-b1", "Occasion", "henna night outfit"),
        ("r1-b2", "Cut-off", "the perfect thobe doesn't exi—"),
        ("r1-b3", "Confession", "I almost didn't buy this dress"),
        ("r1-b4", "What I wore", "here's what I wore to my cousin's henna"),
    ]
    for i, (cid, label, text) in enumerate(lines):
        card(cid, "r1-lines", label, f"“{text}”", i + 1)
        if want(cid): text_on_clip(cid, MIRROR, 0.0, 4.0, text, BASE, "appear", 0.0)
    # C. How the text arrives (same words, look and shot)
    motions = [
        ("r1-c1", "Just appears", "No animation, there from the first frame. The most native look.", "appear"),
        ("r1-c2", "Slow and graceful", "Fades in over 0.9s with a small drift up.", "slow"),
        ("r1-c3", "Smooth and confident", "Rises 36px and settles in 0.35s.", "smooth"),
        ("r1-c4", "Gentle rhythm", "One word at a time, a third of a second apart.", "words"),
    ]
    for i, (cid, label, desc, m) in enumerate(motions):
        card(cid, "r1-motion", label, desc, i + 1)
        if want(cid): text_on_clip(cid, MIRROR, 1.5, 4.0, HOOK, BASE, m, 0.0 if m == "appear" else 0.4)
    # D. Between shots (same two shots)
    cuts = [
        ("r1-d1", "Straight cut", "No transition, like a phone edit.", 0),
        ("r1-d2", "Quick soft blend", "A 0.2s dissolve. Barely there.", 0.2),
        ("r1-d3", "Slow blend", "A 0.5s dissolve. Dreamier.", 0.5),
    ]
    for i, (cid, label, desc, x) in enumerate(cuts):
        card(cid, "r1-cuts", label, desc, i + 1)
        if want(cid): cut_between(cid, GARDEN, 4.0, MIRROR, 1.0, 2.0, x)
    (OUT / "cards.json").write_text(json.dumps(CARDS, indent=1))
    print("ok", len(CARDS))
