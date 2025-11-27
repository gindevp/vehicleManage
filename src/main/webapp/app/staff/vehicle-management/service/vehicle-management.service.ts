import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Pagination } from 'app/core/request/request.model';
import { IVehicle } from '../vehicle-management.model';

@Injectable({ providedIn: 'root' })
export class VehicleManagementService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/vehicles');

  create(data: any): Observable<IVehicle> {
    return this.http.post<any>(this.resourceUrl, data);
  }
  

  createOrUpd(data: any): Observable<IVehicle> {
    if(data?.id) return this.http.put<IVehicle>(this.resourceUrl, data);
    return this.http.post<any>(this.resourceUrl, data);
  }
  update(user: IVehicle): Observable<IVehicle> {
    return this.http.put<IVehicle>(this.resourceUrl, user);
  }

  find(login: string): Observable<IVehicle> {
    return this.http.get<IVehicle>(`${this.resourceUrl}/${login}`);
  }

  query(req?: Pagination): Observable<HttpResponse<IVehicle[]>> {
    const options = createRequestOption(req);
    return this.http.get<IVehicle[]>(this.resourceUrl, { params: options, observe: 'response' });
  }
  search(req?: Pagination): Observable<HttpResponse<IVehicle[]>> {
    const options = createRequestOption(req);
    return this.http.get<IVehicle[]>(`${this.resourceUrl}/search`, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/${id}`);
  }

  authorities(): Observable<string[]> {
    return this.http
      .get<{ name: string }[]>(this.applicationConfigService.getEndpointFor('api/authorities'))
      .pipe(map(authorities => authorities.map(a => a.name)));
  }
}
