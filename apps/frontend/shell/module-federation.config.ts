import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'shell',
  remotes: [
    ['feature-users', 'http://localhost:4201'],
    ['feature-products', 'http://localhost:4202']
  ]
};

/**
* Nx requires a default export of the config to allow correct resolution of the module federation graph.
**/
export default config;
