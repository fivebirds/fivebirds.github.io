# fivebirds.github.io

Source for the [fivebirds.org](https://fivebirds.org) landing page.

## About

**Five Birds** is an open source AI innovation collective — five independent projects, each named after a sacred bird, each solving a different breakthrough problem for humanity. No corporation owns this. No single server hosts this. The flock cannot be killed.

Licensed under Apache 2.0.

## Projects

| Bird | Status | Focus |
|---|---|---|
| [Ibis](https://ibis.fivebirds.org) | Active | Human values & AI symbiosis — preserving human wisdom, building Good AI |
| ??? | Watching | Classified |
| ??? | Watching | Classified |
| ??? | Watching | Classified |
| ??? | Watching | Classified |

### Ibis

The first bird. Ibis tackles the absence of a decentralized, cryptographically protected repository of human values — the knowledge foundation needed for a Good AI.

> *"Adversarial AI is optimized for goals — not for people. It manipulates, erases culture, rewrites history."*

Ibis builds a dual pipeline: one to collect and preserve human wisdom at scale, one to train AI that is grown from relationships and culture rather than engineered toward goals.

→ [ibis.fivebirds.org](https://ibis.fivebirds.org)

## Stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com)

## Development

```bash
cd app
npm install
npm run dev
```

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint with ESLint |

## Deployment

Pushes to `main` that touch files under `app/` automatically build and deploy to GitHub Pages via the [landing-page-deploy](.github/workflows/landing-page-deploy.yml) workflow.

Manual deploys can be triggered from the **Actions** tab using the `workflow_dispatch` trigger.

> **Note:** The GitHub Pages source must be set to **GitHub Actions** in repository settings (Settings → Pages → Source).
