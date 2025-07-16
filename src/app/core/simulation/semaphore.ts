export class Semaphore {
    private queue: (() => void)[] = [];
    private count: number;
    constructor(public max: number) { this.count = max; }
    async acquire(): Promise<void> {
        if (this.count > 0) { this.count--; return; }
        await new Promise<void>(res => this.queue.push(res));
    }
    release(): void {
        this.count++;
        if (this.queue.length > 0) {
            this.count--;
            const next = this.queue.shift();
            next?.();
        }
    }
}
