import { DashedLine, DottedLine, SolidLine } from "../assets/icons";

export const SHORT_CUTS = [
  [" "],
  ["Backspace"],
  ["Delete"],
  ["Control", "d"],
  ["Control", "z"],
  ["Control", "y"],
  ["Control", "s"],
  ["Control", "S"],
  ["Control", "Shift"],
  ["ArrowLeft"],
  ["ArrowRight"],
  ["ArrowUp"],
  ["ArrowDown"],
];

export const BACKGROUND_COLORS = [
  "transparent",
  "rgb(255, 201, 201)",
  "rgb(178, 242, 187)",
  "rgb(165, 216, 255)",
  "rgb(255, 236, 153)",
];

export const STROKE_COLORS = [
  "rgb(30, 30, 30)",
  "rgb(224, 49, 49)",
  "rgb(47, 158, 68)",
  "rgb(25, 113, 194)",
  "rgb(240, 140, 0)",
];

export const STROKE_STYLES = [
  {
    slug: "solid",
    icon: SolidLine,
  },
  {
    slug: "dashed",
    icon: DashedLine,
  },
  {
    slug: "dotted",
    icon: DottedLine,
  },
];

export const CANVAS_BACKGROUND = [
  "rgb(255, 201, 201)",
  "rgb(178, 242, 187)",
  "rgb(165, 216, 255)",
  "rgb(255, 236, 153)",
];