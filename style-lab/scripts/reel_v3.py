"""Bonita Style reel: come pack orders with me (behind the scenes), in the locked style with soft music."""
import sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
import round1 as r
import reel_v2 as base

r.OUT = r.S / "reel_v3"; r.OUT.mkdir(exist_ok=True)
r.LAY = r.OUT / "layers"; r.LAY.mkdir(exist_ok=True)
SHELF, PACK, SCALE, CAT = r.clip(12), r.clip(10), r.clip(8), r.clip(6)
SEGS = [  # (clip, start, duration, text, look); every range checked face-free
    (SHELF, 0.0, 2.4, "come pack orders with me", base.HOOK),
    (PACK, 1.0, 1.8, "packed by hand", base.CALL),
    (SCALE, 0.0, 2.8, None, None),
    (CAT, 0.0, 2.0, None, None),
]

def build(track, out_name):
    inputs, fc, k = [], "", len(SEGS)
    for src, st, du, *_ in SEGS:
        inputs += ["-ss", str(st), "-t", str(du), "-i", str(src)]
    for i, (src, st, du, text, look) in enumerate(SEGS):
        fc += r.base_filter(f"{i}:v") + f",trim=0:{du},setpts=PTS-STARTPTS[v{i}];"
        if text:
            p = r.LAY / f"seg{i}.png"; r.layer(text, look, p)
            inputs += ["-loop", "1", "-t", str(du), "-i", str(p)]
            fc += f"[{k}:v]format=rgba[t{i}];[v{i}][t{i}]overlay=0:0[s{i}];"; k += 1
        else:
            fc += f"[v{i}]null[s{i}];"
    total = round(sum(s[2] for s in SEGS), 2)
    fc += "".join(f"[s{i}]" for i in range(len(SEGS))) + f"concat=n={len(SEGS)}:v=1:a=0[v];"
    inputs += ["-i", str(track)]
    fc += f"[{k}:a]atrim=0:{total},asetpts=PTS-STARTPTS,volume=-2.5dB,afade=t=in:d=0.4,afade=t=out:st={total - 1.2}:d=1.2,alimiter=limit=0.89[a]"
    out = r.OUT / out_name
    r.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
           "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
           "-movflags", "+faststart", str(out)])
    return out

if __name__ == "__main__":
    print(build(r.S / "music/track1.mp3", "bonita_pack_orders_with_me.mp4"))
