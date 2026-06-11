module.exports = {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write", () => "tsc --noEmit"],
  "*.{css,json,md}": ["prettier --write"],
};
