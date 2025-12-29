export type Payment = {
  id: number;
  paymentDate: string | null;  // ISO date string or null
};

export type Loan = {
  id: number;
  name: string;
  interestRate: number;
  principal: number;
  dueDate: string;
  loanPayments: Payment[];
};

export type CategorizedItem = {
  id: number;
  name: string;
  interest_rate: number;
  principal: number;
  dueDate: string;
  paymentDate: string | null;
  status: 'On Time' | 'Late' | 'Defaulted' | 'Unpaid';
};

export function categorizePayments(loans: Loan[]): CategorizedItem[] {
  const result: CategorizedItem[] = [];

  for (const loan of loans) {
    for (const payment of loan.loanPayments) {
      let status: CategorizedItem['status'] = 'Unpaid';
      let paymentDate: string | null = null;

      if (payment.paymentDate) {
        paymentDate = payment.paymentDate;  // already string from GraphQL
        const due = new Date(loan.dueDate);
        const paid = new Date(payment.paymentDate);
        const diffDays = Math.floor((paid.getTime() - due.getTime()) / (1000 * 3600 * 24));

        if (diffDays <= 5) status = 'On Time';
        else if (diffDays <= 30) status = 'Late';
        else status = 'Defaulted';
      }

      result.push({
        id: loan.id,
        name: loan.name,
        interest_rate: loan.interestRate,
        principal: loan.principal,
        dueDate: loan.dueDate,
        paymentDate,
        status,
      });
    }

    // If no payments, add Unpaid entry for the loan
    if (loan.loanPayments.length === 0) {
      result.push({
        id: loan.id,
        name: loan.name,
        interest_rate: loan.interestRate,
        principal: loan.principal,
        dueDate: loan.dueDate,
        paymentDate: null,
        status: 'Unpaid',
      });
    }
  }

  return result;
}