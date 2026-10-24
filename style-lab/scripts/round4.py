"""Style Lab round 4 for Bonita Style: centred highlight boxes in more colour pairs, and a full mini video
(hook, callout, then the full look) so the flow of a finished post is easy to judge."""
import json, sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
import round1 as r

r.OUT = r.S / "round4"; r.OUT.mkdir(exist_ok=True)
r.LAY = r.OUT / "layers"; r.LAY.mkdir(exist_ok=True)
HOOK = {"cx": 540, "cy": 930, "maxw": 760, "font": "tt_xbold", "size": 66, "color": (255, 255, 255)}
CALL = {"cx": 540, "cy": 520, "maxw": 760, "font": "tt_bold", "size": 46, "color": (255, 255, 255)}
BOXED = {**CALL, "size": 42}
BELT = (12.8, 2.0)
CALLOUT = "comes with the belt"
BLUSH = (246, 227, 231)
CARDS = []
def card(cid, section, label, desc, order): CARDS.append({"id": cid, "section": section, "label": label, "desc": desc, "order": order})


def mini_video(cid, call_look):
    """Hook on the sleeve (2.5s) -> callout on the belt (2s) -> the full look, no text (2.5s). Straight cuts."""
    segs = [(2.2, 2.5, "found my henna night thobe", HOOK), (BELT[0], BELT[1], CALLOUT, call_look), (5.6, 2.5, None, None)]
    inputs, fc, outs = [], "", []
    for i, (st, du, text, look) in enumerate(segs):
        inputs += ["-ss", str(st), "-t", str(du), "-i", str(r.GARDEN)]
    n = len(segs)
    for i, (st, du, text, look) in enumerate(segs):
        fc += r.base_filter(f"{i}:v") + f",trim=0:{du},setpts=PTS-STARTPTS[v{i}];"
        if text:
            p = r.LAY / f"{cid}_{i}.png"; r.layer(text, look, p)
            inputs += ["-loop", "1", "-t", str(du), "-i", str(p)]
            k = n + sum(1 for s in segs[:i] if s[2])
            fc += f"[{k}:v]format=rgba[t{i}];[v{i}][t{i}]overlay=0:0[s{i}];"
        else:
            fc += f"[v{i}]null[s{i}];"
    fc += "".join(f"[s{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[v]"
    r.finish(cid, inputs, fc, sum(s[1] for s in segs))


if __name__ == "__main__":
    only = set(sys.argv[1:]); want = lambda c: not only or c in only
    boxes = [
        ("r4-a1", "White highlight, black text", "Your idea: white box, black text, now centred on the words.", {**BOXED, "color": (20, 20, 20), "box": (255, 255, 255, 240)}),
        ("r4-a2", "Black highlight, white text", "The same flipped.", {**BOXED, "color": (255, 255, 255), "box": (18, 18, 18, 225)}),
        ("r4-a3", "Cream highlight, berry text", "Round 3's cream box, now centred.", {**BOXED, "color": r.BERRY, "box": r.CREAM + (240,)}),
        ("r4-a4", "Berry highlight, cream text", "Round 3's berry box, now centred.", {**BOXED, "color": r.CREAM, "box": r.BERRY + (235,)}),
        ("r4-a5", "Blush highlight, berry text", "A soft pink box with berry text, more feminine.", {**BOXED, "color": r.BERRY, "box": BLUSH + (240,)}),
    ]
    for i, (cid, label, desc, look) in enumerate(boxes):
        card(cid, "r4-highlight", label, desc, i + 1)
        if want(cid): r.text_on_clip(cid, r.GARDEN, BELT[0], BELT[1], CALLOUT, look, "appear", 0.0)
    minis = [
        ("r4-b1", "Mini video, plain white callout", "A 7-second post: your hook, then the small white callout on the belt, then the full look with no text.", CALL),
        ("r4-b2", "Mini video, white highlight callout", "The same post, with the callout in a white highlight box.", {**BOXED, "color": (20, 20, 20), "box": (255, 255, 255, 240)}),
    ]
    for i, (cid, label, desc, look) in enumerate(minis):
        card(cid, "r4-mini", label, desc, i + 1)
        if want(cid): mini_video(cid, look)
    (r.OUT / "cards.json").write_text(json.dumps(CARDS, indent=1))
    print("ok", len(CARDS))
