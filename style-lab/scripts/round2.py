"""Style Lab round 2 for Bonita Style: bolder text in the middle of the screen, the cream-and-berry maybe,
more hook lines in the voice that was kept, and appear-vs-smooth on the new style."""
import json, sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
import round1 as r

r.OUT = r.S / "round2"; r.OUT.mkdir(exist_ok=True)
r.LAY = r.OUT / "layers"; r.LAY.mkdir(exist_ok=True)
MID = {"cx": 540, "cy": 930, "maxw": 760, "color": (255, 255, 255)}
BOLD = {**MID, "font": "tt_bold", "size": 66}
HOOK = "henna night outfit"
CARDS = []
def card(cid, section, label, desc, order): CARDS.append({"id": cid, "section": section, "label": label, "desc": desc, "order": order})

if __name__ == "__main__":
    only = set(sys.argv[1:]); want = lambda c: not only or c in only
    weights = [
        ("r2-a1", "SemiBold", "One step bolder than round 1, centred in the middle of the screen.", {**MID, "font": "tt_semi", "size": 66}),
        ("r2-a2", "Bold", "Two steps bolder, same size and place.", BOLD),
        ("r2-a3", "ExtraBold", "The heaviest TikTok Sans, same size and place.", {**MID, "font": "tt_xbold", "size": 66}),
        ("r2-a4", "Bold, bigger", "Bold, about 10% larger.", {**BOLD, "size": 74}),
    ]
    for i, (cid, label, desc, look) in enumerate(weights):
        card(cid, "r2-weight", label, desc, i + 1)
        if want(cid): r.text_on_clip(cid, r.MIRROR, 0.0, 4.0, HOOK, look, "appear", 0.0)
    boxes = [
        ("r2-b1", "Cream box, berry text", "Your round 1 maybe, now bold and in the middle.", {**BOLD, "color": r.BERRY, "box": r.CREAM + (235,)}),
        ("r2-b2", "Berry box, cream text", "The same colours flipped.", {**BOLD, "color": r.CREAM, "box": r.BERRY + (235,)}),
    ]
    for i, (cid, label, desc, look) in enumerate(boxes):
        card(cid, "r2-colour", label, desc, i + 1)
        if want(cid): r.text_on_clip(cid, r.MIRROR, 0.0, 4.0, HOOK, look, "appear", 0.0)
    lines = [
        ("r2-c1", "What I wore, shorter", "what I wore to my cousin's henna"),
        ("r2-c2", "Everyone asked", "everyone asked where my thobe was from"),
        ("r2-c3", "Wasn't going to post", "I wasn't going to post this but—"),
        ("r2-c4", "Eid, next", "my Eid outfit is sorted"),
        ("r2-c5", "Found it", "found my henna night thobe"),
    ]
    for i, (cid, label, text) in enumerate(lines):
        card(cid, "r2-lines", label, f"“{text}”", i + 1)
        if want(cid): r.text_on_clip(cid, r.MIRROR, 0.0, 4.0, text, BOLD, "appear", 0.0)
    motions = [
        ("r2-d1", "Just appears", "Your keep from round 1, on the new bold centred text.", "appear"),
        ("r2-d2", "Smooth and confident", "Your maybe from round 1, on the same text.", "smooth"),
    ]
    for i, (cid, label, desc, m) in enumerate(motions):
        card(cid, "r2-motion", label, desc, i + 1)
        if want(cid): r.text_on_clip(cid, r.MIRROR, 1.5, 4.0, HOOK, BOLD, m, 0.0 if m == "appear" else 0.4)
    (r.OUT / "cards.json").write_text(json.dumps(CARDS, indent=1))
    print("ok", len(CARDS))
