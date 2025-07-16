import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { SimulationService } from '../../core/simulation/simulation.service';
import { ControlPanelComponent } from '../control-panel/control-panel.component';
import { ClassroomComponent } from '../classroom/classroom.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, ControlPanelComponent, ClassroomComponent],
  template: `
    <app-control-panel></app-control-panel>
    <div class="grid">
      <app-classroom *ngFor="let room of sim.classrooms" [room]="room"></app-classroom>
    </div>
  `,
  styles: [`.grid { display: flex; flex-wrap: wrap; }`]
})
export class DashboardComponent {
  constructor(public sim: SimulationService) {}
}
