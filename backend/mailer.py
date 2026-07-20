"""Минимальная отправка писем через SMTP (заявки с формы «Организаторам»).

Транспорт берётся из config.settings (env). Если SMTP не настроен — функция
возвращает False, не роняя запрос: вызывающий код всё равно сохраняет заявку
в БД, так что данные не теряются.
"""
import smtplib
import ssl
from email.message import EmailMessage

from config import settings


def smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_FROM or settings.SMTP_USER)


def send_email(
    to_addr: str,
    subject: str,
    body: str,
    reply_to: str | None = None,
    html: str | None = None,
    attachments: list[tuple[str, bytes, str]] | None = None,
) -> bool:
    """Отправляет письмо. Возвращает True при успехе.

    • body  — текстовая версия (обязательна, фолбэк для клиентов без HTML);
    • html  — необязательная HTML-версия (красивое оформление);
    • attachments — список (имя_файла, байты, mime-тип), напр.
      ("бриф.pdf", b"...", "application/pdf").

    Любая ошибка (нет конфигурации, недоступен сервер, отказ авторизации)
    проглатывается и возвращается False — форма не должна падать из-за почты.
    """
    host = (settings.SMTP_HOST or "").strip()
    to_addr = (to_addr or "").strip()
    if not host:
        print("[mailer] SMTP_HOST не задан — письмо не отправлено")
        return False
    if not to_addr:
        print("[mailer] получатель пуст — письмо не отправлено")
        return False

    from_addr = (settings.SMTP_FROM or settings.SMTP_USER or "").strip()
    if not from_addr:
        print("[mailer] SMTP_FROM/SMTP_USER не задан — письмо не отправлено")
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to_addr
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body)
    if html:
        msg.add_alternative(html, subtype="html")

    for att in attachments or []:
        try:
            filename, data, mime = att
            maintype, _, subtype = (mime or "application/octet-stream").partition("/")
            msg.add_attachment(
                data,
                maintype=maintype or "application",
                subtype=subtype or "octet-stream",
                filename=filename,
            )
        except Exception as exc:  # noqa: BLE001 — вложение не должно ронять письмо
            print(f"[mailer] не удалось приложить файл: {exc}")

    try:
        if settings.SMTP_USE_SSL:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(host, settings.SMTP_PORT, context=context, timeout=15) as server:
                if settings.SMTP_USER:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
        else:
            with smtplib.SMTP(host, settings.SMTP_PORT, timeout=15) as server:
                if settings.SMTP_USE_TLS:
                    server.starttls(context=ssl.create_default_context())
                if settings.SMTP_USER:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
        # Без адресов в логе — это персональные данные. Для диагностики
        # достаточно факта отправки и параметров транспорта.
        print(f"[mailer] письмо отправлено (host={host}:{settings.SMTP_PORT}, ssl={settings.SMTP_USE_SSL})")
        return True
    except Exception as exc:  # noqa: BLE001 — почта не критична для запроса
        print(f"[mailer] send failed: {type(exc).__name__}: {exc}")
        return False
