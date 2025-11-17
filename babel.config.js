module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
            '@screens': './src/screens',
            '@components': './src/components',
            '@utils': './src/utils',
            '@services': './src/services',
            '@types': './src/types',
            '@store': './src/store',
            '@hooks': './src/hooks',
            '@theme': './src/theme',
          },
        },
      ],
    ],
  };
};
