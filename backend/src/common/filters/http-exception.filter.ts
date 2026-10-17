import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    let requiredPermission: string | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const respObj = exceptionResponse as any;
        message = respObj.message || exception.message;
        errorCode = respObj.code || (status === 403 ? 'PERMISSION_DENIED' : 'HTTP_ERROR');
        requiredPermission = respObj.requiredPermission;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    }

    if (status === HttpStatus.FORBIDDEN) {
      this.logger.warn(
        `[ACCESS_DENIED] Path: ${request.url} | User: ${(request as any).user?.username || 'ANONYMOUS'} | Permission: ${requiredPermission || 'N/A'}`
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message: Array.isArray(message) ? message.join(', ') : message,
        statusCode: status,
        requiredPermission,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
