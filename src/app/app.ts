import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Editor } from './editor/editor';
import { Header } from './header/header';
import { StatCard } from './stat-card/stat-card';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Editor, StatCard],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('character-counter');
}
