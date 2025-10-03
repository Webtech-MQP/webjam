import { createTransport } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

const transportConfig: SMTPTransport.Options = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};

const transporter = createTransport(transportConfig);

export async function verifySMTP() {
    await transporter.verify();
    console.log('SMTP Transport valid');
}

interface EmailData {
    to: string;
    name: string;
    subject: string;
    html: string;
}

function sendEmail(data: EmailData) {
    try {
        console.log('Sending email... to:', data.to, 'name:', data.name);
        const mailOptions: Mail.Options = {
            from: '"WebJam Team" <noreply@mosaiq.dev>',
            to: data.to,
            subject: data.subject,
            html: data.html,
        };
        void transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Error while sending mail', err);
    }
}

export function sendWelcomeEmail(data: { to: string; name: string }) {
    const emailData: EmailData = {
        to: data.to,
        name: data.name,
        subject: 'Welcome to WebJam!',
        html: `
<div>
    <h1>Welcome to WebJam, ${data.name}!</h1>
    <p>We're excited to have you on board. Start creating and sharing your projects today!</p>
    <p>Best regards,<br/>The WebJam Team</p>
</div>
`,
    };
    sendEmail(emailData);
}

export function sendJamSignedUpEmail(data: { to: string; name: string; jamName: string; jamUrl: string; startEpoch: number }) {
    const niceStart = new Date(data.startEpoch * 1000).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short', timeZone: 'UTC' });
    const emailData: EmailData = {
        to: data.to,
        name: data.name,
        subject: `You've signed up for the jam "${data.jamName}"!`,
        html: `
<div>
    <h1>You've signed up for the jam "${data.jamName}", ${data.name}!</h1>
    <p>Thank you for signing up for the jam. We're thrilled to have you participate!</p>
    <p><strong>Starts:</strong> ${niceStart}</p>
    <p>Make sure to mark your calendar and prepare your ideas. You can view the jam details and rules here: <a href="${data.jamUrl}">${data.jamUrl}</a></p>
    <p>You'll receive another email when the jam starts with all the information you need to get going.</p>
    <p>If you have any questions, feel free to reach out to us at <a href="mailto:webjamsupport@mosaiq.dev">webjamsupport@mosaiq.dev</a>.</p>
    <p>Happy jamming!,<br/>The WebJam Team</p>
</div>
`,
    };
    sendEmail(emailData);
}

export function sendJamStartEmail(data: { to: string; name: string; teamName: string; jamName: string; jamUrl: string; startEpoch: number; endEpoch: number }) {
    const niceStart = new Date(data.startEpoch * 1000).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short', timeZone: 'UTC' });
    const niceEnd = new Date(data.endEpoch * 1000).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short', timeZone: 'UTC' });
    const emailData: EmailData = {
        to: data.to,
        name: data.name,
        subject: `The jam "${data.jamName}" has started!`,
        html: `
<div>
    <h1>The jam "${data.jamName}" has started, ${data.name}!</h1>
    <p>The jam is now live! You can start working on your projects.</p>
    <p><strong>Starts:</strong> ${niceStart}<br/>
       <strong>Ends:</strong> ${niceEnd}</p>
    <p>Get in contact with your team (${data.teamName}) and start jamming! Submit your projects before the deadline.</p>
    <p>Check out the jam here: <a href="${data.jamUrl}">${data.jamUrl}</a></p>
    <p>If you have any questions, feel free to reach out to us at <a href="mailto:webjamsupport@mosaiq.dev">webjamsupport@mosaiq.dev</a>.</p>
    <p>Happy jamming!,<br/>The WebJam Team</p>
</div>
`,
    };
    sendEmail(emailData);
}

export function sendJamEndEmail(data: { to: string; name: string; jamName: string; jamUrl: string }) {
    const emailData: EmailData = {
        to: data.to,
        name: data.name,
        subject: `The jam "${data.jamName}" has ended!`,
        html: `
<div>
    <h1>The jam "${data.jamName}" has ended, ${data.name}!</h1>
    <p>The submission period is over. You can no longer submit projects, but you can still view others' submissions.</p>
    <p>The WebJam team will now review the submissions and announce the winners soon. Stay tuned!</p>
    <p>Visit the jam here: <a href="${data.jamUrl}">${data.jamUrl}</a></p>
    <p>Thank you for participating,<br/>The WebJam Team</p>
</div>
`,
    };
    sendEmail(emailData);
}

export function sendJudgedEmail(data: { to: string; name: string; jamName: string; jamUrl: string }) {
    const emailData: EmailData = {
        to: data.to,
        name: data.name,
        subject: `Your project has been judged in the jam "${data.jamName}"!`,
        html: `
<div>
    <h1>Your project has been judged, ${data.name}!</h1>
    <p>Your submission in the jam "${data.jamName}" has received new judgments. Check out the feedback and scores from the judges.</p>
    <p>View your project here: <a href="${data.jamUrl}">${data.jamUrl}</a></p>
    <p>Keep up the great work,<br/>The WebJam Team</p>
</div>
`,
    };
    sendEmail(emailData);
}

export function sendUserReportedEmail(data: { adminEmail: string; reporterName: string; reportedName: string; reason: string; description: string; reportId: string }) {
    const emailData: EmailData = {
        to: data.adminEmail,
        name: 'Admin',
        subject: `User Reported`,
        html: `
<div>
    <h1>A user has been reported</h1>
    <p><strong>Reported by:</strong> ${data.reporterName}</p>
    <p><strong>Reported user:</strong> ${data.reportedName}</p>
    <p><strong>Reason:</strong> ${data.reason}</p>
    <p><strong>Description:</strong> ${data.description}</p>
    <p><strong>Report ID:</strong> ${data.reportId}</p>
    <p>Please review the report and take appropriate action.</p>
    <p>Thank you,<br/>The WebJam Team</p>
</div>
`,
    };
    sendEmail(emailData);
}
