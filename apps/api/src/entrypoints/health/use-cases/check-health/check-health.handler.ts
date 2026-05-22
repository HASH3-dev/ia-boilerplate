import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckHealthHandler {
  handle(): { status: string } {
    return { status: 'ok' };
  }
}
