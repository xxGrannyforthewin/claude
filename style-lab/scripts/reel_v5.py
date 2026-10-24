"""Bonita Style reel builder, v5 look: sentence-case TikTok Sans Medium hook on one long line (user reference,
"The lace set every modest girl needs."), every shot held 3s+, soft music. Segments may be slowed to reach 3s."""
import sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
import round1 as r
import reel_v2 as base

HOOK = {"cx": 540, "cy": 930, "maxw": 900, "font": "tt_med", "size": 50, "color": (255, 255, 255)}
CALL = base.CALL


def build(out_dir, out_name, segs, track, music_start=0.0):
    """segs: (clip, start, source_seconds, speed, text, look). Output length per seg = source_seconds / speed."""
    out_dir.mkdir(exist_ok=True); lay = out_dir / "layers"; lay.mkdir(exist_ok=True)
    inputs, fc, k, durs = [], "", len(segs), []
    for src, st, du, *_ in segs:
        inputs += ["-ss", str(st), "-t", str(du), "-i", str(src)]
    for i, (src, st, du, speed, text, look) in enumerate(segs):
        d = round(du / speed, 3); durs.append(d)
        slow = f",setpts=PTS/{speed}" if speed != 1 else ""
        fc += r.base_filter(f"{i}:v") + f"{slow},setpts=PTS-STARTPTS,trim=0:{d},setpts=PTS-STARTPTS,fps=30,setsar=1[v{i}];"
        if text:
            p = lay / f"{out_name}_{i}.png"; r.layer(text, look, p)
            inputs += ["-loop", "1", "-t", str(d), "-i", str(p)]
            fc += f"[{k}:v]format=rgba[t{i}];[v{i}][t{i}]overlay=0:0[s{i}];"; k += 1
        else:
            fc += f"[v{i}]null[s{i}];"
    total = round(sum(durs), 2)
    fc += "".join(f"[s{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=0[v];"
    inputs += ["-ss", str(music_start), "-i", str(track)]
    fc += f"[{k}:a]atrim=0:{total},asetpts=PTS-STARTPTS,volume=-2.5dB,afade=t=in:d=0.6,afade=t=out:st={total - 1.5}:d=1.5,alimiter=limit=0.89[a]"
    out = out_dir / out_name
    r.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
           "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
           "-movflags", "+faststart", str(out)])
    return out, total


if __name__ == "__main__":
    G = r.GARDEN
    segs = [  # black-and-cream thobe, all face-free
        (G, 2.2, 3.2, 1, "The thobe every henna night needs.", HOOK),
        (G, 12.8, 1.95, 0.65, "comes with the belt", CALL),      # belt clearly in shot 12.8-14.75, slowed to 3s
        (G, 5.6, 3.2, 1, None, None),                           # sleeve and full look
        (G, 8.8, 3.2, 1, None, None),                           # full-length, moving
    ]
    print(build(r.S / "reel_v5", "bonita_henna_belt_v2.mp4", segs, r.S / "music/track2.mp3"))
