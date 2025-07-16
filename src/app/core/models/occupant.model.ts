import { PersonType } from './person-type.enum';

export interface Occupant {
  id: string;
  type: PersonType;
  status: 'waiting' | 'seated' | 'inLecture' | 'left';
}
