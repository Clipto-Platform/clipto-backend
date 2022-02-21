import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError((exception) => {
        if (exception instanceof HttpException && exception.getStatus() >= 500) {
          Sentry.captureException(exception);
        } else {
          Sentry.captureException(exception);
        }
        return throwError(() => exception);
      }),
    );
  }
}
