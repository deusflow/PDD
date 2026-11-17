import React, { useEffect } from 'react';
import {
  Car,
  Gauge,
  GraduationCap,
  Hash,
  Lightbulb,
  ParkingCircle,
  ShieldAlert,
  X,
} from 'lucide-react';
import { LanguageMode } from '../../types';
import { SpeakButton } from '../common/SpeakButton';

interface QuickNumbersModalProps {
  isOpen: boolean;
  languageMode: LanguageMode;
  onClose: () => void;
}

interface NumberItem {
  id: string;
  value: string;
  daTerm?: string;
  labelRu: string;
  noteRu: string;
}

interface NumberGroup {
  id: string;
  titleRu: string;
  titleDa: string;
  accent: string;
  icon: React.ReactNode;
  items: NumberItem[];
}

const NUMBER_GROUPS: NumberGroup[] = [
  {
    id: 'parking',
    titleRu: 'Парковка и отступы',
    titleDa: 'Parkering & afstande',
    accent: 'text-sky-600 dark:text-sky-400',
    icon: <ParkingCircle className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
    items: [
      {
        id: 'p_3min',
        value: '3 мин',
        daTerm: 'Standsning op til 3 minutter',
        labelRu: 'Лимит остановки (standsning)',
        noteRu: 'До 3 мин (или высадка/погрузка) без выхода из зоны контроля. Всё дольше — парковка.',
      },
      {
        id: 'p_5m',
        value: '5 м',
        daTerm: '5 meter før fodgængerfelt og cykelsti',
        labelRu: 'До пешеходного перехода и велодорожки',
        noteRu: 'Запрещены и standsning, и parkering за 5 м ДО перехода/выезда велодорожки (после — можно, если нет разметки).',
      },
      {
        id: 'p_10m',
        value: '10 м',
        daTerm: '10 meter fra vejkryds',
        labelRu: 'От перекрёстка (все 4 стороны)',
        noteRu: 'Нельзя ни стоять, ни парковаться ближе 10 м от пересечения проезжих частей или края перекрёстка.',
      },
      {
        id: 'p_12m',
        value: '12 м',
        daTerm: '12 meter ved busstoppested',
        labelRu: 'У остановки автобуса',
        noteRu: 'Если нет жёлтой разметки — по 12 м в обе стороны от знака остановки.',
      },
      {
        id: 'p_30m',
        value: '30 м',
        daTerm: '30 meter før og efter jernbaneoverkørsel',
        labelRu: 'От ж/д переезда',
        noteRu: 'Запрещена парковка в пределах 30 м в обе стороны от ж/д переезда (standsning по общим правилам безопасности).',
      },
      {
        id: 'p_3m_solid',
        value: '3 м',
        daTerm: '3 meter til spærrelinje',
        labelRu: 'До сплошной осевой линии',
        noteRu: 'Между припаркованным авто и spærrelinje должно оставаться минимум 3 м свободного проезда.',
      },
    ],
  },
  {
    id: 'speed_trailer',
    titleRu: 'Скорости и прицепы',
    titleDa: 'Hastighed & påhængskøretøj',
    accent: 'text-teal-600 dark:text-teal-400',
    icon: <Gauge className="h-4 w-4 text-teal-600 dark:text-teal-400" />,
    items: [
      {
        id: 's_50_80_130',
        value: '50 / 80 / 130',
        daTerm: '50 i byzone, 80 på landevej, 130 på motorvej',
        labelRu: 'Базовые лимиты (км/ч)',
        noteRu: 'Город (E55): 50 · Загород и motortrafikvej: 80 · Автобан: 130 (если знаками не снижено до 110/90).',
      },
      {
        id: 's_trailer_80',
        value: '80 / 100 км/ч',
        daTerm: 'Påhængsvogn 80 kilometer i timen og Tempo 100',
        labelRu: 'Лимит с прицепом / караваном',
        noteRu: 'На motorvej с прицепом максимум 80 км/ч (или 100 км/ч только при наличии допуска Tempo 100). Вне автобана — 80 км/ч (на загородных дорогах в Дании также макс. 80 км/ч с лёгким прицепом).',
      },
      {
        id: 's_tow_30',
        value: '30 км/ч',
        daTerm: 'Slæbning højst 30 kilometer i timen',
        labelRu: 'Буксировка неисправного авто',
        noteRu: 'Максимум 30 км/ч (на motorvej и motortrafikvej буксировка на тросе/штанге строго запрещена).',
      },
      {
        id: 's_3500',
        value: '3.500 kg',
        daTerm: 'Tilladt totalvægt 3500 kilogram for kategori B',
        labelRu: 'Порог категории B (авто + прицеп)',
        noteRu: 'Сумма tilladt totalvægt тягача и прицепа ≤ 3.500 kg (смотрим в Registreringsattest!).',
      },
      {
        id: 's_750_4250',
        value: '750 / 4.250 kg',
        daTerm: '750 kilogram let påhængsvogn og B+ 4250 kilogram',
        labelRu: 'Лёгкий прицеп и код B+',
        noteRu: 'Прицеп до 750 kg можно цеплять к авто 3.500 kg (сумма до 4.250 kg). Свыше 750 kg при сумме >3.500 kg нужен код B+ (до 4.250 kg) или BE.',
      },
    ],
  },
  {
    id: 'lights_kontrol',
    titleRu: 'Свет и Kontrolprøven',
    titleDa: 'Lygter & teknisk kontrol',
    accent: 'text-amber-600 dark:text-amber-400',
    icon: <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    items: [
      {
        id: 'k_tread',
        value: '1,6 мм / 3 мм',
        daTerm: 'Mindst 1,6 millimeter dækmønster, anbefalet 3 millimeter om vinteren',
        labelRu: 'Глубина протектора шин',
        noteRu: 'Законный минимум круглый год — 1,6 мм (индикатор TWI). Рекомендация для зимы и аквапланирования — от 3 мм.',
      },
      {
        id: 'k_naerlys',
        value: '30 м (1%)',
        daTerm: 'Nærlys skal oplyse vejen mindst 30 meter frem, fald 1 procent',
        labelRu: 'Ближний свет (Nærlys)',
        noteRu: 'Освещает дорогу минимум на 30 м вперёд, светотеневая граница падает на 1% (1 см на 1 м), не ослепляя встречных.',
      },
      {
        id: 'k_fjernlys',
        value: '100 м',
        daTerm: 'Fjernlys skal oplyse vejen mindst 100 meter frem',
        labelRu: 'Дальний свет (Fjernlys)',
        noteRu: 'Минимум 100 м вперёд; на приборной панели обязательно горит синяя контрольная лампа.',
      },
      {
        id: 'k_pos_plate',
        value: '300 м / 20 м',
        daTerm: 'Positionslys synligt 300 meter, nummerpladelys læseligt 20 meter',
        labelRu: 'Габариты и подсветка номера',
        noteRu: 'Габариты и задние фонари должны быть видны с 300 м; белый свет номера читается с 20 м.',
      },
      {
        id: 'k_minmax',
        value: 'MIN–MAX',
        daTerm: 'Væskestand mellem MIN og MAX for motorolie, kølervæske og bremsevæske',
        labelRu: 'Уровни масла и жидкостей под капотом',
        noteRu: 'Уровень моторного масла, тормозной и охлаждающей жидкости — строго между MIN и MAX. Плюс проверка герметичности педали тормоза.',
      },
      {
        id: 'k_park_2s',
        value: '2 сек',
        daTerm: '2 sekunders reglen',
        labelRu: 'Минимальная дистанция на сухой дороге',
        noteRu: 'На мокрой/скользкой дороге увеличивайте до 3–4 секунд.',
      },
    ],
  },
  {
    id: 'alcohol_safety',
    titleRu: 'Алкоголь, штрафы и ДТП',
    titleDa: 'Promille, klip & ulykke',
    accent: 'text-rose-600 dark:text-rose-400',
    icon: <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />,
    items: [
      {
        id: 'a_050',
        value: '0,50 ‰',
        daTerm: 'Promillegrænse 0,50',
        labelRu: 'Допустимый порог алкоголя',
        noteRu: 'Выше 0,50 ‰ — штраф (1 мес. зарплата × промилле) и условное/безусловное лишение прав.',
      },
      {
        id: 'a_200',
        value: '> 2,00 ‰',
        daTerm: 'Vanvidskørsel over 2,00 promille',
        labelRu: 'Безрассудное вождение (Vanvidskørsel)',
        noteRu: 'Конфискация автомобиля (даже чужого/лизингового!), лишение прав от 3 лет и тюремный срок. То же за >200 км/ч или >100% превышение (свыше 100 км/ч).',
      },
      {
        id: 'a_klip',
        value: '2 / 3 klip',
        daTerm: '2 klip for førstegangserhververe i 3 år, ellers 3 klip',
        labelRu: 'Баллы (Klip i kørekortet)',
        noteRu: 'Первые 3 года после получения прав (новичок): лишение уже после 2 klip (пересдача!). После 3 лет — после 3 klip за 3 года.',
      },
      {
        id: 'a_child',
        value: '135 см',
        daTerm: 'Børn under 135 centimeter i godkendt sikkerhedsudstyr',
        labelRu: 'Детское кресло / бустер',
        noteRu: 'Все дети ниже 135 см обязаны ехать в сертифицированном кресле/бустере. Фронтальная подушка должна быть отключена, если кресло стоит спиной вперёд.',
      },
      {
        id: 'a_triangle',
        value: '50 / 100 м',
        daTerm: 'Advarselstrekant 50 meter på almindelig vej, 100 meter på motorvej',
        labelRu: 'Аварийный треугольник',
        noteRu: 'Минимум 50 м позади авто на обычной дороге и минимум 100 м на motorvej (надевайте светоотражающий жилет).',
      },
      {
        id: 'a_112_114',
        value: '112 / 114',
        daTerm: 'Alarm 112 ved personskade, politi 114 uden personskade',
        labelRu: 'Экстренные номера',
        noteRu: '112 — угроза жизни, пожар, пострадавшие в ДТП. 114 — вызов полиции без угрозы жизни.',
      },
    ],
  },
  {
    id: 'school_exam',
    titleRu: 'Автошкола Lovpakke B и экзамены',
    titleDa: 'Lovpakke B & prøver',
    accent: 'text-indigo-600 dark:text-indigo-400',
    icon: <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
    items: [
      {
        id: 'e_lovpakke',
        value: '29+4+16+4',
        daTerm: '29 teorilektioner, 4 manøvrebane, 16 kørelektioner på vej, 4 køreteknisk anlæg',
        labelRu: 'Обязательный минимум (Lovpakke B)',
        noteRu: '29 уроков теории (по 45 мин) · 4 урока на закрытой площадке · 16 уроков в городе/трассе · 4 урока контраварийной езды (glatbane).',
      },
      {
        id: 'e_teori',
        value: '20 из 25',
        daTerm: 'Teoriprøve: 25 billeder, højst 5 fejl',
        labelRu: 'Проходной балл Teoriprøven',
        noteRu: '25 дорожных ситуаций с подвопросами Ja/Nej. Максимум 5 ошибок (ошибка даже в 1 подвопросе = ошибка во всём слайде). Время: ~25 мин.',
      },
      {
        id: 'e_praksis',
        value: '25–45 мин',
        daTerm: 'Køreprøve med kontrolprøve først',
        labelRu: 'Практический экзамен (Køreprøve)',
        noteRu: 'Начинается с устного Kontrolprøven (инспектор задаёт 2–4 вопроса по авто), затем 25–45 минут езды по маршруту и парковка.',
      },
    ],
  },
];

