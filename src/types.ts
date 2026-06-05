export type Expression =
  | 'idle'
  | 'talking'
  | 'thinking'
  | 'sad'
  | 'angry'
  | 'excited'
  | 'surprised'
  | 'sleepy'
  | 'blushing'
  | 'glitch'
  | 'wink'
  | 'love'
  | 'cool'
  | 'scared';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bmo';
  text: string;
  expression: Expression;
  timestamp: string;
}

export interface BmoResponse {
  text: string;
  expression: Expression;
}
