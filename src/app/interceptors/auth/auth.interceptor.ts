// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token && !this.authService.isTokenExpired()) {
      req = req.clone({
        setHeaders: {
          'X-Jwt-Token': `Bearer ${token}`
        }
      });
    }else{
      if(token) this.authService.logout();
    }

    return next.handle(req);
  }
}
