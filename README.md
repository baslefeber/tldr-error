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

Typing `tldr-error` every time is annoying. You have two better options:

### Option 1: The short alias

Install globally and use the built-in 2-letter alias `te`:

```bash
te node index.js
te tsx server.ts
te npm run dev
```

### Option 2: Set it and forget it (Recommended)

Add it to your `package.json` scripts once — then just run `npm run dev` like you always do:

```json
"scripts": {
  "dev": "tldr-error nodemon index.js",
  "start": "tldr-error node index.js"
}
```

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
