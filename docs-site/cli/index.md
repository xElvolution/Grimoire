# CLI

`grimoire` is the terminal client for the Grimoire API.

![CLI](/banners/grimoire-docs-cli-overview-banner.png)

## Install

```bash
cd cli && npm install && npm run build
```

See [Installation](/cli/installation).

## Environment

```bash
export GRIMOIRE_URL=https://app.heygrimoire.xyz
```

## Example

```bash
grimoire task "Your prompt" --wallet 0xYourWalletAddress
grimoire skills
grimoire credits --wallet 0xYourWalletAddress
```

## Next

- [Commands](/cli/commands)
