import { Component, OnInit } from '@angular/core';
import { ColumnDef } from '../table-widget/table-widget.component';
import * as data from '../../assets/Json/cars.json';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

 // public testVar:string = "Some Name!"
  public carsData;
  public dateVal;
  constructor() { }

  ngOnInit() {
    this.carsData = data.data;
    this.dateVal = new Date( 1562698799643);

  }

  public cols:ColumnDef[] = [
    { header: 'Brand', field: 'brand', filterMatchMode: 'contains', colWidthPercentage: '30%', type: 'dropdown', visible:false },
    { header: 'Year', field: 'year', filterMatchMode: 'contains', colWidthPercentage: '20%', type: 'date' },
    { header: 'Color', field: 'color', filterMatchMode: 'contains', colWidthPercentage: '30%', type: 'text' },
    { header: 'Vin', field: 'vin', filterMatchMode: 'contains', colWidthPercentage: '20%', type: 'text' },
  ]

  onEditComplete() {
    console.log("this.carsData",this.carsData);
  }
}
