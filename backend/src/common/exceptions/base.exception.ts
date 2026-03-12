import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    public readonly errorType: string,
  ) {
    super({ message, error: errorType, statusCode }, statusCode);
  }
}
