import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgFor } from '@angular/common';
import { SimulationService } from '../../core/simulation/simulation.service';
import { ControlPanelComponent } from '../control-panel/control-panel.component';
import { ClassroomComponent } from '../classroom/classroom.component';
import { LiveUpdates } from '../../core/models/live-updates.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [NgFor, ControlPanelComponent, ClassroomComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
    liveUpdates: LiveUpdates[] = [];
    constructor(public sim: SimulationService) {
        this.liveUpdates = sim.liveUpdates;
    }

    // Code to make live updates scrollable
    // This will ensure that the live updates section scrolls to the bottom when new updates are added
    // This is useful for real-time updates in the dashboard
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        const element = this.scrollContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
    }
}
