"""
Авторизация через Telegram WebApp initData.
Верифицирует данные от Telegram, создаёт или обновляет пользователя в БД.
Возвращает профиль пользователя с балансом.
"""
import os
import json
import hmac
import hashlib
from urllib.parse import unquote, parse_qsl
import psycopg2


def verify_telegram_init_data(init_data: str, bot_token: str) -> dict | None:
    parsed = dict(parse_qsl(init_data, strict_parsing=True))
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        return None

    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed.items()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    expected_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected_hash, received_hash):
        return None

    user_str = parsed.get("user")
    if not user_str:
        return None

    return json.loads(unquote(user_str))


def generate_referral_code(user_id: int) -> str:
    import base64
    return "NOVA-" + base64.b32encode(user_id.to_bytes(5, "big")).decode()[:7]


def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
        init_data = body.get("initData", "")

        bot_token = os.environ["TELEGRAM_BOT_TOKEN"]

        # В dev-режиме принимаем mock данные
        if init_data == "dev_mock":
            user_data = {"id": 123456789, "first_name": "Тест", "username": "testuser"}
        else:
            user_data = verify_telegram_init_data(init_data, bot_token)
            if not user_data:
                return {
                    "statusCode": 401,
                    "headers": cors_headers,
                    "body": json.dumps({"error": "Invalid Telegram data"}),
                }

        user_id = user_data["id"]
        username = user_data.get("username", "")
        first_name = user_data.get("first_name", "")
        last_name = user_data.get("last_name", "")
        photo_url = user_data.get("photo_url", "")

        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()

        # Проверяем существующего пользователя
        cur.execute("SELECT id, balance, level, xp, referral_code FROM nova_users WHERE id = %s", (user_id,))
        row = cur.fetchone()

        if row:
            # Обновляем данные
            cur.execute(
                "UPDATE nova_users SET username=%s, first_name=%s, last_name=%s, photo_url=%s, updated_at=NOW() WHERE id=%s",
                (username, first_name, last_name, photo_url, user_id)
            )
            balance, level, xp, referral_code = row[1], row[2], row[3], row[4]
        else:
            # Новый пользователь — даём 500 стартовых звёзд
            referral_code = generate_referral_code(user_id)
            ref_by = body.get("referredBy")
            referred_by_id = None

            if ref_by:
                cur.execute("SELECT id FROM nova_users WHERE referral_code = %s", (ref_by,))
                ref_row = cur.fetchone()
                if ref_row:
                    referred_by_id = ref_row[0]

            cur.execute(
                """INSERT INTO nova_users (id, username, first_name, last_name, photo_url, balance, referral_code, referred_by)
                   VALUES (%s, %s, %s, %s, %s, 500, %s, %s)""",
                (user_id, username, first_name, last_name, photo_url, referral_code, referred_by_id)
            )
            cur.execute(
                "INSERT INTO nova_transactions (user_id, type, amount, description) VALUES (%s, 'win', 500, 'Приветственный бонус')",
                (user_id,)
            )

            # Реферальный бонус
            if referred_by_id:
                cur.execute(
                    "UPDATE nova_users SET balance = balance + 250 WHERE id = %s",
                    (referred_by_id,)
                )
                cur.execute(
                    "INSERT INTO nova_transactions (user_id, type, amount, description) VALUES (%s, 'referral_bonus', 250, %s)",
                    (referred_by_id, f"Реферал: {first_name}")
                )

            balance, level, xp = 500, 1, 0

        conn.commit()
        cur.close()
        conn.close()

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "user": {
                    "id": user_id,
                    "username": username,
                    "first_name": first_name,
                    "last_name": last_name,
                    "photo_url": photo_url,
                    "balance": balance,
                    "level": level,
                    "xp": xp,
                    "referral_code": referral_code,
                }
            }),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"error": str(e)}),
        }
