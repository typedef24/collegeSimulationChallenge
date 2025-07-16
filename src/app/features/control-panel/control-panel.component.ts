import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { SimulationService } from '../../core/simulation/simulation.service';
import { MonitorService } from '../../core/simulation/monitor.service';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="panel">
      <button (click)="startMonitor()">Start Monitor</button>
      <div *ngFor="let room of sim.classrooms">
        <h4>{{room.name}}</h4>
        <button (click)="addStudent(room.name)">Add Student</button>
        <button (click)="addVisitor(room.name)">Add Visitor</button>
        <select #lit>
          <option *ngFor="let l of lecturerIds" [value]="l">{{l}}</option>
        </select>
        <button (click)="addLecturer(room.name, lit.value)">Add Lecturer</button>
      </div>
    </div>
  `,
  styles: [`
    .panel { border: 1px solid #666; padding: 10px; margin: 10px; }
    button, select { margin: 3px; }
  `]
})
export class ControlPanelComponent {
  studentCount=0; visitorCount=0;
  lecturerIds=['Osama','Barry','Faheem','Alex','Aqeel','Waseem'];

  constructor(public sim: SimulationService, private mon: MonitorService) {}
  startMonitor() { this.mon.start(); }
  addStudent(room:string) { this.sim.addStudent(room, 'S' + (++this.studentCount)); }
  addVisitor(room:string) { this.sim.addVisitor(room, 'V' + (++this.visitorCount)); }
  addLecturer(room:string, id:string) { this.sim.addLecturer(room, id); }
}
