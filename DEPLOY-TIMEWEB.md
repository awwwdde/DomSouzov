# Перенос «Дома Союзов» на Timeweb Cloud (VPS + Docker) с доменом domsojuzov.ru

Цель: новый сайт + все данные (включая медиа — они в БД) переезжают на новый
аккаунт Timeweb; домен `domsojuzov.ru` переключается на него; файлы старого
сайта сохраняются отдельным архивом.

> Требование: **Timeweb Cloud — облачный сервер (VPS) на Ubuntu**, где можно
> поставить Docker. На обычном «виртуальном хостинге» Timeweb (PHP-сайты)
> приложение на Python не запустится.

---

## Фаза 1. Бэкап старого сайта (со старого Timeweb)

1. Зайдите в панель старого аккаунта Timeweb → раздел файлов сайта (или по FTP/SSH).
2. Скачайте весь каталог сайта (обычно `public_html` / `www`) архивом.
   - По SSH (если есть): `tar -czf old-site-$(date +%F).tar.gz public_html`, затем скачать `scp`/через панель.
   - Если есть БД у старого сайта (MySQL) — сделайте её дамп и тоже скачайте.
3. Сохраните архив локально/в облаке. Старый аккаунт **не удаляем** — пусть лежит как запасной бэкап.

---

## Фаза 2. Снять дамп БД нового сайта (с awwwdde-panel)

Данные нового сайта сейчас в Postgres на awwwdde-panel. Нужен дамп.

**Вариант А — есть внешний доступ к Postgres (host/port/user/pass из панели):**
с локальной машины (где установлен `pg_dump` 16):
```bash
pg_dump "postgresql://USER:PASS@AWWWDDE_HOST:5432/DBNAME" \
  --no-owner --no-acl -Fc -f dom-soyuzov.dump
```

**Вариант Б — внешнего доступа к БД нет (только панель):**
напишите мне — добавим во временно одноразовый защищённый эндпоинт/скрипт
экспорта всех таблиц в переносимый файл, который вы скачаете из админки.
(Скрипт переноса `backend/migrate_to_postgres.py` уже есть — он умеет
копировать БД-в-БД, если дать обе строки подключения.)

Файл `dom-soyuzov.dump` понадобится в Фазе 3.

---

## Фаза 3. Поднять новый сайт на Timeweb Cloud VPS

1. Создайте облачный сервер: **Ubuntu 22.04/24.04**, 2 vCPU / 2–4 ГБ RAM (видео-герой тяжёлый — лучше 4 ГБ). Запомните **IP**.

2. Подключитесь по SSH и поставьте Docker:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```

3. Заберите код и настройте окружение:
   ```bash
   git clone https://github.com/awwwdde/DomSouzov.git
   cd DomSouzov
   cp .env.prod.example .env
   nano .env            # заполнить пароли, SECRET_KEY, домен, админа
   nano Caddyfile       # проверить домен (по умолчанию domsojuzov.ru)
   ```
   Сгенерировать секреты: `openssl rand -hex 32` (SECRET_KEY), `openssl rand -hex 16` (DB_PASSWORD).

4. Поднимите **только базу** и восстановите дамп:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env up -d db
   # дождаться healthy:
   docker compose -f docker-compose.prod.yml ps

   # залить дамп (Custom-формат -Fc):
   docker compose -f docker-compose.prod.yml exec -T db \
     pg_restore --no-owner --no-acl -U domuser -d domsoyuzov < dom-soyuzov.dump
   ```
   (Если дамп в обычном SQL: `... exec -T db psql -U domuser -d domsoyuzov < dump.sql`.)

5. Запустите приложение и прокси:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env up -d --build
   docker compose -f docker-compose.prod.yml logs -f app   # дождаться "Application startup complete"
   ```
   На старте `seed.py` создаст недостающие таблицы/колонки (идемпотентно) и
   обновит логин админа из `.env`. Демо-контент не подсеется (`SEED_DEMO_CONTENT=false` + БД не пустая).

6. Проверка по IP (до переключения домена), curl с сервера:
   ```bash
   curl -s localhost:8080/healthz      # {"status":"ok",...}
   ```

---

## Фаза 4. Переключить домен domsojuzov.ru

1. В панели регистратора домена откройте управление DNS.
2. Смените **A-запись** `@` (и `www`) на **IP нового сервера**. TTL поменьше (300–600), чтобы быстрее обновилось.
3. Подождите распространения DNS (от минут до пары часов). Caddy сам выпустит HTTPS-сертификат, когда домен начнёт указывать на сервер.

---

## Фаза 5. Smoke-тест после переключения

- [ ] `https://domsojuzov.ru/healthz` → `{"status":"ok"}` и **валидный HTTPS**.
- [ ] Открываются афиша/новости/залы/галерея — контент на месте.
- [ ] Любая загруженная картинка `https://domsojuzov.ru/uploads/<имя>` отдаётся (значит медиа доехало).
- [ ] `/admin` — вход под логином из `.env`, контент виден/редактируется.
- [ ] `https://domsojuzov.ru/sitemap.xml`, `/robots.txt`, `/llms.txt` содержат **новый** домен.
- [ ] Видео на главной играет, перемотка работает (Range-раздача).
- [ ] Submit `sitemap.xml` в Яндекс.Вебмастер и Google Search Console.

---

## Откат / запасной план
- Старый аккаунт Timeweb и его файлы целы (Фаза 1) — можно вернуть A-запись обратно.
- Дамп `dom-soyuzov.dump` храните до подтверждения, что всё работает.
- Контейнеры можно перезапустить: `docker compose -f docker-compose.prod.yml restart`.
