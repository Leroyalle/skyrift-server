const baseConfig = require('@saintleroyalle/core/eslint');

module.exports = [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
];
