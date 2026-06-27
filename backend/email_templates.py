"""HTML-шаблоны писем в фирменном стиле «Дома Союзов».

Письма верстаются таблицами с инлайн-стилями — так их одинаково
показывают Gmail, Яндекс, Outlook и мобильные клиенты. Цвета бренда:
акцент #1F5F4E (зелёный), чернила #141413, бумага #F0EBE0.
"""
from html import escape

from config import settings

ACCENT = "#1F5F4E"
INK = "#141413"
PAPER = "#F0EBE0"
MUTED = "#6B6B63"
LINE = "#DAD5C7"


def _row(label: str, value: str, *, pre: bool = False) -> str:
    """Строка таблицы «поле → значение». pre=True сохраняет переносы строк."""
    value_html = escape(value).replace("\n", "<br>") if value else "—"
    white_space = "pre-wrap" if pre else "normal"
    return f"""
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid {LINE};vertical-align:top;width:150px;
                   font:600 11px/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:{MUTED};">
          {escape(label)}
        </td>
        <td style="padding:14px 0;border-bottom:1px solid {LINE};vertical-align:top;
                   font:400 15px/1.55 Georgia,'Times New Roman',serif;color:{INK};white-space:{white_space};">
          {value_html}
        </td>
      </tr>"""


def organizer_request_html(
    *,
    name: str,
    email: str,
    phone: str,
    message: str,
    request_id: int,
    attachment_name: str = "",
) -> str:
    """Письмо администратору о новой заявке с формы «Организаторам»."""
    site = (settings.SITE_URL or "").rstrip("/")
    site_label = site.replace("https://", "").replace("http://", "") if site else "Дом Союзов"

    rows = _row("Имя", name) + _row("Email", email) + _row("Телефон", phone) + _row("Сообщение", message, pre=True)
    if attachment_name:
        rows += _row("Вложение", f"📎 {attachment_name}")

    return f"""\
<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:{PAPER};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{PAPER};padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0"
             style="width:600px;max-width:100%;background:#ffffff;border:1px solid {LINE};">
        <!-- Шапка -->
        <tr>
          <td style="background:{ACCENT};padding:30px 36px;">
            <div style="font:700 26px/1 Georgia,'Times New Roman',serif;letter-spacing:.04em;
                        text-transform:uppercase;color:#ffffff;">Дом&nbsp;Союзов</div>
            <div style="margin-top:8px;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.18em;
                        text-transform:uppercase;color:rgba(255,255,255,.72);">Большая Дмитровка 1 · Москва</div>
          </td>
        </tr>
        <!-- Тело -->
        <tr>
          <td style="padding:32px 36px;">
            <div style="font:600 11px/1.4 Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:{ACCENT};">
              Новая заявка · Организаторам
            </div>
            <h1 style="margin:8px 0 4px;font:700 28px/1.1 Georgia,'Times New Roman',serif;color:{INK};">
              Заявка с сайта
            </h1>
            <p style="margin:0 0 22px;font:400 14px/1.6 Georgia,serif;color:{MUTED};">
              Поступило обращение через форму «Оставить заявку».
            </p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              {rows}
            </table>

            <div style="margin-top:22px;padding:12px 16px;background:{PAPER};border-left:3px solid {ACCENT};
                        font:400 13px/1.5 Georgia,serif;color:{INK};">
              ✓ Дано согласие на обработку персональных данных (152-ФЗ).
            </div>

            <div style="margin-top:26px;">
              <a href="mailto:{escape(email)}"
                 style="display:inline-block;background:{INK};color:#ffffff;text-decoration:none;
                        font:600 12px/1 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;
                        padding:14px 26px;">Ответить заявителю</a>
            </div>
          </td>
        </tr>
        <!-- Подвал -->
        <tr>
          <td style="padding:20px 36px;border-top:1px solid {LINE};">
            <div style="font:400 12px/1.5 Arial,sans-serif;color:{MUTED};">
              Заявка №{request_id} · отправлено автоматически с сайта
              {f'<a href="{escape(site)}" style="color:{ACCENT};text-decoration:none;">{escape(site_label)}</a>' if site else escape(site_label)}
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
