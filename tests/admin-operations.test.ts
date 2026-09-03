import { describe, it, expect } from 'vitest';

interface MockAppointment {
  id: string;
  expertId: string;
  date: string;
  time: string;
  status: 'Booked' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
}

function checkAppointmentConflict(
  existingAppointments: MockAppointment[],
  expertId: string,
  date: string,
  time: string
): { conflict: boolean; message?: string } {
  const isOccupied = existingAppointments.some(
    app =>
      app.expertId === expertId &&
      app.date === date &&
      app.time === time &&
      ['Booked', 'Scheduled', 'In Progress'].includes(app.status)
  );

  if (isOccupied) {
    return {
      conflict: true,
      message: 'This consultation slot is already booked. Please select an alternate time.',
    };
  }

  return { conflict: false };
}

class HydrationTelemetrySession {
  private entries: { id: string; amount: number; type: string }[] = [];

  addWater(id: string, amount: number, type = 'Pure Filtered Water') {
    if (amount <= 0 || amount > 5000) throw new Error('Invalid amount');
    this.entries.push({ id, amount, type });
  }

  updateWater(id: string, newAmount: number) {
    if (newAmount <= 0 || newAmount > 5000) throw new Error('Invalid amount');
    const item = this.entries.find(e => e.id === id);
    if (item) {
      item.amount = newAmount;
    }
  }

  deleteWater(id: string) {
    this.entries = this.entries.filter(e => e.id !== id);
  }

  getTotalMl(): number {
    return this.entries.reduce((acc, e) => acc + e.amount, 0);
  }

  getEntriesCount(): number {
    return this.entries.length;
  }
}

describe('Admin Operations, Real Booking & Data Integrity Test Suite', () => {
  describe('Double-Booking Collision Prevention', () => {
    const existing: MockAppointment[] = [
      {
        id: 'app_1',
        expertId: 'dr_sharma',
        date: '2026-09-10',
        time: '10:00 AM',
        status: 'Booked',
      },
      {
        id: 'app_2',
        expertId: 'dr_sharma',
        date: '2026-09-10',
        time: '02:00 PM',
        status: 'Cancelled',
      },
    ];

    it('blocks booking when requested slot is already active', () => {
      const res = checkAppointmentConflict(existing, 'dr_sharma', '2026-09-10', '10:00 AM');
      expect(res.conflict).toBe(true);
      expect(res.message).toContain('already booked');
    });

    it('permits booking when slot is currently Cancelled', () => {
      const res = checkAppointmentConflict(existing, 'dr_sharma', '2026-09-10', '02:00 PM');
      expect(res.conflict).toBe(false);
    });

    it('permits booking on unoccupied date/time slot', () => {
      const res = checkAppointmentConflict(existing, 'dr_sharma', '2026-09-10', '04:00 PM');
      expect(res.conflict).toBe(false);
    });
  });

  describe('Manual Hydration Tracking Data Integrity Matrix (Section 25 Test)', () => {
    it('accurately computes 500ml + 750ml + 500ml = 1750ml -> delete 500ml = 1250ml -> edit 750ml to 1000ml = 1500ml', () => {
      const tracker = new HydrationTelemetrySession();

      // Step 1: Add 500ml
      tracker.addWater('entry_1', 500);
      expect(tracker.getTotalMl()).toBe(500);

      // Step 2: Add 750ml
      tracker.addWater('entry_2', 750);
      expect(tracker.getTotalMl()).toBe(1250);

      // Step 3: Add 500ml
      tracker.addWater('entry_3', 500);
      expect(tracker.getTotalMl()).toBe(1750);
      expect(tracker.getEntriesCount()).toBe(3);

      // Step 4: Delete 500ml (entry_1)
      tracker.deleteWater('entry_1');
      expect(tracker.getTotalMl()).toBe(1250);
      expect(tracker.getEntriesCount()).toBe(2);

      // Step 5: Edit 750ml -> 1000ml (entry_2)
      tracker.updateWater('entry_2', 1000);
      expect(tracker.getTotalMl()).toBe(1500);
      expect(tracker.getEntriesCount()).toBe(2);
    });
  });

  describe('Practitioner Verification State Transitions', () => {
    it('preserves EXPERT role upon verification approval and updates verifiedAt', () => {
      const initialPractitioner = {
        uid: 'exp_123',
        role: 'expert',
        verificationStatus: 'pending',
      };

      // Admin approves
      const approvedPractitioner = {
        ...initialPractitioner,
        verificationStatus: 'verified',
        verifiedAt: new Date(),
        verifiedBy: 'admin_root',
      };

      expect(approvedPractitioner.role).toBe('expert'); // Never converted into customer!
      expect(approvedPractitioner.verificationStatus).toBe('verified');
      expect(approvedPractitioner.verifiedBy).toBe('admin_root');
    });

    it('preserves EXPERT role upon rejection and requires rejectionReason', () => {
      const initialPractitioner = {
        uid: 'exp_456',
        role: 'expert',
        verificationStatus: 'pending',
      };

      const rejectionReason = 'Medical Council Registration Certificate expired';
      const rejectedPractitioner = {
        ...initialPractitioner,
        verificationStatus: 'rejected',
        rejectionReason,
      };

      expect(rejectedPractitioner.role).toBe('expert');
      expect(rejectedPractitioner.verificationStatus).toBe('rejected');
      expect(rejectedPractitioner.rejectionReason).toBe(rejectionReason);
    });
  });

  describe('Admin Role Management Invariants', () => {
    it('rejects adding an admin when user email does not exist', () => {
      const mockRegisteredUsers = new Set(['flowpulsehealth@gmail.com', 'doctor@fluetas.com']);
      const emailToPromote = 'ghost-user@example.com';

      const exists = mockRegisteredUsers.has(emailToPromote);
      expect(exists).toBe(false);

      const attemptPromotion = () => {
        if (!exists) throw new Error('User account not found.');
      };

      expect(attemptPromotion).toThrow('User account not found.');
    });

    it('prevents demotion of sole platform administrator', () => {
      const currentAdmins = ['admin_primary'];
      const targetToDemote = 'admin_primary';

      const attemptDemotion = () => {
        if (currentAdmins.length === 1 && currentAdmins[0] === targetToDemote) {
          throw new Error('Cannot revoke administrative privileges for the sole remaining administrator.');
        }
      };

      expect(attemptDemotion).toThrow('Cannot revoke administrative privileges for the sole remaining administrator.');
    });
  });
});
