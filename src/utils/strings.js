/**
 * Capitalize the first letter of each word in a string.
 */
export function capitalize(str) {
  return str
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
