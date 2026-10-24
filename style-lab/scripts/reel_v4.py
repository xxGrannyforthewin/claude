"""Bonita Style reel: black thobe with gold hand-embroidery (mirror clip), locked style, soft music."""
import sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
import round1 as r
import reel_v2 as base

r.OUT = r.S / "reel_v4"; r.OUT.mkdir(exist_ok=True)
r.LAY = r.OUT / "layers"; r.LAY.mkdir(exist_ok=True)
CALL_SIDE = {**base.CALL, "cx": 280, "cy": 800}  # on the plain dark area beside the embroidered panel
# (start, duration, text, look, extra video filter) on the mirror clip
SEGS = [
    (2.1, 2.5, "the perfect thobe doesn't exi—", base.HOOK, ""),
    # front view: zoom 15% from the bottom so the chin stays out of frame, played at 0.7x (front view ends at 1.6s, scene cut)
    (0.45, 1.12, "hand-embroidered", CALL_SIDE, ",crop=iw/1.15:ih/1.15:(iw-iw/1.15)/2:ih-ih/1.15,scale=1080:1920,setpts=PTS/0.7"),
    (4.6, 2.0, None, None, ""),
]

def build(track, music_start, out_name):
    inputs, fc, k, durs = [], "", len(SEGS), []
    for st, du, *_ in SEGS:
        inputs += ["-ss", str(st), "-t", str(du), "-i", str(r.MIRROR)]
    for i, (st, du, text, look, extra) in enumerate(SEGS):
        d = round(du / 0.7, 3) if "setpts=PTS/0.7" in extra else du
        durs.append(d)
        fc += r.base_filter(f"{i}:v") + f"{extra},setpts=PTS-STARTPTS,trim=0:{d},setpts=PTS-STARTPTS,fps=30,setsar=1[v{i}];"
        if text:
            p = r.LAY / f"seg{i}.png"; r.layer(text, look, p)
            inputs += ["-loop", "1", "-t", str(d), "-i", str(p)]
            fc += f"[{k}:v]format=rgba[t{i}];[v{i}][t{i}]overlay=0:0[s{i}];"; k += 1
        else:
            fc += f"[v{i}]null[s{i}];"
    total = round(sum(durs), 2)
    fc += "".join(f"[s{i}]" for i in range(len(SEGS))) + f"concat=n={len(SEGS)}:v=1:a=0[v];"
    inputs += ["-ss", str(music_start), "-i", str(track)]
    fc += f"[{k}:a]atrim=0:{total},asetpts=PTS-STARTPTS,volume=-2.5dB,afade=t=in:d=0.6,afade=t=out:st={total - 1.2}:d=1.2,alimiter=limit=0.89[a]"
    out = r.OUT / out_name
    r.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
           "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
           "-movflags", "+faststart", str(out)])
    return out, total

if __name__ == "__main__":
    print(build(r.S / "music/track2.mp3", 8.0, "bonita_gold_hand_embroidered.mp4"))
