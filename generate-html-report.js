const report = require('multiple-cucumber-html-reporter');
const path = require('path');
const fs = require('fs');

// Function to process the cucumber report JSON
function processTestResults(jsonPath) {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const results = JSON.parse(jsonContent);
    const failureDetails = [];
    let totalTests = 0;
    let failedTests = 0;

    results.forEach((feature) => {
        feature.elements?.forEach((scenario) => {
            totalTests++;
            const failed = scenario.steps.some((step) => step.result.status === 'failed');
            if (failed) {
                failedTests++;
                const failedStep = scenario.steps.find((step) => step.result.status === 'failed');
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

try {
    // Create html-report directory
    const htmlReportDir = path.join('reports', 'html-report');
    if (!fs.existsSync(htmlReportDir)) {
        fs.mkdirSync(htmlReportDir, { recursive: true });
    }

    // Check if the JSON report exists
    const jsonReportPath = path.join('reports', 'cucumber-report.json');
    if (!fs.existsSync(jsonReportPath)) {
        console.error('No cucumber-report.json file found!');
        process.exit(1);
    }

    // Process test results
    const { totalTests, failedTests, failureDetails } = processTestResults(jsonReportPath);

    // Create failure summary HTML
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

    // Generate the report
    report.generate({
        jsonDir: 'reports',
        reportPath: htmlReportDir,
        displayDuration: true,
        durationInSeconds: true,
        displayReportTime: true,
        displayDurationInMS: true,
        pageTitle: 'Test Report',
        reportName: 'Test Automation Report',
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
                { label: 'Failed Tests', value: failedTests.toString() }
            ]
        },
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
                    background-color: #f8f8f8;
                    padding: 10px;
                    border-radius: 4px;
                }
                .copy-button {
                    display: inline-block;
                    background-color: #dc3545;
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
                    background-color: #c82333;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .copy-button.copied {
                    background-color: #28a745;
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
                        
                        await navigator.clipboard.writeText(errorText);
                        
                        const button = errorDiv.querySelector('.copy-button');
                        button.textContent = 'Copied!';
                        button.classList.add('copied');
                        
                        setTimeout(() => {
                            button.textContent = 'Copy Error';
                            button.classList.remove('copied');
                        }, 2000);

                        alert('Error message copied to clipboard:\\n\\n' + errorText);
                    } catch (err) {
                        console.error('Failed to copy error:', err);
                        alert('Failed to copy error message. Please try again.');
                    }
                }

                // Add failure summary to the top of the report
                window.addEventListener('load', function() {
                    const mainContainer = document.querySelector('.container');
                    const failureSummary = document.querySelector('.failure-summary');
                    if (mainContainer && failureSummary) {
                        mainContainer.insertBefore(failureSummary, mainContainer.firstChild);
                    }
                });
            </script>
        `
    });

    console.log(`Report generated at: ${path.resolve(htmlReportDir)}`);
} catch (error) {
    console.error('Error generating report:', error);
}
