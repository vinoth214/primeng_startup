import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DropdownValuesService {

  constructor() { }
  public brands = [
    {label: 'Audi', value: 'Audi'},
    {label: 'BMW', value: 'BMW'},
    {label: 'Fiat', value: 'Fiat'},
    {label: 'Ford', value: 'Ford'},
    {label: 'Honda', value: 'Honda'},
    {label: 'Jaguar', value: 'Jaguar'},
    {label: 'Mercedes', value: 'Mercedes'},
    {label: 'Renault', value: 'Renault'},
    {label: 'VW', value: 'VW'},
    {label: 'Volvo', value: 'Volvo'}
];
dropValuesAssigner(value) {
  if(value){
    return this.brands;
  }
 
}
}
