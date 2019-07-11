import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {CalendarModule} from 'primeng/calendar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashBoardComponent } from './dash-board/dash-board.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { HomeComponent } from './home/home.component';
import {TableModule} from 'primeng/table';
import { TableWidgetComponent } from './table-widget/table-widget.component';
import { CustomersModule } from './customers/customers.module'

@NgModule({
  declarations: [
    AppComponent,
    DashBoardComponent,
    NavBarComponent,
    HomeComponent,
    TableWidgetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TableModule,DropdownModule,CalendarModule,
    FormsModule,CustomersModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
