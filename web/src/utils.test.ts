// src/utils.test.ts
import { categorizePayments } from './utils';

// Test 1: Basic categorization with one payment (On Time)
test('categorizes payment as On Time when paid within 5 days', () => {
  const loans = [
    {
      id: 1,
      name: "Test Loan",
      interestRate: 5.0,
      principal: 10000,
      dueDate: "2025-03-01",
      loanPayments: [
        { id: 1, paymentDate: "2025-03-04" } // 3 days after due date
      ]
    }
  ];

  const result = categorizePayments(loans);

  expect(result).toHaveLength(1);
  expect(result[0].status).toBe('On Time');
  expect(result[0].paymentDate).toBe("2025-03-04");
});

// Test 2: Categorizes as Late
test('categorizes payment as Late when paid 6-30 days after due date', () => {
  const loans = [
    {
      id: 2,
      name: "Late Loan",
      interestRate: 5.0,
      principal: 10000,
      dueDate: "2025-03-01",
      loanPayments: [
        { id: 1, paymentDate: "2025-03-20" } // 19 days after
      ]
    }
  ];

  const result = categorizePayments(loans);

  expect(result[0].status).toBe('Late');
});

// Test 3: Handles unpaid loan correctly
test('marks loan as Unpaid when no payments exist', () => {
  const loans = [
    {
      id: 4,
      name: "Unpaid Loan",
      interestRate: 1.5,
      principal: 40000,
      dueDate: "2025-03-01",
      loanPayments: [] // empty array
    }
  ];

  const result = categorizePayments(loans);

  expect(result).toHaveLength(1);
  expect(result[0].status).toBe('Unpaid');
  expect(result[0].paymentDate).toBeNull();
});

// Test 4: Handles multiple payments for one loan
test('creates separate entries for each payment of the same loan', () => {
  const loans = [
    {
      id: 1,
      name: "Multi Payment Loan",
      interestRate: 5.0,
      principal: 10000,
      dueDate: "2025-03-01",
      loanPayments: [
        { id: 1, paymentDate: "2025-03-04" }, // On Time
        { id: 2, paymentDate: "2025-04-01" }  // Defaulted
      ]
    }
  ];

  const result = categorizePayments(loans);

  expect(result).toHaveLength(2);
  expect(result[0].status).toBe('On Time');
  expect(result[1].status).toBe('Defaulted');
});