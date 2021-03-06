import { Component, OnInit } from '@angular/core';
import { ColumnDef } from 'src/app/table-widget/table-widget.component';
import * as data from '../../../assets/Json/cars.json';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  public carsData;
  public selectedRowsData;
  constructor() { }
  public cols:ColumnDef[] = [
    { header: 'Brand', field: 'brand', filterMatchMode: 'equals', colWidthPercentage: '20%', type: 'dropdown', isEditable:true },
    { header: 'Year', field: 'year', filterMatchMode: '', colWidthPercentage: '20%', type: 'date' },
    { header: 'Color', field: 'color', filterMatchMode: 'in', colWidthPercentage: '20%', type: 'text' },
    { header: 'Vin', field: 'vin', filterMatchMode: 'contains', colWidthPercentage: '20%', type: 'text' },
  ]

  ngOnInit() {
    this.carsData = data.data;
  }
  update() {
    console.log("this.carsData++1222",this.carsData);
    console.log("selectedRowsData++++",this.selectedRowsData);
    //this.OnRowsSelectionChange();
  }

  public OnRowsSelectionChange(event) {
    console.log("inside function",event);
    console.log("selectedRowsData++++",this.selectedRowsData);
  }
  OnRowClicked(event) {
    console.log("inside OnRowClicked",event);
  }
}
