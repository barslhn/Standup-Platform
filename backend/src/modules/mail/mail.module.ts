import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { AppConfigModule } from '../../common/config/app-config.module';
import { MailAdapter } from './adapters/mail.adapter';
import { ResendMailAdapter } from './adapters/resend-mail.adapter';

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [
    MailService,
    {
      provide: MailAdapter,
      useClass: ResendMailAdapter,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
