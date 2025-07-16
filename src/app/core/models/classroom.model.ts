import { Occupant } from './occupant.model';

export interface Classroom {
  name: string;
  capacity: number;
  occupants: Occupant[];
  lecturer?: string;
  lectureRunning: boolean;
}
