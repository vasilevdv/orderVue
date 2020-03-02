module.exports = {
  outputDir: './vue-build',
  productionSourceMap: false,
  filenameHashing: false,
  chainWebpack: (config) => {
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
  },
  configureWebpack: {},
};
