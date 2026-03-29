"""
Создание инвойса для пополнения баланса через CryptoBot (@send).
POST / — создать инвойс, вернуть pay_url
POST /check — проверить статус оплаты и зачислить звёзды
"""
import os
import json
import psycopg2
import urllib.request
import urllib.error


CRYPTOBOT_API = "https://pay.crypt.bot/api"

STARS_PACKAGES = [
    {"stars": 100,  "ton": "0.1",  "label": "100 ⭐"},
    {"stars": 500,  "ton": "0.45", "label": "500 ⭐"},
    {"stars": 1000, "ton": "0.85", "label": "1000 ⭐"},
    {"stars": 5000, "ton": "4.0",  "label": "5000 ⭐"},
]


def cryptobot_request(method: str, params: dict) -> dict:
    token = os.environ["CRYPTOBOT_TOKEN"]
    url = f"{CRYPTOBOT_API}/{method}"
    data = json.dumps(params).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Crypto-Pay-API-Token": token, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())


def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    path = event.get("path", "/")
    body = json.loads(event.get("body") or "{}")
    user_id = body.get("user_id")

    if not user_id:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "user_id required"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    # Создать инвойс
    if path == "/" or path == "":
        package_idx = body.get("package", 1)
        if package_idx < 0 or package_idx >= len(STARS_PACKAGES):
            package_idx = 1
        pkg = STARS_PACKAGES[package_idx]

        result = cryptobot_request("createInvoice", {
            "asset": "TON",
            "amount": pkg["ton"],
            "description": f"Nova Casino — {pkg['label']}",
            "payload": json.dumps({"user_id": user_id, "stars": pkg["stars"]}),
            "expires_in": 3600,
        })

        if not result.get("ok"):
            cur.close(); conn.close()
            return {"statusCode": 502, "headers": cors_headers, "body": json.dumps({"error": "CryptoBot error", "detail": result})}

        invoice = result["result"]
        cur.execute(
            """INSERT INTO nova_invoices (user_id, invoice_id, amount_crypto, asset, stars_amount, status, pay_url)
               VALUES (%s, %s, %s, 'TON', %s, 'pending', %s)""",
            (user_id, str(invoice["invoice_id"]), pkg["ton"], pkg["stars"], invoice["pay_url"])
        )
        conn.commit()
        cur.close(); conn.close()

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "invoice_id": invoice["invoice_id"],
                "pay_url": invoice["pay_url"],
                "stars": pkg["stars"],
                "ton": pkg["ton"],
            }),
        }

    # Проверить статус инвойса
    if path == "/check":
        invoice_id = body.get("invoice_id")
        if not invoice_id:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "invoice_id required"})}

        # Проверяем в БД
        cur.execute(
            "SELECT status, stars_amount FROM nova_invoices WHERE invoice_id = %s AND user_id = %s",
            (str(invoice_id), user_id)
        )
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return {"statusCode": 404, "headers": cors_headers, "body": json.dumps({"error": "Invoice not found"})}

        db_status, stars_amount = row

        # Уже зачислено
        if db_status == "paid":
            cur.close(); conn.close()
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"status": "paid", "stars": stars_amount})}

        # Проверяем у CryptoBot
        result = cryptobot_request("getInvoices", {"invoice_ids": [int(invoice_id)]})
        if not result.get("ok"):
            cur.close(); conn.close()
            return {"statusCode": 502, "headers": cors_headers, "body": json.dumps({"error": "CryptoBot check error"})}

        items = result["result"].get("items", [])
        if not items:
            cur.close(); conn.close()
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"status": "pending"})}

        invoice_status = items[0].get("status")

        if invoice_status == "paid":
            # Зачисляем звёзды
            cur.execute("UPDATE nova_invoices SET status='paid', paid_at=NOW() WHERE invoice_id=%s", (str(invoice_id),))
            cur.execute("UPDATE nova_users SET balance = balance + %s WHERE id = %s", (stars_amount, user_id))
            cur.execute(
                "INSERT INTO nova_transactions (user_id, type, amount, description, invoice_id, status) VALUES (%s, 'deposit', %s, 'Пополнение через CryptoBot', %s, 'completed')",
                (user_id, stars_amount, str(invoice_id))
            )
            conn.commit()
            cur.close(); conn.close()
            return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"status": "paid", "stars": stars_amount})}

        cur.close(); conn.close()
        return {"statusCode": 200, "headers": cors_headers, "body": json.dumps({"status": invoice_status})}

    cur.close(); conn.close()
    return {"statusCode": 404, "headers": cors_headers, "body": json.dumps({"error": "Not found"})}
