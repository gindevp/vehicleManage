import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatType',
  standalone: true
})
export class FormatTypePipe implements PipeTransform {
  transform(value: any, type: string): string {
    if (value == null || value === '') return '';

    switch (type) {
      case 'vehicle':
        return this.formatVehicle(value);
      default:
        return String(value);
    }
  }

  private formatVehicle(value: number | string): string {
    const map: Record<number | string, string> = {
      1: 'Nội địa',
      2: 'Nhập khẩu'
    };
    return map[value] ?? 'Không xác định';
  }
}
