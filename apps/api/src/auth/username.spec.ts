import { describe, expect, it } from 'vitest';
import { isValidUsername } from './username';

describe('isValidUsername', () => {
  it('accepts 4-20 character usernames containing letters, numbers, and underscores', () => {
    expect(isValidUsername('dolly_01')).toBe(true);
    expect(isValidUsername('A123')).toBe(true);
    expect(isValidUsername('user_name_2026')).toBe(true);
  });

  it('rejects usernames outside the allowed format', () => {
    expect(isValidUsername('abc')).toBe(false);
    expect(isValidUsername('this_name_is_way_too_long')).toBe(false);
    expect(isValidUsername('玲娜贝儿')).toBe(false);
    expect(isValidUsername('user-name')).toBe(false);
    expect(isValidUsername('has space')).toBe(false);
  });
});
