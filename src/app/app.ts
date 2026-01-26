import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Editor } from './components/editor/editor';
import { StatCard } from './components/stat-card/stat-card';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Editor, StatCard],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('character-counter');
}
