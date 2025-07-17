import { Component, Input } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Classroom } from '../../core/models/classroom.model';

@Component({
    selector: 'app-classroom',
    standalone: true,
    imports: [NgIf, NgFor, NgClass],
    templateUrl: './classroom.component.html',
    styleUrl: './classroom.component.scss',
})
export class ClassroomComponent {
    @Input() room!: Classroom;

    get occupantsComment(): string {
        if (!this.room) return '';
        const len = this.room.occupants.length;
        if (len === 0) return '(Empty)';
        if (len === this.room.capacity) return '(Full)';
        return '';
    }

}
