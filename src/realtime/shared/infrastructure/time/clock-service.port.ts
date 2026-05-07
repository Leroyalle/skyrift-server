export interface ClockPort {
  now(): Date;
  nowMs(): number;
}
