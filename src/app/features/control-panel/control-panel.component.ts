import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { SimulationService } from '../../core/simulation/simulation.service';
import { MonitorService } from '../../core/simulation/monitor.service';

@Component({
    selector: 'app-control-panel',
    standalone: true,
    imports: [NgFor],
    templateUrl: './control-panel.component.html',
    styleUrl: './control-panel.component.scss',
})
export class ControlPanelComponent {
    studentCount = 0;
    visitorCount = 0;
    lecturerIds = ['Osama', 'Barry', 'Faheem', 'Alex', 'Aqeel', 'Waseem'];
    // for auto simulate
    isAutoRunning = false;
    autoIntervalId: any;

    constructor(public sim: SimulationService, private mon: MonitorService) { 
        // Automatically start the monitor when the component is initialized
        // The monitor somehow makes the classrooms to update their state properly and on time
        this.startMonitor();
    }

    startMonitor() { this.mon.start(); }

    addStudent(room: string) {
        this.sim.addStudent(room, 'S' + (++this.studentCount));
    }

    addVisitor(room: string) {
        this.sim.addVisitor(room, 'V' + (++this.visitorCount));
    }

    addLecturer(room: string, id: string) {
        this.sim.addLecturer(room, id);
    }


    // for auto simulate
    startAutoSimulation() {
        this.isAutoRunning = true;
        this.autoIntervalId = setInterval(() => {
            this.sim.simulateAutoTick();  // triggers an auto cycle
        }, 1000);
    }

    stopAutoSimulation() {
        this.isAutoRunning = false;
        clearInterval(this.autoIntervalId);
    }
}
