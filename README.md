# Smart Reading Pen — Web V2

A **runnable browser version** built from the learning rules and curated vocabulary in Smart Reading Pen Android V96. The Android project is unchanged. Web V2 is a standalone HTML/CSS/JavaScript PWA; no npm, Android Studio, database, account, or paid API key is required.

## Open locally (Windows / macOS / Linux)

Unzip the folder and run a local HTTP server in `SmartReadingPen_Web_V2`:

```shell
python -m http.server 8000
```

Open **http://localhost:8000/** in Chrome / Edge / Firefox. Use **https://** when publishing for camera access and PWA installation. Opening `index.html` by double-clicking is not supported because JavaScript modules and PWA service workers require HTTP(S).

## Publish free via GitHub Pages

1. Create a new public repository in GitHub. Upload **the contents of SmartReadingPen_Web_V2** into the repository root (index.html, js/, styles.css, assets/, ...).
2. Go to **Settings → Pages → Build and deployment**, select **Deploy from a branch**, `main` and `/(root)`.
3. Open the HTTPS Pages URL displayed by GitHub. It may take a little time to publish. On a phone use **Add to Home screen** if offered.
4. Do not upload the Android ZIP as your website home page. You need the **files inside the web ZIP**.

## Features implemented

- Trilingual site UI: Chinese, English, Malay.
- Photo upload/camera, rectangular crop, source-language-specific local OCR with **Tesseract.js** loaded on demand, Chinese single-character/one-line/full-page layout options with retry and crop enhancement, editable OCR text, original and translated photo preview, Read/Stop/Translate controls. The translated image is a **text-over-photo preview**, not precise line-replacement or document layout recreation.
- Browser TTS, punctuation pauses, Chinese reading pinyin filter, character-based Chinese highlights, best-effort sentence/segment highlights for English and Malay; rate control and voice diagnostics.
- Offline curated 26-term trilingual word dictionary. Online translation via **MyMemory (translated.net)** is optional, quota-limited, and **requires a parent to confirm each transmission of recognized text**. Never send photo data. Translation is not guaranteed to be accurate.
- Learning playground: Word Shooter (4 worlds, 9 questions/3 stars and a boss per world, word ×3 letter counting, touch/keyboard controls, no answer popups, sound effects, read-along target, automatic progress), Math (four operations, 10 levels each, five stars per level with 5 correct per star), Listen & Choose, Sentence Order, 1–12 Times Table, sticker rewards.
- Stroke order using Hanzi Writer from CDN with animate and tracing quiz. Textbook-to-Quiz based only on curated known words, and step-by-step basic integer arithmetic tutor from OCR/manual expressions.
- Local progress saving and manual JSON export, PWA shell cache for navigation/games/dictionary.

## Limitations / privacy

- The application shell, games and small dictionary work offline after initial caching. **OCR model initialization, new Hanzi stroke data and online translation require connectivity**, unless separately cached by the browser/underlying library. Browser/system speech voices vary; no website can silently install voice packages.
- Browser OCR is not Android ML Kit and will produce different results; OCR may confuse numeral `1` with Chinese `零`. Correct recognized text manually when needed. The OCR library and language assets come from third-party CDNs. The original language is selected by the user before recognition and is never changed from a garbled OCR result. In Chinese mode, if no Chinese characters can be recognized, the app warns instead of silently translating English gibberish. For Chinese words, choose 中文 and 单个汉字 or 一行文字, and select a close crop. This is still imperfect and does not guarantee all characters.
- Online translation transfers **only recognized/edited text after explicit parental confirmation** to MyMemory; see the provider's privacy policy and usage limits. The free anonymous MyMemory tier is limited (currently ~5000 characters/day), and short API input chunks are used. Network failure and quota errors are reported.
- Images stay in current browser memory (object URLs and canvas). No user accounts and no app server. Learning progress is saved in `localStorage` on this device/browser, **not synchronized**. Browser privacy mode or storage clearing may erase it.
- For public distribution directed at minors, review your privacy policy, use of external services, child data obligations and accessibility before launch. This is a working **V1 browser port**, not a claim of functional parity with every native Android feature.

## Browser tests

Use `python -m http.server 8000`; manually test: Photo > Upload > crop > OCR; Translate > parent consent; three-language TTS; Play > Shooter APPLE ×3 (A3/P6/L3/E3), next-level stars, save/reload; math and games; Tools > Stroke and Dictionary; offline after full page load.

Source adapted from the user-provided **SmartReadingPen_V96.zip**. Included original audio files (answer_correct, answer_try_again, shooter_laser). See `LICENSES.md` for third-party acknowledgements.

## V2 iPad and website update (important)

V1 used one huge mixed-language OCR worker (`eng+chi_sim+msa`) and *overrode the original language based on its own OCR guess*. On iPad this can misrecognize 请/海 as English-looking garbage. V2 downloads one language model at a time and honors your selection. Choose **中文** and **单个汉字** for a cropped 海, or **一行文字** for a short phrase. A poorly photographed character may still require manual correction. Photos stay local; language model assets come from jsDelivr.

**To update an existing GitHub Pages repo:** Extract this ZIP and upload **all files and folders inside** `SmartReadingPen_Web_V2` to the *existing repository root*, overwriting the old `index.html`, `js/`, `styles.css`, `sw.js`, and other files. Commit changes. Reload the page on iPad; if it still shows Web V1, close its Safari tab and reopen, or clear website cache. Local saved game progress remains in the same browser because the storage key is unchanged. GitHub Pages publication may take a few minutes.

Because browsers cache app shells, V2 changes the service-worker cache ID and uses network-first requests for HTML/JS/CSS. Existing opened V1 pages may briefly show the old UI until the update activates and the page reloads.
