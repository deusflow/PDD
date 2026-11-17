import React, { useEffect, useState } from 'react';
import { LanguageMode, TechnicalTabId } from '../../types';
import { BilingualText } from '../common/BilingualText';
import { SpeakButton } from '../common/SpeakButton';

interface CarTechnicalSVGProps {
  initialTab?: TechnicalTabId;
  activeHotspot?: string;
  languageMode?: LanguageMode;
  compact?: boolean;
  className?: string;
}

interface HotspotInfo {
  id: string;
  tab: TechnicalTabId;
  labelDa: string;
  labelRu: string;
  checkDa: string;
  checkRu: string;
}

const HOTSPOTS: HotspotInfo[] = [
  // Motorrum
  {
    id: 'bremsevaeske',
    tab: 'motorrum',
    labelDa: 'Bremsevæskebeholder',
    labelRu: 'Бачок тормозной жидкости',
    checkDa: 'Væskestanden skal stå mellem MIN og MAX. Hurtigt fald = utæt bremsesystem (kør ikke videre!).',
    checkRu: 'Уровень между MIN и MAX. Резкое падение означает утечку в тормозной системе — ехать нельзя!',
  },
  {
    id: 'motorolie',
    tab: 'motorrum',
    labelDa: 'Motorolie & Oliepind',
    labelRu: 'Щуп и заливная горловина масла',
    checkDa: 'Bilen står plant med slukket motor. Tør pinden af, sæt ned, træk op: niveau mellem MIN og MAX.',
    checkRu: 'Авто стоит ровно, мотор заглушен. Протрите щуп, вставьте до упора и проверьте уровень между MIN и MAX.',
  },
  {
    id: 'koelervaeske',
    tab: 'motorrum',
    labelDa: 'Kølervæske (Ekspansionsbeholder)',
    labelRu: 'Охлаждающая жидкость (антифриз)',
    checkDa: 'Mellem MIN og MAX. Åbn ALDRIG låget, når motoren er varm — risiko for skoldning!',
    checkRu: 'Между MIN и MAX. НИКОГДА не откручивайте крышку на горячем моторе — давление выбьет кипяток!',
  },
  {
    id: 'sprinklervaeske',
    tab: 'motorrum',
    labelDa: 'Sprinklervæske (Blåt låg)',
    labelRu: 'Бачок омывателя (синяя крышка)',
    checkDa: 'Skal have væske (med frostsikring om vinteren), så forruden altid kan vaskes ren.',
    checkRu: 'Должна быть залита жидкость (зимой незамерзайка) для постоянной очистки лобового стекла.',
  },

  // Dæk, Bremser & Styretøj
  {
    id: 'daek',
    tab: 'daek_bremser',
    labelDa: 'Dækmønster (min. 1,6 mm & TWI)',
    labelRu: 'Протектор шин (мин. 1,6 мм и TWI)',
    checkDa: 'Mindst 1,6 mm i hovedrillerne (TWI-indikator). Samme dæktype (sommer/vinter) på alle 4 hjul.',
    checkRu: 'Минимум 1,6 мм по всей рабочей зоне (ориентир TWI). Одинаковый тип шин на всех 4 колёсах.',
  },
  {
    id: 'bremser',
    tab: 'daek_bremser',
    labelDa: 'Driftsbremse & Vakuumforstærker',
    labelRu: 'Тормозная педаль и вакуумный усилитель',
    checkDa: 'Sluk motor → pump 3-4 gange (hård) → hold tryk & start → pedalen synker let. Må ikke synke ved fast tryk!',
    checkRu: 'Заглушить → нажать 3–4 раза до твёрдости → держать и завести → чуть уйдёт вниз. Не должна проваливаться до пола!',
  },
  {
    id: 'haandbremse',
    tab: 'daek_bremser',
    labelDa: 'Parkeringsbremse (Håndbremse)',
    labelRu: 'Стояночный тормоз (ручник)',
    checkDa: 'Skal kunne holde bilen sikkert på en stejl bakke (virker uafhængigt af hydraulikken).',
    checkRu: 'Должен надёжно удерживать авто на уклоне (механический или электрический контур).',
  },
  {
    id: 'stoddaempere',
    tab: 'daek_bremser',
    labelDa: 'Støddæmpere (4 hjørner)',
    labelRu: 'Амортизаторы (проверка углов кузова)',
    checkDa: 'Tryk kraftigt ned over hvert hjørne og slip: bilen skal straks gå i ro uden eftersvingninger.',
    checkRu: 'Нажмите на угол кузова и отпустите: машина поднимается 1 раз и сразу замирает без раскачки.',
  },
  {
    id: 'styretoej',
    tab: 'daek_bremser',
    labelDa: 'Styretøj & Ratslør (0 cm)',
    labelRu: 'Рулевое управление и люфт (0 см)',
    checkDa: 'Med aktiv servo skal forhjulene straks følge med, når rattet drejes let (0 cm ratslør).',
    checkRu: 'С включённым усилителем колёса реагируют на поворот руля мгновенно, без свободного люфта.',
  },

  // Lygter
  {
    id: 'positionslys',
    tab: 'lygter',
    labelDa: 'Positionslys (2 hvide + 2 røde)',
    labelRu: 'Габаритные огни (300 м)',
    checkDa: 'Skal kunne ses tydeligt på min. 300 m i mørke uden at blænde.',
    checkRu: '2 белых спереди, 2 красных сзади; видимость в темноте минимум с 300 м.',
  },
  {
    id: 'naerlys',
    tab: 'lygter',
    labelDa: 'Nærlys (min. 30 m & 1% fald)',
    labelRu: 'Ближний свет (мин. 30 м, уклон 1%)',
    checkDa: 'Asymmetrisk lyskegle mod højre kantsten, fald 1% (1 cm pr. meter), lyser min. 30 m uden at blænde.',
    checkRu: 'Асимметричный луч на правую обочину, уклон 1%, освещает минимум 30 м без ослепления.',
  },
  {
    id: 'fjernlys',
    tab: 'lygter',
    labelDa: 'Fjernlys (min. 100 m & Blå lampe)',
    labelRu: 'Дальний свет (мин. 100 м, синяя лампа)',
    checkDa: 'Lyser mindst 100 meter frem og tænder blå kontrollampe på instrumentbrættet.',
    checkRu: 'Освещает минимум 100 м; при включении загорается синий индикатор на панели.',
  },
  {
    id: 'stoplys',
    tab: 'lygter',
    labelDa: 'Stoplys (3 røde lygter)',
    labelRu: 'Стоп-сигналы (3 фонаря)',
    checkDa: '3 røde lygter bagpå (sider + højt i midten), væsentligt kraftigere end baglys.',
    checkRu: '3 красных фонаря (по бокам и верхний центральный), существенно ярче габаритов.',
  },
  {
    id: 'blinklys',
    tab: 'lygter',
    labelDa: 'Blinklys & Havariblink (60–120/min)',
    labelRu: 'Поворотники и аварийка (6 шт.)',
    checkDa: '6 gule lygter (for, sider, bag), 60–120 blink/min. Hurtigere blink = sprunget pære.',
    checkRu: '6 жёлтых фонарей с частотой 60–120/мин. Ускоренное мигание — перегорела лампа.',
  },
  {
    id: 'nummerplade',
    tab: 'lygter',
    labelDa: 'Nummerpladelys (20 m) & Reflekser',
    labelRu: 'Подсветка номера (20 м) и катафоты',
    checkDa: 'Hvidt lys læsbar på 20 m; 2 røde bagreflekser (må IKKE være trekantede!).',
    checkRu: 'Белая подсветка читаема с 20 м; 2 красных катафота сзади (НЕ треугольные!).',
  },
  {
    id: 'horn',
    tab: 'lygter',
    labelDa: 'Horn (Kun ved fare)',
    labelRu: 'Клаксон (только при опасности)',
    checkDa: 'Klar ensartet tone — må kun bruges for at afværge overhængende fare.',
    checkRu: 'Ровный чёткий звук; по закону используется только для предотвращения опасности.',
  },

  // Instrumentpanel
  {
    id: 'olie_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Rød oliekande — Olietryk',
    labelRu: 'Красная маслёнка — давление масла',
    checkDa: 'STANDS STRAKS og sluk motoren! Manglende olietryk ødelægger motoren øjeblikkeligt.',
    checkRu: 'НЕМЕДЛЕННО остановитесь и заглушите мотор!',
  },
  {
    id: 'bremse_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Rød (!) — Bremsefejl / Håndbremse',
    labelRu: 'Красный (!) — ошибка тормозов / ручник',
    checkDa: 'Hvis håndbremsen er nede: for lav bremsevæske eller fejl på bremsesystem — stands straks!',
    checkRu: 'Если ручник опущен: утечка тормозной жидкости или отказ системы — остановитесь сразу!',
  },
  {
    id: 'temp_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Rød Temperatur / Batteri',
    labelRu: 'Красный термометр / АКБ',
    checkDa: 'Stands sikkert hurtigst muligt — motoren overopheder eller generatoren lader ikke.',
    checkRu: 'Остановитесь как можно быстрее — перегрев мотора или отсутствие зарядки.',
  },
  {
    id: 'abs_lampe',
    tab: 'instrumentpanel',
    labelDa: 'Gul ABS / ESP / Motorlampe',
    labelRu: 'Жёлтый индикатор ABS / ESP / Check',
    checkDa: 'Advarsel: kør forsigtigt til nærmeste værksted (ved ABS-fejl virker bremserne stadig, men kan blokere).',
    checkRu: 'Предупреждение: можно осторожно доехать до сервиса.',
  },
];

