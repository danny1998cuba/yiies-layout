import { Injectable } from '@angular/core';
import { auth_user } from './mock-data';
import { of } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor() { }

  getAuthUser(): Observable<any> {
    return of(auth_user)
  }
}
