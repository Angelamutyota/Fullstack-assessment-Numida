import { FC } from 'react';

interface LoanCalculatorProps {
  principal: number;
  rate: number;        // annual interest rate in %
  months: number;
}

export const LoanCalculator: FC<LoanCalculatorProps> = ({
  principal,
  rate,
  months,
}) => {
  // Simple interest formula: (P × R × T) / 100
  // But typically monthly: total interest = principal * (rate/100) * (months/12)
  const totalInterest = principal * (rate / 100) * (months / 12);
  const monthlyPayment = (principal + totalInterest) / months;

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#333', borderRadius: '8px' }}>
      <h3>Loan Calculator Results</h3>
      <p><strong>Principal:</strong> {principal.toLocaleString()}</p>
      <p><strong>Annual Rate:</strong> {rate}%</p>
      <p><strong>Term:</strong> {months} months</p>
      <p><strong>Total Interest:</strong> {totalInterest.toFixed(2)}</p>
      <p><strong>Estimated Monthly Payment:</strong> {monthlyPayment.toFixed(2)}</p>
    </div>
  );
};