import * as fs from 'fs';
import * as path from 'path';
const report = require('multiple-cucumber-html-reporter');

// Handle any uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process, let the report generation complete
});

interface CustomData {
    label: string;
    value: string;
}
interface ReporterOptions {
    jsonDir: string;
    reportPath: string;
    displayDuration: boolean;
    durationInSeconds: boolean;
    displayReportTime: boolean;
    pageTitle: string;
    reportName: string;
    metadata: {
        browser: {
            name: string;
        };
        device: string;
        platform: {
            name: string;
        };
    };
    customData: {
        title: string;
        data: CustomData[];
    };
    saveCollectedJSON: boolean;
    displayDurationInMS: boolean;
    disableLog: boolean;
    pageFooter: string;
}

// Function to format date time with seconds
function getFormattedDateTime(): string {
    const now = new Date();
    return now.toISOString()
        .replace(/[:-]/g, '')
        .replace(/[T.]/g, '_')
        .slice(0, 15); // Gets format like: YYYYMMDD_HHMMSS
}

// Function to read and parse the cucumber report JSON
function processTestResults(jsonPath: string): { totalTests: number; failedTests: number; failureDetails: any[] } {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const results = JSON.parse(jsonContent);
    const failureDetails: any[] = [];
    let totalTests = 0;
    let failedTests = 0;

    results.forEach((feature: any) => {
        feature.elements?.forEach((scenario: any) => {
            totalTests++;
            const failed = scenario.steps.some((step: any) => step.result.status === 'failed');
            if (failed) {
                failedTests++;
                const failedStep = scenario.steps.find((step: any) => step.result.status === 'failed');
                failureDetails.push({
                    scenario: scenario.name,
                    step: failedStep.name,
                    error: failedStep.result.error_message
                });
            }
        });
    });

    return { totalTests, failedTests, failureDetails };
}

// Get unique timestamp for this run
const timestamp = getFormattedDateTime();
const reportDir = path.join('reports', timestamp);

// Create directory if it doesn't exist
if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
}

// Create html-report directory
const htmlReportDir = path.join(reportDir, 'html-report');
if (!fs.existsSync(htmlReportDir)) {
    fs.mkdirSync(htmlReportDir, { recursive: true });
}

// Process test results
const jsonReport = path.join('reports', 'cucumber-report.json');
const newJsonPath = path.join(reportDir, 'cucumber-report.json');

try {
    if (fs.existsSync(jsonReport)) {
        // Copy the JSON file (don't move it)
        fs.copyFileSync(jsonReport, newJsonPath);

        // Process test results
        const { totalTests, failedTests, failureDetails } = processTestResults(jsonReport);

        // Create custom HTML for failed tests
        const failureHtml = failureDetails.map(failure => {
            const safeId = failure.scenario.replace(/[^a-zA-Z0-9]/g, '-');
            return `
            <div class="failure-detail">
                <h4>Failed Scenario: ${failure.scenario}</h4>
                <p>Failed Step: ${failure.step}</p>
                <div class="error-message" id="error-${safeId}">
                    <pre>${failure.error}</pre>
                    <button class="copy-button" onclick="copyError('${safeId}')">Copy Error</button>
                </div>
            </div>
        `;
        }).join('');

        const options: ReporterOptions = {
            jsonDir: reportDir,
            reportPath: path.join(reportDir, 'html-report'),
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
                    { label: 'Project', value: 'Sauce Demo Testing' },
                    { label: 'Total Tests', value: totalTests.toString() },
                    { label: 'Failed Tests', value: failedTests.toString() },
                    { label: 'Execution Time', value: new Date().toISOString() },
                    { label: 'Report Directory', value: reportDir }
                ]
            },
            saveCollectedJSON: true,
            disableLog: false,
            pageFooter: `
            <style>
                .failure-summary {
                    margin: 20px;
                    padding: 20px;
                    border: 2px solid #ff0000;
                    border-radius: 8px;
                    background-color: #fff5f5;
                    box-shadow: 0 2px 4px rgba(255, 0, 0, 0.1);
                }
                .failure-detail {
                    margin: 15px 0;
                    padding: 20px;
                    border: 1px solid #ffcccc;
                    border-radius: 6px;
                    background-color: white;
                }
                .error-message {
                    background-color: #f8f8f8;
                    padding: 15px;
                    margin: 15px 0;
                    border-radius: 6px;
                    border: 1px solid #e0e0e0;
                }
                .error-message pre {
                    margin: 10px 0;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    font-family: monospace;
                }
                .copy-button {
                    display: inline-block;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 15px;
                    font-size: 14px;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }
                .copy-button:hover {
                    background-color: #0056b3;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .copy-button.copied {
                    background-color: #28a745;
                }
                .failure-summary h3 {
                    color: #dc3545;
                    margin-bottom: 20px;
                    font-size: 24px;
                }
                .failure-detail h4 {
                    color: #721c24;
                    margin-bottom: 15px;
                    font-size: 18px;
                }
            </style>
            ${failedTests > 0 ? `
            <div class="failure-summary">
                <h3>Failed Tests Summary</h3>
                ${failureHtml}
            </div>
            ` : ''}
            <script>
                async function copyError(scenarioId) {
                    try {
                        const errorDiv = document.getElementById('error-' + scenarioId);
                        const errorText = errorDiv.querySelector('pre').textContent;
                        
                        // Try to use the modern clipboard API
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            await navigator.clipboard.writeText(errorText);
                        } else {
                            // Fallback for older browsers
                            const textarea = document.createElement('textarea');
                            textarea.value = errorText;
                            document.body.appendChild(textarea);
                            textarea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textarea);
                        }

                        const button = errorDiv.querySelector('.copy-button');
                        button.textContent = 'Copied!';
                        button.classList.add('copied');
                        
                        // Reset button after 2 seconds
                        setTimeout(() => {
                            button.textContent = 'Copy Error';
                            button.classList.remove('copied');
                        }, 2000);

                        // Show a prompt with the error message
                        alert('Error message copied to clipboard:\\n\\n' + errorText);
                    } catch (err) {
                        console.error('Failed to copy error:', err);
                        alert('Failed to copy error message. Please try again.');
                    }
                }
            </script>
        `
        };

        try {
            // Generate report using the reporter
            report.generate(options);

            console.log(`
========================================
Test Execution Report Generated
----------------------------------------
Location: ${path.join(reportDir, 'html-report', 'index.html')}
Total Tests: ${totalTests}
Failed Tests: ${failedTests}
Report Timestamp: ${timestamp}
========================================
        `);

            if (failedTests > 0) {
                console.log(`
Failed Test Details:
${failureDetails.map(failure => `
Scenario: ${failure.scenario}
Failed Step: ${failure.step}
Error: ${failure.error}
----------------------------------------`).join('\n')}
            `);
            }
            else {
                console.error('No cucumber-report.json file found. Did the tests run successfully?');
                process.exit(1);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            // Try to generate report even when there are failures
            report.generate(options);
        }
    } else {
        console.error('No cucumber-report.json file found. Did the tests run successfully?');
        process.exit(1);
    }
} catch (error) {
    console.error('Error processing test results:', error);
}


