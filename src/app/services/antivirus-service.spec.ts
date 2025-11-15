import { TestBed } from '@angular/core/testing';

import { AntivirusService } from './antivirus-service';

describe('AntivirusService', () => {
  let service: AntivirusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AntivirusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
