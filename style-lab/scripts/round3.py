"""Style Lab round 3 for Bonita Style: feature callouts (small text pointing at a detail), a hook-then-callout
mini edit, and a final Bold vs ExtraBold check on a two-line hook. Sample callout wording: swap for the real detail."""
import json, sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
import round1 as r

r.OUT = r.S / "round3"; r.OUT.mkdir(exist_ok=True)
r.LAY = r.OUT / "layers"; r.LAY.mkdir(exist_ok=True)
HOOK_LOOK = {"cx": 540, "cy": 930, "maxw": 760, "font": "tt_bold", "size": 66, "color": (255, 255, 255)}
CALL = {"cx": 540, "cy": 520, "maxw": 760, "font": "tt_bold", "size": 46, "color": (255, 255, 255)}
BELT = (12.8, 2.0)  # the sash is clearly in shot here, no face
CALLOUT = "comes with the belt"
CARDS = []
def card(cid, section, label, desc, order): CARDS.append({"id": cid, "section": section, "label": label, "desc": desc, "order": order})


def hook_then_callout(cid, call_look, call_text):
    """3s of the sleeve with the hook, straight cut to the sash with the callout."""
    a = r.LAY / f"{cid}_hook.png"; r.layer("found my henna night thobe", HOOK_LOOK, a)
    b = r.LAY / f"{cid}_call.png"; r.layer(call_text, call_look, b)
    seg1, seg2 = 3.0, BELT[1]
    inputs = ["-ss", "2.2", "-t", str(seg1), "-i", str(r.GARDEN), "-ss", str(BELT[0]), "-t", str(seg2), "-i", str(r.GARDEN),
              "-loop", "1", "-t", str(seg1), "-i", str(a), "-loop", "1", "-t", str(seg2), "-i", str(b)]
    fc = (r.base_filter("0:v") + f",trim=0:{seg1},setpts=PTS-STARTPTS[v0];" + r.base_filter("1:v") + f",trim=0:{seg2},setpts=PTS-STARTPTS[v1];"
          "[2:v]format=rgba[h];[3:v]format=rgba[c];[v0][h]overlay=0:0[s0];[v1][c]overlay=0:0[s1];[s0][s1]concat=n=2:v=1:a=0[v]")
    r.finish(cid, inputs, fc, seg1 + seg2)


if __name__ == "__main__":
    only = set(sys.argv[1:]); want = lambda c: not only or c in only
    styles = [
        ("r3-a1", "Small white", "Same Bold white as your hooks, smaller, just under the belt.", CALL, CALLOUT),
        ("r3-a2", "Small white with arrow", "The same, with an arrow pointing up at the belt.", CALL, "↑ " + CALLOUT),
        ("r3-a3", "Cream box, berry text", "Your maybe from rounds 1 and 2, tried as a small callout.", {**CALL, "size": 42, "color": r.BERRY, "box": r.CREAM + (235,)}, CALLOUT),
        ("r3-a4", "Berry box, cream text", "The flipped colours, small.", {**CALL, "size": 42, "color": r.CREAM, "box": r.BERRY + (235,)}, CALLOUT),
    ]
    for i, (cid, label, desc, look, text) in enumerate(styles):
        card(cid, "r3-callout", label, desc, i + 1)
        if want(cid): r.text_on_clip(cid, r.GARDEN, BELT[0], BELT[1], text, look, "appear", 0.0)
    combos = [
        ("r3-b1", "Hook, then white callout", "Your hook style on the sleeve, straight cut to the belt with the small white callout.", CALL, "↑ " + CALLOUT),
        ("r3-b2", "Hook, then cream callout", "The same edit, with the callout in the cream box.", {**CALL, "size": 42, "color": r.BERRY, "box": r.CREAM + (235,)}, CALLOUT),
    ]
    for i, (cid, label, desc, look, text) in enumerate(combos):
        card(cid, "r3-together", label, desc, i + 1)
        if want(cid): hook_then_callout(cid, look, text)
    long = "everyone asked where my thobe was from"
    weights = [("r3-c1", "Bold", "Your keep from round 2, on a two-line hook.", HOOK_LOOK), ("r3-c2", "ExtraBold", "Your maybe from round 2, on the same hook.", {**HOOK_LOOK, "font": "tt_xbold"})]
    for i, (cid, label, desc, look) in enumerate(weights):
        card(cid, "r3-weight", label, desc, i + 1)
        if want(cid): r.text_on_clip(cid, r.MIRROR, 0.0, 4.0, long, look, "appear", 0.0)
    (r.OUT / "cards.json").write_text(json.dumps(CARDS, indent=1))
    print("ok", len(CARDS))
