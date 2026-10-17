import { Controller, Sse, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { RealtimeService } from './realtime.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Realtime')
@ApiBearerAuth()
@Controller('realtime')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Sse('stream')
  @ApiOperation({ summary: 'Server-Sent Events (SSE) stream for live updates' })
  streamEvents(@CurrentUser() user: AuthenticatedUser): Observable<any> {
    return this.realtimeService.getEventStream(user);
  }
}
