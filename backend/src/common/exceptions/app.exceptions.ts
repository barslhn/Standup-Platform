import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class NotFoundException extends BaseException {
  constructor(message = 'No record found') {
    super(message, HttpStatus.NOT_FOUND, 'NotFound');
  }
}

export class AuthenticationException extends BaseException {
  constructor(message = 'Authentication failed') {
    super(message, HttpStatus.UNAUTHORIZED, 'Unauthorized');
  }
}

export class AuthorizationException extends BaseException {
  constructor(message = 'You are not authorized to perform this action') {
    super(message, HttpStatus.FORBIDDEN, 'Forbidden');
  }
}

export class ValidationException extends BaseException {
  constructor(message = 'Invalid data') {
    super(message, HttpStatus.BAD_REQUEST, 'ValidationError');
  }
}

export class BusinessRuleException extends BaseException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT, 'BusinessRuleViolation');
  }
}
