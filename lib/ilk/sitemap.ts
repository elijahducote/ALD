interface page {
  name: string,
  meta?: {
    metatags?: string[],
    pageName?: undefined | null | false | string,
    encoding?: undefined | null | false | string,
    resources?: (undefined | string | { [key: string]: string })[]
  },
};

interface sitemap {
  name: string,
  entrypoints: string[],
  siteIndex: page[],
}

export {
  page,
  sitemap
};