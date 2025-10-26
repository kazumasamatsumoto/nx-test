import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'feature-products',
  exposes: {
    './Routes': 'apps/frontend/feature-products/src/app/remote-entry/entry.routes.ts',
  },
};

export default config;
