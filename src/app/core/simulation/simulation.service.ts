import { Injectable } from '@angular/core';
import { Classroom } from '../models/classroom.model';
import { Occupant } from '../models/occupant.model';
import { PersonType } from '../models/person-type.enum';
import { Semaphore } from './semaphore';
import { LoggerService } from '../services/logger.service';

@Injectable({ providedIn: 'root' })
export class SimulationService {
    classrooms: Classroom[] = [
        { name: 'W201', capacity: 60, occupants: [], lectureRunning: false },
        { name: 'W202', capacity: 60, occupants: [], lectureRunning: false },
        { name: 'W101', capacity: 20, occupants: [], lectureRunning: false },
        { name: 'JS101', capacity: 30, occupants: [], lectureRunning: false },
    ];
    private lectLocks = new Map<string, Semaphore>();
    constructor(private logger: LoggerService) {
        this.classrooms.forEach(c => this.lectLocks.set(c.name, new Semaphore(1)));
    }

    printStatus() {
        this.classrooms.forEach(c => {
            this.logger.log(`[${c.name}] Lecturer: ${c.lecturer ?? 'none'} | Running: ${c.lectureRunning}`);
            this.logger.log(` Occupants: ${c.occupants.map(o => `${o.type}:${o.id}:${o.status}`).join(', ')}`);
        });
    }

    async addStudent(roomName: string, id: string) { await this.addPerson(roomName, id, PersonType.Student); }
    async addVisitor(roomName: string, id: string) { await this.addPerson(roomName, id, PersonType.Visitor); }
    private async addPerson(roomName: string, id: string, type: PersonType) {
        const room = this.classrooms.find(r => r.name === roomName);
        // Can't enter after the lecturer or when lecture is going on.
        // Also checking if class is not full and ensuring a max of 5 visitors per classroom
        if (!room || room.lectureRunning || room.lecturer != undefined || room.occupants.length >= room.capacity
            || (type === PersonType.Visitor && room.occupants.filter(o => o.type === PersonType.Visitor).length >= 5)
        ) return;
        const occupant: Occupant = { id, type, status: 'waiting' };
        room.occupants.push(occupant);
        this.logger.log(`[${roomName}] ${type} ${id} entered`);
        occupant.status = 'seated';
        this.logger.log(`[${roomName}] ${type} ${id} seated`);
        if (type === PersonType.Student) {
            while (room.lectureRunning || room.lecturer != undefined) {    //Student cannot leave if a lecturer is in class or a lecture is going on
                await this.delay(500);  //delay and then check again
            }
            // lecture not running & no lecturer in class so wait for some time and then leave
            await this.delay(5000);
            occupant.status = 'left';
            room.occupants = room.occupants.filter(o => o !== occupant);
            this.logger.log(`[${roomName}] Student ${id} left`);
        } else {
            // Visitor can leave anytime after a short delay
            await this.delay(5000);
            occupant.status = 'left';
            room.occupants = room.occupants.filter(o => o !== occupant);
            this.logger.log(`[${roomName}] Visitor ${id} left`);
        }
    }

    async addLecturer(roomName: string, id: string) {
        const lock = this.lectLocks.get(roomName);
        if (!lock) return;
        await lock.acquire();
        const room = this.classrooms.find(r => r.name === roomName); if (!room) return;
        room.lecturer = id;
        this.logger.log(`[${roomName}] Lecturer ${id} entered`);
        // as long as there is at least one student in the room who is not seated, lecture cannot start
        while (room.occupants.some(o => o.type === PersonType.Student && o.status !== 'seated')) {
            await this.delay(500);
        }
        room.lectureRunning = true;
        this.logger.log(`[${roomName}] Lecture started by ${id}`);
        await this.delay(5000); // Simulate lecture duration as 5 seconds
        room.lectureRunning = false;
        this.logger.log(`[${roomName}] Lecture ended by ${id}`);
        room.lecturer = undefined;
        this.logger.log(`[${roomName}] Lecturer ${id} left`);
        lock.release(); // Release the lock so another lecturer can enter
    }

    delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }
}
