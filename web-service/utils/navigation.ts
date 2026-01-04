import { SectionOption } from "./types.ts";

export enum MainMenuOption {
  BattleArena = "battle_arena",
  Codex = "codex",
  AIWarzone = "ai_warzone",
  HallOfFame = "hall_of_fame",
  Settings = "settings",
  AILaboratory = "ai_laboratory",
}

export const sectionOptions: SectionOption[] = [
  {
    id: MainMenuOption.BattleArena,
    title: "Battle Arena",
    description:
      "Configure your match and dominate the board in tactical duels.",
    link: "/gameConfig",
    color: "blue",
  },
  {
    id: MainMenuOption.Codex,
    title: "Codex",
    description: "Master the combat rules and core expansion mechanics.",
    link: "/about",
    color: "indigo",
  },
  {
    id: MainMenuOption.AIWarzone,
    title: "AI Warzone",
    description:
      "Witness the chaos: advanced algorithms clashing against each other.",
    link: "/ai-arena",
    color: "red",
  },
  {
    id: MainMenuOption.HallOfFame,
    title: "Hall of Fame",
    description:
      "Analyze the Elo system and discover which AI is the deadliest.",
    link: "/elo-system",
    color: "emerald",
  },
  {
    id: MainMenuOption.Settings,
    title: "Settings",
    description:
      "Global settings, visual preferences, and technical configuration.",
    link: "/global-settings",
    color: "slate",
  },
  {
    id: MainMenuOption.AILaboratory,
    title: "AI Laboratory",
    description:
      "Explore the inner workings of our AIs and how they learn to win.",
    link: "/ai-laboratory",
    color: "slate",
  },
];
