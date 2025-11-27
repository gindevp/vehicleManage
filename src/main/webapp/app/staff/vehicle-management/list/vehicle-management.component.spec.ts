jest.mock('app/core/auth/account.service');

import { ComponentFixture, TestBed, fakeAsync, inject, tick, waitForAsync } from '@angular/core/testing';
import { HttpHeaders, HttpResponse, provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AccountService } from 'app/core/auth/account.service';
import { VehicleManagementService } from '../service/vehicle-management.service';
import { Vehicle } from '../vehicle-management.model';

import UserManagementComponent from './vehicle-management.component';

describe('Vehicle Management Component', () => {
  let comp: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let service: VehicleManagementService;
  let mockAccountService: AccountService;
  const data = of({
    defaultSort: 'id,asc',
  });
  const queryParamMap = of(
    jest.requireActual('@angular/router').convertToParamMap({
      page: '1',
      size: '1',
      sort: 'id,desc',
    }),
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [UserManagementComponent],
      providers: [provideHttpClient(), { provide: ActivatedRoute, useValue: { data, queryParamMap } }, AccountService],
    })
      .overrideTemplate(UserManagementComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserManagementComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(VehicleManagementService);
    mockAccountService = TestBed.inject(AccountService);
    mockAccountService.identity = jest.fn(() => of(null));
  });

  describe('OnInit', () => {
    it('should call load all on init', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        const headers = new HttpHeaders().append('link', 'link;link');
        jest.spyOn(service, 'query').mockReturnValue(
          of(
            new HttpResponse({
              body: [new Vehicle(123)],
              headers,
            }),
          ),
        );

        // WHEN
        comp.ngOnInit();
        tick(); // simulate async

        // THEN
        expect(service.query).toHaveBeenCalled();
        expect(comp.users()?.[0]).toEqual(expect.objectContaining({ id: 123 }));
      }),
    ));
  });

  describe('setActive', () => {
    it('should update user and call load all', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        const headers = new HttpHeaders().append('link', 'link;link');
        const user = new Vehicle(123);
        jest.spyOn(service, 'query').mockReturnValue(
          of(
            new HttpResponse({
              body: [user],
              headers,
            }),
          ),
        );
        jest.spyOn(service, 'update').mockReturnValue(of(user));

        // WHEN
        comp.setActive(user, true);
        tick(); // simulate async

        // THEN
        expect(service.update).toHaveBeenCalledWith({ ...user, activated: true });
        expect(service.query).toHaveBeenCalled();
        expect(comp.users()?.[0]).toEqual(expect.objectContaining({ id: 123 }));
      }),
    ));
  });
});
