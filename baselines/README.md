# Public route baseline

`public-routes.json` records the public GitHub Pages surface that existed before the handbook work began. It is a non-breaking contract, not a permanent ban on editing a presentation.

The fixture contains:

- the source commit and GitHub Pages configuration;
- every route linked from the portfolio index;
- the live deck, speaker notes, standalone deck, carousel, PDF, and exported carousel images;
- the observed HTTP status, content type, response size, and final URL on the capture date;
- SHA-256 hashes for the root index and every presentation HTML entry point; and
- the current absence of `robots.txt`, `sitemap.xml`, and `llms.txt`.

`npm run check:baseline` confirms that every source file still exists and that hashed presentation files have not changed silently. An intentional presentation edit should update the affected hash and explain the change in the pull request. The live HTTP observations are historical evidence; they are not fetched during CI.

Captured on 2026-10-09 from commit `0f3b72ad28a41001604b74572368b505c7762378`.
