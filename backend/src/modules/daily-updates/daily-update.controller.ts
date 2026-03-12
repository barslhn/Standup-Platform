import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Cacheable } from '../../common/decorators/cacheable.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { DailyUpdateService } from './daily-update.service';
import {
  CreateDailyUpdateDto,
  UpdateDailyUpdateDto,
  UpdateStandupPolicyDto,
} from './dto/daily-update.dto';

@ApiBearerAuth()
@ApiTags('updates')
@Controller('updates')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DailyUpdateController {
  constructor(private readonly service: DailyUpdateService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDailyUpdateDto) {
    return this.service.create(user.sub, dto);
  }

  @Get()
  @Cacheable(30)
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'team', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'ON_LEAVE'] })
  findAll(
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
    @Query('date') date?: string,
    @Query('search') search?: string,
    @Query('team') team?: string,
    @Query('status') status?: 'ACTIVE' | 'ON_LEAVE',
  ) {
    return this.service.findAll({
      skip: skip ? Number(skip) : 0,
      limit: limit ? Number(limit) : 100,
      date,
      search,
      team,
      status,
    });
  }

  @Get('policy')
  @Cacheable(30)
  getPolicy() {
    return this.service.getStandupPolicy();
  }

  @Patch('policy')
  @Roles('MANAGER')
  updatePolicy(@Body() dto: UpdateStandupPolicyDto) {
    return this.service.updateStandupPolicy(dto);
  }

  @Get('stats/team')
  @Roles('MANAGER')
  @Cacheable(30)
  getTeamStats(@Query('date') date?: string, @Query('team') team?: string) {
    return this.service.getTeamStats(date, team);
  }

  @Get('versions/batch')
  @Cacheable(30)
  findVersionsBatch(@Query('ids') ids?: string) {
    const idList = ids?.split(',') ?? [];
    return this.service.findVersionsBatch(idList);
  }

  @Get(':id')
  @Cacheable()
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDailyUpdateDto,
  ) {
    return this.service.update(user.sub, id, dto);
  }

  @Get(':id/versions')
  @Cacheable()
  findVersions(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findVersions(id);
  }
}
