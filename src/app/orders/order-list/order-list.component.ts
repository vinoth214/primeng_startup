import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MenuItem, LazyLoadEvent, SelectItem, ConfirmationService } from 'primeng/components/common/api';
import { DropdownValuesService } from '../../service/dropdown-values.service';
import * as DateFns from 'date-fns';
export class ColumnDef {
  public constructor(init?: Partial<ColumnDef>) {
    Object.assign(this, init);
  }

  public header: string;
  public field: string;
  public type ?= 'text';
  public colWidthPercentage: string;
  public filterMatchMode ?= 'contains';
  public codeList?: string = null;
  public visible ?= true;
  public dropDownValName?:string = null;
  public defaultsForFilter?: (items: SelectItem[]) => SelectItem[] = e => e;
}
@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent<T> implements OnInit {

  constructor(private drpService:DropdownValuesService) { }
  public _Cols: ColumnDef[];
  public gridData: T[] = [];
  @Input() public isEditable:boolean;
  @Output() public gridDataChange: EventEmitter<T[]> = new EventEmitter();
  @Input() public set Cols(value: ColumnDef[]) {
    this._Cols = value.map(e => new ColumnDef(e));
  }
  @Input() public set GridData(value: T[]) { 
    if(value) {
      this.gridData = value;
    }
   
  }
  ngOnInit() {
  }
  getDropDownValues(dropVal) {
    return this.drpService.dropValuesAssigner(dropVal);
  }
  onEditComplete() {
    console.log("++++++++",this.gridData)
   // this.gridDataChange.emit(this.gridData);
  }
  public getValueAsString(rowItem, col): string {
    const val = rowItem[col.field];
    if (val != null) {
      switch (col.type) {
        case 'date': return DateFns.format(val, 'DD-MMM-YYYY');
        case 'datetime': return DateFns.format(val, 'DD-MMM-YYYY HH:mm:ss');
        case 'bool': return val ? 'Yes' : 'No';

        default:
        {
          return val;
        }
      }
    }
    return null;
  }

  public dateConverter (val) {
    console.log("new Date(val)",new Date(val))
    return new Date(val);
  }
}
