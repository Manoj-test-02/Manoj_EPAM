const common = `
  --require-module ts-node/register
  --require e2e/step-definitions/**/*.ts
  --require e2e/support/**/*.ts
  --format summary
  --format @cucumber/pretty-formatter
  --format-options '{"snippetInterface": "async-aware"}'
`;

module.exports = {
  default: `${common} e2e/features/**/*.feature`,
};
