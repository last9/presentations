# Last9 presentations

Conference talks by Shekhar Patil and Last9 about securely operating untrusted AI agents on shared infrastructure.

## Talks

1. [Running Untrusted Agent Code at Scale](talk-1/)
2. [Secrets That Even Your Own Code Can't Steal](talk-2/)
3. [Stopping the $50k Agent](talk-3/)
4. [Tamper-Evident Agents](talk-4/)
5. [Deploying Code You Didn't Write](talk-5/)
6. [Approvals as a First-Class Control](talk-6/)
7. [Building a Multi-Tenant Agent Platform in Go](talk-7/)
8. [Why Containers Aren't Enough for Untrusted Agents](talk-8/)

The expanded conference version, including speaker notes, is in [`talk-live/`](talk-live/). A LinkedIn carousel and PDF export are in [`carousel/`](carousel/).

Talk abstracts, outlines, and presenter scripts are in [`docs/`](docs/).

## Run locally

```sh
npm ci
npm run check
npm run dev
```

Open <http://localhost:8000>. In a talk, use the arrow keys to navigate, `F` for full screen, and `S` for speaker view when notes are available.

## Structure

- `talk-1/` … `talk-8/`: standalone Reveal.js decks
- `talk-live/`: expanded live deck and printable speaker notes
- `carousel/`: social carousel source and exported assets
- `docs/`: abstracts, outlines, and presenter scripts
- `assets/`: shared images and research graphics
- `shared/theme.css`: shared Reveal.js theme

## License

See [LICENSE](LICENSE).
