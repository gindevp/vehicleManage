import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ValidatorFn, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzModalModule, NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { Subject } from 'rxjs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { CommonModule } from '@angular/common';
import { LunarDate } from 'vietnamese-lunar-calendar';
import { VehicleManagementService } from '../service/vehicle-management.service';

@Component({
    selector: 'vehicle-form',
    imports: [NzButtonModule, NzModalModule, ReactiveFormsModule,
         FormsModule, NzFormModule,
        NzInputModule,
        NzSelectModule,
        NzDatePickerModule,
        CommonModule
    ],
    templateUrl: './vehicle-form.component.html',
    styles: [

    ]
})
export class VehicleFormComponent implements OnInit, OnDestroy {
    private fb = inject(NonNullableFormBuilder);
    private destroy$ = new Subject<void>();
    private readonly vehicleService = inject(VehicleManagementService);

    constructor(
        private modalRef: NzModalRef<VehicleFormComponent>,
        @Inject(NZ_MODAL_DATA) public modalData: { mode: 'create' | 'update'; data?: any }
    ) {
        console.log('modalData ở constructor:', this.modalData);
    }

    ngOnDestroy(): void {
    }
    ngOnInit(): void {
        console.log('Data nhận từ modal:', this.modalData);
        if (this.modalData.mode === 'update') {
            this.idItem = this.modalData.data?.id;
            // đổ dữ liệu vào form
            this.formGroup.patchValue(this.modalData.data);
        }
    }
    isVisible = false;
    isConfirmLoading = false;
    idItem: any = null;

    formGroup = this.fb.group({
        id: this.fb.control(null, []),
        name: this.fb.control(
            null,
            [MyValidators.required, MyValidators.maxLength(500)],
        ),
        type: this.fb.control(1, [MyValidators.required]),
        registrationDate: this.fb.control(null, []),
        purchaseDate: this.fb.control(null, []),
    });

    //   constructor(private modalService: NzModalService) {}

    showModal(): void {
        this.isVisible = true;
    }


    handleOk(): void {
        if (this.formGroup.valid) {
            this.isConfirmLoading = true;
            this.vehicleService
                .createOrUpd(this.formGroup.value)
                .subscribe({
                    next: (res: any) => {
                        console.log('respóne save', res);
                        this.modalRef.close('success');
                    },
                    error: () => {
                    },
                    complete: () => {
                        this.isConfirmLoading = false;

                    },
                });

        } else {
            Object.values(this.formGroup.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });

        }
        // setTimeout(() => {
        //     this.isVisible = false;
        //     this.isConfirmLoading = false;
        // }, 3000);
    }

    handleCancel(): void {
        this.modalRef.close('cancel');
    }
    submitForm() {

    }
  getDateDay(date: Date): string {
    return `${date.getDate()}`;
  }

  isToday(d: Date): boolean {
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }

  lunarText(d: Date): string {
    const L = new LunarDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    return L.date === 1 ? `1/${L.month}${L.isLeap ? 'N' : ''}` : `${L.date}`;
  }

  isSpecial(d: Date): boolean {
    const L = new LunarDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    return L.date === 1 || L.date === 15;
  }

  private solarHolidays: string[] = [
    '1-1',  // 01/01
    '30-4', // 30/04
    '1-5',  // 01/05
    '2-9',  // 02/09
  ];

  isHoliday(d: Date): boolean {
    const key = `${d.getDate()}-${d.getMonth() + 1}`; // "day-month"
    return this.solarHolidays.includes(key);
  }


}
export type MyErrorsOptions = { 'zh-cn': string; en: string } & Record<string, NzSafeAny>;
export type MyValidationErrors = Record<string, MyErrorsOptions>;
function isEmptyInputValue(value: NzSafeAny): boolean {
    return value == null || value.length === 0;
}

function isMobile(value: string): boolean {
    return typeof value === 'string' && /(^1\d{10}$)/.test(value);
}
export class MyValidators extends Validators {
    static override minLength(minLength: number): ValidatorFn {
        return (control: AbstractControl): MyValidationErrors | null => {
            if (Validators.minLength(minLength)(control) === null) {
                return null;
            }
            return { minlength: { 'zh-cn': `最小长度为 ${minLength}`, en: `MinLength is ${minLength}` } };
        };
    }

    static override maxLength(maxLength: number): ValidatorFn {
        return (control: AbstractControl): MyValidationErrors | null => {
            if (Validators.maxLength(maxLength)(control) === null) {
                return null;
            }
            return { maxlength: { 'zh-cn': `最大长度为 ${maxLength}`, en: `MaxLength is ${maxLength}` } };
        };
    }

    static mobile(control: AbstractControl): MyValidationErrors | null {
        const value = control.value;

        if (isEmptyInputValue(value)) {
            return null;
        }

        return isMobile(value)
            ? null
            : { mobile: { 'zh-cn': `手机号码格式不正确`, en: `Mobile phone number is not valid` } };
    }
}
