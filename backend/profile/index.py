"""
Получение профиля пользователя: баланс, история ставок, статистика.
GET /?user_id=123 — профиль
"""
import os
import json
import psycopg2


def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    params = event.get("queryStringParameters") or {}
    user_id = params.get("user_id")

    if not user_id:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "user_id required"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    cur.execute(
        "SELECT id, username, first_name, last_name, photo_url, balance, level, xp, referral_code, created_at FROM nova_users WHERE id = %s",
        (int(user_id),)
    )
    row = cur.fetchone()
    if not row:
        cur.close(); conn.close()
        return {"statusCode": 404, "headers": cors_headers, "body": json.dumps({"error": "User not found"})}

    user = {
        "id": row[0], "username": row[1], "first_name": row[2],
        "last_name": row[3], "photo_url": row[4], "balance": row[5],
        "level": row[6], "xp": row[7], "referral_code": row[8],
        "created_at": row[9].isoformat() if row[9] else None,
    }

    # Статистика
    cur.execute(
        "SELECT COUNT(*), COALESCE(SUM(CASE WHEN result='win' THEN 1 ELSE 0 END), 0), COALESCE(MAX(win_amount), 0) FROM nova_games WHERE user_id = %s",
        (int(user_id),)
    )
    stats_row = cur.fetchone()
    total_games = stats_row[0] or 0
    total_wins = stats_row[1] or 0
    biggest_win = stats_row[2] or 0
    win_rate = round((total_wins / total_games * 100)) if total_games > 0 else 0

    # История последних 20 игр
    cur.execute(
        """SELECT game_type, bet_amount, win_amount, result, crash_point, cashout_at, created_at, metadata
           FROM nova_games WHERE user_id = %s ORDER BY created_at DESC LIMIT 20""",
        (int(user_id),)
    )
    history = []
    for r in cur.fetchall():
        history.append({
            "game_type": r[0], "bet_amount": r[1], "win_amount": r[2],
            "result": r[3], "crash_point": float(r[4]) if r[4] else None,
            "cashout_at": float(r[5]) if r[5] else None,
            "created_at": r[6].isoformat() if r[6] else None,
            "metadata": r[7],
        })

    # Рефералы
    cur.execute("SELECT COUNT(*) FROM nova_users WHERE referred_by = %s", (int(user_id),))
    referrals_count = cur.fetchone()[0]

    cur.close(); conn.close()

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({
            "user": user,
            "stats": {
                "total_games": total_games,
                "total_wins": total_wins,
                "win_rate": win_rate,
                "biggest_win": biggest_win,
                "referrals_count": referrals_count,
            },
            "history": history,
        }),
    }
