import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../common/config/app-config.service';
import { MailAdapter } from './adapters/mail.adapter';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly configService: AppConfigService,
    private readonly mailAdapter: MailAdapter,
  ) {}

  async sendResetPasswordEmail(email: string, token: string, name: string) {
    const resetUrl = `${this.configService.frontendUrl}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a;">Hello ${name},</h2>
        <p style="color: #475569; line-height: 1.6;">
          We have received a request to reset the password for your account. You can reset your password by clicking the button below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: 500; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          This link will expire in 1 hour. If you did not request this, please ignore this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">
          Sent by the Standup Platform team.
        </p>
      </div>
    `;

    return this.mailAdapter.send({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
  }
}
