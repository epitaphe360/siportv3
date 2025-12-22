import { describe, it, expect } from 'vitest';
import { 
  VISITOR_QUOTAS, 
  getVisitorQuota, 
  calculateRemainingQuota 
} from '../../src/config/quotas';

describe('Quotas System', () => {
  describe('VISITOR_QUOTAS', () => {
    it('should have correct quota values', () => {
      expect(VISITOR_QUOTAS.free).toBe(0);
      expect(VISITOR_QUOTAS.premium).toBe(10); // VIP: 10 demandes max selon CDC
    });
  });

  describe('getVisitorQuota', () => {
    it('should return correct quota for valid level', () => {
      expect(getVisitorQuota('free')).toBe(0);
      expect(getVisitorQuota('premium')).toBe(10); // VIP: 10 demandes max selon CDC
    });

    it('should return 0 for undefined level', () => {
      expect(getVisitorQuota(undefined)).toBe(0);
    });

    it('should return 0 for invalid level', () => {
      expect(getVisitorQuota('invalid')).toBe(0);
    });
  });

  describe('calculateRemainingQuota', () => {
    it('should calculate remaining quota correctly', () => {
      expect(calculateRemainingQuota('premium', 2)).toBe(8); // 10 - 2 = 8
    });

    it('should not return negative values', () => {
      expect(calculateRemainingQuota('free', 10)).toBe(0);
    });

    it('should handle undefined level', () => {
      expect(calculateRemainingQuota(undefined, 0)).toBe(0);
    });
  });
});
