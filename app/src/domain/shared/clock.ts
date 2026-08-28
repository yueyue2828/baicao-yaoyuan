export interface Clock {
  nowMs(): number
}

export class SystemClock implements Clock {
  constructor(private readonly readNow: () => number = Date.now) {}

  nowMs(): number {
    return this.readNow()
  }
}

export class FixedClock implements Clock {
  constructor(private currentMs: number) {}

  nowMs(): number {
    return this.currentMs
  }

  advanceMs(deltaMs: number): void {
    this.currentMs += deltaMs
  }
}
