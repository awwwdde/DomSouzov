---
name: halls-equipment-feature
description: Фича «Техническое оснащение залов» на странице Организаторам — план и решения (в работе)
metadata:
  type: project
---

Задача (начата 2026-07-06, продолжить 2026-07-07): заменить на странице «Организаторам» две PDF-кнопки (технический райдер + залы) на встроенную секцию **«Техническое оснащение»** с вкладками залов. По каждому залу — оборудование + схема (клик → лайтбокс) + вспомогательные помещения; снизу общие кнопки **Скачать PDF** и **Отправить заявку** (форма заявки уже есть — `RequestModal` в [Organizers.tsx](frontend/src/pages/Organizers.tsx)).

**Решения пользователя (AskUserQuestion):**
- Данные залов — **редактируемые через админку** (добавить поля, не хардкод).
- Схемы залов — пользователь **загрузит сам** (нужно поле загрузки в админке).
- «Скачать PDF» — **генерировать на бэкенде** из этих же данных.
- Раскладка — **вкладки залов** (Колонный / Октябрьский / Зал №1).

**ОТКРЫТЫЙ ВОПРОС (ждём ответа):** чем генерить PDF — `fpdf2` + юникод-шрифт DejaVuSans (настоящий файл, +зависимость в requirements, нужен редеплой бэка) ИЛИ print-страница `/halls/rider` с «Сохранить как PDF» (без зависимостей). Начинать бэкенд-фундамент после ответа.

**План:**
1. Модель `Hall` ([backend/models.py](backend/models.py:143)) + колонки: `equipment_ru/en`, `aux_rooms_ru/en` (по строке на пункт), `scheme_image` (URL). Миграция — дописать в `columns` в [backend/migrate_db.py](backend/migrate_db.py) (идемпотентный ADD COLUMN).
2. `schemas.py` HallBase + `_hall_out` в [backend/routers/public.py](backend/routers/public.py) → отдавать `equipment`, `aux_rooms`, `scheme`. Админ-роуты залов в [backend/routers/admin.py](backend/routers/admin.py:388).
3. Эндпоинт `GET /api/halls/rider.pdf` (если выбран fpdf2).
4. Админка [AdminHalls.tsx](frontend/src/pages/admin/AdminHalls.tsx): textarea оборудование/помещения + загрузка схемы.
5. Фронт: секция с вкладками на [Organizers.tsx](frontend/src/pages/Organizers.tsx) вместо `PdfButton`-ов (настройки `organizers_rider_pdf`/`organizers_halls_pdf` в [AdminSettings.tsx](frontend/src/pages/admin/AdminSettings.tsx:262) — потом убрать/переосмыслить).

**Данные из PDF (исходники на Рабочем столе: «Технический райдер (1).pdf», «Схемы док.pdf»):**
- Колонный зал — до 1021 мест. Оборуд.: микшер Soundcraft Vi6; линейный массив CODA Audio (24шт); сабвуферы CODA 1200Вт (6шт); мониторы CODA 500Вт (4шт); 4 микр. Shure; рояли Steinway & Sons, Bechstein ×2, «Москва». Помещения: Анфилада(500), Гримёрная(100), Овальный(50), Буфет(300).
- Октябрьский зал — до 400 мест. Оборуд.: микшер Yamaha TF-1; порталы и сабвуферы JBL; 4 радиомикрофона. Помещения: Президиум(8), Фойе(200).
- Зал №1 — до 100 мест. Оборуд.: микшер Allen & Heath SQ-6; конференц-система (30 микрофонов).
- Схемы — 3 плана (Колонный, Октябрьский, Зал №1) картинками.

`features_list` зала формируется в `_hall_features` (public.py). Модель Hall: name_ru/en, capacity, area, columns, features_ru/en, description_ru/en, image, gallery, sort_order.

См. [[pending-deploy-2026-07]] — в дереве много незакоммиченных правок этой сессии.
