import { Injectable } from '@angular/core';
import { LiveUpdates } from '../models/live-updates.model';
import { Classroom } from '../models/classroom.model';
import { Occupant } from '../models/occupant.model';
import { PersonType } from '../models/person-type.enum';
import { Semaphore } from './semaphore';
import { LoggerService } from '../services/logger.service';

@Injectable({ providedIn: 'root' })
export class SimulationService {
    liveUpdates: LiveUpdates[] = [
        { message: 'College simulation ready. All classrooms still empty', isError: false },
        { message: 'You can manually add students, visitors and lecturers to classrooms or click "Start" at the top-left corner to automate this process (You can always intervene manually).', isError: false },
    ];

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

    async addStudent(roomName: string, id: string) {
        await this.addPerson(roomName, id, PersonType.Student);
    }

    async addVisitor(roomName: string, id: string) {
        await this.addPerson(roomName, id, PersonType.Visitor);
    }

    private async addPerson(roomName: string, id: string, type: PersonType) {
        const room = this.classrooms.find(r => r.name === roomName);
        // Can't enter after the lecturer or when lecture is going on.
        // Also checking if class is not full and ensuring a max of 5 visitors per classroom
        if (!room || room.lectureRunning || room.lecturer !== undefined || room.occupants.length >= room.capacity
            || (type === PersonType.Visitor && room.occupants.filter(o => o.type === PersonType.Visitor).length >= 4)
        ) {
            this.liveUpdates.push({ message: `[Class ${roomName}] ${type} ${id} cannot enter due to constraints!`, isError: true });
            return;
        }
        const occupant: Occupant = { id, type, status: 'waiting' };
        room.occupants.push(occupant);
        this.logger.log(`[${roomName}] ${type} ${id} entered`);
        occupant.status = 'seated';
        this.logger.log(`[${roomName}] ${type} ${id} seated`);
        this.liveUpdates.push({ message: `[Class ${roomName}] ${type} ${id} entered and seated`, isError: false });
        if (type === PersonType.Student) {
            //Student cannot leave if a lecturer is in class or a lecture is going on
            // so wait until lecture is over or lecturer leaves
            // i.e ensure student attends ongoing or about to be started lecture
            while (room.lectureRunning || room.lecturer !== undefined) {
                await this.delay(500);
            }

            // Lecture is over — but student must wait 10 seconds during which a 
            // new lecture could start or a new lecturer could enter
            let safeToLeave = true;
            const leaveDeadline = Date.now() + 10000;

            // while waiting for 10 seconds, continuously check if a new lecture starts or a lecturer enters
            while (Date.now() < leaveDeadline) {
                if (room.lectureRunning || room.lecturer !== undefined) {
                    // Another lecturer entered or another lecture started during wait. Abort.
                    safeToLeave = false;
                    break;
                }
                await this.delay(500);
            }

            if (safeToLeave) {
                occupant.status = 'left';
                room.occupants = room.occupants.filter(o => o !== occupant);
                this.logger.log(`[${roomName}] Student ${id} left`);
                this.liveUpdates.push({ message: `[Class ${roomName}] Student ${id} left`, isError: false });
            } else {
                // Wait again until next lecture ends
                while (room.lectureRunning || room.lecturer !== undefined) {
                    await this.delay(500);
                }

                // After second lecture ends, student can safely leave
                occupant.status = 'left';
                room.occupants = room.occupants.filter(o => o !== occupant);
                this.logger.log(`[${roomName}] Student ${id} left`);
                this.liveUpdates.push({ message: `[Class ${roomName}] Student ${id} left`, isError: false });
            }
        } else {
            // Visitor can leave anytime after a short delay
            await this.delay(10000); // Simulate visitor's stay as 10 seconds
            occupant.status = 'left';
            room.occupants = room.occupants.filter(o => o !== occupant);
            this.logger.log(`[${roomName}] Visitor ${id} left`);
            this.liveUpdates.push({ message: `[Class ${roomName}] Visitor ${id} left`, isError: false });
        }
    }

