import datetime
from flask import Flask, request, jsonify
from flask_graphql import GraphQLView
from flask_cors import CORS, cross_origin
import graphene

app = Flask(__name__)

# Enable CORS globally + force OPTIONS handling
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

loans = [
    {"id": 1, "name": "Tom's Loan", "interest_rate": 5.0, "principal": 10000, "due_date": datetime.date(2025, 3, 1)},
    {"id": 2, "name": "Chris Wailaka", "interest_rate": 3.5, "principal": 500000, "due_date": datetime.date(2025, 3, 1)},
    {"id": 3, "name": "NP Mobile Money", "interest_rate": 4.5, "principal": 30000, "due_date": datetime.date(2025, 3, 1)},
    {"id": 4, "name": "Esther's Autoparts", "interest_rate": 1.5, "principal": 40000, "due_date": datetime.date(2025, 3, 1)},
]

loan_payments = [
    {"id": 1, "loan_id": 1, "payment_date": datetime.date(2025, 3, 4)},
    {"id": 2, "loan_id": 2, "payment_date": datetime.date(2025, 3, 15)},
    {"id": 3, "loan_id": 3, "payment_date": datetime.date(2025, 4, 5)},
]

class LoanPayment(graphene.ObjectType):
    id = graphene.Int()
    loan_id = graphene.Int()
    payment_date = graphene.Date()

class ExistingLoans(graphene.ObjectType):
    id = graphene.Int()
    name = graphene.String()
    interest_rate = graphene.Float()
    principal = graphene.Int()
    due_date = graphene.Date()
    loan_payments = graphene.List(LoanPayment)

    def resolve_loan_payments(parent, info):
        return [p for p in loan_payments if p["loan_id"] == parent["id"]]

class Query(graphene.ObjectType):
    loans = graphene.List(ExistingLoans)

    def resolve_loans(self, info):
        return loans

schema = graphene.Schema(query=Query)

app.add_url_rule(
    "/graphql", view_func=GraphQLView.as_view("graphql", schema=schema, graphiql=True)
)

@app.route("/")
def home():
    return "Welcome to the Loan Application API"

@app.route('/api/payments', methods=['POST', 'OPTIONS'])
@cross_origin(
    origins="http://localhost:5173",
    methods=['POST', 'OPTIONS'],
    allow_headers=['Content-Type'],
    max_age=300
)
def add_payment():
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.get_json()
        if data is None:
            return jsonify({"error": "Invalid JSON"}), 400

        required = ['loan_id', 'payment_date', 'amount']
        if not all(field in data for field in required):
            missing = [f for f in required if f not in data]
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

        loan_id = int(data['loan_id'])
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
        payment_date = datetime.date.fromisoformat(data['payment_date'])

        loan_exists = any(loan['id'] == loan_id for loan in loans)
        if not loan_exists:
            return jsonify({"error": f"Loan with ID {loan_id} does not exist"}), 404

        new_payment = {
            "id": len(loan_payments) + 1,
            "loan_id": loan_id,
            "payment_date": payment_date,
            "amount": amount
        }

        loan_payments.append(new_payment)

        return jsonify({
            "message": "Payment added successfully",
            "payment": new_payment
        }), 201

    except ValueError as ve:
        return jsonify({"error": "Invalid value format (check loan ID, amount or date)"}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5000)