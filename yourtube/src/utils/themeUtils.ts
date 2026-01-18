const SOUTH_STATES = [
  "tamil nadu",
  "kerala",
  "karnataka",
  "andhra pradesh",
  "andhra",
  "telangana",
  "telungana"
];

export function getTheme(state: string, hour: number) {
  if (!state) return "dark";

  const isSouth = SOUTH_STATES.includes(state.toLowerCase());
  const isWhiteTime = hour >= 10 && hour < 12;

  return isSouth && isWhiteTime ? "light" : "dark";
}

export { SOUTH_STATES };
