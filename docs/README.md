# Grimoire docs

## Public documentation site

**GitBook-style docs** for developers and judges:

```bash
cd docs-site
npm install
npm run dev      # http://localhost:5173
npm run build    # → .vitepress/dist
```

Deploy to **https://doc.grimoire.xyz** - see `docs-site/deployment/docs-site.md` or the [deployment guide](https://doc.grimoire.xyz/deployment/docs-site) once live.

## Deep-dive research (contributors)

| Document | Description |
| --- | --- |
| [`engram/README.md`](./engram/README.md) | Engram neuroscience design |
| [`engram/BUILD.md`](./engram/BUILD.md) | ~110 item master build list |
| [`engram/WHY.md`](./engram/WHY.md) | Rationale for every BUILD item |
| [`engram/building-neurons.md`](./engram/building-neurons.md) | Neuron implementation guide |

See also: [`MILESTONE.md`](../MILESTONE.md) · [`SUBMISSION.md`](../SUBMISSION.md) · [`contracts/README.md`](../contracts/README.md)
