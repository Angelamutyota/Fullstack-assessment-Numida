import './App.css'
import { useQuery } from '@apollo/client';
import { GET_LOANS } from './queries';
import { categorizePayments, CategorizedItem } from './utils';


const AddNewPayment = () => {
    return (
        <div>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <p>
                    <label>Payment Loan Id</label>
                    <input name="loan-id" onChange={() => {}} />
                </p>

                <p>
                    <label>Payment Amount</label>
                    <input
                        name="payment-amount"
                        type="number"
                        onChange={() => {}}
                    />
                </p>
                <p>
                    <button type="submit">Add Payment</button>
                </p>
            </form>
        </div>
    )
}

function App() {
  const { loading, error, data } = useQuery(GET_LOANS);

  if (loading) return <p>Loading loans...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  const loans = data?.loans || [];
  const categorizedLoans: CategorizedItem[] = categorizePayments(loans);

  return (
    <>
      <div>
        <h1>Existing Loans & Payments</h1>

        {categorizedLoans.length === 0 ? (
          <p>No loans found.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {categorizedLoans.map((item) => (
              <li
                key={`${item.id}-${item.paymentDate || 'unpaid'}`}
                style={{
                  border: '1px solid #444',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  backgroundColor: '#2a2a2a',
                }}
              >
                <strong>{item.name}</strong>
                <br />
                Principal: {item.principal} | Interest Rate: {item.interest_rate}%
                <br />
                Due Date: {item.dueDate}
                <br />
                Payment Date: {item.paymentDate || 'Not paid'}
                <br />
                <span
                  style={{
                    fontWeight: 'bold',
                    color:
                      item.status === 'On Time'
                        ? 'green'
                        : item.status === 'Late'
                        ? 'orange'
                        : item.status === 'Defaulted'
                        ? 'red'
                        : 'grey',
                    fontSize: '1.1em',
                  }}
                >
                  Status: {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}

        <h1>Add New Payment</h1>
        <AddNewPayment />
      </div>
    </>
  );
}

export default App
