from collections import defaultdict
from itertools import combinations
from app.schemas.association import AssociationRulesRequest, AssociationRulesResponse, AssociationRuleItem


def run_association_rules(request: AssociationRulesRequest) -> AssociationRulesResponse:
    if not request.routines_exercises:
        return AssociationRulesResponse(rules=[], total_routines_analyzed=0)

    total_routines = len(request.routines_exercises)
    item_counts = defaultdict(int)
    pair_counts = defaultdict(int)

    # Conteo de frecuencia de ejercicios individuales y pares
    for routine in request.routines_exercises:
        unique_exs = sorted(list(set(routine.exercise_ids)))
        for ex in unique_exs:
            item_counts[ex] += 1
        for ex1, ex2 in combinations(unique_exs, 2):
            pair_counts[(ex1, ex2)] += 1

    min_support = request.min_support or 0.05
    min_confidence = request.min_confidence or 0.3

    rules = []
    for (ex1, ex2), count in pair_counts.items():
        support = count / total_routines
        if support >= min_support:
            # Regla 1: ex1 -> ex2
            conf1 = count / item_counts[ex1]
            if conf1 >= min_confidence:
                lift1 = conf1 / (item_counts[ex2] / total_routines)
                rules.append(
                    AssociationRuleItem(
                        antecedent_id=ex1,
                        consequent_id=ex2,
                        support=round(support, 4),
                        confidence=round(conf1, 4),
                        lift=round(lift1, 4),
                    )
                )

            # Regla 2: ex2 -> ex1
            conf2 = count / item_counts[ex2]
            if conf2 >= min_confidence:
                lift2 = conf2 / (item_counts[ex1] / total_routines)
                rules.append(
                    AssociationRuleItem(
                        antecedent_id=ex2,
                        consequent_id=ex1,
                        support=round(support, 4),
                        confidence=round(conf2, 4),
                        lift=round(lift2, 4),
                    )
                )

    rules.sort(key=lambda x: x.lift, reverse=True)

    return AssociationRulesResponse(
        rules=rules[: request.top_k or 10],
        total_routines_analyzed=total_routines,
    )
