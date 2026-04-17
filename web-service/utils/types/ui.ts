import { MainMenuOption } from "@/utils/navigation.ts";

export type CardColor = "blue" | "indigo" | "red" | "emerald" | "slate";

export interface SectionOption {
  id: MainMenuOption;
  title: string;
  description: string;
  link: string;
  color: CardColor;
}
