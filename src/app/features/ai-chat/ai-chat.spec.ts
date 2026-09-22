import { ComponentFixture, TestBed } from '@angular/core';
import { AiChatComponent } from './ai-chat';
import { AiChat } from '../../services/ai-chat';

describe('AiChatComponent', () => {
  let component: AiChatComponent;
  let fixture: ComponentFixture<AiChatComponent>;
  let aiChatService: AiChat;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiChatComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AiChatComponent);
    component = fixture.componentInstance;
    aiChatService = TestBed.inject(AiChat);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should prefill prompt input when modal opens for an article', () => {
    aiChatService.openChat({
      id: '1',
      badge: 'Tech',
      headline: 'Sample Article Title',
      timestamp: '1h',
      url: 'https://example.com/article',
      imageUrl: null,
    });
    fixture.detectChanges();

    expect(aiChatService.isOpen()).toBe(true);
    expect(component.messageInput()).toContain('Sample Article Title');
    expect(component.messageInput()).toContain('https://example.com/article');
  });
});
