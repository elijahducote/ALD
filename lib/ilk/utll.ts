interface stringPair {
  [key: string]: string;
};

interface spawnConfig {
  cmd: string[];
  env: NodeJS.ProcessEnv;
  stdout: "inherit";
  stderr: "inherit";
}

export {
  stringPair,
  spawnConfig
};