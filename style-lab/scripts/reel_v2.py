"""First real Bonita Style reel in the locked style: hook -> belt callout -> full look -> movement, soft music."""
import sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
import round1 as r

r.OUT = r.S / "reel_v2"; r.OUT.mkdir(exist_ok=True)
r.LAY = r.OUT / "layers"; r.LAY.mkdir(exist_ok=True)
HOOK = {"cx": 540, "cy": 930, "maxw": 760, "font": "tt_xbold", "size": 66, "color": (255, 255, 255)}
CALL = {"cx": 540, "cy": 520, "maxw": 760, "font": "tt_bold", "size": 42, "color": (20, 20, 20), "box": (255, 255, 255, 240)}
SEGS = [  # (start, duration, text, look) on the black-and-cream thobe clip, all face-free
    (2.2, 2.7, "henna night outfit", HOOK),
    (12.8, 2.0, "comes with the belt", CALL),
    (5.6, 2.8, None, None),
    (15.0, 1.6, None, None),
]

def build(track, out_name):
    inputs, fc, k = [], "", len(SEGS)
    for st, du, *_ in SEGS:
        inputs += ["-ss", str(st), "-t", str(du), "-i", str(r.GARDEN)]
    layers = []
    for i, (st, du, text, look) in enumerate(SEGS):
        fc += r.base_filter(f"{i}:v") + f",trim=0:{du},setpts=PTS-STARTPTS[v{i}];"
        if text:
            p = r.LAY / f"seg{i}.png"; r.layer(text, look, p)
            inputs += ["-loop", "1", "-t", str(du), "-i", str(p)]
            fc += f"[{k}:v]format=rgba[t{i}];[v{i}][t{i}]overlay=0:0[s{i}];"; k += 1
        else:
            fc += f"[v{i}]null[s{i}];"
    total = round(sum(s[1] for s in SEGS), 2)
    fc += "".join(f"[s{i}]" for i in range(len(SEGS))) + f"concat=n={len(SEGS)}:v=1:a=0[v];"
    inputs += ["-i", str(track)]
    fc += f"[{k}:a]atrim=0:{total},asetpts=PTS-STARTPTS,volume=-2.5dB,afade=t=in:d=0.4,afade=t=out:st={total - 1.2}:d=1.2,alimiter=limit=0.89[a]"
    out = r.OUT / out_name
    r.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
           "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
           "-movflags", "+faststart", str(out)])
    return out

if __name__ == "__main__":
    for t, name in ((r.S / "music/track2.mp3", "bonita_henna_belt_strings.mp4"), (r.S / "music/track1.mp3", "bonita_henna_belt_oud.mp4")):
        print(build(t, name))
