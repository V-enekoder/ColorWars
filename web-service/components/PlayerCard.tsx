import { AgentType } from "../utils/types.ts";
import { CardColor } from "../utils/navigation.ts";

export interface PlayerCardProps {
  id: number;
  name: string;
  type: AgentType;
  color?: CardColor;
}
