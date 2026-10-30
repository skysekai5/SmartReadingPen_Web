# SmartReadingPen_Web_V1

**First independent browser edition** (source derived from user-supplied SmartReadingPen Android V96):

- Responsive trilingual site and PWA app-shell caching, separate from Android app.
- Browser photo/gallery import, crop and local multilingual Tesseract.js OCR, manual text correction, side-by-side desktop/vertical mobile translation preview, local curated lookup and parent-confirmed online MyMemory text translation.
- TTS reading, punctuation pauses, Chinese character and Latin passage highlighting, voice availability summary, reading speed.
- Learning playground: complete 4-world 36-question Word Shooter stage structure with correct ×3 letter counts, three levels per star, three stars per world and three-round BOSS; letter falling, pointer/keyboard movement, continuous firing, nonmodal audio and automatic local save.
- 4×10-level math quiz with 5 stars ×5 questions per level, listen-and-choose, sentence ordering, 1–12 multiplication table, achievements/stickers.
- Hanzi Writer stroke tracing, curated three-language dictionary, textbook-known-word mini quiz, arithmetic step tutor.
- Privacy: images never sent; translation text transmitted only after explicit parental confirmation; local-only progress/achievements; export JSON.

**Known differences:** This is a working Web V1 port rather than pixel-for-pixel native parity. Tesseract OCR ≠ Android ML Kit; online translation limited by external provider; Hanzi Writer and OCR first-use resources require network; voice quality and boundary highlighting depend on browser; translated image overlay is not an exact replacement of text in the original photograph. See README.md.
