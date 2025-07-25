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

export async function sendEmail() {
    try {
        const mailOptions: Mail.Options = {
            from: '"Mosaiq Team" <noreply@mosaiq.dev>',
            to: 'matthagger64@gmail.com',
            subject: 'Important Security Updates to Your Account',
            text: 'Hello Matt, you have 8 important security notifications awaiting you in your account. Login at https://mosaiq.dev to review these changes.',
            html: '<b>Hello Matt, you have 8 important security notifications awaiting you in your account. <a href="https://mosaiq.dev">Login at https://mosaiq.dev</a> to review these changes.</b>',
        };
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (err) {
        console.error('Error while sending mail', err);
    }
}
