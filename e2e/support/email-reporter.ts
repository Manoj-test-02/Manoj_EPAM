import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface EmailConfig {
    enabled: boolean;
    sender: {
        email: string;
        appPassword: string;
    };
    recipients: string[];
    subject: string;
    includeHtmlReport: boolean;
    includeSummary: boolean;
}

export class EmailReporter {
    private config: EmailConfig;

    constructor() {
        const configPath = path.join(process.cwd(), 'projectconfig.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.config = this.resolveEnvironmentVariables(config.emailReport);
    }

    private resolveEnvironmentVariables(config: EmailConfig): EmailConfig {
        // Deep clone the config to avoid modifying the original
        const resolvedConfig = JSON.parse(JSON.stringify(config));

        // Resolve environment variables for email and password
        resolvedConfig.sender.email = this.getEnvValue(resolvedConfig.sender.email);
        resolvedConfig.sender.appPassword = this.getEnvValue(resolvedConfig.sender.appPassword);

        // Resolve recipients
        if (Array.isArray(resolvedConfig.recipients)) {
            resolvedConfig.recipients = resolvedConfig.recipients.map((recipient: string) => 
                this.getEnvValue(recipient)
            );
        }

        return resolvedConfig;
    }

    private getEnvValue(value: string): string {
        if (value.startsWith('${') && value.endsWith('}')) {
            const envVar = value.slice(2, -1);
            const envValue = process.env[envVar];
            if (!envValue) {
                throw new Error(`Environment variable ${envVar} is not set`);
            }
            return envValue;
        }
        return value;
    }

    async sendTestReport(testResults: any) {
        if (!this.config.enabled) {
            console.log('Email reporting is disabled in projectconfig.json');
            return;
        }

        try {
            console.log('Setting up email transport with:', {
                email: this.config.sender.email,
                passwordLength: this.config.sender.appPassword?.length
            });
            
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: this.config.sender.email,
                    pass: this.config.sender.appPassword
                },
                debug: true
            });

            const htmlContent = await this.generateEmailContent(testResults);
            const attachments = await this.getAttachments();

            const mailOptions = {
                from: this.config.sender.email,
                to: this.config.recipients.join(','),
                subject: this.config.subject,
                html: htmlContent,
                attachments
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('Test report email sent successfully');
            return result;
        } catch (error) {
            console.error('Failed to send test report email:', error);
            throw error;
        }
    }

    private async generateEmailContent(testResults: any): Promise<string> {
        const summary = testResults.summary;
        const date = new Date().toLocaleString();

        return `
            <h2>Test Execution Report</h2>
            <p>Execution Date: ${date}</p>
            
            <h3>Summary:</h3>
            <ul>
                <li>Total Scenarios: ${summary.total}</li>
                <li>Passed: ${summary.passed}</li>
                <li>Failed: ${summary.failed}</li>
                <li>Skipped: ${summary.skipped}</li>
                <li>Duration: ${summary.duration}s</li>
            </ul>
            
            ${this.generateFailureSection(testResults.failures)}
            
            <p>Please find the detailed HTML report attached.</p>
        `;
    }

    private generateFailureSection(failures: any[]): string {
        if (!failures || failures.length === 0) {
            return '<p>All tests passed successfully! 🎉</p>';
        }

        return `
            <h3>Failed Scenarios:</h3>
            <ul>
                ${failures.map(failure => `
                    <li>
                        <strong>${failure.scenario}</strong><br>
                        Error: ${failure.error}
                    </li>
                `).join('')}
            </ul>
        `;
    }

    private async getAttachments(): Promise<any[]> {
        const attachments = [];

        if (this.config.includeHtmlReport) {
            const reportPath = path.join(process.cwd(), 'reports', 'html-report', 'index.html');
            if (fs.existsSync(reportPath)) {
                attachments.push({
                    filename: 'test-report.html',
                    path: reportPath
                });
            }
        }

        return attachments;
    }
}
