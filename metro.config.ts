import { getDefaultConfig } from 'expo/metro-config';
import path from 'path';

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name: string) =>
      path.join(__dirname, `node_modules/${name}`),
  }
);

config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
  },
};

module.exports = config;
