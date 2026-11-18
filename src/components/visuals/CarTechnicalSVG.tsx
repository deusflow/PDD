import React, { useEffect, useId, useState } from 'react';
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
  const uid = useId().replace(/:/g, '');
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
            <defs>
              <linearGradient id={`${uid}_bay`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#18181B" />
                <stop offset="100%" stopColor="#09090B" />
              </linearGradient>
              <linearGradient id={`${uid}_metal`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#64748B" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="440" height="220" fill={`url(#${uid}_bay)`} />
            {/* Windshield cowl top + front bumper/radiator grille bottom */}
            <path d="M 16 14 Q 220 4 424 14 L 414 202 Q 220 212 26 202 Z" fill="#27272A" stroke="#52525B" strokeWidth="2" />
            <rect x="112" y="192" width="216" height="12" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="1.2" />
            <line x1="126" y1="198" x2="314" y2="198" stroke="#64748B" strokeWidth="1.5" strokeDasharray="8 6" />
            {/* Open hood prop rod */}
            <line x1="406" y1="186" x2="424" y2="28" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />

            {/* Realistic ribbed engine block + intake manifold + dipstick */}
            <rect x="136" y="42" width="166" height="126" rx="14" fill="#1E293B" stroke="#475569" strokeWidth="2" />
            <rect x="150" y="54" width="138" height="72" rx="10" fill={`url(#${uid}_metal)`} stroke="#94A3B8" strokeWidth="1.4" />
            {[164, 184, 204, 224, 244, 264].map((x) => (
              <rect key={x} x={x} y="62" width="8" height="54" rx="3" fill="#1E293B" opacity="0.65" />
            ))}
            <text x="219" y="49" textAnchor="middle" fill="#CBD5E1" fontSize="8.5" fontWeight="800" letterSpacing="1">
              MOTORBLOK &amp; OLIE
            </text>
            {/* Oil filler cap + bright yellow dipstick ring */}
            <circle cx="176" cy="144" r="10" fill="#0F172A" stroke="#FACC15" strokeWidth="2" />
            <line x1="219" y1="126" x2="219" y2="146" stroke="#FACC15" strokeWidth="3" />
            <circle cx="219" cy="150" r="8" fill="none" stroke="#FACC15" strokeWidth="3" />
            <text x="255" y="152" fill="#FDE047" fontSize="8" fontWeight="700">
              Oliepind
            </text>

            {/* 12V Battery */}
            <rect x="34" y="122" width="84" height="62" rx="7" fill="#09090B" stroke="#71717A" strokeWidth="2" />
            <rect x="44" y="128" width="16" height="10" rx="2" fill="#DC2626" />
            <text x="52" y="136" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="900">+</text>
            <rect x="92" y="128" width="16" height="10" rx="2" fill="#3F3F46" />
            <text x="100" y="136" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="900">-</text>
            <text x="76" y="164" textAnchor="middle" fill="#D4D4D8" fontSize="9.5" fontWeight="700">
              12V Batteri
            </text>

            {/* 1. Bremsevæske reservoir with visible MIN/MAX */}
            <rect x="36" y="28" width="76" height="68" rx="9" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.8" />
            <rect x="42" y="54" width="64" height="22" rx="4" fill="#D97706" opacity="0.55" />
            <line x1="42" y1="54" x2="106" y2="54" stroke="#FDE68A" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="42" y1="74" x2="106" y2="74" stroke="#FDE68A" strokeWidth="1" strokeDasharray="3 2" />
            <text x="100" y="52" textAnchor="end" fill="#FDE68A" fontSize="6.5" fontWeight="700">MAX</text>
            <text x="100" y="72" textAnchor="end" fill="#FDE68A" fontSize="6.5" fontWeight="700">MIN</text>
            <text x="74" y="88" textAnchor="middle" fill="#FDE68A" fontSize="8" fontWeight="800">
              BREMSEVÆSKE
            </text>

            {/* 3. Kølervæske pressurized sphere */}
            <rect x="322" y="28" width="84" height="72" rx="14" fill="#1E293B" stroke="#FB7185" strokeWidth="1.8" />
            <ellipse cx="364" cy="64" rx="28" ry="18" fill="#E11D48" opacity="0.45" />
            <line x1="336" y1="54" x2="392" y2="54" stroke="#FECDD3" strokeWidth="1" strokeDasharray="3 2" />
            <line x1="336" y1="74" x2="392" y2="74" stroke="#FECDD3" strokeWidth="1" strokeDasharray="3 2" />
            <text x="364" y="92" textAnchor="middle" fill="#FECDD3" fontSize="7.8" fontWeight="800">
              KØLER (VARM!)
            </text>

            {/* 4. Sprinklervæske tank */}
            <rect x="324" y="118" width="80" height="66" rx="10" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1.8" />
            <rect x="330" y="138" width="68" height="28" rx="5" fill="#0284C7" opacity="0.55" />
            <text x="364" y="176" textAnchor="middle" fill="#BAE6FD" fontSize="8" fontWeight="800">
              SPRINKLER
            </text>

            {/* Hotspots */}
            {hotspotCircle('bremsevaeske', 74, 52, '1', '#F59E0B')}
            {hotspotCircle('motorolie', 219, 102, '2', '#10B981')}
            {hotspotCircle('koelervaeske', 364, 58, '3', '#E11D48')}
            {hotspotCircle('sprinklervaeske', 364, 146, '4', '#0284C7')}
          </g>
        );

      case 'daek_bremser':
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}_carBody`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="440" height="220" fill="#09090B" />
            {/* Road ground line */}
            <line x1="16" y1="190" x2="424" y2="190" stroke="#3F3F46" strokeWidth="2.5" />
            {/* Realistic Hatchback side cutaway */}
            <path
              d="M 46 148 Q 48 116 74 102 L 138 66 Q 198 54 276 58 L 352 94 L 392 104 Q 404 114 404 148 L 372 152 A 36 36 0 0 0 296 152 L 160 152 A 36 36 0 0 0 84 152 Z"
              fill={`url(#${uid}_carBody)`}
              stroke="#94A3B8"
              strokeWidth="1.8"
            />
            {/* Side windows */}
            <path d="M 142 74 L 222 68 L 222 100 L 116 100 Z" fill="#0F172A" opacity="0.85" />
            <path d="M 230 68 L 274 68 L 330 96 L 230 100 Z" fill="#0F172A" opacity="0.85" />
            {/* Steering column + vacuum brake booster + handbrake cable */}
            <line x1="148" y1="98" x2="122" y2="148" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="4 2" />
            <path d="M 206 128 L 122 154 M 266 132 L 334 154" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 3" />
            {/* Shock absorber coil over rear wheel */}
            <path d="M 352 98 L 344 112 L 358 118 L 344 124 L 358 130 L 348 142" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />

            {/* Front & Rear Alloy Wheels with Brake Disc + Red Caliper */}
            {[122, 334].map((cx) => (
              <g key={cx}>
                <circle cx={cx} cy="154" r="35" fill="#18181B" stroke="#71717A" strokeWidth="4" />
                <circle cx={cx} cy="154" r="24" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
                <circle cx={cx} cy="154" r="15" fill="#CBD5E1" opacity="0.7" />
                <path d={`M ${cx + 8} 142 A 14 14 0 0 1 ${cx + 12} 162`} fill="none" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />
                <circle cx={cx} cy="154" r="5" fill="#0F172A" />
              </g>
            ))}

            {/* Zoomed TWI Tread Callout */}
            <g transform="translate(14, 14)">
              <rect x="0" y="0" width="132" height="48" rx="10" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
              <rect x="10" y="10" width="28" height="28" rx="4" fill="#27272A" />
              <rect x="16" y="10" width="4" height="22" fill="#09090B" />
              <rect x="26" y="10" width="4" height="22" fill="#09090B" />
              <rect x="16" y="25" width="4" height="4" fill="#34D399" />
              <text x="46" y="23" fill="#34D399" fontSize="9.5" fontWeight="800">
                Min. 1,6 mm
              </text>
              <text x="46" y="36" fill="#CBD5E1" fontSize="8">
                TWI · 4 ens dæk
              </text>
            </g>

            {hotspotCircle('daek', 122, 154, 'DÆK', '#10B981')}
            {hotspotCircle('styretoej', 152, 96, 'RAT', '#38BDF8')}
            {hotspotCircle('bremser', 206, 128, 'PEDAL', '#EF4444')}
            {hotspotCircle('haandbremse', 266, 128, 'HÅND', '#F59E0B')}
            {hotspotCircle('stoddaempere', 354, 102, 'STØD', '#8B5CF6')}
          </g>
        );

      case 'lygter':
        return (
          <g>
            <rect x="0" y="0" width="440" height="220" fill="#09090B" />
            {/* Headlight & Taillight cones */}
            <polygon points="122,74 16,32 16,104" fill="#FEF08A" opacity="0.22" />
            <polygon points="122,146 16,116 16,188" fill="#FEF08A" opacity="0.22" />
            <polygon points="122,74 42,60 42,88" fill="#FEF9C3" opacity="0.34" />
            <polygon points="122,146 42,132 42,160" fill="#FEF9C3" opacity="0.34" />
            <polygon points="322,110 385,92 385,128" fill="#FFFFFF" opacity="0.22" />
            {/* Tapered top-down car silhouette */}
            <path
              d="M 122 72 Q 124 54 148 54 L 300 54 Q 322 54 322 74 L 322 146 Q 322 166 300 166 L 148 166 Q 124 166 122 148 Z"
              fill="#334155"
              stroke="#94A3B8"
              strokeWidth="1.8"
            />
            <rect x="164" y="66" width="114" height="88" rx="14" fill="#0F172A" />
            <rect x="192" y="72" width="66" height="76" rx="8" fill="#475569" opacity="0.65" />
            {/* Side mirrors */}
            <rect x="172" y="47" width="14" height="7" rx="3" fill="#475569" />
            <rect x="172" y="166" width="14" height="7" rx="3" fill="#475569" />
            {/* Tail & brake lamps */}
            <rect x="316" y="64" width="6" height="18" rx="2" fill="#EF4444" />
            <rect x="316" y="138" width="6" height="18" rx="2" fill="#EF4444" />
            {/* Horn sound arcs */}
            <path d="M 146 102 A 10 10 0 0 0 146 118 M 138 96 A 16 16 0 0 0 138 124" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />

            <text x="16" y="24" fill="#FEF08A" fontSize="10" fontWeight="700">
              FORAN (Hvid / Gul)
            </text>
            <text x="424" y="24" textAnchor="end" fill="#FCA5A5" fontSize="10" fontWeight="700">
              BAGPÅ (Rød + Hvid nr.plade)
            </text>
            {hotspotCircle('positionslys', 132, 68, 'POS', '#94A3B8')}
            {hotspotCircle('naerlys', 96, 110, '30m', '#FACC15')}
            {hotspotCircle('fjernlys', 46, 110, '100m', '#3B82F6')}
            {hotspotCircle('horn', 180, 110, 'HORN', '#10B981')}
            {hotspotCircle('blinklys', 224, 54, '60-120', '#F59E0B')}
            {hotspotCircle('stoplys', 316, 78, 'STOP', '#EF4444')}
            {hotspotCircle('nummerplade', 348, 128, '20m', '#EC4899')}
          </g>
        );

      case 'instrumentpanel':
        return (
          <g>
            <rect x="0" y="0" width="440" height="220" fill="#09090B" />
            <path d="M 18 198 L 36 42 Q 220 8 404 42 L 422 198 Z" fill="#18181B" stroke="#3F3F46" strokeWidth="2.5" />
            {/* Analog-style Speedometer */}
            <circle cx="106" cy="116" r="56" fill="#09090B" stroke="#475569" strokeWidth="3" />
            <path d="M 64 142 A 50 50 0 1 1 148 142" fill="none" stroke="#38BDF8" strokeWidth="3" strokeDasharray="4 6" opacity="0.6" />
            <line x1="106" y1="116" x2="82" y2="82" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
            <circle cx="106" cy="116" r="6" fill="#CBD5E1" />
            <text x="106" y="142" textAnchor="middle" fill="#38BDF8" fontSize="10" fontWeight="800">
              50 · 80 · 130
            </text>
            <text x="106" y="156" textAnchor="middle" fill="#94A3B8" fontSize="8.5" fontWeight="700">
              km/t
            </text>

            {/* Analog-style Tachometer */}
            <circle cx="334" cy="116" r="56" fill="#09090B" stroke="#475569" strokeWidth="3" />
            <path d="M 294 140 A 48 48 0 0 1 322 72" fill="none" stroke="#22C55E" strokeWidth="5" opacity="0.7" />
            <line x1="334" y1="116" x2="310" y2="86" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
            <circle cx="334" cy="116" r="6" fill="#CBD5E1" />
            <text x="334" y="142" textAnchor="middle" fill="#4ADE80" fontSize="9.5" fontWeight="800">
              Øko ~2.000
            </text>
            <text x="334" y="156" textAnchor="middle" fill="#94A3B8" fontSize="8.5" fontWeight="700">
              o/min
            </text>

            {/* Center Warning Cluster */}
            <rect x="174" y="38" width="92" height="148" rx="14" fill="#09090B" stroke="#334155" strokeWidth="2" />
            <circle cx="220" cy="150" r="9" fill="#1D4ED8" opacity="0.35" stroke="#60A5FA" strokeWidth="1" />
            <text x="220" y="153" textAnchor="middle" fill="#93C5FD" fontSize="7" fontWeight="800">
              FJERN
            </text>
            {hotspotCircle('olie_lampe', 200, 72, 'OLIE', '#DC2626')}
            {hotspotCircle('bremse_lampe', 240, 72, '(!)', '#DC2626')}
            {hotspotCircle('temp_lampe', 200, 114, 'TEMP', '#EF4444')}
            {hotspotCircle('abs_lampe', 240, 114, 'ABS', '#F59E0B')}
            <text x="220" y="176" textAnchor="middle" fill="#FCA5A5" fontSize="8" fontWeight="800">
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
