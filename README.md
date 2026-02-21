tldr-error 💥
Put your messy stack traces on a diet.

I built this because I got sick of missing a single comma and watching Node vomit 50 lines of node:internal garbage into my terminal. I just want to know what broke and exactly what line of code caused it.

tldr-error is a zero-config CLI wrapper. It intercepts your crashes, throws away the noise, and gives you a clean, readable summary of exactly what went wrong.

The Before & After
(Drop your screenshot here)

Installation
You don't even need to install it to try it. Just use npx:

Bash
npx tldr-error node your-app.js
Or, if you want it permanently on your machine, install it globally:

Bash
npm install -g tldr-error
How to use it
Just put tldr-error in front of whatever command you normally run to start your app. It works perfectly with standard Node, npm scripts, or tsx.

Instead of this:

Bash
node index.js
npm run dev
tsx server.ts
Do this:

Bash
tldr-error node index.js
tldr-error npm run dev
tldr-error tsx server.ts
That's literally it.

Normal console.logs pass through perfectly. Warnings print normally. But if your app crashes, it swallows the ugly stack trace and prints a custom red box with your exact error summary and a clickable relative file path.

Why did I build this?
I'm just a dev who hates scrolling up in the terminal. I built this to scratch my own itch and save my sanity during late-night debugging sessions.

If you find a bug or a weird edge-case error (like a super specific framework syntax error) that my regex doesn't catch, please open an issue or submit a PR! I'd love to see how other people improve the parsing logic.

License
MIT
