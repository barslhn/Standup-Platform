import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsGateway } from './events.gateway';
import { ConnectionManagerService } from './connection-manager.service';
import { WsAuthGuard } from './ws-auth.guard';
import { AppConfigModule } from '../../common/config/app-config.module';

@Global()
@Module({
  imports: [AppConfigModule, JwtModule.register({})],
  providers: [EventsGateway, ConnectionManagerService, WsAuthGuard],
  exports: [EventsGateway],
})
export class EventsModule {}
