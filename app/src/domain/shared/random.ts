export interface RandomSource {
  nextFloat(): number
  getState(): number
  setState(state: number): void
}

export class XorShift32 implements RandomSource {
  private state: number

  constructor(seed: number) {
    this.state = seed >>> 0 || 0x6d2b79f5
  }

  nextFloat(): number {
    let value = this.state
    value ^= value << 13
    value ^= value >>> 17
    value ^= value << 5
    this.state = value >>> 0
    return this.state / 0x1_0000_0000
  }

  getState(): number {
    return this.state
  }

  setState(state: number): void {
    this.state = state >>> 0 || 0x6d2b79f5
  }
}
