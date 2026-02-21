# tldr-error 💥

> Put your messy stack traces on a diet.

I built this because I got sick of missing a single comma and watching Node vomit 50 lines of `node:internal` garbage into my terminal. I just want to know **what broke** and **exactly what line** caused it.

`tldr-error` is a zero-config CLI wrapper. It intercepts your crashes, throws away the noise, and gives you a clean, readable summary of exactly what went wrong.

---

## Before & After

<!-- Drop a screenshot here once you have one -->
<!-- ![Before and after comparison](./images/before-after.png) -->
![CleanShot 2026-02-21 at 18 10 29](https://github.com/user-attachments/assets/11bedfc5-b5f2-4d3e-a327-8c098a7c81cf)


---

## Installation

You don't even need to install it to try it. Just use `npx`:

```bash
npx tldr-error node your-app.js
```

Or, if you want it permanently on your machine, install it globally:

```bash
npm install -g tldr-error
```

---

## Usage

Just put `tldr-error` in front of whatever command you normally run to start your app. It works with standard Node, npm scripts, or tsx.

**Instead of this:**

```bash
node index.js
npm run dev
tsx server.ts
```

**Do this:**

```bash
tldr-error node index.js
tldr-error npm run dev
tldr-error tsx server.ts
```

That's literally it.

Normal `console.log`s pass through perfectly. Warnings print normally. But if your app crashes, it swallows the ugly stack trace and prints a clean red box with your exact error summary and a clickable relative file path.

---

## Why I Built This

I'm just a dev who hates scrolling up in the terminal. I built this to scratch my own itch and save my sanity during late-night debugging sessions.

If you find a bug or a weird edge-case error (like a super specific framework syntax error) that the regex doesn't catch, please [open an issue](../../issues) or submit a PR! I'd love to see how other people improve the parsing logic.

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b fix/your-fix`
3. Push and open a PR

---

## License

[MIT](./LICENSE)
