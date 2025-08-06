const report = require('multiple-cucumber-html-reporter');

report.generate({
    jsonDir: './reports/',
    reportPath: './reports/cucumber-html-report/',
    metadata: {
        browser: {
            name: 'chrome',
            version: 'latest'
        },
        device: 'Desktop',
        platform: {
            name: 'Windows',
            version: '10'
        }
    },
    customData: {
        title: 'Run info',
        data: [
            {name: 'Project', value: 'SauceDemo Test Automation'},
            {name: 'Release', value: '1.0.0'},
            {name: 'Environment', value: 'Production'}
        ]
    }
});
