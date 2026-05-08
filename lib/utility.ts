import type {
  stringPair,
  spawnConfig
} from "./ilk/utll.ts";
import type {
  page
} from "./ilk/sitemap.ts";
import { existsSync } from "node:fs";

// Turns array of strings into object by grouping indexes near eachother
function getArrayProp(arr: string[]): stringPair {
  const nth: number = arr.length;
  const converted: stringPair = {};

  let itR8: number = nth;
  let cur: number;

  if ((nth & 1) === 1) throw new Error("Missing value!");

  for (; itR8; --itR8) {
    cur = nth - itR8;
    if ((cur & 1) === 1) continue;
    converted[arr[cur]] = arr[cur + 1];
  }
  return converted;
}

// Get all the paths in the siteIndex array
function collectPaths(pages: page[]): string[] {
  const nth: number = pages.length;
  const list: string[] = [];

  let itR8: number = nth;
  let cur: number;
  for (; itR8; --itR8) {
    cur = nth - itR8;
    list[cur] = pages[cur].name;
  }
  return list;
}

const ANSI: stringPair = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  italic: '\x1b[3m',
  dim: '\x1b[2m',
  strike: '\x1b[9m',

  mystery: '\x1b[95m',
  prompt: '\x1b[96m',
  aid: '\x1b[93m',
  success: '\x1b[92m',
  fail: '\x1b[91m',
  test: '\x1b[94m',
  cite: '\x1b[90m',
};

/**
 * High-performance Markdown parser for terminal formatting
 */
function parseMarkdown(text: string, activeColor: string = ''): string {
  const len: number = text.length;
  let result: string = '';
  let i = 0;

  while (i < len) {
    const char: string = text[i];
    const next: string | undefined = text[i + 1];

    // Escape: \
    if (char === '\\' && next) {
      result += next;
      i += 2;
      continue;
    }

    // Color: {tag}...{/tag}
    if (char === '{') {
      const tagEnd: number = text.indexOf('}', i + 1);
      if (tagEnd !== -1) {
        const tag: string = text.slice(i + 1, tagEnd);

        if (ANSI[tag]) {
          const closeTag: string = `{/${tag}}`;
          const closeIdx: number = text.indexOf(closeTag, tagEnd + 1);

          if (closeIdx !== -1) {
            const content: string = text.slice(tagEnd + 1, closeIdx);
            result += ANSI[tag] + parseMarkdown(content, ANSI[tag]) + ANSI.reset + activeColor;
            i = closeIdx + closeTag.length;
            continue;
          }
        }
      }
    }

    // Bold: ** or __
    if ((char === '*' && next === '*') || (char === '_' && next === '_')) {
      const marker: string = char + char;
      const closeIdx: number = text.indexOf(marker, i + 2);

      if (closeIdx !== -1) {
        const content: string = text.slice(i + 2, closeIdx);
        result += ANSI.bold + parseMarkdown(content, activeColor) + ANSI.reset + activeColor;
        i = closeIdx + 2;
        continue;
      }
    }

    // Italic: * or _
    if (char === '*' || char === '_') {
      const closeIdx: number = text.indexOf(char, i + 1);

      if (closeIdx !== -1 && text[closeIdx + 1] !== char) {
        const content: string = text.slice(i + 1, closeIdx);
        result += ANSI.italic + parseMarkdown(content, activeColor) + ANSI.reset + activeColor;
        i = closeIdx + 1;
        continue;
      }
    }

    // Strikethrough: ~~
    if (char === '~' && next === '~') {
      const closeIdx: number = text.indexOf('~~', i + 2);

      if (closeIdx !== -1) {
        const content: string = text.slice(i + 2, closeIdx);
        result += ANSI.strike + parseMarkdown(content, activeColor) + ANSI.reset + activeColor;
        i = closeIdx + 2;
        continue;
      }
    }

    // Code: `
    if (char === '`') {
      const closeIdx: number = text.indexOf('`', i + 1);

      if (closeIdx !== -1) {
        result += ANSI.dim + text.slice(i + 1, closeIdx) + ANSI.reset + activeColor;
        i = closeIdx + 1;
        continue;
      }
    }

    // Regular character
    result += char;
    i++;
  }

  return result;
}

function print(msg: string): void {
  msg = parseMarkdown(msg);
  const cfg: spawnConfig = {
    cmd: [],
    env: process.env,
    stdout: "inherit",
    stderr: "inherit"
  };

  if (process?.platform === "win32") {
    cfg.cmd[0] = "C:\\Windows\\System32\\cmd.exe";
    cfg.cmd[1] = "/c";
    cfg.cmd[2] = `echo ${msg}`;
  } else {
    // Check for bash first, fall back to sh
    if (existsSync("/bin/bash")) cfg.cmd[0] = "/bin/bash";
    else if (existsSync("/usr/bin/bash")) cfg.cmd[0] = "/usr/bin/bash";
    else cfg.cmd[0] = "/bin/sh";
    cfg.cmd[1] = "-c";
    cfg.cmd[2] = `echo ${msg}`;
  }

  Bun.spawnSync(cfg);
}

export {getArrayProp, collectPaths, print};