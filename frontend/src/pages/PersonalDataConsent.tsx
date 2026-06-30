import LegalDocument from '../components/LegalDocument';
import { useSite } from '../context/SiteContext';

const BODY_RU = `Предоставляя свои персональные данные, пользователь даёт согласие на обработку, хранение и использование своих персональных данных ФГБУ «Управление по эксплуатации зданий Федерального Собрания Российской Федерации» (далее — Оператор) на основании Федерального закона № 152-ФЗ «О персональных данных» от 27.07.2006 в следующих целях:
— осуществление клиентской поддержки;
— получение пользователем информации о маркетинговых событиях;
— проведение аудита и прочих внутренних исследований с целью повышения качества предоставляемых услуг.

Состав персональных данных
Под персональными данными подразумевается любая информация личного характера, позволяющая установить личность пользователя/покупателя, такая как:
— фамилия, имя, отчество;
— дата рождения;
— контактный телефон;
— адрес электронной почты;
— почтовый адрес.

Хранение и обработка
Персональные данные пользователей хранятся исключительно на электронных носителях и обрабатываются с использованием автоматизированных систем, за исключением случаев, когда неавтоматизированная обработка персональных данных необходима в связи с исполнением требований законодательства Российской Федерации.

Передача третьим лицам
Оператор обязуется не передавать полученные персональные данные третьим лицам, за исключением следующих случаев:
— по запросам уполномоченных органов государственной власти Российской Федерации — только на основаниях и в порядке, которые установлены законодательством Российской Федерации;
— стратегическим партнёрам, которые работают с Оператором, для предоставления продуктов и услуг, а также тем из них, которые помогают Оператору реализовывать продукты и услуги потребителям.
Мы предоставляем третьим лицам минимальный объём персональных данных, необходимый только для оказания требуемой услуги или проведения необходимой транзакции.

Изменение условий
Оператор оставляет за собой право вносить изменения в одностороннем порядке в настоящие правила, при условии, что изменения не противоречат действующему законодательству Российской Федерации. Изменения условий настоящих правил вступают в силу после их публикации на сайте.`;

const BODY_EN = `By providing personal data, the user consents to the processing, storage and use of their personal data by the Federal State Budgetary Institution “Directorate for the Operation of Buildings of the Federal Assembly of the Russian Federation” (hereinafter — the Operator) pursuant to Federal Law No. 152-FZ “On Personal Data” of 27 July 2006, for the following purposes:
— providing customer support;
— informing the user about marketing events;
— conducting audits and other internal research to improve the quality of the services provided.

Categories of personal data
Personal data means any information of a personal nature that makes it possible to identify the user/customer, such as:
— surname, first name and patronymic;
— date of birth;
— contact phone number;
— email address;
— postal address.

Storage and processing
Users’ personal data is stored exclusively on electronic media and processed using automated systems, except where non-automated processing of personal data is required in order to comply with the legislation of the Russian Federation.

Disclosure to third parties
The Operator undertakes not to transfer the personal data received to third parties, except in the following cases:
— at the request of authorised state authorities of the Russian Federation — only on the grounds and in the manner established by the legislation of the Russian Federation;
— to strategic partners who work with the Operator to provide products and services, as well as to those who help the Operator deliver products and services to consumers.
We provide third parties with the minimum amount of personal data necessary solely to deliver the requested service or carry out the necessary transaction.

Amendments
The Operator reserves the right to unilaterally amend these rules, provided that the amendments do not contradict the applicable legislation of the Russian Federation. Amendments to these rules take effect upon their publication on the website.`;

export default function PersonalDataConsent() {
  const { lang, t } = useSite();

  const title = t('consent_title') || (lang === 'ru' ? 'Обработка персональных данных' : 'Personal data processing');
  const body = t('consent_body') || (lang === 'ru' ? BODY_RU : BODY_EN);

  return <LegalDocument title={title} body={body} path="personal-data-consent" lang={lang} />;
}
