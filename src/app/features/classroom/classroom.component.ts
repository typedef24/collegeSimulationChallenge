import { Component, Input } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Classroom } from '../../core/models/classroom.model';

@Component({
  selector: 'app-classroom',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  template: `
    <div class="card">
      <h3>{{room.name}} ({{room.capacity}})</h3>
      <p><strong>Lecturer:</strong> {{room.lecturer || 'none'}}</p>
      <p><strong>Lecture:</strong> <span [class.on]="room.lectureRunning">{{room.lectureRunning ? '✅' : '❌'}}</span></p>
      <div class="occupants">
        <span *ngFor="let o of room.occupants" [title]="o.status">
          <i [ngClass]="{ student: o.type === 'student', visitor: o.type === 'visitor' }"></i>
        </span>
      </div>
    </div>
  `,
  styles: [`
    .card { border: 1px solid #333; padding: 10px; margin: 10px; border-radius:4px; }
    .on { color: green; }
    .occupants { display: flex; flex-wrap: wrap; }
    i { width: 16px; height:16px; margin:2px; display:block; }
    i.student { background: blue; }
    i.visitor { background: orange; }
  `]
})
export class ClassroomComponent {
  @Input() room!: Classroom;
}
