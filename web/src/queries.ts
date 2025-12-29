// src/queries.ts
import { gql } from '@apollo/client';

export const GET_LOANS = gql`
  query GetLoans {
    loans {
      id
      name
      interestRate
      principal
      dueDate
      loanPayments {
        id
        paymentDate
      }
    }
  }
`;