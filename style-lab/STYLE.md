# Bonita Style — Video Style

Built round by round in Style Lab (4 rounds so far): https://claude.ai/artifact/H89TDcBDGMkPaVzrVnfSWa

## The rules (anyone editing a Bonita video follows these)

**Feel:** a real phone edit by a woman who loves the piece, not an ad. Simple yet elegant, feminine and soft, a gentle sell. If a choice looks "designed", pick the plainer one.

**Footage**
- Real Bonita footage only. Never AI-generated footage.
- No faces. Frame from the neck or shoulders down, or shoot backs, hands and details.
- Vertical 9:16, 1080×1920, for TikTok Shop, Facebook Reels/Stories ads, Instagram Reels and the Houston store.

**Shape of a post** (round 4 mini video, kept)
1. **Hook** on the first shot, about 2–3 seconds.
2. **Straight cut** to a detail, with **one callout** that answers a buyer's question, about 2 seconds.
3. **Straight cut** to the full look, **no text**, about 2–3 seconds.
Longer videos repeat steps 2–3 with new details. No logo at the end.

**Hook text**
- TikTok Sans **ExtraBold**, white, soft drop shadow, no box.
- About 66px on a 1080×1920 frame, centred horizontally, in the middle of the screen (text block centred around y 930).
- One or two lines, split evenly. Keep it inside Instagram's safe zone (x 91–990; y 237–997, and to y 1479 on the left of the button column).
- Appears instantly, with no animation.

**Feature callouts**
- TikTok Sans **Bold**, about 42px, in a **highlight box**: **white box with black text** (default) or **black box with white text**. Box rounded, sits evenly around the words.
- Placed beside the detail it names, never covering the embroidery itself.
- Wording must be true for that piece (e.g. "comes with the belt", "fully lined", "true to size"). No arrows.
- Appears instantly, with no animation.

**Cuts and motion**
- Straight cuts only. No dissolves, zooms, glitches or flashy transitions.

**Sound**
- No sound effects. Soft instrumental music under every video: strings, qanun, oud or piano, calm and warm, steady volume, no drops or vocals. Either a track generated for the video (Google Lyria via Treg, about $0.04 per 30s, user-approved; prompts in `scripts/reel_v2.py` history) mixed about −2.5 dB with a 0.4s fade in and 1.2s fade out, or a calm sound added in the app when posting.

**Hook bank** (only post a line when it's true for that video)
- henna night outfit
- the perfect thobe doesn't exi—
- I almost didn't buy this dress
- what I wore to my cousin's henna
- everyone asked where my thobe was from
- I wasn't going to post this but—
- my Eid outfit is sorted
- found my henna night thobe

**Never:** cheap effects, cluttered or loud text, text over the embroidery, neon or discount-ad looks, silly trend sounds, faces, AI-looking anything, hard selling, ending on the logo.

## The brief

1. **What it's for:** Bonita Style (modest boutique) video for TikTok Shop, Facebook ads (Reels and Stories only), Instagram Reels, and the Houston store (8401 Westheimer, STE 130; store content comes last, from Store B-Roll / Store UGC clips).
2. **Shape:** vertical 9:16 for everything.
3. **Viewer and first second:** women aged 25–40, Arab and Muslim, often Palestinian, shopping for thobes and kaftans for henna nights, Eid, weddings and family gatherings. In the first second: the embroidery and fabric stop the scroll ("that's so beautiful, I need to see it closer") and the viewer feels "this is for me and my people", like a friend sent it.
4. **References:**
   - Warda of London (TikTok and Instagram): loved for *simplicity yet elegance*; shows what this age group likes. Videos not yet viewable here (TikTok and Instagram blocked downloads); user may save them to Drive.
   - Bonita's own store-opening reel (@bonitastyleus, `refs/ref1` on branch `claude/style-lab-refs`): raw handheld behind-the-scenes footage, heavy condensed all-caps text for key info, bold lowercase serif for spoken captions.
5. **Never:** see the rules above.
6. **What we already have:**
   - Logo: hand-painted watercolor calligraphy wordmark in Arabic-inspired lettering, berry/wine (about `#a03450`, deepest `#770825`) with gold-leaf accents (about `#dcb683`); "MODEST BOUTIQUE" in wide-spaced gold capitals. File: `brand/bonita-logo.webp`.
   - Fonts: TikTok Sans or Proxima Nova.
7. **Motion:** asked to "show me"; the plainest option won every time.
8. **Sound:** soft instrumental or Arabic-inspired, or a trending sound added in the app. No sound effects.
9. **Built first:** hooks, then callouts.

## How each rule was decided

- **Straight cuts** — round 1 keep; dissolves not chosen.
- **Text appears instantly** — round 1 keep; smooth settle was a maybe, then unrated.
- **Hook text white, no box, centred and bolder** — round 1 keep with note "more bold, in the middle of the screen"; Bold kept in round 2; ExtraBold kept on a two-line hook in round 3.
- **Callouts** — small white kept in round 3; highlight boxes liked but "off center" (fixed); white/black and black/white highlights kept in round 4; the mini video with the white highlight kept in round 4.
- **Hook bank** — 3 lines kept in round 1, 5 more kept in round 2.

## Rejected

- White bubble behind **hook** text (round 1). (A white highlight is fine for **callouts**, at the user's request in round 3.)
- Proxima Nova for hooks (round 1).
- Gold accent word in the hook (round 1).
- Arrow (↑) in callouts (round 3).

## Parked

- **Brand-colour boxes** (cream/berry, berry/cream, blush/berry): a maybe in rounds 1, 2, 3 and 4. Not part of the everyday kit; possible for special brand moments (e.g. the store opening) if the user wants.

## Patterns in the notes

- Every pick was the most native, least edited option: plain text, no animation, straight cuts. Keep pushing toward "real phone edit", away from "designed".

## Still to do

- Houston store videos (from Store B-Roll / Store UGC).
- Warda of London reference videos: save to Drive so they can be studied frame by frame.
- Music source for finished videos (in-app, or a licensed library later).
