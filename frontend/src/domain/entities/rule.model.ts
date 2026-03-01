export interface Rule {
  id: number;
  name: string;
  type: 'bonus' | 'malus';
  points: number;
  isDefault: boolean;
}

export interface RulePayload {
  name: string;
  type: 'bonus' | 'malus';
  points: number;
}