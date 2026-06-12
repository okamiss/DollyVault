export const USERNAME_PATTERN = /^[A-Za-z0-9_]{4,20}$/;

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}
