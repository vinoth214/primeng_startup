import { Component, OnInit, Input, Output, EventEmitter,ViewChild,ElementRef, ChangeDetectorRef } from '@angular/core';
import { MenuItem, LazyLoadEvent, SelectItem, ConfirmationService } from 'primeng/components/common/api';
import { DropdownValuesService } from '../../service/dropdown-values.service';
import * as DateFns from 'date-fns';
import * as Enumerable from 'linq';
// declare var $: any;
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
  public isEditable ?= false;
  public dropDownValName?:string = null;
  public defaultsForFilter?: (items: SelectItem[]) => SelectItem[] = e => e;
}
@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent<T> implements OnInit {
  public _Cols: ColumnDef[];
  public originalGridData: T[] = [];
  public gridData: T[] = [];
  @ViewChild('grid', { static: false }) public GridRef;
  @ViewChild('gridWidgetDiv', { static: false }) public gridWidgetDiv: ElementRef;
  @Output() public gridDataChange: EventEmitter<T[]> = new EventEmitter();
  @Input() public set Cols(value: ColumnDef[]) {
    this.DefaultColumns = value.map(e => new ColumnDef(e));
    this._Cols = value.map(e => new ColumnDef(e));

  }
  @Input() public set GridData(value: T[]) {
    if (value) {
      this.originalGridData = value;
      this.gridData = value;

      this.filterSelectItems.clear();

      this.LoadVirtualRecords(value);
    }
  }
  @Input() public Description = 'Records';
  @Input() public dataKey = 'id';
  @Input() public isLoading: boolean;
  @Input() public scrollHeight = '300px';
  @Input() public rowsPerPage = 5;
  @Input() public isPaginator = true;
  @Input() public RightClickHandler: (rowData: T, menuItems: MenuItem[]) => void;  
  @Input() public HasFilters: boolean; // Flag to say if table has a header row with filter
  @Input() public HasCheckBoxMultiSelect: boolean; 
  @Input() public selectedRowsData: T[] = [];

  
  @Output() public selectedRowsDataChange: EventEmitter<T[]> = new EventEmitter();
  @Output() RowsSelectionChange: EventEmitter<T[]> = new EventEmitter(); // Event when rows selected using checkBox
  @Output() RowLeftClick: EventEmitter<T> = new EventEmitter(); // Event when a row is selected using left click

  public interalContextHeaderMenuItems: MenuItem[] = [];
  protected _rightClickSelectedColData: ColumnDef;
  public selectedColumns: ColumnDef[] = [];
  public DefaultColumns: ColumnDef[] = [];
  protected prevTargetRowData: T = null; // used to clear the formatting
  protected prevTarget = null; // used to clear the formatting
  public ColumnSelectAllFlag: boolean;
  public showColumnHeaderFlag = false;
  protected filterSelectItems: Map<string, SelectItem[]> = new Map();






  constructor(private drpService: DropdownValuesService,
    protected cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.selectedColumns = this._Cols.map(e => new ColumnDef(e));
  }
  getDropDownValues(dropVal) {
    return this.drpService.dropValuesAssigner(dropVal);
  }
  getColSpanEmptyMessage() {
    return this._Cols.filter(c => c.visible).length + (this.HasCheckBoxMultiSelect ? 1 : 0);
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

  onselectDatePicker(date: Date, index, filed) {
    this.gridData[index][filed] = DateFns.format(date, 'DD-MMM-YYYY');
    this.gridDataChange.emit(this.gridData);
  }

  onHeaderRightClick($event, rightClickSelectedItem: ColumnDef, hcm) {
    this._rightClickSelectedColData = rightClickSelectedItem;
    $event.rightClickSelectedItem = rightClickSelectedItem;

    this.interalContextHeaderMenuItems = [
      {
        label: rightClickSelectedItem ? 'Hide \'' + this._rightClickSelectedColData.header + '\'' : 'Hide',
        icon: 'pi pi-minus-circle',
        disabled: rightClickSelectedItem ? false : true,
        command: (event) => { this.hideSpecficColumn(); }
      },
      {
        label: 'Select Columns',
        icon: 'pi pi-check-circle',
        command: (event) => {
          this.showColumnHeaderFlag = true;
          this.onColumnSelectChange();
        }
      },
      {
        label: 'Reset To Defaults',
        icon: 'pi pi-refresh',
        command: (event) => { this.restoreDefault(); }
      }
    ];

    hcm.show($event);
  }

  hideSpecficColumn() {
    this._rightClickSelectedColData.visible = false;

    this.selectedColumns = this._Cols.map(e => new ColumnDef(e));
    this.cdr.detectChanges();
  }

  restoreDefault() {
    this._Cols = this.DefaultColumns.map(e => new ColumnDef(e));
    this.selectedColumns = this._Cols.map(e => new ColumnDef(e));
    this.cdr.detectChanges();
  }

  onColumnHeaderCheckboxToggle(checked: boolean) {
    this.selectedColumns.forEach(e => e.visible = checked);
  }
  onColumnSelectChange() {
    if (this.selectedColumns.length === this.selectedColumns.filter(e => e.visible === true).length) {
      this.ColumnSelectAllFlag = true;
    } else {
      this.ColumnSelectAllFlag = false;
    }
  }
  showFilteredColumns() {
    this.showColumnHeaderFlag = false;
    this._Cols = this.selectedColumns.map(e => new ColumnDef(e));
    this.cdr.detectChanges();
  }

  onColResize($event) {
   // this.UpdateColWidthPref();
  }

  protected selectionChangeHandler(event) {

  //  this.SelectedResultsCount = this.selectedRowsData.length;
    this.refreshHeaderCheckboxState();
    this.selectedRowsDataChange.emit(this.selectedRowsData);
    this.RowsSelectionChange.emit(this.selectedRowsData);
    if (event.originalEvent && event.originalEvent.originalEvent) {
      event.originalEvent.originalEvent.stopPropagation();
    } else if (event.originalEvent) {
      event.originalEvent.stopPropagation();
    }
  }
  onRowSelect(event) {
    this.selectionChangeHandler(event);
  }
  onRowUnselect(event) {
    this.selectionChangeHandler(event);
  }
  getKey(item: T) {
    return this.getDescendantProp(item, this.dataKey);
  }
  getDescendantProp(obj: any, desc: string) {
    const arr = desc.split('.');
    while (arr.length && obj) { obj = obj[arr.shift()]; }
    return obj;
  }
  rowTrackByFunction = (index: number, item: T) => {
    return this.getKey(item);
  }
  OnRowClick(event: MouseEvent, rowIndex: number, selectedRowData: T) {
    console.log("selectedRowData",selectedRowData)
      this.HandleRowClick(event, selectedRowData);
  }
  private HandleRowClick(event: any, selectedRowData: T) {
    if (this.prevTarget) {
      this.prevTarget.classList.remove('selectedRow');
      this.prevTargetRowData['__selected'] = false;
    }
    event.currentTarget.classList.add('selectedRow');
    selectedRowData['__selected'] = true;
    this.prevTarget = event.currentTarget;
    this.prevTargetRowData = selectedRowData;
    // refresh selected results Count
    // this.SelectedResultsCount = this.selectedRowsData.length;
    this.RowLeftClick.emit(selectedRowData);
  }
  cloneEvent(e: Event) {
    if (e === undefined || e === null) { return undefined; }
    const evt = {};
  // tslint:disable-next-line: forin
    for (const p in e) {
        const d = Object.getOwnPropertyDescriptor(e, p);
        if (d && (d.get || d.set)) { Object.defineProperty(evt, p, d); } else { evt[p] = e[p]; }
    }
    Object.setPrototypeOf(evt, e);
    return evt;
}
  onHeaderCheckboxToggle(checked: boolean) {
     if (checked) {

     this.selectedRowsData = Enumerable.from(this.selectedRowsData)
            .union(this.originalGridData, e => this.getKey(e))
            .toArray();
     } else {
      this.selectedRowsData = [];
     }
    this.selectionChangeHandler(this.selectedRowsData);
  }

  
  refreshHeaderCheckboxState() {
    // if (this.LazyData && this.LazyData.visibleResults.length > 0) {
    //   const count = Enumerable.from(this.LazyData.visibleResults).except(this.selectedRowsData, e => this.getKey(e)).count();
    //   if (count > 0) {
    //     this.tableHeaderCheckboxSelectedAll = false;
    //   } else {
    //     this.tableHeaderCheckboxSelectedAll = true;
    //   }
    // } else {
    //   const count = Enumerable.from(this.originalGridData).union(this.pinnedRowsData, e => this.getKey(e))
    //     .except(this.selectedRowsData, e => this.getKey(e)).count();
    //   this.tableHeaderCheckboxSelectedAll = (count === 0);
    // }
  }

  // filter code starts

  FieldFilterOptions(col: ColumnDef): SelectItem[] {
    const fieldName = col.field;
    if (!this.filterSelectItems.has(fieldName)) {
      if (col.type !== 'bool') {
        const items = Enumerable.from(this.originalGridData).select(e =>
          <SelectItem>{ label: e[fieldName], value: e[fieldName] })
          .distinct(e => e.label)
          .orderBy(e => e.label.toLocaleLowerCase()).toArray();
        this.filterSelectItems.set(fieldName, items);
      } else {
        const items = Enumerable.from(this.originalGridData).select(e =>
          <SelectItem>{ label: e[fieldName] ? 'Yes' : 'No', value: e[fieldName] })
          .distinct(e => e.label)
          .orderByDescending(e => e.label).toArray();
        this.filterSelectItems.set(fieldName, items);
      }

      this.populateDefaultForFilter(col);

    }
    return this.filterSelectItems.get(fieldName);
  }

  // getSelectedValue(col: ColumnDef) {
  //   if (this.GridRef.hasFilter) {
  //     if (this.GridRef.filters[col.field]) {
  //       return this.GridRef.filters[col.field];
  //     }
  //   }

  //   return '--All--';

  // }

  populateDefaultForFilter(col: ColumnDef) {
    
    const fieldDefaults = col.field + '_defaults';
    if (col.filterMatchMode === 'equals') {
      if (this.GridRef.hasFilter && this.GridRef.filters[col.field]) {
        this.filterSelectItems[fieldDefaults] = this.GridRef.filters[col.field].value[0];
       }
      // else {
      //   if (col.defaultsForFilter) {
      //     const items = this.filterSelectItems.get(col.field);
      //     const defaults = col.defaultsForFilter(items);
      //     this.filterSelectItems[fieldDefaults] = defaults[0].value;
      //   }
       else {
          this.filterSelectItems[fieldDefaults] = '--All--';
        }
     // }
    } else {
      if (this.GridRef.hasFilter && this.GridRef.filters[col.field]) {
        this.filterSelectItems[fieldDefaults] = this.GridRef.filters[col.field].value;
      } else {
      const items = this.filterSelectItems.get(col.field);
      const defaults = col.defaultsForFilter ? col.defaultsForFilter(items) : items;
      this.filterSelectItems[fieldDefaults] = defaults.map(e => e.value);
      }
    }

  }

  onSelectChange($event, grid, col) {
    if ($event.target.value === '--All--') {
      grid.filter('', col.field, 'equals');
    } else {

      let filteredValue = $event.target.value;
      if (col.type === 'bool') {
        if ($event.target.value === 'true') {
          filteredValue = true;
        } else {
          filteredValue = false;
        }
      }

      grid.filter([filteredValue], col.field, 'in');
    }
  }

  private LoadVirtualRecords(value: T[]) {
    let hasToFilter = false;
    const filters = {};
    if (this.HasFilters) {
      if (this.GridRef.hasFilter()) {
        hasToFilter = true;
        if (this.GridRef) {
          this.GridRef._filter();
        }
      } else {
        this._Cols.forEach(col => {
          if (col.filterMatchMode === 'in' && col.defaultsForFilter) {
            // if (col.codeList) {
            // //  this.CodeListFilterOptions(col);
            // } else {
            //   this.FieldFilterOptions(col);
            // }
            this.FieldFilterOptions(col);
            filters[col.field] = { value: this.filterSelectItems[col.field + '_defaults'], matchMode: 'in' };
            this.GridRef.filter(this.filterSelectItems[col.field + '_defaults'], col.field, 'in');
            hasToFilter = true;

          }
        });
      }
    }
    if (hasToFilter) {
      // const lazyLoadEvent = <LazyLoadEvent>{
      //   first: 0,
      //   rows: this.VirtualRowsCount * 2,
      //   filters: filters
      // };
      // this.LazyLoad(lazyLoadEvent);
    } else {
      if (this.GridRef) {
        this.GridRef._filter();
      }
      // this.virtualRowsData = value.slice(0, this.VirtualRowsCount * 2);
      // this.DisplayedResultsCount = value.length;
    }
    this.cdr.detectChanges();
  }

}
