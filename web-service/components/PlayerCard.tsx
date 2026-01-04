import { AgentType } from "../utils/types.ts";
import { CardColor } from "../utils/types.ts";

export interface PlayerCardProps {
  id: number;
  name: string;
  type: AgentType;
  color?: CardColor;
}
