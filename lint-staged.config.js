/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  Dockerfile: () => 'docker build --check .',
  '*.css': 'stylelint --fix',
  '*.prisma': 'prisma format --schema',
  '*.svg': 'svgo',
  '*': 'prettier --ignore-unknown --write --ignore-path .gitignore',
};
