import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export class EmailReporter {
    constructor() {}

    async sendTestReport(testResults: any) {
        const sendEmail = (process.env.SEND_EMAIL || '').toLowerCase() === 'true';
        if (!sendEmail) {
            console.log('Email reporting is disabled via SEND_EMAIL in .env');
            return;
        }

        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_APP_PASSWORD;
        const recipients = process.env.EMAIL_RECIPIENTS;
        const subject = process.env.EMAIL_SUBJECT || 'Test Automation Report';
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
        const smtpSecure = (process.env.SMTP_SECURE || 'true') === 'true';

        if (!emailUser || !emailPass || !recipients) {
            console.error('Missing email credentials or recipients in .env');
            return;
        }

        try {
            console.log('Setting up email transport with:', {
                email: emailUser,
                passwordLength: emailPass?.length,
                smtpHost, smtpPort, smtpSecure
            });

            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpSecure,
                auth: {
                    user: emailUser,
                    pass: emailPass
                },
                debug: true
            });

            const htmlContent = await this.generateEmailContent(testResults);
            const attachments = await this.getAttachments();

            const mailOptions = {
                from: emailUser,
                to: recipients,
                subject: subject,
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
        const attachScreenshots = (process.env.ATTACH_SCREENSHOTS || 'true').toLowerCase() === 'true';
        if (attachScreenshots) {
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
