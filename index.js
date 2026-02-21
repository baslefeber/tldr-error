#!/usr/bin/env node

const spawn = require("cross-spawn");
const pc = require("picocolors");
const path = require("path");

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: tldr-error <command> [args...]");
  process.exit(1);
}

const [cmd, ...cmdArgs] = args;

const child = spawn(cmd, cmdArgs, {
  stdio: ["inherit", "inherit", "pipe"],
});

let stderrBuffer = "";

child.stderr.on("data", (chunk) => {
  stderrBuffer += chunk.toString();
});

child.on("close", (code) => {
  if (code !== 0 && stderrBuffer.trim().length > 0) {
    // The app crashed! Show our beautiful UI.
    const parsed = parseError(stderrBuffer);
    printErrorBox(parsed);
  } else if (stderrBuffer.length > 0) {
    // BUG FIX: The app didn't crash, but it threw warnings.
    // We must pass these warnings to the user so we don't hide them!
    process.stderr.write(stderrBuffer);
  }

  // Exit with the exact same code the user's app exited with
  process.exit(code === null ? 1 : code);
});

child.on("error", (err) => {
  console.error(
    `tldr-error: failed to run command "${cmd}": ${err.message}`,
  );
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

function isNoisyLine(line) {
  return (
    line.includes("node_modules") || line.includes("node:internal")
  );
}

function parseError(stderr) {
  const lines = stderr.split("\n").map((l) => l.trimEnd());

  const mainError = extractMainError(lines);
  const location = extractLocation(lines);

  return { mainError, location };
}

/**
 * Find the first line that looks like an error message.
 * Covers patterns like:
 *   TypeError: Cannot read properties of undefined
 *   SyntaxError: Unexpected token '}'
 *   ReferenceError: foo is not defined
 *   Error: ENOENT: no such file or directory
 */
function extractMainError(lines) {
  const errorPattern = /^(\w*Error):\s*.+/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (errorPattern.test(trimmed)) {
      return trimmed;
    }
  }

  // Fallback: return the first non-empty line
  for (const line of lines) {
    if (line.trim().length > 0) return line.trim();
  }

  return "Unknown error";
}

/**
 * Find the exact file + line number responsible for the error.
 *
 * Strategy 1 — Runtime stack frames:
 *   Lines starting with "    at " (V8 stack trace format).
 *   Examples:
 *     at Object.<anonymous> (/Users/name/app.js:10:5)
 *     at /Users/name/app.js:10:5
 *
 * Strategy 2 — Syntax error header:
 *   Node prints the absolute file path as the very first line for syntax errors:
 *     /Users/name/app.js:14
 *     SyntaxError: ...
 */
function extractLocation(lines) {
  // Strategy 2: absolute path line followed (soon) by a SyntaxError line.
  const absolutePathPattern =
    /^(\/[^\s:]+\.(?:js|mjs|cjs|ts|mts|cts)):(\d+)$/;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (absolutePathPattern.test(trimmed) && !isNoisyLine(trimmed)) {
      const m = trimmed.match(absolutePathPattern);
      const relativePath = path.relative(process.cwd(), m[1]);
      return `${relativePath}:${m[2]}`;
    }
  }

  // Strategy 1: first user-land "at" frame in the stack trace.
  const atFramePattern =
    /at\s+(?:\S+\s+)?\(?(\/[^\s:)]+\.(?:js|mjs|cjs|ts|mts|cts)):(\d+):\d+\)?/;
  for (const line of lines) {
    if (!line.trimStart().startsWith("at ")) continue;
    if (isNoisyLine(line)) continue;
    const m = line.match(atFramePattern);
    if (m) {
      const relativePath = path.relative(process.cwd(), m[1]);
      return `${relativePath}:${m[2]}`;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

const BOX_WIDTH = 60;

function pad(text, width) {
  const visibleLen = stripAnsi(text).length;
  const padding = width - visibleLen;
  return text + " ".repeat(Math.max(0, padding));
}

/** Minimal ANSI escape stripper for accurate width calculation. */
function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*m/g, "");
}

function boxLine(content) {
  const inner = BOX_WIDTH - 2; // subtract the two side border chars
  return pc.red("│") + " " + pad(content, inner - 1) + pc.red("│");
}

function wrapText(text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if (current.length + word.length + (current ? 1 : 0) > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function printErrorBox({ mainError, location }) {
  const innerWidth = BOX_WIDTH - 2;
  const contentWidth = innerWidth - 2; // one space padding each side

  const top = pc.red("╭" + "─".repeat(BOX_WIDTH - 2) + "╮");
  const bottom = pc.red("╰" + "─".repeat(BOX_WIDTH - 2) + "╯");
  const divider = pc.red("├" + "─".repeat(BOX_WIDTH - 2) + "┤");

  // Title
  const titleText = "💥 TLDR ERROR";
  const titlePad = Math.floor(
    (contentWidth - stripAnsi(titleText).length) / 2,
  );
  const titleLine = boxLine(
    " ".repeat(titlePad) + pc.bold(pc.white(titleText)),
  );

  // Error lines
  const errorLabel = pc.bold(pc.red("Error: "));
  const errorLabelPlain = "Error: ";
  const errorContentWidth = contentWidth - errorLabelPlain.length;
  const errorWrapped = wrapText(mainError, errorContentWidth);
  const errorLines = errorWrapped.map((segment, i) => {
    if (i === 0)
      return boxLine(errorLabel + pc.bold(pc.white(segment)));
    return boxLine(
      " ".repeat(errorLabelPlain.length) + pc.white(segment),
    );
  });

  // Location lines
  let locationLines = [];
  if (location) {
    const whereLabel = pc.bold(pc.yellow("Where: "));
    const whereLabelPlain = "Where: ";
    const whereContentWidth = contentWidth - whereLabelPlain.length;
    const whereWrapped = wrapText(location, whereContentWidth);
    locationLines = whereWrapped.map((segment, i) => {
      if (i === 0) return boxLine(whereLabel + pc.cyan(segment));
      return boxLine(
        " ".repeat(whereLabelPlain.length) + pc.cyan(segment),
      );
    });
  }

  const emptyLine = boxLine("");

  console.error("");
  console.error(top);
  console.error(emptyLine);
  console.error(titleLine);
  console.error(emptyLine);
  console.error(divider);
  console.error(emptyLine);
  errorLines.forEach((l) => console.error(l));
  if (locationLines.length > 0) {
    console.error(emptyLine);
    locationLines.forEach((l) => console.error(l));
  }
  console.error(emptyLine);
  console.error(bottom);
  console.error("");
}
