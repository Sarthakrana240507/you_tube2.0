export const isValidComment = (text) => {
  // Allows letters from any language, numbers, spaces, and basic punctuation
  // Blocks special characters like @, #, $, %, etc.
  const regex = /^[\p{L}\p{N}\s.,!?'-]+$/u;
  return regex.test(text);
};
