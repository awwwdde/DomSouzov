"""Seed database with initial content."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine, Base
from models import AdminUser, SiteSettings, Event, NewsArticle, Hall, GalleryImage
from auth import hash_password
from config import settings


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Admin user
    if not db.query(AdminUser).filter_by(email=settings.ADMIN_EMAIL).first():
        db.add(AdminUser(email=settings.ADMIN_EMAIL, hashed_password=hash_password(settings.ADMIN_PASSWORD)))

    # Site settings
    defaults = [
        ("hero_title_ru", "ДОМ СОЮЗОВ", "HOUSE OF UNIONS"),
        ("hero_subtitle_ru", "Колонный зал · 28 коринфских колонн · Превосходная акустика",
         "Hall of Columns · 28 Corinthian columns · Exceptional acoustics"),
        ("hero_kicker_ru", "est. 1784 · Памятник классицизма", "est. 1784 · Classicist Landmark"),
        ("hero_desc_ru",
         "28 коринфских колонн. Белый мрамор. Пять хрустальных люстр. Сцена, на которой звучали Чайковский и Лист. Зал, в котором писалась история.",
         "28 Corinthian columns. White marble. Five crystal chandeliers. The stage that carried Tchaikovsky and Liszt. The hall where history was written."),
        ("address_ru", "Москва · Большая Дмитровка 1", "Moscow · Bolshaya Dmitrovka 1"),
        ("hours_ru", "Вт–Вс · 10:00—22:00", "Tue–Sun · 10:00—22:00"),
        ("phone", "+7 (495) 000-00-00", "+7 (495) 000-00-00"),
        ("email_rent", "rent@dom-soyuzov.ru", "rent@dom-soyuzov.ru"),
        ("email_press", "press@dom-soyuzov.ru", "press@dom-soyuzov.ru"),
        ("intro_heading_ru",
         "Здание, в котором акустика и история звучат в унисон.",
         "A building where acoustics and history sound in unison."),
        ("intro_p1_ru",
         "Дом Союзов — памятник классицизма конца XVIII века, перестроенный архитектором Матвеем Казаковым. Его главный зал — Колонный — знаменит 28 коринфскими колоннами и одной из лучших акустик столицы.",
         "House of Unions is a late 18th-century classicist landmark, rebuilt by architect Matvey Kazakov. Its principal room — the Hall of Columns — is famed for 28 Corinthian columns and some of the city's finest acoustics."),
        ("intro_p2_ru",
         "Здесь выступали Чайковский, Лист, Рахманинов, проходили знаковые исторические события. Сегодня Дом Союзов — действующая престижная площадка для концертов, конференций и торжественных мероприятий.",
         "Tchaikovsky, Liszt and Rachmaninoff performed here; landmark events of the nation took place here. Today the House of Unions is a working venue for concerts, conferences and ceremonies."),
        ("fact1_number", "1784", "1784"),
        ("fact1_label_ru", "Год постройки", "Year built"),
        ("fact2_number", "28", "28"),
        ("fact2_label_ru", "Коринфских колонн", "Corinthian columns"),
        ("fact3_number", "1 200", "1,200"),
        ("fact3_label_ru", "Мест в Колонном зале", "Seats in the Hall"),
        ("next_event_ru", "Эпоха великих композиторов", "The Age of Great Composers"),
        ("next_event_date_ru", "19 ИЮНЯ · 19:30", "19 JUN · 19:30"),
        ("footer_tagline_ru",
         "Памятник классицизма конца XVIII века. Колонный зал, акустика, исторические концерты.",
         "Late 18th-century landmark. Hall of Columns, acoustics, historical concerts."),
        ("metro_ru",
         "Охотный ряд · Театральная · Площадь Революции",
         "Okhotny Ryad · Teatralnaya · Ploschad Revolyutsii"),
    ]
    for key, val_ru, val_en in defaults:
        if not db.query(SiteSettings).filter_by(key=key).first():
            db.add(SiteSettings(key=key, value_ru=val_ru, value_en=val_en))

    # Events
    if db.query(Event).count() == 0:
        events = [
            Event(
                title_ru="Эпоха великих композиторов",
                title_en="The Age of Great Composers",
                date="19 ИЮН 2026", date_en="19 JUN 2026",
                time="19:30", weekday_ru="Пт", weekday_en="Fri",
                hall_ru="Колонный зал", hall_en="Hall of Columns",
                tag_ru="Симфоническая", tag_en="Symphonic",
                price_ru="от 2 500 ₽", price_en="from 2,500 ₽",
                description_ru="Незабываемый вечер симфонической музыки в Колонном зале. В программе — произведения Чайковского, Рахманинова и Бетховена.",
                description_en="An unforgettable evening of symphonic music in the Hall of Columns. Programme: Tchaikovsky, Rachmaninoff and Beethoven.",
                is_featured=True, sort_order=1,
            ),
            Event(
                title_ru="Дмитрий Дюжев — Евгений Онегин",
                title_en="Dmitry Dyuzhev — Eugene Onegin",
                date="24 ИЮН 2026", date_en="24 JUN 2026",
                time="20:00", weekday_ru="Ср", weekday_en="Wed",
                hall_ru="Колонный зал", hall_en="Hall of Columns",
                tag_ru="Литературный", tag_en="Literary",
                price_ru="от 3 800 ₽", price_en="from 3,800 ₽",
                description_ru="Поэтический вечер — «Евгений Онегин» в исполнении Дмитрия Дюжева.",
                description_en="A poetic evening — 'Eugene Onegin' performed by Dmitry Dyuzhev.",
                sort_order=2,
            ),
            Event(
                title_ru="Московский казачий хор",
                title_en="Moscow Cossack Choir",
                date="02 ИЮЛ 2026", date_en="02 JUL 2026",
                time="19:00", weekday_ru="Чт", weekday_en="Thu",
                hall_ru="Октябрьский зал", hall_en="October Hall",
                tag_ru="Хоровая", tag_en="Choral",
                price_ru="от 1 500 ₽", price_en="from 1,500 ₽",
                description_ru="Московский казачий хор — программа народных и духовных песнопений.",
                description_en="Moscow Cossack Choir — a programme of folk and sacred choral music.",
                sort_order=3,
            ),
            Event(
                title_ru="XVI Фестиваль Ростроповича",
                title_en="XVI Rostropovich Festival",
                date="14 МАР 2026", date_en="14 MAR 2026",
                time="19:30", weekday_ru="Сб", weekday_en="Sat",
                hall_ru="Колонный зал", hall_en="Hall of Columns",
                tag_ru="Фестиваль", tag_en="Festival",
                price_ru="от 2 000 ₽", price_en="from 2,000 ₽",
                description_ru="Открытие XVI Фестиваля памяти Мстислава Ростроповича.",
                description_en="Opening of the XVI Festival in memory of Mstislav Rostropovich.",
                sort_order=4,
            ),
        ]
        db.add_all(events)

    # News
    if db.query(NewsArticle).count() == 0:
        news = [
            NewsArticle(
                tag_ru="ФЕСТИВАЛЬ · 2026", tag_en="FESTIVAL · 2026",
                title_ru="XVI Фестиваль Мстислава Ростроповича",
                title_en="XVI Rostropovich Festival",
                excerpt_ru="Шестнадцатый сезон ежегодного фестиваля памяти маэстро пройдёт в Колонном зале с 14 по 27 марта. В программе — семь симфонических вечеров, три камерные премьеры и мастер-классы для молодых музыкантов.",
                excerpt_en="The sixteenth season of the annual festival in memory of the maestro runs 14–27 March in the Hall of Columns: seven symphonic evenings, three chamber premieres, masterclasses for young musicians.",
                content_ru="Шестнадцатый фестиваль Ростроповича открывается 14 марта 2026 года в Колонном зале Дома Союзов. Программа включает семь симфонических вечеров с ведущими российскими и международными оркестрами, три камерные премьеры и серию мастер-классов для молодых исполнителей.",
                content_en="The sixteenth Rostropovich Festival opens on 14 March 2026 in the Hall of Columns. The programme includes seven symphonic evenings with leading Russian and international orchestras, three chamber premieres and a series of masterclasses for young performers.",
                is_lead=True, sort_order=1,
            ),
            NewsArticle(
                tag_ru="ПРЕМЬЕРА", tag_en="PREMIERE",
                title_ru="«Семь слов Спасителя на кресте»",
                title_en="«Seven Last Words of Christ»",
                excerpt_ru="Редкое для Москвы исполнение оратории Дюбуа — в канун Великого поста.",
                excerpt_en="A rare Moscow performance of Dubois's oratorio, on the eve of Lent.",
                content_ru="Оратория Теодора Дюбуа «Семь слов Спасителя на кресте» прозвучит в Колонном зале впервые за несколько десятилетий.",
                content_en="Théodore Dubois's oratorio 'Seven Last Words of Christ' will be performed in the Hall of Columns for the first time in several decades.",
                sort_order=2,
            ),
            NewsArticle(
                tag_ru="ИНТЕРВЬЮ", tag_en="INTERVIEW",
                title_ru="Реставрация Колонного зала: разговор с главным архитектором",
                title_en="Restoring the Hall of Columns: a conversation with the lead architect",
                excerpt_ru="О деталях, которые не видны глазу: акустические панели, мрамор, хрусталь.",
                excerpt_en="The details you cannot see: acoustic panels, marble, crystal.",
                content_ru="Главный архитектор реставрации Колонного зала рассказывает о трёхлетней работе по восстановлению исторического облика и акустических характеристик зала.",
                content_en="The lead architect of the Hall of Columns restoration describes three years of work to restore the hall's historical appearance and acoustic properties.",
                sort_order=3,
            ),
        ]
        db.add_all(news)

    # Halls
    if db.query(Hall).count() == 0:
        halls = [
            Hall(
                name_ru="Колонный зал", name_en="Hall of Columns",
                capacity="1 200 мест", area="1 120 м²",
                columns="28",
                features_ru="28 колонн · Акустика класса A",
                features_en="28 columns · Acoustic class A",
                description_ru="Главный зал Дома Союзов — шедевр классицизма. Двадцать восемь коринфских колонн белого мрамора, пять хрустальных люстр, превосходная акустика. Здесь выступали Чайковский, Лист и Рахманинов.",
                description_en="The principal hall of the House of Unions — a masterpiece of classicism. Twenty-eight Corinthian columns of white marble, five crystal chandeliers, exceptional acoustics. Tchaikovsky, Liszt and Rachmaninoff performed here.",
                sort_order=1,
            ),
            Hall(
                name_ru="Октябрьский зал", name_en="October Hall",
                capacity="480 мест", area="540 м²",
                columns=None,
                features_ru="Концерты · Конференции",
                features_en="Concerts · Conferences",
                description_ru="Камерный зал Дома Союзов — идеальное пространство для конференций, лекций, камерных концертов и торжественных приёмов.",
                description_en="The intimate hall of the House of Unions — ideal for conferences, lectures, chamber concerts and formal receptions.",
                sort_order=2,
            ),
        ]
        db.add_all(halls)

    # Gallery placeholders (no real images, just metadata)
    if db.query(GalleryImage).count() == 0:
        gallery = [
            GalleryImage(caption_ru="Колонный зал", caption_en="Hall of Columns",
                         category_ru="Архитектура", category_en="Architecture",
                         image="", span="span2 span2h", sort_order=1),
            GalleryImage(caption_ru="Фасад", caption_en="Facade",
                         category_ru="Архитектура", category_en="Architecture",
                         image="", span=None, sort_order=2),
            GalleryImage(caption_ru="Хрустальная люстра", caption_en="Crystal chandelier",
                         category_ru="Архитектура", category_en="Architecture",
                         image="", span=None, sort_order=3),
            GalleryImage(caption_ru="Архив · 1910", caption_en="Archive · 1910",
                         category_ru="Архив", category_en="Archive",
                         image="", span=None, sort_order=4),
            GalleryImage(caption_ru="Репетиция", caption_en="Rehearsal",
                         category_ru="Концерты", category_en="Concerts",
                         image="", span=None, sort_order=5),
            GalleryImage(caption_ru="Концерт · вид из яруса", caption_en="Concert · view from tier",
                         category_ru="Концерты", category_en="Concerts",
                         image="", span="span2", sort_order=6),
        ]
        db.add_all(gallery)

    db.commit()
    db.close()
    print("✓ Database seeded successfully")


if __name__ == "__main__":
    seed()
