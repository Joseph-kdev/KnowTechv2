import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addfeeds } from './addfeeds';

describe('Addfeeds', () => {
  let component: Addfeeds;
  let fixture: ComponentFixture<Addfeeds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addfeeds],
    }).compileComponents();

    fixture = TestBed.createComponent(Addfeeds);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
