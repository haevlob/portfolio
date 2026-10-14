# Marketplace portfolio / 14 October 2026

These are original fictional portfolio studies, not customer commissions. Product visuals were generated with the built-in Imagegen tool; the Russian typography and all card layouts are editable HTML/CSS in tools/build-marketplace.cjs. Each series has five exported images at 900 × 1200 px. Brands and product attributes are illustrative. No client results, reviews, or sales outcomes are claimed.

## Original image prompts

### stove

Use case: product-mockup. Create one exquisite photorealistic premium product photograph for a Russian graphic designer's fictional marketplace portfolio. Subject: a contemporary compact black steel wood-burning sauna heater, rectangular graphite metal lower firebox with elegant glass door revealing a small warm fire, cylindrical open black mesh stone cage on top filled with natural dark rounded sauna stones, short black flue outlet. Beautiful convincing engineering, crisp steel texture, realistic scale, no extra doors, no distortion. Three-quarter front perspective, entire isolated object fits in frame with generous transparent margins, object centered, vertical portrait composition. High-end industrial catalog photography, soft huge studio light from upper left, delicate warm rim. Transparent background, real alpha, soft contact shadow only. No scenery, no floor, no text, no lettering, no logos, no watermarks. This is a fictional design study, no recognizable brand.

### serum

Use case: product-mockup. Create one extraordinarily refined editorial beauty product photograph for a fictional Russian premium skincare brand portfolio. Subject: one generously proportioned translucent frosted pale blush glass serum bottle with a precise cylindrical matte ivory dropper cap and a clear pipette, delicate milky pink liquid inside; minimalist completely blank packaging, beautiful realistic material refraction, fine tactile glass. Standing upright, front three-quarter perspective, whole bottle visible with generous transparent margin, portrait composition. Luxury still-life beauty campaign, very soft directional daylight with a gentle specular highlight, tactile realistic light, warm blush and ivory hues. Isolated on a truly transparent background with real alpha and only delicate contact shadow. No floor or surroundings. Absolutely no letters, no text, no logos, no watermark. A fictional unbranded product, no medical claims.

### headphones

Use case: product-mockup. Create one extraordinarily polished photorealistic product photograph for a fictional premium consumer electronics marketplace design portfolio. Subject: one pair of over-ear wireless headphones in warm pale butter-yellow, sculpted continuous arch headband, generously padded oval earcups with tactile matte anodized outer shells and supple cream leather inner cushions. Elegant sophisticated original industrial design, physically plausible, no wires, no buttons on front, no branding. Three-quarter front view with both earcups clearly visible and headband forming a clean arch. Entire isolated product with generous transparent margin, portrait composition. Premium editorial studio photograph, precise softbox lighting, buttery pale yellow highlights, crisp believable material details. Truly transparent background with real alpha, only soft contact shadow; no scene, no floor, no props. No typography, no logo, no watermark. Fictional original design.

## Export

Set NODE_PATH to the installed bundle containing playwright and sharp, then run node tools/build-marketplace.cjs. The script generates PNGs, WebP gallery images, and WebP thumbnails. Product images are retained in assets/marketplace/source.

## AURA revision 2 / 14 October 2026

The headphone series now uses a separate music-poster art direction, implemented in `tools/aura-v2.cjs`: cobalt blue #2139e9, acid yellow #e5fc68, heavy sans-serif typography, macro detail, equalizer graphics, a numbered product diagram, and a record/ticket composition. All five cards remain 900 × 1200 px and retain the same original headphone product image. No new native image generation was used for this revision; layout and text were composed deterministically in HTML/CSS. The original AURA exports remain available in the repository for rollback but are not used by the current page.

Revision 2 was built with `node tools/build-marketplace.cjs aura-v2` and mapped the stable `project=aura` URL to `assets/marketplace/aura-v2/`. It has been superseded by revision 3 below.


## AURA revision 3 / 15 October 2026

The user rejected the heavy music-poster treatment. The current series uses restrained audio-product art direction: mist blue and silver tones, navy, measured sans-serif typography, a new studio photograph, and calm material close-ups. Five exports remain 900 x 1200 px. Header and contact ownership remain scoped to Renata's marketplace portfolio.

Studio photo: built-in Imagegen edit using the original headphones.png as the identity reference. Final source: assets/marketplace/source/headphones-studio-v3.png. Exact prompt:

Use case: precise-object-edit / premium product-mockup. Reference image is the product identity anchor: preserve exactly these butter-yellow over-ear wireless headphones, their distinctive earcup shapes, leather cushions, headband, proportions, materials, and colors. Create one exquisite refined industrial-design editorial studio photograph for a luxury audio campaign. Same product only, no new product. Completely change the presentation to a cool silver-blue seamless studio environment. Headphones hover very subtly above a smooth matte silver-blue floor, with a physically realistic soft grounded shadow. Camera three-quarter front with a gentle tilt, entire product comfortably in frame, precise fine materials and soft beautiful studio light. Keep color restrained: cold mist blue backdrop, warm pale headphones, graceful ivory highlights, no electric colors. Very subtle tonal depth and realistic light falloff; no stylized shapes, no graphics, no props, no neon. Portrait composition, intended 3:4. The upper 35 percent of the image is quiet clean light blue negative space for later typography, product occupies lower 60 percent, lower side margins comfortable. The product is the clear focus, beautifully separated from background. Premium Bang-and-Olufsen-grade photographic restraint, original unbranded product. Absolutely NO text, NO logos, NO letters, NO numbers, NO watermark, NO ticket, NO stickers, NO graphic circles.

Layouts are in tools/aura-v3.cjs. Rebuild with node tools/build-marketplace.cjs aura-v3. Stable project=aura links now use assets/marketplace/aura-v3/; prior versions are retained for rollback.
