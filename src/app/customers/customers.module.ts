import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomersRoutingModule } from './customers-routing.module';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { TableWidgetComponent } from './../table-widget/table-widget.component';
import { OrdersModule} from './../orders/orders.module'
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [CustomerListComponent],
  imports: [
    CommonModule,
    CustomersRoutingModule,
    OrdersModule,
    TableModule
  ]
})
export class CustomersModule { }
