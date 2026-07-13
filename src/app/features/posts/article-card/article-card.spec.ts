import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleCardComponent } from './article-card';

describe('ArticleCardComponent', () => {
  let fixture: ComponentFixture<ArticleCardComponent>;
  let component: ArticleCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleCardComponent);
    component = fixture.componentInstance;
    component.article = {
      id: '1',
      badge: 'TechCrunch',
      headline: 'Test article',
      timestamp: '2h',
      url: 'https://example.com',
      imageUrl: null,
      description: 'A short description for testing the card layout.',
    };
    fixture.detectChanges();
  });

  it('renders the no-image variant with the title, badge, description and timestamp', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Test article');
    expect(compiled.textContent).toContain('TechCrunch');
    expect(compiled.textContent).toContain('A short description for testing the card layout.');
    expect(compiled.textContent).toContain('2h');
  });
});
