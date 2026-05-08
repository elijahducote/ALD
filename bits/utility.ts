import { lookup } from "mrmime";
import {print} from "../lib/utility.js";
import axios from "axios";
import type { Props, ChildDom, VanTags } from "./ilk/util.ts";

function htm(
  tags: VanTags,
  content: ChildDom | ChildDom[],
  nomer?: string,
  attr?: Props
): Element {
  const args: (Props | ChildDom)[] = [];
  if (attr) args[0] = attr;
  if (!nomer) nomer = "span";
  if (Array.isArray(content)) {
    const contentArr: ChildDom[] = content;
    let itR8: number = contentArr.length,
    nth: number = itR8;
    for (;itR8;--itR8) {
      args.push(contentArr[nth - itR8]);
    }
  }
  else args.push(content);
  return tags[nomer](args[0], ...args.slice(1) as ChildDom[]);
}

function capitalize(string: string) : string {
  if (string.length === 0) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function findMimeType(link: string): Promise<string | false> {
  const prefX: string = "http";
  let i: number = 4,
  matches: number = 0,
  char: number,
  cur: number,
  pos: number;

  // Check whether or not resource starts with http protocol
  for (;i;--i) {
    cur = 4 - i;
    char = prefX.charCodeAt(cur);
    pos = link.charCodeAt(cur);
    if (pos === char || pos === char-32) ++matches;
  }

  // Matches protocol = external link
  if (matches === 4) {
    let mimetype: string | false = "",
    isSecure: number = link.charCodeAt(4),
    formatted: string;

    // Convert to https
    if (isSecure === 115  || isSecure === 83) formatted = link;
    else formatted = "https" + link.slice(4);

    // Make a request to get mimetype
    await axios.get<void>(formatted)
    .then((res) => {
      const header: string = String(res.headers["content-type"] ?? ""),
      length: number = header.length;
      let itR8: number = length,
      cur: number,
      char: number;

      // Trim header to mimetype
      for (;itR8;--itR8) {
        cur = length - itR8;
        char = header.charCodeAt(cur);
        switch (char) {
          case 9: // tab
          case 32:  // space
          case 34: // quote
          case 92: // backslash
            continue;
          case 59:  // semi-colon
            return;
        }
        (mimetype as string) += String.fromCharCode(char);
      }
    }).catch((err: Error) => {
      print(err.message);
      mimetype = false;
    });
    return mimetype;
  }
  // Treat as local resource
  else {
    let itR8: number = link.length,
    ext: string = "",
    code: number;

    for (;itR8;--itR8) {
      code = link.charCodeAt(itR8-1);

      // Check if period then return.
      if (code == 46) return lookup(ext) || false;
      else if (!(itR8-1)) return false;

      // Cap length at 9
      if (ext.length >= 9) return false;

      // Normalize extension uppercase to lowercase
      if (code > 64 && code < 91) code += 32;
      ext = String.fromCodePoint(code) + ext;

    }

    return false;
  }
}

function withinRange(value: number, range: number): number {
 return (((value | range) === range) ? 1 : 0) & ((~value >>> 31) & 1);
}


export {
  htm,
  capitalize,
  findMimeType,
  withinRange
};