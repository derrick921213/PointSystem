import { LoadContext, Plugin } from '@docusaurus/types';
import path from 'path';

export default function customNavbarPlugin(context: LoadContext): Plugin<void> {
  return {
    name: 'custom-navbar-plugin',
    configureWebpack(config, isServer, utils) {
      return {
        resolve: {
          alias: {
            GoogleLoginButton: path.resolve(__dirname, '../../components/GoogleLoginButton.tsx'),
          },
        },
      };
    },
  };
}
