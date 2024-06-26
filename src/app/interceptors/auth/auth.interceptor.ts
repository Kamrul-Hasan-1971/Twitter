import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(this.authService.getToken()).pipe(
      mergeMap((idToken) => {
        if (idToken) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${idToken}`,
            },
          });
        }

        return next.handle(request);
      })
    );
  }
}
