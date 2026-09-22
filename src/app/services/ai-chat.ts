import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { serverUrl } from '../utils/utils';

import { DisplayArticle } from '../features/posts/article-card/article-card';
import { AuthService } from './authService';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export type ChatStreamError =
  | { type: 'server'; message: string }
  | { type: 'timeout' }
  | { type: 'parse'; raw: string }
  | { type: 'network'; message: string };

const STREAM_TIMEOUT_MS = 50_000;

@Service()
export class AiChat {
  history = signal<ChatMessage[]>([]);
  streaming = signal(false);
  isOpen = signal<boolean>(false);
  activeArticle = signal<DisplayArticle | null>(null);
  inputDraft = signal<string>('');
  private abortController?: AbortController;
  auth = inject(AuthService);
  private accessToken = toSignal(from(this.auth.getIdToken()));

  openChat(article: DisplayArticle): void {
    const currentArticle = this.activeArticle();
    if (!currentArticle || currentArticle.id !== article.id) {
      this.activeArticle.set(article);
      this.history.set([]);
    }
    const prefill = `Can you summarize this article: "${article.headline}" (${article.url})?`;
    this.inputDraft.set(prefill);
    this.isOpen.set(true);
  }

  closeChat(): void {
    if (this.streaming()) {
      this.cancel();
    }
    this.isOpen.set(false);
  }

  clearHistory(): void {
    this.history.set([]);
  }

  async sendMessage(
    message: string,
    onChunk: (chunk: string) => void,
    onError: (error: ChatStreamError) => void,
  ): Promise<void> {
    this.streaming.set(true);
    this.abortController = new AbortController();

    const timeoutId = setTimeout(() => {
      this.abortController?.abort();
    }, STREAM_TIMEOUT_MS);

    let receivedDone = false;

    try {
      const response = await fetch(`${serverUrl}chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken()}`,
        },
        body: JSON.stringify({ message, history: this.history() }),
        signal: this.abortController.signal,
      });

      if (!response.ok || !response.body) {
        onError({ type: 'network', message: `Request failed: ${response.status}` });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? '';

        for (const event of events) {
          if (this.handleEvent(event, onChunk, onError)) {
            receivedDone = true;
          }
        }
      }

      buffer += decoder.decode();
      if (buffer.trim() && this.handleEvent(buffer, onChunk, onError)) {
        receivedDone = true;
      }

      if (!receivedDone) {
        onError({ type: 'network', message: 'Stream ended without a done event' });
      }
    } catch (err) {
      if (this.abortController.signal.aborted) {
        onError({ type: 'timeout' });
      } else {
        onError({ type: 'network', message: (err as Error).message });
      }
    } finally {
      clearTimeout(timeoutId);
      this.streaming.set(false);
    }
  }
  private handleEvent(
    event: string,
    onChunk: (chunk: string) => void,
    onError: (error: ChatStreamError) => void,
  ): boolean {
    const lines = event.split(/\r?\n/);
    const eventType = lines.find((line) => line.startsWith('event:'))?.slice('event:'.length).trim();
    const isDone = eventType === 'done';
    const isError = eventType === 'error';
    const dataLine = lines.find((line) => line.startsWith('data:'));

    if (!dataLine) return false;

    const raw = dataLine.slice('data:'.length).trimStart();

    if (isError) {
      onError({ type: 'server', message: raw });
      return false;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      onError({ type: 'parse', raw });
      return false;
    }

    const payload = parsed as { done?: boolean; history?: ChatMessage[]; chunk?: string };

    if (isDone || payload.done === true) {
      if (payload.history) {
        this.history.set(payload.history);
      }
      return true;
    }

    if (typeof payload.chunk !== 'string') {
      onError({ type: 'parse', raw });
      return false;
    }

    onChunk(payload.chunk);
    return false;
  }

  cancel(): void {
    this.abortController?.abort();
    this.streaming.set(false);
  }
}
