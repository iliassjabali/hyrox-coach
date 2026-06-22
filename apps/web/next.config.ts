import type { NextConfig } from 'next';

const NATIVE_EXTERNALS = ['@libsql/client', 'libsql', '@libsql/hrana-client'];

const config: NextConfig = {
  // Internal packages ship raw TS — Next transpiles them.
  transpilePackages: ['@hyrox/trpc', '@hyrox/training', '@hyrox/db'],
  // Keep the native libSQL driver out of the server bundle.
  serverExternalPackages: NATIVE_EXTERNALS,
  // serverExternalPackages does not apply to deps pulled in via transpilePackages
  // (@hyrox/db -> @libsql/client), so externalize them explicitly on the server.
  webpack: (webpackConfig, { isServer }) => {
    if (isServer) {
      webpackConfig.externals = [
        ...(Array.isArray(webpackConfig.externals) ? webpackConfig.externals : []),
        ...NATIVE_EXTERNALS,
      ];
    }
    return webpackConfig;
  },
};

export default config;
