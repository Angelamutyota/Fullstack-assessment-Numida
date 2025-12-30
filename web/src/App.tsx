import "./App.css";
import { useQuery } from "@apollo/client";
import { GET_LOANS } from "./queries";
import { categorizePayments, CategorizedItem } from "./utils";
import { useState } from "react";
import { useApolloClient } from "@apollo/client";

/**
 * Component for adding a new loan payment via REST API.
 * Submits payment details to the backend and auto-refreshes the loan list on success.
 */
const AddNewPayment = () => {
  const client = useApolloClient();
  const [loanId, setLoanId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(""); // ← New state for date
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles form submission: sends payment data to REST endpoint,
   * shows success/error feedback, and triggers refetch of loans on success.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentDate) {
      setError("Please select a payment date");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("http://localhost:2024/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loan_id: parseInt(loanId),
          payment_date: paymentDate, // ← Use selected date
          amount: parseFloat(amount),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to add payment");
      }

      await response.json();
      setMessage(
        `Payment added successfully! Amount: ${amount} on ${paymentDate}`
      );
      setLoanId("");
      setAmount("");
      setPaymentDate("");

      await client.refetchQueries({
        include: [GET_LOANS],
      });
    } catch (err: any) {
      const errorMsg = err.message || "Something went wrong";

      let friendlyMessage = errorMsg;

      // Mapping backend errors to user-friendly text
      if (errorMsg.includes("does not exist")) {
        friendlyMessage = `Loan ID ${loanId} was not found. Please check the list above and use a valid ID.`;
      } else if (errorMsg.includes("Invalid value format")) {
        friendlyMessage =
          "Invalid input — please check Loan ID (number), Amount (positive number), and Date format.";
      } else if (errorMsg.includes("Amount must be positive")) {
        friendlyMessage = "Amount must be a positive number.";
      } else if (errorMsg.includes("Missing required fields")) {
        friendlyMessage = "Please fill in all fields (Loan ID, Amount, Date).";
      } else if (errorMsg.includes("An unexpected error")) {
        friendlyMessage =
          "Something went wrong on the server. Please try again later.";
      }

      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Add New Payment</h2>
      <form onSubmit={handleSubmit}>
        {/* Loan ID */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Loan ID
          </label>
          <input
            type="number"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            required
            min="1"
            style={{ padding: "0.5rem", width: "200px" }}
          />
        </div>

        {/* Amount */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.01"
            style={{ padding: "0.5rem", width: "200px" }}
          />
        </div>

        {/* Payment date picker */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Payment Date
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
            max={new Date().toISOString().split("T")[0]}
            style={{ padding: "0.5rem", width: "200px" }}
          />
        </div>

        {/* Submit button with loading state */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.7rem 1.5rem",
            backgroundColor: loading ? "#666" : "#646cff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Adding..." : "Add Payment"}
        </button>
      </form>

        {/* Success / Error feedback */}
      {message && <p style={{ color: "lime", marginTop: "1rem" }}>{message}</p>}
      {error && (
        <p style={{ color: "red", marginTop: "1rem" }}>Error: {error}</p>
      )}
    </div>
  );
};


/**
 * Main application component.
 * Fetches existing loans via GraphQL, categorizes payments, and renders the UI.
 */
function App() {
  const { loading, error, data } = useQuery(GET_LOANS);

  // Loading and error states
  if (loading) return <p>Loading loans...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  // Extract loans from query response (fallback to empty array)
  const loans = data?.loans || [];

  // Categorize payments into display-friendly format
  const categorizedLoans: CategorizedItem[] = categorizePayments(loans);

  return (
    <>
      <div>
        <h1>Existing Loans & Payments</h1>

        {/* Loan list display */}
        {categorizedLoans.length === 0 ? (
          <p>No loans found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {categorizedLoans.map((item) => (
              <li
                key={`${item.id}-${item.paymentDate || "unpaid"}`}
                style={{
                  border: "1px solid #444",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "16px",
                  backgroundColor: "#2a2a2a",
                }}
              >
                <strong>{item.name}</strong>
                <br />
                Principal: {item.principal} | Interest Rate:{" "}
                {item.interest_rate}%
                <br />
                Due Date: {item.dueDate}
                <br />
                Payment Date: {item.paymentDate || "Not paid"}
                <br />
                <span
                  style={{
                    fontWeight: "bold",
                    color:
                      item.status === "On Time"
                        ? "green"
                        : item.status === "Late"
                        ? "orange"
                        : item.status === "Defaulted"
                        ? "red"
                        : "grey",
                    fontSize: "1.1em",
                  }}
                >
                  Status: {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Form to add new payment */}
        <h1>Add New Payment</h1>
        <AddNewPayment />{" "}
      </div>
    </>
  );
}

export default App;
