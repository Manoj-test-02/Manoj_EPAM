const report = require('multiple-cucumber-html-reporter');
const path = require('path');
const fs = require('fs');

// Create reports directory if it doesn't exist
if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports');
}

// Create html-report directory
const htmlReportDir = path.join('reports', 'html-report');
if (!fs.existsSync(htmlReportDir)) {
    fs.mkdirSync(htmlReportDir, { recursive: true });
}

// Generate the HTML report
report.generate({
    jsonDir: 'reports',
    reportPath: htmlReportDir,
    displayDuration: true,
    durationInSeconds: true,
    displayReportTime: true,
    displayDurationInMS: true,
    pageTitle: 'Sauce Demo Test Report',
    reportName: 'Sauce Demo Automation Test Results',
    metadata: {
        browser: {
            name: 'chrome'
        },
        device: 'Local Machine',
        platform: {
            name: 'windows'
        }
    },
    customData: {
        title: 'Test Execution Info',
        data: [
            { label: 'Project', value: 'Sauce Demo Testing' }
        ]
    },
    saveCollectedJSON: true,
    disableLog: false
});