    async addLecturer(roomName: string, id: string) {
        // check if this lecturer is not already in another classroom
        if (this.classrooms.some(r => r.lecturer === id)) {
            this.logger.log(`[${roomName}] Lecturer ${id} already in another classroom`);
            this.liveUpdates.push({ message: `[Class ${roomName}] Lecturer ${id} already in another classroom!`, isError: true });
            return;
        }
        // lecturer is free so try to enter this classroom
        const lock = this.lectLocks.get(roomName);
        if (!lock) return;  // another lecturer is already in this classroom
        await lock.acquire();   // acquire lock for this room so no other lecturer can enter while this one is in class
        const room = this.classrooms.find(r => r.name === roomName); if (!room) return;
        room.lecturer = id;
        this.logger.log(`[${roomName}] Lecturer ${id} entered`);
        this.liveUpdates.push({ message: `[Class ${roomName}] Lecturer ${id} entered`, isError: false });
        // as long as there is at least one student in the room who is not seated, lecture cannot start
        while (room.occupants.some(o => o.type === PersonType.Student && o.status !== 'seated')) {
            await this.delay(500);
        }
        // only start lecture if there's at least one student in the room
        if (room.occupants.some(o => o.type === PersonType.Student)) {
            room.lectureRunning = true;
            this.logger.log(`[${roomName}] Lecture started by ${id}`);
            this.liveUpdates.push({ message: `[Class ${roomName}] Lecture started by ${id}`, isError: false });
            await this.delay(10000); // Simulate lecture duration as 10 seconds
            room.lectureRunning = false;
            this.logger.log(`[${roomName}] Lecture ended by ${id}`);
            this.liveUpdates.push({ message: `[Class ${roomName}] Lecture ended by ${id}`, isError: false });
        }
        else {
            this.logger.log(`[${roomName}] Lecturer ${id} will leave without starting lecture since no students are present`);
            this.liveUpdates.push({ message: `[Class ${roomName}] Lecturer ${id} will leave without starting lecture since no students are present`, isError: true });
            // No students in the room, so just stay a little while and then leave
            // This little delay is so that the UI can show the lecturer entered before leaving
            await this.delay(5000);
        }
        room.lecturer = undefined;
        this.logger.log(`[${roomName}] Lecturer ${id} left`);
        this.liveUpdates.push({ message: `[Class ${roomName}] Lecturer ${id} left`, isError: false });
        lock.release(); // Release the lock so another lecturer can enter
    }


    // for auto simulation. This simulates a random person entering a random classroom every second.
    // No guarantee that the person will actually enter the room, as it depends on the room's state.
    simulateAutoTick() {
        const randomRoom = this.getRandomRoom();
        const randomPersonType = this.getRandomPersonType();

        const id = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

        switch (randomPersonType) {
            case PersonType.Student:
            case PersonType.Visitor:
                this.addPerson(randomRoom.name, id, randomPersonType);
                break;
            case PersonType.Lecturer:
                this.addLecturer(randomRoom.name, this.getRandomLecturer());
                break;
        }
    }

    // helper functions for auto simulation
    getRandomRoom(): Classroom {
        const index = Math.floor(Math.random() * this.classrooms.length);
        return this.classrooms[index];
    }

    getRandomPersonType(): PersonType {
        const r = Math.random(); // [0, 1)

        if (r < 0.6) return PersonType.Student;      // 60% We want more students
        else if (r < 0.9) return PersonType.Visitor; // 30%
        else return PersonType.Lecturer;             // 10%
    }

    getRandomLecturer(): string {
        const lecturers = ['Osama', 'Barry', 'Faheem', 'Alex', 'Aqeel', 'Waseem'];
        return lecturers[Math.floor(Math.random() * lecturers.length)];
    }

    // Helper function to simulate delay in milliseconds
    delay(ms: number) {
        return new Promise(res => setTimeout(res, ms));
    }
}
