import { TestBed } from '@angular/core/testing';

import { DropdownValuesService } from './dropdown-values.service';

describe('DropdownValuesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DropdownValuesService = TestBed.get(DropdownValuesService);
    expect(service).toBeTruthy();
  });
});
