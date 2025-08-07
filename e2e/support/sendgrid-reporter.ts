import * as sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as path from 'path';

interface EmailConfig {
    enabled: boolean;
    sender: {
        email: string;
    };
    recipients: string[];
    subject: string;
    includeHtmlReport: boolean;
    includeSummary: boolean;
}

export class SendGridReporter {
    private config: EmailConfig;

    constructor() {
        const configPath = path.join(process.cwd(), 'projectconfig.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.config = this.resolveEnvironmentVariables(config.emailReport);
        
        // Set SendGrid API Key
        sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
    }

    private resolveEnvironmentVariables(config: EmailConfig): EmailConfig {
        const resolvedConfig = JSON.parse(JSON.stringify(config));
        resolvedConfig.sender.email = process.env.EMAIL_USER || config.sender.email;
        resolvedConfig.recipients = [process.env.EMAIL_RECIPIENTS || config.recipients[0]];
        return resolvedConfig;
    }

    async sendReport(reportPath: string, summaryText: string): Promise<void> {
        if (!this.config.enabled) {
            console.log('Email reporting is disabled');
            return;
        }

        const htmlContent = this.config.includeHtmlReport 
            ? fs.readFileSync(reportPath, 'utf8')
            : '';

        const msg = {
            to: this.config.recipients,
            from: this.config.sender.email,
            subject: this.config.subject,
            text: this.config.includeSummary ? summaryText : '',
            html: htmlContent,
        };

        try {
            await sgMail.send(msg);
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}
