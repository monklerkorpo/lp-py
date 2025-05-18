from flask import Flask, request, jsonify
from flask_cors import CORS
from pulp import (
    LpProblem, LpMaximize, LpMinimize, LpVariable, LpStatus, LpStatusOptimal,
    lpSum, PULP_CBC_CMD
)
from http import HTTPStatus
from typing import Dict, List, Tuple, Any

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для всех доменов

def parse_input(data: Dict[str, Any]) -> Tuple[List[float], List[Dict], str, str]:
    try:
        objective = data.get('objective')
        constraints = data.get('constraints')
        method = data.get('method', 'simplex').lower()
        optimize_type = data.get('optimize_type', 'max').lower()

        if not isinstance(objective, list) or not objective:
            raise ValueError("Objective must be a non-empty list of coefficients")
        if not isinstance(constraints, list) or not constraints:
            raise ValueError("Constraints must be a non-empty list")
        if method not in ['simplex', 'artificial']:
            raise ValueError("Method must be 'simplex' or 'artificial'")
        if optimize_type not in ['max', 'min']:
            raise ValueError("Optimize_type must be 'max' or 'min'")

        return objective, constraints, method, optimize_type
    except Exception as e:
        raise ValueError(f"Invalid input format: {str(e)}")

def create_lp_model(objective: List[float], constraints: List[Dict], optimize_type: str) -> Tuple[LpProblem, List[LpVariable]]:
    sense = LpMaximize if optimize_type == 'max' else LpMinimize
    prob = LpProblem("Linear_Programming_Problem", sense)

    var_count = len(objective)
    variables = [LpVariable(f"x{i+1}", lowBound=0) for i in range(var_count)]

    # Objective function
    prob += lpSum(objective[i] * variables[i] for i in range(var_count)), "Objective"

    # Constraints
    for idx, constr in enumerate(constraints):
        coefficients = constr.get('coefficients', [])
        rhs = constr.get('rhs', 0)
        constr_type = constr.get('type', '<=')

        if len(coefficients) != var_count:
            raise ValueError(f"Constraint {idx+1} has incorrect number of coefficients")
        if not isinstance(rhs, (int, float)):
            raise ValueError(f"Constraint {idx+1} right-hand side must be a number")

        expr = lpSum(coefficients[i] * variables[i] for i in range(var_count))

        if constr_type == '<=':
            prob += expr <= rhs, f"Constraint_{idx+1}"
        elif constr_type == '>=':
            prob += expr >= rhs, f"Constraint_{idx+1}"
        elif constr_type == '=':
            prob += expr == rhs, f"Constraint_{idx+1}"
        else:
            raise ValueError(f"Invalid constraint type in constraint {idx+1}: {constr_type}")

    return prob, variables

def solve_simplex(prob: LpProblem) -> Tuple[int, LpProblem]:
    status = prob.solve(PULP_CBC_CMD(msg=False))
    return status, prob

def solve_artificial_basis(prob: LpProblem) -> Tuple[int, LpProblem]:
    status = prob.solve(PULP_CBC_CMD(msg=False))
    return status, prob

@app.route('/api/solve', methods=['POST'])
def solve_lp():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), HTTPStatus.BAD_REQUEST

        objective, constraints, method, optimize_type = parse_input(data)
        prob, variables = create_lp_model(objective, constraints, optimize_type)

        solve_fn = solve_simplex if method == 'simplex' else solve_artificial_basis
        status, prob = solve_fn(prob)

        if status != LpStatusOptimal:
            return jsonify({
                "error": f"No optimal solution found",
                "status": LpStatus[status]
            }), HTTPStatus.BAD_REQUEST

        solution = {var.name: var.varValue for var in variables}
        objective_value = prob.objective.value()

        return jsonify({
            "status": "optimal",
            "solution": solution,
            "objective_value": objective_value,
            "method_used": method
        }), HTTPStatus.OK

    except ValueError as e:
        return jsonify({"error": str(e)}), HTTPStatus.BAD_REQUEST
    except Exception as e:
        app.logger.error(f"Internal error: {str(e)}")
        return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
