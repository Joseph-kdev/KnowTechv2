import { Component } from '@angular/core';
import { Sidebar } from "../../features/sidebar/sidebar";
import { RouterOutlet } from '@angular/router';
import { AiChatComponent } from '../../features/ai-chat/ai-chat';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, Sidebar, AiChatComponent],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {}