const TABS: Array<{ id: TechnicalTabId; da: string; ru: string }> = [
  { id: 'motorrum', da: '1. Motorrum', ru: 'Под капотом' },
  { id: 'daek_bremser', da: '2. Dæk & Bremser', ru: 'Шины и тормоза' },
  { id: 'lygter', da: '3. Lygter & Horn', ru: 'Фары и сигналы' },
  { id: 'instrumentpanel', da: '4. Instrumentpanel', ru: 'Приборная панель' },
];

export const CarTechnicalSVG: React.FC<CarTechnicalSVGProps> = ({
  initialTab = 'motorrum',
  activeHotspot,
  languageMode = 'both',
  compact = false,
  className = '',
}) => {
  const [tab, setTab] = useState<TechnicalTabId>(initialTab);
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (activeHotspot) return activeHotspot;
    return HOTSPOTS.find((h) => h.tab === initialTab)?.id ?? 'bremsevaeske';
  });

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeHotspot) {
      setSelectedId(activeHotspot);
      const found = HOTSPOTS.find((h) => h.id === activeHotspot);
      if (found) setTab(found.tab);
    }
  }, [activeHotspot]);

  const tabHotspots = HOTSPOTS.filter((h) => h.tab === tab);
  const currentInfo =
    HOTSPOTS.find((h) => h.id === selectedId && h.tab === tab) ?? tabHotspots[0];

  const handleSelectTab = (nextTab: TechnicalTabId) => {
    setTab(nextTab);
    const first = HOTSPOTS.find((h) => h.tab === nextTab);
    if (first) setSelectedId(first.id);
  };

  const hotspotCircle = (id: string, cx: number, cy: number, label: string, color = '#0284C7') => {
    const active = currentInfo?.id === id;
    return (
      <g
        key={id}
        onClick={() => setSelectedId(id)}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
      >
        {active && (
          <circle cx={cx} cy={cy} r="22" fill={color} opacity="0.24" className="animate-pulse-soft" />
        )}
        <circle
          cx={cx}
          cy={cy}
          r="14"
          fill={active ? color : '#18181B'}
          stroke="#FFFFFF"
          strokeWidth="2.5"
        />
        <text x={cx} y={cy + 3.5} textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="800">
          {label}
        </text>
      </g>
    );
  };

  const renderDiagram = () => {
    switch (tab) {
      case 'motorrum':
        return (
          <g>
            {/* Engine bay background */}
            <rect x="0" y="0" width="440" height="220" fill="#18181B" />
            <rect x="24" y="18" width="392" height="184" rx="16" fill="#27272A" stroke="#3F3F46" strokeWidth="2" />
            {/* Engine block */}
            <rect x="135" y="42" width="165" height="122" rx="12" fill="#3F3F46" stroke="#52525B" strokeWidth="2" />
            <text x="218" y="98" textAnchor="middle" fill="#A1A1AA" fontSize="13" fontWeight="800">
              MOTORBLOK
            </text>
            {/* Battery */}
            <rect x="38" y="128" width="76" height="56" rx="6" fill="#09090B" stroke="#71717A" strokeWidth="2" />
            <text x="76" y="160" textAnchor="middle" fill="#D4D4D8" fontSize="10" fontWeight="700">
              12V +/-
            </text>
            {/* Reservoirs */}
            <rect x="36" y="34" width="64" height="50" rx="8" fill="#451A03" stroke="#F59E0B" strokeWidth="2" />
            <text x="68" y="76" textAnchor="middle" fill="#FDE68A" fontSize="8.5" fontWeight="700">
              BREMSE
            </text>
            <rect x="328" y="34" width="70" height="58" rx="10" fill="#4C0519" stroke="#FB7185" strokeWidth="2" />
            <text x="363" y="84" textAnchor="middle" fill="#FECDD3" fontSize="8.5" fontWeight="700">
              KØLER (VARM!)
            </text>
            <rect x="330" y="124" width="66" height="58" rx="10" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="2" />
            <text x="363" y="174" textAnchor="middle" fill="#BAE6FD" fontSize="8.5" fontWeight="700">
              SPRINKLER
            </text>
            {/* Hotspots */}
            {hotspotCircle('bremsevaeske', 68, 52, '1', '#F59E0B')}
            {hotspotCircle('motorolie', 218, 134, '2', '#10B981')}
            {hotspotCircle('koelervaeske', 363, 56, '3', '#E11D48')}
            {hotspotCircle('sprinklervaeske', 363, 146, '4', '#0284C7')}
          </g>
        );

      case 'daek_bremser':
        return (
          <g>
            <rect x="0" y="0" width="440" height="220" fill="#18181B" />
            {/* Chassis side silhouette */}
            <path
              d="M 48 135 L 72 95 L 150 62 L 295 62 L 365 98 L 402 110 L 402 152 L 48 152 Z"
              fill="#27272A"
              stroke="#52525B"
              strokeWidth="2.5"
            />
            {/* Wheels */}
            <circle cx="118" cy="154" r="34" fill="#09090B" stroke="#71717A" strokeWidth="5" />
            <circle cx="118" cy="154" r="16" fill="#52525B" />
            <circle cx="326" cy="154" r="34" fill="#09090B" stroke="#71717A" strokeWidth="5" />
            <circle cx="326" cy="154" r="16" fill="#52525B" />
            {/* TWI Callout */}
            <rect x="16" y="16" width="118" height="36" rx="8" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
            <text x="75" y="33" textAnchor="middle" fill="#34D399" fontSize="10" fontWeight="800">
              Min. 1,6 mm (TWI)
            </text>
            <text x="75" y="45" textAnchor="middle" fill="#94A3B8" fontSize="8.5">
              Ens dæk på 4 hjul
            </text>
            {hotspotCircle('daek', 118, 154, 'DÆK', '#10B981')}
            {hotspotCircle('styretoej', 155, 102, 'RAT', '#38BDF8')}
            {hotspotCircle('bremser', 210, 128, 'PEDAL', '#EF4444')}
            {hotspotCircle('haandbremse', 265, 128, 'HÅND', '#F59E0B')}
            {hotspotCircle('stoddaempere', 355, 106, 'STØD', '#8B5CF6')}
          </g>
        );

      case 'lygter':
        return (
          <g>
            <rect x="0" y="0" width="440" height="220" fill="#18181B" />
            {/* Top-down car outline */}
            <rect x="125" y="54" width="190" height="112" rx="28" fill="#27272A" stroke="#52525B" strokeWidth="2.5" />
            <rect x="165" y="68" width="108" height="84" rx="14" fill="#09090B" />
            {/* Front left beams */}
            <polygon points="125,74 35,44 35,104" fill="#FEF08A" opacity="0.28" />
            <polygon points="125,146 35,116 35,176" fill="#FEF08A" opacity="0.28" />
            <text x="58" y="32" fill="#FEF08A" fontSize="10" fontWeight="700">
              FORAN (Hvid)
            </text>
            <text x="382" y="32" textAnchor="end" fill="#FCA5A5" fontSize="10" fontWeight="700">
              BAGPÅ (Rød)
            </text>
            {hotspotCircle('positionslys', 132, 74, 'POS', '#94A3B8')}
            {hotspotCircle('naerlys', 102, 110, '30m', '#FACC15')}
            {hotspotCircle('fjernlys', 54, 110, '100m', '#3B82F6')}
            {hotspotCircle('horn', 180, 110, 'HORN', '#10B981')}
            {hotspotCircle('blinklys', 220, 56, '60-120', '#F59E0B')}
            {hotspotCircle('stoplys', 310, 84, 'STOP', '#EF4444')}
            {hotspotCircle('nummerplade', 330, 134, '20m', '#EC4899')}
          </g>
        );

      case 'instrumentpanel':
        return (
          <g>
            <rect x="0" y="0" width="440" height="220" fill="#09090B" />
            <rect x="24" y="20" width="392" height="180" rx="22" fill="#18181B" stroke="#3F3F46" strokeWidth="3" />
            {/* Gauges */}
            <circle cx="115" cy="110" r="56" fill="#09090B" stroke="#3F3F46" strokeWidth="3" />
            <text x="115" y="106" textAnchor="middle" fill="#A1A1AA" fontSize="14" fontWeight="800">
              km/t
            </text>
            <text x="115" y="126" textAnchor="middle" fill="#38BDF8" fontSize="11" fontWeight="700">
              50 / 80 / 130
            </text>
            <circle cx="325" cy="110" r="56" fill="#09090B" stroke="#3F3F46" strokeWidth="3" />
            <text x="325" y="108" textAnchor="middle" fill="#A1A1AA" fontSize="12" fontWeight="700">
              o/min
            </text>
            <text x="325" y="126" textAnchor="middle" fill="#4ADE80" fontSize="10" fontWeight="700">
              Øko ~2.000
            </text>
            {/* Warning lights center */}
            <rect x="180" y="42" width="80" height="136" rx="12" fill="#09090B" stroke="#27272A" strokeWidth="2" />
            {hotspotCircle('olie_lampe', 202, 74, 'OLIE', '#DC2626')}
            {hotspotCircle('bremse_lampe', 238, 74, '(!)', '#DC2626')}
            {hotspotCircle('temp_lampe', 202, 114, 'TEMP', '#EF4444')}
            {hotspotCircle('abs_lampe', 238, 114, 'ABS', '#F59E0B')}
            <text x="220" y="160" textAnchor="middle" fill="#FCA5A5" fontSize="8.5" fontWeight="800">
              RØD = STANDS STRAKS!
            </text>
          </g>
        );
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 4 tabs */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTab(t.id)}
              className={`rounded-xl border px-2.5 py-2 text-left text-xs transition-all ${
                isActive
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="font-semibold">{t.da}</div>
              {languageMode !== 'da_only' && (
                <div className={`text-[10px] ${isActive ? 'opacity-80' : 'text-zinc-400'}`}>
                  {t.ru}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* SVG Canvas */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 dark:border-zinc-800">
        <svg viewBox="0 0 440 220" className="h-auto w-full select-none">
          {renderDiagram()}
        </svg>
      </div>

      {/* Interactive pills for hotspots in active tab */}
      <div className="flex flex-wrap gap-1.5">
        {tabHotspots.map((item) => {
          const isSelected = currentInfo?.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? 'border-sky-500 bg-sky-50 text-sky-800 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-200'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {item.labelDa}
            </button>
          );
        })}
      </div>

      {/* Selected hotspot specification card */}
      {!compact && currentInfo && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="flex items-start justify-between gap-2">
            <BilingualText
              da={currentInfo.labelDa}
              ru={currentInfo.labelRu}
              mode={languageMode}
              daClassName="text-sm font-semibold"
              ruClassName="text-xs"
            />
            <SpeakButton
              id={`tech_${currentInfo.id}`}
              text={`${currentInfo.labelDa}. ${currentInfo.checkDa}`}
            />
          </div>
          <div className="mt-2 border-t border-zinc-200/80 pt-2 dark:border-zinc-800">
            <BilingualText
              da={currentInfo.checkDa}
              ru={currentInfo.checkRu}
              mode={languageMode}
              daClassName="text-xs sm:text-sm font-normal"
              ruClassName="text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};
