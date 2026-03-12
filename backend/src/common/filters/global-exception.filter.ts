import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { BaseException } from '../exceptions/base.exception';
import { AppConfigService } from '../config/app-config.service';

type ZodIssue = { message: string };
type ZodErrorLike = { issues?: ZodIssue[] };

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly configService: AppConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();
    const path = request.url;

    const { statusCode, type, error, message, stack } = this.getExceptionDetails(exception);

    const isProduction = this.configService.isProduction;
    const payload: Record<string, unknown> = {
      type,
      error,
      message,
      timestamp,
      path,
      statusCode,
    };

    if (!isProduction && stack) {
      payload.stack = stack;
    }

    this.logger.error(`[${statusCode}] ${request.method} ${path} - ${message}`, stack);

    response.status(statusCode).json(payload);
  }

  private getExceptionDetails(exception: unknown): {
    statusCode: number;
    type: string;
    error: string;
    message: string;
    stack?: string;
  } {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let type = 'InternalServerError';
    let error = 'Internal Server Error';
    let message = 'An unexpected error occurred';
    let stack: string | undefined;

    if (exception instanceof BaseException) {
      statusCode = exception.getStatus();
      type = exception.errorType;
      error = exception.errorType;
      message = exception.message;
      stack = exception.stack;
    } else if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as ZodErrorLike | undefined;
      const issues = Array.isArray(zodError?.issues) ? zodError.issues : [];
      statusCode = HttpStatus.BAD_REQUEST;
      type = 'ValidationError';
      error = 'Bad Request';
      message = issues.length ? issues.map((e) => e.message).join(', ') : exception.message;
      stack = exception.stack;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null) {
        const bodyObj = body as Record<string, unknown>;
        message = (bodyObj.message as string) || message;
        error = (bodyObj.error as string) || exception.name;
      } else {
        message = typeof body === 'string' ? body : message;
        error = exception.name;
      }
      type = exception.name;
      stack = exception instanceof Error ? exception.stack : undefined;
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }

    return { statusCode, type, error, message, stack };
  }
}