export const QuickNumbersModal: React.FC<QuickNumbersModalProps> = ({
  isOpen,
  languageMode,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-numbers-title"
    >
      <div
        className="nordic-card flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="quick-numbers-title"
                className="text-base font-bold text-zinc-900 dark:text-zinc-50"
              >
                Все цифры ПДД Дании за 2 минуты
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Шпаргалка перед экзаменом · 5 ключевых блоков чисел и норм
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть шпаргалку"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {NUMBER_GROUPS.map((group) => (
            <section key={group.id} className="space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-200/70 pb-2 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  {group.icon}
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {languageMode === 'da_only' ? group.titleDa : group.titleRu}
                  </h3>
                </div>
                {languageMode !== 'da_only' && (
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    {group.titleDa}
                  </span>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-lg bg-white px-2.5 py-0.5 text-sm font-extrabold shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-700 ${group.accent}`}
                          >
                            {item.value}
                          </span>
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {item.labelRu}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {item.noteRu}
                        </p>
                      </div>

                      {item.daTerm && (
                        <SpeakButton id={`num_${item.id}`} text={item.daTerm} size="sm" />
                      )}
                    </div>

                    {item.daTerm && (
                      <div className="mt-2 border-t border-zinc-200/60 pt-1.5 text-[11px] font-medium text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                        DA: {item.daTerm}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200/80 bg-zinc-50/70 px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Car className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>Эти цифры проверяются в 70% билетов Teoriprøven и на Kontrolprøven.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Понятно, закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
