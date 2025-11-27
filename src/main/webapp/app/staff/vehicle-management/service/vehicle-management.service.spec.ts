import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Authority } from 'app/config/authority.constants';
import { Vehicle } from '../vehicle-management.model';

import { VehicleManagementService } from './vehicle-management.service';

describe('User Service', () => {
  let service: VehicleManagementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(VehicleManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service methods', () => {
    it('should return User', () => {
      let expectedResult: string | undefined;

      service.find('user').subscribe(received => {
        expectedResult = received.login;
      });

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(new Vehicle(123, 'user'));
      expect(expectedResult).toEqual('user');
    });

    it('should return Authorities', () => {
      let expectedResult: string[] = [];

      service.authorities().subscribe(authorities => {
        expectedResult = authorities;
      });
      const req = httpMock.expectOne({ method: 'GET' });

      req.flush([{ name: Authority.USER }, { name: Authority.ADMIN }]);
      expect(expectedResult).toEqual([Authority.USER, Authority.ADMIN]);
    });

    it('should propagate not found response', () => {
      let expectedResult = 0;

      service.find('user').subscribe({
        error: (error: HttpErrorResponse) => (expectedResult = error.status),
      });

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush('Invalid request parameters', {
        status: 404,
        statusText: 'Bad Request',
      });
      expect(expectedResult).toEqual(404);
    });
  });
});
