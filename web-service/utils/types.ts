export interface GameConfig {
  rows: number;
  cols: number;
  mode: string;
  criticalPoints: number;
  num_players: number;
}

export enum PlayerColor {
  Red = "#ef4444",
  Blue = "#3b82f6",
  Empty = "#ffffff",
}

export enum GameState {
  Playing = "playing",
  Paused = "paused",
  GameOver = "gameover",
}

export enum GameMode {
  HumanVsHuman = "JvsJ",
  HumanVsIA = "JvsIA",
  IAvsIA = "IAvsIA",
}

export enum AgentType {
  Human = "human",
  RandomAI = "random",
  MinimaxAI = "minimax",
  HeuristicAI = "heuristic",
  NeuralNetwork = "nn",
}

// 1. Paleta NEON
export enum PaletteNeon {
  Red = "#ff0a12ff",
  PumpkinSpice = "#ff7300ff",
  Yellow = "#fffb00ff",
  LimeFlash = "#90fe00ff",
  NeonIce = "#00fff7ff",
  Blue = "#0015ffff",
  UltraViolet = "#8400ffff",
  BrilliantRose = "#ff00a1ff",
}

// 2. Paleta RETRO / VINTAGE
export enum PaletteRetro {
  StrawberryRed = "#f94144ff",
  AtomicTangerine = "#f3722cff",
  CarrotOrange = "#f8961eff",
  TuscanSun = "#f9c74fff",
  WillowGreen = "#90be6dff",
  Seagrass = "#43aa8bff",
  EgyptianBlue = "#003391ff",
  IndigoInk = "#38007bff",
}

// 3. Paleta SUMMER / SOFT
export enum PaletteSummer {
  Cerulean = "#227c9dff",
  PacificBlue = "#1da0a8ff",
  LightSeaGreen = "#17c3b2ff",
  ApricotCream = "#ffcb77ff",
  LightApricot = "#ffe2b3ff",
  FloralWhite = "#fef9efff",
  PowderBlush = "#feb3b1ff",
  GrapefruitPink = "#fe6d73ff",
}

// 4. Paleta EARTHY
export enum PaletteEarthy {
  CharcoalBlue = "#264653ff",
  PineBlue = "#287271ff",
  Verdigris = "#2a9d8fff",
  MutedOlive = "#8ab17dff",
  TuscanSun = "#e9c46aff",
  SunlitClay = "#efb366ff",
  SandyBrown = "#f4a261ff",
  BurntPeach = "#e76f51ff",
}

// 5. Paleta SLATE / MODERN
export enum PaletteModern {
  StrawberryRed = "#f94144ff",
  AtomicTangerine = "#f3722cff",
  CarrotOrange = "#f8961eff",
  TuscanSun = "#f9c74fff",
  WillowGreen = "#90be6dff",
  Seagrass = "#43aa8bff",
  DarkCyan = "#4d908eff",
  BlueSlate = "#577590ff",
}

// 6. Paleta SWEET PASTEL
export enum PalettePastel {
  PowderBlush = "#ffadadff",
  ApricotCream = "#ffd6a5ff",
  Cream = "#fdffb6ff",
  TeaGreen = "#caffbfff",
  ElectricAqua = "#9bf6ffff",
  BabyBlueIce = "#a0c4ffff",
  Periwinkle = "#bdb2ffff",
  Mauve = "#ffc6ffff",
}
