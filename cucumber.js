const common = {
  requireModule: ['ts-node/register'],
  require: ['e2e/step-definitions/**/*.ts', 'e2e/support/**/*.ts'],
  format: ['@cucumber/pretty-formatter', 'summary'],
  formatOptions: {
    snippetInterface: 'async-await'
  },
  publishQuiet: true
};

module.exports = {
  default: {
    ...common,
    paths: ['e2e/features/**/*.feature'],
    format: [
      '@cucumber/pretty-formatter',
      'summary',
      'json:reports/cucumber-report.json'
    ]
  }
};
