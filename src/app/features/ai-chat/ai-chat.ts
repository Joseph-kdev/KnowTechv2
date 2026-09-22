import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
  signal,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiChat, ChatStreamError } from '../../services/ai-chat';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ai-chat.html',
  styleUrl: './ai-chat.css',
})
export class AiChatComponent {
  readonly aiChatService = inject(AiChat);
  private toastService = inject(HotToastService);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  readonly messageInput = signal<string>('');
  readonly currentChunk = signal<string>('');

  constructor() {
    effect(() => {
      if (this.aiChatService.isOpen()) {
        this.messageInput.set(this.aiChatService.inputDraft());
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });

    effect(() => {
      // Trigger auto scroll on state updates
      this.aiChatService.history();
      this.currentChunk();
      setTimeout(() => this.scrollToBottom(), 30);
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.aiChatService.isOpen()) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.aiChatService.closeChat();
  }

  clearChat(): void {
    this.aiChatService.clearHistory();
    this.currentChunk.set('');
  }

  setPrompt(prompt: string): void {
    this.messageInput.set(prompt);
  }

  async send(): Promise<void> {
    const text = this.messageInput().trim();
    if (!text || this.aiChatService.streaming()) {
      return;
    }

    this.messageInput.set('');
    this.currentChunk.set('');

    await this.aiChatService.sendMessage(
      text,
      (chunk: string) => {
        this.currentChunk.update((prev) => prev + chunk);
        this.scrollToBottom();
      },
      (error: ChatStreamError) => {
        this.handleError(error);
      },
    );

    this.currentChunk.set('');
    this.scrollToBottom();
  }

  cancelStream(): void {
    this.aiChatService.cancel();
    this.currentChunk.set('');
  }

  private handleError(error: ChatStreamError): void {
    let msg = 'An error occurred while streaming AI response.';
    if (error.type === 'timeout') {
      msg = 'Request timed out. Please try again.';
    } else if (error.type === 'server') {
      msg = `Server error: ${error.message}`;
    } else if (error.type === 'network') {
      msg = `Network error: ${error.message}`;
    } else if (error.type === 'parse') {
      msg = 'Failed to parse AI response stream.';
    }
    this.toastService.error(msg);
  }

  private scrollToBottom(): void {
    if (this.scrollContainer?.nativeElement) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
