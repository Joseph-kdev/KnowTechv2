import { TestBed } from '@angular/core/testing';
import { Home } from './home';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Home);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have 4 newsfeed articles', () => {
    const fixture = TestBed.createComponent(Home);
    expect(fixture.componentInstance.newsfeedArticles.length).toBe(4);
  });
});
