import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { combineLatest } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, SortState, sortStateSignal } from 'app/shared/sort';
import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { SORT } from 'app/config/navigation.constants';
import { ItemCountComponent } from 'app/shared/pagination';
import { AccountService } from 'app/core/auth/account.service';
import { VehicleManagementService } from '../service/vehicle-management.service';
import { Vehicle } from '../vehicle-management.model';
import UserManagementDeleteDialogComponent from '../delete/user-management-delete-dialog.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';                 
import { LunarDate } from 'vietnamese-lunar-calendar';
import { VehicleFormComponent } from '../modal/vehicle-form.component';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { FormatTypePipe } from '../../FormatTypePipe';
import { NzFormModule } from 'ng-zorro-antd/form';

@Component({
  selector: 'jhi-vehicle-mgmt',
  templateUrl: './vehicle-management.component.html',
  imports: [RouterModule, SharedModule, SortDirective, SortByDirective, ItemCountComponent,
     NzDatePickerModule, FormsModule, NzModalModule, FormatTypePipe, NzFormModule, ReactiveFormsModule],
})
export default class UserManagementComponent implements OnInit {
  constructor(private modal: NzModalService) {}
    private fb = inject(NonNullableFormBuilder);

  currentAccount = inject(AccountService).trackCurrentAccount();
  users = signal<Vehicle[] | null>(null);
  isLoading = signal(false);
  totalItem: any = signal(0);
  pageSize   = ITEMS_PER_PAGE;
  pageIndex: number = 1;
  sortState = sortStateSignal({});
  dateValue: Date | null = null;
  loading: any | null = false;
  
formSearchGroup = this.fb.group({
        name: this.fb.control(null, []),
    });
  private readonly vehicleService = inject(VehicleManagementService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sortService = inject(SortService);
  private readonly modalService = inject(NgbModal);
  listOfData: any[] | any = [];

  ngOnInit(): void {
    this.handleNavigation();
    // const data: any[] = [];
    // for (let i = 0; i < 100; i++) {
    //   data.push({
    //     name: `Edward King ${i}`,
    //     age: 32,
    //     address: `London, Park Lane no. ${i}`
    //   });
    // }
    // this.listOfData = data;
  }

  setActive(user: Vehicle, isActivated: boolean): void {
    this.vehicleService.update({ ...user, activated: isActivated }).subscribe(() => this.loadAll());
  }

  trackIdentity(item: Vehicle): number {
    return item.id!;
  }

  deleteItem(user: Vehicle): void {
    const modalRef = this.modalService.open(UserManagementDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.user = user;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }

  loadAll(): void {
    this.isLoading.set(true);
    this.vehicleService
      .search({
        page: this.pageIndex - 1,
        size: this.pageSize,
        sort: this.sortService.buildSortParam(this.sortState(), 'id'),
      })
      .subscribe({
        next: (res: HttpResponse<any>) => {
          this.isLoading.set(false);
          this.onSuccess(res.body?.content ?? [], res.headers);
        },
        error: () => this.isLoading.set(false),
        complete: () => {
          this.isLoading.set(false);
        }
      });
  }
  searchPage(): void {
    this.isLoading.set(true);
    this.vehicleService
      .search({
        page: this.pageIndex - 1,
        size: this.pageSize,
        sort: this.sortService.buildSortParam(this.sortState(), 'id'),
        ...this.formSearchGroup.value
      })
      .subscribe({
        next: (res: HttpResponse<any>) => {
          this.isLoading.set(false);
          this.onSuccess(res.body?.content ?? [], res.headers);
        },
        error: () => this.isLoading.set(false),
        complete: () => {
          this.isLoading.set(false);
        }
      });
  }

  transition(sortState?: SortState): void {
    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute.parent,
      queryParams: {
        page: this.pageIndex,
        sort: this.sortService.buildSortParam(sortState ?? this.sortState()),
      },
    });
  }

  private handleNavigation(): void {
    combineLatest([this.activatedRoute.data, this.activatedRoute.queryParamMap]).subscribe(([data, params]) => {
      const page = params.get('page');
      this.pageIndex = +(page ?? 1);
      this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data.defaultSort));
      this.loadAll();
    });
  }

  private onSuccess(list: any, headers: HttpHeaders): void {
    this.totalItem.set(Number(headers.get('X-Total-Count')));
    console.log('checked list', list);
    this.listOfData = list;
  }

  getDateDay(date: Date): string {
    return `${date.getDate()}`;
  }

  // text âm lịch hiển thị trong ô ngày
  lunarText(d: Date): string {
    const L = new LunarDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    // gợi ý: mồng 1 show "1/MM", còn lại show lDay
    return L.date === 1 ? `1/${L.month}${L.isLeap ? 'N' : ''}` : `${L.date}`;
  }

  // để bôi đậm mồng 1 và rằm
  isSpecial(d: Date): boolean {
    const L = new LunarDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    return L.date === 1 || L.date === 15;
  }

  handleItem(data?: any) {
    console.log('checked handle item', data);
    const ref = this.modal.create({
      nzTitle: data ? 'Cập nhật': 'Thêm mới',
      nzContent: VehicleFormComponent,
      nzData: { mode: data ? 'update' : 'create', data: data }, 
      nzFooter: null,              // footer do form tự render
      nzMaskClosable: false
    });
    ref.afterClose.subscribe(res => { 
      console.log('checked aftẻ close', res);
      if(res === 'success') {
        this.searchPage()
      }
    });
  }

  formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
}
