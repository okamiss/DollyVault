import { describe, expect, it } from 'vitest';
import { money } from './utils';

describe('money', () => {
  it('formats values as CNY', () => {
    expect(money(399)).toContain('399.00');
  });
});
