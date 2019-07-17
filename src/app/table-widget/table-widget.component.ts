import { Component, OnInit,Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MenuItem, LazyLoadEvent, SelectItem, ConfirmationService } from 'primeng/components/common/api';
import { DropdownValuesService } from '../service/dropdown-values.service';
import * as DateFns from 'date-fns';
import { DatePipe } from '@angular/common';
declare var $: any;
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
  public _Cols: ColumnDef[];
  public gridData: T[] = [];
  @ViewChild('grid',{static: false}) public GridRef;
  @ViewChild('gridWidgetDiv',{static: false}) public gridWidgetDiv: ElementRef;
  @Input() public isEditable:boolean;
  @Output() public gridDataChange: EventEmitter<T[]> = new EventEmitter();
  @Input() public set Cols(value: ColumnDef[]) {
    this.DefaultColumns = value.map(e => new ColumnDef(e));
    this._Cols = value.map(e => new ColumnDef(e));

  }
  @Input() public set GridData(value: T[]) { 
    if(value) {
      this.gridData = value;
    }   
  }
  @Input() public Description = 'Records';
  @Input() public isLoading: boolean;
  @Input() public scrollHeight = '300px';
  @Input() public RightClickHandler: (rowData: T, menuItems: MenuItem[]) => void;
  public interalContextHeaderMenuItems: MenuItem[] = [];
  protected _rightClickSelectedColData: ColumnDef;
  public selectedColumns: ColumnDef[] = [];
  public DefaultColumns: ColumnDef[] = [];
  public ColumnSelectAllFlag: boolean;
  public showColumnHeaderFlag = false;
  protected observer = new MutationObserver(mutations => {
    this.AdjustScrollHeightDynamically();
  });




  constructor(private drpService:DropdownValuesService,
              protected cdr: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.gridWidgetDiv) {
      const parentDiv = $(this.gridWidgetDiv.nativeElement).parents('div').get(0);
      this.observer.observe(parentDiv, {
        attributes: true
      });
    }
    // let availableWidth = $(this.gridWidgetDiv.nativeElement).find('.ui-table-virtual-scroller').width();
    // if (!availableWidth) {
    //   availableWidth = $(this.gridWidgetDiv.nativeElement).find('.ui-treetable-scrollable-body').prop('clientWidth');
    // }
    this.selectedColumns = this._Cols.map(e => new ColumnDef(e));
    this.AdjustScrollHeightDynamically();
  }
  ngOnDestroy(): void {
    this.observer.disconnect();
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

  onselectDatePicker(date: Date, index, filed, calender) {

    calender.preventDefault()
    this.gridData[index][filed] =  DateFns.format(date, 'DD-MMM-YYYY');
    this.gridDataChange.emit(this.gridData);
    } 

    onHeaderRightClick($event, rightClickSelectedItem: ColumnDef, hcm) {
      this._rightClickSelectedColData = rightClickSelectedItem;
       $event.rightClickSelectedItem = rightClickSelectedItem;
   
       this.interalContextHeaderMenuItems = [
         {
         label: rightClickSelectedItem ? 'Hide \'' + this._rightClickSelectedColData.header + '\'' : 'Hide',
         icon: 'pi pi-minus-circle',
         disabled : rightClickSelectedItem ?  false : true,
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
   
       // if (this.RightClickHandler) {
       //   this.RightClickHandler(rightClickSelectedItem, this.interalContextHeaderMenuItems);
       // }
   
       hcm.show($event);
     }

     hideSpecficColumn() {
      this._rightClickSelectedColData.visible = false;
  
      this.selectedColumns = this._Cols.map(e => new ColumnDef(e));
      this.cdr.detectChanges();
      this.AdjustScrollHeightDynamically();
  
     // const colPref = this.tablePref.columns.find(e => e.columnName === this._rightClickSelectedColData.field);
      //colPref.hidden = true;
      // this.prefClient.updateTablePreference(this.tablePref).subscribe();
      // this.authService.NotifyStateChangeToUserDetail();
    }
  
    restoreDefault() {
      this._Cols = this.DefaultColumns.map(e => new ColumnDef(e));
  
      //  this._Cols.forEach(e => {
      //      const colPref = this.tablePref.columns.find(c => c.columnName === e.field);
      //      if (colPref) {
      //       colPref.hidden = !e.visible;
      //     }
      // });
  
      // this.prefClient.updateTablePreference(this.tablePref).subscribe();
      // this.authService.NotifyStateChangeToUserDetail();
  
      //this._Cols.forEach(c => c.visible = true);
      this.selectedColumns = this._Cols.map(e => new ColumnDef(e));
      this.cdr.detectChanges();
      const totalColsWidth = $(this.gridWidgetDiv.nativeElement)
      .find('table.ui-table-scrollable-body-table,.ui-treetable-scrollable-body-table').width();
      let availableWidth = $(this.gridWidgetDiv.nativeElement).find('.ui-table-virtual-scroller').width();
      if (!availableWidth) {
        availableWidth = $(this.gridWidgetDiv.nativeElement).find('.ui-treetable-scrollable-body').prop('clientWidth');
      }
      if (totalColsWidth <= availableWidth ) { // 100px instead of 100%, scale accordingly
        $(this.gridWidgetDiv.nativeElement)
        .find('table.ui-table-scrollable-header-table, table.ui-table-scrollable-body-table').width(availableWidth + 'px');
        $(this.gridWidgetDiv.nativeElement)
        .find('.ui-treetable-scrollable-header-table, .ui-treetable-scrollable-body-table').width(availableWidth + 'px');
      }
  
      this.AdjustScrollHeightDynamically();
      setTimeout(() => {
        this.UpdateColWidthPref();
      }, 1000);
  
     }

    onColumnHeaderCheckboxToggle(checked: boolean) {
      this.selectedColumns.forEach(e => e.visible = checked);
     }
     onColumnSelectChange() {
       if (this.selectedColumns.length === this.selectedColumns.filter( e => e.visible === true).length) {
        this.ColumnSelectAllFlag = true;
       } else {
        this.ColumnSelectAllFlag = false;
       }
     }
     showFilteredColumns() {
      this.showColumnHeaderFlag = false;
      this._Cols = this.selectedColumns.map(e => new ColumnDef(e));
      this.cdr.detectChanges();
      this.AdjustScrollHeightDynamically();
  
      // this._Cols.forEach(c => {
      //   const colPref = this.tablePref.columns.find(e => e.columnName === c.field);
      //   if (colPref) {
      //     colPref.hidden = !c.visible;
      //   }
      // });
      // this.prefClient.updateTablePreference(this.tablePref).subscribe();
      // this.authService.NotifyStateChangeToUserDetail();
    }

    protected AdjustScrollHeightDynamically() {
      if (!this.gridWidgetDiv) { // short circuit for tree-grid
        return;
      }
      const parentDiv = $(this.gridWidgetDiv.nativeElement).parents('div').get(0);
      if (parentDiv && parentDiv.clientHeight > 0) {
        const minHeight = 100; // minimum allowed height of the grid
        if (!this.scrollHeight) {
          this.scrollHeight = minHeight + 'px';
        }
        const currentHeight = parseInt(this.scrollHeight.match(/\d+/)[0], 10);
        const headerHeight = $(this.gridWidgetDiv.nativeElement).find('.ui-table-scrollable-header,.ui-treetable-scrollable-header').height();
  
        let totalSiblingsHeight = 0;
        $(parentDiv).children().each((index, childElement) => {
          if (childElement !== this.gridWidgetDiv.nativeElement &&
            childElement !== this.gridWidgetDiv.nativeElement.parentElement) {
            totalSiblingsHeight += this.getSiblingHeight(childElement);
          }
        });
  
        let newHeight = Math.max(parentDiv.clientHeight - (totalSiblingsHeight + headerHeight), minHeight);
        newHeight = Math.floor(newHeight / 27) * 27;
  
        if (currentHeight !== newHeight && newHeight > minHeight) {
          this.scrollHeight = newHeight + 'px';
          this.cdr.detectChanges();
        }
  
        if (this.GridRef) {
          this.GridRef.tableService.valueSource.next();
  
          const scrollHeight = $(this.gridWidgetDiv.nativeElement)
          .find('.ui-table-scrollable-body-table')
          .get(0).offsetHeight;
          const scrollerHeight = $(this.gridWidgetDiv.nativeElement).find('.ui-table-virtual-scroller').height();
          if (scrollHeight && scrollerHeight && scrollerHeight < scrollHeight &&
          Math.abs((scrollerHeight - scrollHeight) / scrollerHeight) < 0.1) { // max 10% deviation
          $(this.gridWidgetDiv.nativeElement).find('.ui-table-virtual-scroller').height(scrollHeight);
          }
        }
      }
    }

    protected UpdateColWidthPref() {
      if (!this.gridWidgetDiv) { // short circuit for tree-grid
        return;
      }
      $(this.gridWidgetDiv.nativeElement).find('.grid-header th').each((index, thElement) => {
        const field = $(thElement).attr('data-field');
        // if (field) {
        //   const width = $(thElement).outerWidth();
        //   const colPref = this.tablePref.columns.find(c => c.columnName === field);
        //   if (colPref && width) {
        //     colPref.width = width;
        //   }
        // }
      });
      // this.prefClient.updateTablePreference(this.tablePref).subscribe();
      // this.authService.NotifyStateChangeToUserDetail();
    }

    protected getSiblingHeight(element) {
      if (element.offsetHeight > 0) {
        if (!$.contains(element, this.gridWidgetDiv.nativeElement)) {
          return element.offsetHeight;
        }
      }
  
      let totalSiblingsHeight = 0;
      $(element).children().each((index, childElement) => {
        if (childElement !== this.gridWidgetDiv.nativeElement &&
            childElement !== this.gridWidgetDiv.nativeElement.parentElement) {
          totalSiblingsHeight += this.getSiblingHeight(childElement);
        }
      });
      return totalSiblingsHeight;
    }
}
