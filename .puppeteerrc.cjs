// Use one headless browser for both PDF exporters.
module.exports = {
  chrome: { skipDownload: true },
  'chrome-headless-shell': { skipDownload: false }
};
