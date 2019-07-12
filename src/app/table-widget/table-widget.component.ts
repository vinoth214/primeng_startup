import { Component, OnInit,Input, Output, EventEmitter } from '@angular/core';
import { MenuItem, LazyLoadEvent, SelectItem, ConfirmationService } from 'primeng/components/common/api';
import { DropdownValuesService } from '../service/dropdown-values.service';
import * as DateFns from 'date-fns';
import { DatePipe } from '@angular/common';
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
  selector: 'app-table-widget',
  templateUrl: './table-widget.component.html',
  styleUrls: ['./table-widget.component.css']
})
export class TableWidgetComponent<T> implements OnInit {

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
  @Input() public Description = 'Records';
  @Input() public isLoading: boolean;
  ngOnInit() {
  }
  getDropDownValues(dropVal) {
    return this.drpService.dropValuesAssigner(dropVal);
  }
  onEditComplete(data) {
    console.log("++++++++",data);
   // this.gridDataChange.emit(this.gridData);
  }
  getColSpanEmptyMessage() {
    return this._Cols.filter(c => c.visible).length;
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

  onselectDatePicker(date: Date, index, filed) {
    this.gridData[index][filed] =  DateFns.format(date, 'DD-MMM-YYYY');
    this.gridDataChange.emit(this.gridData);
    } 
}
