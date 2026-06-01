def safe_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def safe_bool(value):
    if isinstance(value, bool):
        return value

    if isinstance(value, str):
        return value.strip().lower() in {'1', 'true', 'yes', 'y'}

    return bool(value)


def question_score(base_points, penalty_points, is_correct):
    base_points = safe_int(base_points)

    if is_correct:
        return base_points

    return 0


def quiz_totals_from_details(details):
    normalized_details = []
    score = 0
    max_score = 0
    correct_count = 0

    for detail in details or []:
        base_points = safe_int(detail.get('base_points'))
        penalty_points = safe_int(detail.get('penalty_points'))
        is_correct = safe_bool(detail.get('is_correct'))
        points_delta = question_score(base_points, penalty_points, is_correct)

        normalized_details.append({
            **detail,
            'is_correct': is_correct,
            'points_delta': points_delta,
            'base_points': base_points,
            'penalty_points': penalty_points,
        })

        score += points_delta
        max_score += base_points
        correct_count += 1 if is_correct else 0

    return {
        'score': score,
        'max_score': max_score,
        'correct_count': correct_count,
        'total_questions': len(normalized_details),
        'details': normalized_details,
    }
