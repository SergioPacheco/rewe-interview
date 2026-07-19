import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-resume',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss'
})
export class ResumeComponent {}
