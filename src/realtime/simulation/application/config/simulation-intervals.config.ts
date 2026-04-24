export interface SimulationIntervals {
  movement: number;
  actions: number;
  aoe: number;
  regeneration: number;
  interaction: number;
  aiMobs: number;
  effects: number;
  projectiles: number;
}

export const SIMULATION_INTERVALS_TOKEN = Symbol('SIMULATION_INTERVALS_TOKEN');

export const SIMULATION_INTERVALS: SimulationIntervals = {
  movement: 150,
  actions: 200,
  aoe: 200,
  regeneration: 1000,
  interaction: 300,
  aiMobs: 200,
  effects: 200,
  projectiles: 100,
};
