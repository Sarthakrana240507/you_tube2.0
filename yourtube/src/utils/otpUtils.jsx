/**
 * Determines OTP method based on login location
 * @param {string|null} state - User login state/region
 * @returns {"email"|"mobile"} - OTP delivery method
 */
export function getOtpMethod(state) {
  const southStates = [
    "tamil nadu",
    "kerala",
    "karnataka",
    "andhra pradesh",
    "andhra",
    "telangana",
    "telungana"
  ];

  if (state && southStates.includes(state.toLowerCase())) return "email";
  return "mobile"; // fallback
}
