export const geckoApi = {
  base: "https://api.coingecko.com/api/v3/",
  list() {
    return `${this.base}/coins/list`;
  },
};