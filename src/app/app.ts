import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Editor } from './components/editor/editor';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Editor],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('character-counter');
}
