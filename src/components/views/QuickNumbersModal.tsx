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
        daTerm: 'Standsning er op til 3 minutter (eller af- og påstigning samt af- og pålæsning). Derefter er det parkering.',
        labelRu: 'Лимит остановки (standsning)',
        noteRu: 'До 3 минут (или посадка/высадка и погрузка/разгрузка). После этого — это стоянка.',
      },
      {
        id: 'p_5m',
        value: '5 м',
        daTerm: 'Standsning og parkering er forbudt inden for 5 meter før fodgængerfelt og cykelstiudmunding.',
        labelRu: 'До пешеходного перехода и выезда с велодорожки',
        noteRu: 'Остановка и стоянка запрещены в пределах 5 м ДО пешеходного перехода и выезда с велодорожки.',
      },
      {
        id: 'p_10m',
        value: '10 м',
        daTerm: 'Standsning og parkering er forbudt nærmere end 10 meter fra den nærmeste kant af den krydsende kørebane i et vejkryds.',
        labelRu: 'От перекрёстка',
        noteRu: 'Остановка и стоянка запрещены ближе 10 м от ближайшего края пересекаемой проезжей части перекрёстка.',
      },
      {
        id: 'p_12m',
        value: '12 м',
        daTerm: 'Inden for 12 meter på begge sider af et busstoppested er parkering (> 3 min) forbudt, mens kort standsning uden at genere bussen er tilladt (medmindre der er gul heltrukken kantlinje).',
        labelRu: 'У остановки автобуса',
        noteRu:
          'В пределах 12 м по обе стороны от автобусной остановки запрещена стоянка (> 3 мин), а краткая остановка без помехи автобусу разрешена (если нет сплошной жёлтой линии у бордюра).',
      },
      {
        id: 'p_30m',
        value: '30 м',
        daTerm: 'Parkering er forbudt inden for 30 meter før og efter en jernbaneoverkørsel (og standsning/parkering på selve overkørslen er forbudt).',
        labelRu: 'От ж/д переезда',
        noteRu: 'Стоянка запрещена в пределах 30 м до и после ж/д переезда (остановка и стоянка на самом переезде запрещены).',
      },
      {
        id: 'p_3m_solid',
        value: '3 м',
        daTerm: 'Mellem en parkeret bil og en spærrelinje skal der være mindst 3 meter fri bredde.',
        labelRu: 'До сплошной линии разметки',
        noteRu: 'Между припаркованным авто и сплошной линией (spærrelinje) должно оставаться минимум 3 м свободной ширины.',
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
        daTerm: '50 km/t i byzone (E55), 80 km/t på landevej og motortrafikvej, 130 km/t på motorvej (medmindre skiltet til 110/90).',
        labelRu: 'Базовые лимиты (км/ч)',
        noteRu: '50 км/ч в городе (E55), 80 км/ч на загородной дороге и motortrafikvej, 130 км/ч на автомагистрали (если знаками не указано 110/90).',
      },
      {
        id: 's_trailer_80',
        value: '80 / 100 км/ч',
        daTerm: 'Med påhængsvogn højst 80 km/t på landevej og motorvej (eller op til 100 km/t på motorvej og motortrafikvej med dansk Tempo 100-godkendelse).',
        labelRu: 'Лимит с прицепом',
        noteRu: 'С прицепом макс. 80 км/ч на загородной дороге и автомагистрали (или до 100 км/ч на автомагистрали и motortrafikvej при наличии датского допуска Tempo 100).',
      },
      {
        id: 's_tow_30',
        value: '30 км/ч',
        daTerm: 'Slæbning højst 30 km/t og er forbudt på motorvej og motortrafikvej.',
        labelRu: 'Буксировка неисправного авто',
        noteRu: 'Буксировка макс. 30 км/ч и запрещена на автомагистрали (motorvej) и motortrafikvej.',
      },
      {
        id: 's_3500',
        value: '3.500 kg',
        daTerm: 'Ved kategori B må summen af bilens og trailerens tilladte totalvægt på registreringsattesten højst være 3.500 kg.',
        labelRu: 'Порог категории B (авто + прицеп)',
        noteRu: 'При категории B сумма разрешённой максимальной массы (tilladt totalvægt) авто и прицепа по техпаспорту — не более 3.500 kg.',
      },
      {
        id: 's_750_4250',
        value: '750 / 4.250 kg',
        daTerm: 'Let påhængsvogn højst 750 kg må altid kobles til bil op til 3.500 kg (i alt op til 4.250 kg); er traileren over 750 kg og summen over 3.500 kg, kræves B+ (op til 4.250 kg) eller BE.',
        labelRu: 'Лёгкий прицеп и код B+',
        noteRu: 'Лёгкий прицеп до 750 kg всегда можно прицепить к авто до 3.500 kg (всего до 4.250 kg); если прицеп > 750 kg и сумма > 3.500 kg, нужен код B+ (до 4.250 kg) или BE.',
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
        daTerm: 'Mindst 1,6 mm dækmønster året rundt (TWI-indikatorer); om vinteren anbefales mindst 3 mm.',
        labelRu: 'Глубина протектора шин',
        noteRu: 'Минимум 1,6 мм протектора круглый год (индикаторы TWI); зимой рекомендуется не менее 3 мм.',
      },
      {
        id: 'k_naerlys',
        value: '30 м (1%)',
        daTerm: 'Nærlys skal oplyse vejen mindst 30 meter frem med et fald på ca. 1 % (1 cm pr. meter) uden at blænde modkørende.',
        labelRu: 'Ближний свет (Nærlys)',
        noteRu: 'Ближний свет должен освещать дорогу минимум на 30 м вперёд с уклоном около 1% (1 см на метр), не ослепляя встречных.',
      },
      {
        id: 'k_fjernlys',
        value: '100 м',
        daTerm: 'Fjernlys skal oplyse vejen mindst 100 meter frem, og en blå kontrollampe skal lyse på instrumentbrættet.',
        labelRu: 'Дальний свет (Fjernlys)',
        noteRu: 'Дальний свет должен освещать дорогу минимум на 100 м вперёд, а на приборной панели должна гореть синяя контрольная лампа.',
      },
      {
        id: 'k_pos_plate',
        value: '300 м / 20 м',
        daTerm: 'Positionslys skal kunne ses på mindst 300 m, og hvidt nummerpladelys skal gøre pladen læselig på mindst 20 m.',
        labelRu: 'Габариты и подсветка номера',
        noteRu: 'Габаритные огни должны быть видны минимум с 300 м, а белая подсветка номера — делать знак читаемым минимум с 20 м.',
      },
      {
        id: 'k_minmax',
        value: 'MIN–MAX',
        daTerm: 'Væskestand mellem MIN og MAX for motorolie, kølervæske og bremsevæske.',
        labelRu: 'Уровни жидкостей под капотом',
        noteRu: 'Уровень жидкостей должен быть между MIN и MAX для моторного масла, охлаждающей жидкости и тормозной жидкости.',
      },
      {
        id: 'k_park_2s',
        value: '2 сек',
        daTerm: '2 sekunders sikkerhedsafstand på tør vej (øges til 3–4 sekunder i regn eller glat føre).',
        labelRu: 'Минимальная дистанция',
        noteRu: 'Дистанция 2 секунды на сухой дороге (увеличивается до 3–4 секунд в дождь или гололёд).',
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
        value: '0,20 / 0,50 ‰',
        daTerm: 'Promillegrænse fra 01.07.2025: højst 0,20 ‰ for nye bilister i de første 3 år (ellers kørselsforbud og ANT-kursus); for erfarne bilister 0,50 ‰.',
        labelRu: 'Допустимый порог алкоголя',
        noteRu: 'Порог алкоголя с 01.07.2025: макс. 0,20‰ для новичков в первые 3 года (иначе kørselsforbud и курс ANT); для опытных водителей — 0,50‰.',
      },
      {
        id: 'a_200',
        value: '> 2,00 ‰',
        daTerm: 'Vanvidskørsel over 2,00 ‰, over 200 km/t eller over 100 % fartoverskridelse (ved mindst 100 km/t) giver konfiskation af bilen og frakendelse.',
        labelRu: 'Безрассудное вождение (Vanvidskørsel)',
        noteRu: 'Свыше 2,00‰, свыше 200 км/ч или превышение скорости более чем на 100% (при не менее 100 км/ч) ведёт к конфискации авто и лишению прав.',
      },
      {
        id: 'a_klip',
        value: '2 / 3 klip',
        daTerm: 'Kørselsforbud efter 2 klip for førstegangserhververe i de første 3 år; ellers betinget frakendelse efter 3 klip inden for 3 år.',
        labelRu: 'Баллы (Klip i kørekortet)',
        noteRu: 'Запрет на вождение (kørselsforbud) после 2 баллов для новичков в первые 3 года; иначе условное лишение после 3 баллов за 3 года.',
      },
      {
        id: 'a_child',
        value: '135 см',
        daTerm: 'Børn under 135 cm skal bruge godkendt sikkerhedsudstyr; passagerairbag SKAL slås fra ved bagudvendt autostol på forsædet.',
        labelRu: 'Детское кресло / бустер',
        noteRu: 'Дети ниже 135 см должны ехать в сертифицированном удерживающем устройстве; подушку пассажира НУЖНО отключить при кресле спиной вперёд на переднем сиденье.',
      },
      {
        id: 'a_triangle',
        value: '50 / 100 м',
        daTerm: 'Advarselstrekant mindst 50 meter bag bilen på almindelig vej og mindst 100 meter på motorvej (brug refleksvest).',
        labelRu: 'Аварийный треугольник',
        noteRu: 'Аварийный треугольник минимум за 50 м позади машины на обычной дороге и минимум за 100 м на автомагистрали (надевайте светоотражающий жилет).',
      },
      {
        id: 'a_112_114',
        value: '112 / 114',
        daTerm: 'Alarm 112 ved personskade, brand eller livsfare; politi 114 ved uheld eller forhold uden personskade.',
        labelRu: 'Экстренные номера',
        noteRu: '112 — при травмах, пожаре или угрозе жизни; полиция 114 — при происшествиях без пострадавших.',
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
        daTerm: '29 teorilektioner, 4 på manøvrebane, 16 kørelektioner på vej og 4 på køreteknisk anlæg (glatbane).',
        labelRu: 'Обязательный минимум (Lovpakke B)',
        noteRu: '29 уроков теории, 4 на площадке (manøvrebane), 16 уроков вождения на дороге и 4 на скользком полигоне (glatbane).',
      },
      {
        id: 'e_teori',
        value: '20 из 25',
        daTerm: 'Digital teoriprøve: 25 billeder med Ja/Nej-spørgsmål på 25 minutter, kræver mindst 20/25 rigtige (højst 5 fejl; én fejl i et delspørgsmål gør hele billedet forkert).',
        labelRu: 'Проходной балл Teoriprøven',
        noteRu: 'Цифровой экзамен: 25 картинок с вопросами Ja/Nej за 25 минут, нужно минимум 20/25 (максимум 5 ошибок; ошибка в подвопросе обнуляет всю картинку).',
      },
      {
        id: 'e_praksis',
        value: '25–35 мин',
        daTerm: 'Praktisk køreprøve starter med mundtlig kontrolprøve ved bilen (ca. 5 min.), efterfulgt af 25–35 minutters kørsel.',
        labelRu: 'Практический экзамен (Køreprøve)',
        noteRu: 'Практический экзамен начинается с устного осмотра (kontrolprøve) у машины (~5 мин), за которым следует 25–35 минут вождения.',
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
                      <div className="mt-2 flex items-start gap-1.5 border-t border-zinc-200/60 pt-2 text-xs leading-snug text-teal-950/85 dark:border-zinc-800/80 dark:text-teal-200/90">
                        <span className="mt-0.5 inline-flex shrink-0 items-center rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                          DA
                        </span>
                        <span>{item.daTerm}</span>
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
