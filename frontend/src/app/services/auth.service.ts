import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

import { environment } from '../../environments/environment';

const JWTS_LOCAL_KEY = 'JWTS_LOCAL_KEY';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url = environment.auth0.url;
  audience = environment.auth0.audience;
  clientId = environment.auth0.clientId;
  callbackURL = environment.auth0.callbackURL;

  token: string;
  payload: any;

  constructor() {
    console.log('AuthService initialized');
    this.load_jwts(); // Ensure we load JWTs on initialization
  }

  build_login_link(callbackPath = '') {
    let link = 'https://';
    link += this.url + '.auth0.com';
    link += '/authorize?';
    link += 'audience=' + this.audience + '&';
    link += 'response_type=token&';
    link += 'client_id=' + this.clientId + '&';
    link += 'redirect_uri=' + this.callbackURL + callbackPath;
    return link;
  }

  check_token_fragment() {
    const fragment = window.location.hash.substr(1).split('&')[0].split('=');
    console.log('Checking token fragment:', fragment);
    if (fragment[0] === 'access_token') {
      this.token = fragment[1];
      console.log('Token found in URL fragment:', this.token);
      this.set_jwt();
      window.location.hash = ''; // Clear the hash to prevent reprocessing
    }
  }

  set_jwt() {
    console.log('Setting JWT:', this.token);
    localStorage.setItem(JWTS_LOCAL_KEY, this.token);
    sessionStorage.setItem(JWTS_LOCAL_KEY, this.token);
    if (this.token) {
      this.decodeJWT(this.token);
    }
  }

  load_jwts() {
    console.log('Loading JWTs from storage');
    this.token = sessionStorage.getItem(JWTS_LOCAL_KEY) || localStorage.getItem(JWTS_LOCAL_KEY) || null;
    console.log('Loaded JWT:', this.token);
    if (this.token) {
      this.decodeJWT(this.token);
    }
  }

  activeJWT() {
    return this.token;
  }

  decodeJWT(token: string) {
    const jwtservice = new JwtHelperService();
    this.payload = jwtservice.decodeToken(token);
    console.log('Decoded JWT payload:', this.payload);
    return this.payload;
  }

  login() {
    console.log('Redirecting to login');
    window.location.href = this.build_login_link('/tabs/user-page');
  }

  logout() {
    console.log('Logging out, clearing JWT');
    sessionStorage.removeItem(JWTS_LOCAL_KEY);
    localStorage.removeItem(JWTS_LOCAL_KEY);
    this.token = '';
    this.payload = null;
    console.log('JWT after logout:', {
      token: this.token,
      payload: this.payload,
    });
    console.log('Storage after logout:', {
      sessionStorage: sessionStorage.getItem(JWTS_LOCAL_KEY),
      localStorage: localStorage.getItem(JWTS_LOCAL_KEY),
    });
  }

  can(permission: string) {
    return this.payload && this.payload.permissions && this.payload.permissions.length && this.payload.permissions.indexOf(permission) >= 0;
  }
}
