import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));

function rewriteAuthPaths(req, _res, next) {
  const url = req.url || '';
  const path = url.split('?')[0];
  if (path === '/sign-in' || path === '/sign-in/') req.url = '/sign-in.html' + url.slice(path.length);
  else if (path === '/sign-up' || path === '/sign-up/') req.url = '/sign-up.html' + url.slice(path.length);
  next();
}

function authPaths() {
  return {
    name: 'auth-paths',
    configureServer(server) {
      server.middlewares.use(rewriteAuthPaths);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewriteAuthPaths);
    },
  };
}

export default defineConfig({
  plugins: [authPaths()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        signIn: resolve(root, 'sign-in.html'),
        signUp: resolve(root, 'sign-up.html'),
      },
    },
  },
});
