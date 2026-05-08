import van from "vanjs-core";

import {htm,capitalize,findMimeType} from "../utility.js";
import {getArrayProp} from "../../lib/utility.js";


export default async function MetaData(tags,page,icons,siteName) {
  const head = htm(tags, [], "head");
  let elm,
  ext,
  nomer,
  isSupported = false;

  // Encoding
  if (page?.meta?.encoding) {
    van.add(head, htm(tags, undefined, "meta", {charset: page.meta.encoding}));
    van.add(head, htm(tags, undefined, "meta", {"http-equiv": "Content-Type", content: `text/html; charset=${page.meta.encoding}`}));
  }

  // Title
  let title;
  if (typeof page?.meta?.pageName === "string" && page.meta.pageName) {
    title = capitalize(page.meta.pageName);
  } else if (page?.name && siteName) {
    title = `${capitalize(page.name)} \u2014 ${siteName}`;
  } else {
    title = "Not Found!";
  }
  van.add(head, htm(tags, title, "title"));

  // Icons
  if (icons) van.add(head, icons);

  // Metatags
  if (page?.meta?.metatags?.length) {
    const pairs = getArrayProp(page.meta.metatags);
    for (const key in pairs) {
      van.add(head, htm(tags, undefined, "meta", {name: key, content: pairs[key]}));
    }
  }

  // Resources
  if (page?.meta?.resources?.length) {
    let itR8 = page.meta.resources.length,
    cur,
    res;

    for (;itR8;--itR8) {
      cur = page.meta.resources.length - itR8;
      res = page.meta.resources[cur];

      if (typeof res === "string") {
        ext = await findMimeType(res);
        elm = {};
        isSupported = false;

        switch (ext) {
          case "text/css": {
            nomer = "link";
            elm.href = res;
            elm.rel = "stylesheet";
            elm.type = ext;
            isSupported = true;
            break;
          }
          case "application/javascript":
          case "text/javascript": {
            nomer = "script";
            elm.src = res;
            elm.type = ext;
            isSupported = true;
            break;
          }
          default: {
            isSupported = false;
            break;
          }
        }

        if (isSupported) van.add(head, htm(tags, undefined, nomer, elm));
      } else if (res && typeof res === "object") {
        if (res.href) nomer = "link";
        else if (res.src) nomer = "script";
        else nomer = "meta";
        van.add(head, htm(tags, undefined, nomer, res));
      }
    }
  }

  return head;
}
