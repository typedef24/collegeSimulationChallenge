import { Injectable } from '@angular/core';
import { SimulationService } from './simulation.service';

@Injectable({ providedIn: 'root' })
export class MonitorService {
  constructor(private sim: SimulationService) {}
  start() {
    setInterval(() => { console.clear(); this.sim.printStatus(); }, 2000);
  }
}
