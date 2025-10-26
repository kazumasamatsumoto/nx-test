import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'feature-users',
  exposes: {
    './Routes': 'apps/frontend/feature-users/src/app/remote-entry/entry.routes.ts',
  },
};

export default config;
