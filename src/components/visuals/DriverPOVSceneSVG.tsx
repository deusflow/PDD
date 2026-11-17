import React from 'react';
import { DanishRoadSignSVG, PSkiveSVG } from './DanishRoadSignSVG';

interface DriverPOVSceneSVGProps {
  presetId: string;
  signCode?: string;
  subPlaque?: string;
  maneuverBadge?: string;
  className?: string;
}

const CockpitFrame: React.FC<{
  skyColor?: string;
  night?: boolean;
  children: React.ReactNode;
}> = ({ skyColor = '#BAE6FD', night = false, children }) => (
  <g>
    {/* Sky / background */}
    <rect x="0" y="0" width="460" height="250" fill={night ? '#09090B' : skyColor} />
    {children}
    {/* Dashboard & hood edge */}
    <path d="M 0 212 Q 230 194 460 212 L 460 250 L 0 250 Z" fill="#18181B" />
    {/* Steering wheel top arc */}
    <path
      d="M 88 250 A 62 62 0 0 1 198 250"
      fill="none"
      stroke="#3F3F46"
      strokeWidth="12"
      strokeLinecap="round"
    />
    {/* Windshield top A-pillars subtle */}
    <polygon points="0,0 24,0 0,165" fill="#18181B" opacity="0.22" />
    <polygon points="460,0 436,0 460,165" fill="#18181B" opacity="0.22" />
  </g>
);

const HorizonRoad: React.FC<{
  vanishX?: number;
  horizonY?: number;
  withCenterDash?: boolean;
  withSolidCenter?: boolean;
  withCykelsti?: 'solid' | 'dashed' | 'none';
}> = ({
  vanishX = 230,
  horizonY = 98,
  withCenterDash = true,
  withSolidCenter = false,
  withCykelsti = 'none',
}) => (
  <g>
    {/* Grass / ground */}
    <rect x="0" y={horizonY} width="460" height={250 - horizonY} fill="#D9F99D" opacity="0.35" />
    {/* Main asphalt */}
    <polygon points={`${vanishX - 42},${horizonY} ${vanishX + 42},${horizonY} 450,220 10,220`} fill="#3F3F46" />
    {/* Right sidewalk */}
    <polygon points={`${vanishX + 42},${horizonY} ${vanishX + 62},${horizonY} 460,220 420,220`} fill="#D4D4D8" />
    {/* Cykelsti */}
    {withCykelsti !== 'none' && (
      <g>
        <polygon
          points={`${vanishX + 26},${horizonY} ${vanishX + 42},${horizonY} 420,220 355,220`}
          fill="#0284C7"
          opacity="0.78"
        />
        <line
          x1={vanishX + 26}
          y1={horizonY}
          x2="355"
          y2="220"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeDasharray={withCykelsti === 'dashed' ? '10 8' : undefined}
        />
      </g>
    )}
    {/* Center line */}
    {withSolidCenter && (
      <line x1={vanishX} y1={horizonY} x2={vanishX} y2="215" stroke="#FFFFFF" strokeWidth="3" />
    )}
    {withCenterDash && !withSolidCenter && (
      <line
        x1={vanishX}
        y1={horizonY}
        x2={vanishX}
        y2="215"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeDasharray="10 10"
      />
    )}
  </g>
);

const FrontCar: React.FC<{
  x: number;
  y: number;
  scale?: number;
  color?: string;
  blinkLeft?: boolean;
  blinkRight?: boolean;
  brake?: boolean;
}> = ({ x, y, scale = 1, color = '#52525B', blinkLeft, blinkRight, brake }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <rect x="-32" y="-12" width="64" height="24" rx="5" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M -22 -12 L -14 -26 L 14 -26 L 22 -12 Z" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
    <rect x="-15" y="-23" width="30" height="10" rx="2" fill="#0F172A" />
    {/* Taillights */}
    <rect x="-30" y="-7" width="10" height="5" rx="1" fill={brake ? '#EF4444' : '#991B1B'} />
    <rect x="20" y="-7" width="10" height="5" rx="1" fill={brake ? '#EF4444' : '#991B1B'} />
    {blinkLeft && <circle cx="-28" cy="-1" r="4" fill="#F59E0B" />}
    {blinkRight && <circle cx="28" cy="-1" r="4" fill="#F59E0B" />}
    <circle cx="-22" cy="12" r="5" fill="#18181B" />
    <circle cx="22" cy="12" r="5" fill="#18181B" />
  </g>
);

const SideCar: React.FC<{
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  color?: string;
}> = ({ x, y, scale = 1, flip = false, color = '#E11D48' }) => (
  <g transform={`translate(${x}, ${y}) scale(${flip ? -scale : scale}, ${scale})`}>
    <rect x="-42" y="-14" width="84" height="24" rx="6" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M -24 -14 L -12 -28 L 18 -28 L 28 -14 Z" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
    <rect x="-13" y="-25" width="28" height="10" rx="2" fill="#0F172A" />
    <circle cx="-24" cy="11" r="7" fill="#18181B" stroke="#D4D4D8" strokeWidth="2" />
    <circle cx="24" cy="11" r="7" fill="#18181B" stroke="#D4D4D8" strokeWidth="2" />
    {/* Headlight */}
    <rect x="38" y="-9" width="5" height="6" rx="1" fill="#FEF08A" />
  </g>
);

const CyclistPOV: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <circle cx="0" cy="-28" r="6" fill="#FACC15" stroke="#18181B" strokeWidth="1.5" />
    <path d="M 0 -22 L 0 -8 M -8 -16 L 8 -16" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
    <ellipse cx="0" cy="4" rx="4" ry="12" fill="none" stroke="#18181B" strokeWidth="2.5" />
  </g>
);

const BadgePill: React.FC<{ x: number; y: number; text: string; tone?: 'dark' | 'warn' | 'teal' }> = ({
  x,
  y,
  text,
  tone = 'dark',
}) => {
  const bg = tone === 'warn' ? '#B45309' : tone === 'teal' ? '#0D9488' : '#09090B';
  const width = Math.max(120, text.length * 6.5 + 22);
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y="0" width={width} height="24" rx="12" fill={bg} opacity="0.92" />
      <text x={width / 2} y="15.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
        {text}
      </text>
    </g>
  );
};

export const DriverPOVSceneSVG: React.FC<DriverPOVSceneSVGProps> = ({
  presetId,
  signCode,
  subPlaque,
  maneuverBadge,
  className = '',
}) => {
  const renderContent = () => {
    switch (presetId) {
      case 'pov_spejl_skulder':
        return (
          <CockpitFrame>
            <HorizonRoad withCykelsti="solid" />
            {/* Rearview mirror */}
            <rect x="172" y="12" width="116" height="32" rx="8" fill="#0F172A" stroke="#71717A" strokeWidth="2.5" />
            <rect x="178" y="17" width="104" height="22" rx="4" fill="#334155" />
            <rect x="216" y="23" width="24" height="10" rx="2" fill="#94A3B8" />
            <BadgePill x={170} y={50} text="1. Bakspejl" />
            {/* Right mirror */}
            <rect x="348" y="96" width="90" height="44" rx="8" fill="#0F172A" stroke="#71717A" strokeWidth="2.5" />
            <rect x="354" y="102" width="78" height="32" rx="4" fill="#334155" />
            <BadgePill x={324} y={146} text="2. Sidespejl" />
            {/* Blind spot cyclist alert */}
            <CyclistPOV x={330} y={168} scale={0.9} />
            <BadgePill x={16} y={18} text="3. SKULDERKIG! (Слепая зона)" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_distance_2s':
        return (
          <CockpitFrame>
            <HorizonRoad />
            {/* Roadside pole */}
            <rect x="315" y="74" width="6" height="48" fill="#71717A" />
            <circle cx="318" cy="74" r="5" fill="#FACC15" />
            <FrontCar x={230} y={128} scale={0.78} brake />
            <BadgePill x={18} y={18} text="Ориентир → «1001, 1002» (2 сек)" tone="teal" />
            <BadgePill x={18} y={48} text="2× скорость = 4× тормозной путь!" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_hajtaender_b11':
        return (
          <CockpitFrame>
            <HorizonRoad withCenterDash={false} />
            {/* Crossroad */}
            <polygon points="90,118 370,118 415,148 45,148" fill="#52525B" />
            {/* Hajtænder across our lane */}
            {[150, 178, 206, 234, 262, 290].map((x) => (
              <polygon key={x} points={`${x},162 ${x + 18},162 ${x + 9},149`} fill="#FFFFFF" />
            ))}
            <SideCar x={145} y={122} scale={0.78} color="#E11D48" />
            <g transform="translate(362, 54) scale(0.58)">
              <DanishRoadSignSVG code="B11" size={110} />
            </g>
            <BadgePill x={16} y={18} text="Hajtænder + B11 = уступить ОБЕИМ сторонам" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_hojre_vigepligt':
        return (
          <CockpitFrame>
            <HorizonRoad />
            {/* Equal residential crossroad */}
            <polygon points="80,116 380,116 425,148 35,148" fill="#52525B" />
            {/* Car coming from RIGHT */}
            <SideCar x={335} y={122} scale={0.8} flip color="#16A34A" />
            <path d="M 290 128 L 235 128" stroke="#4ADE80" strokeWidth="4" strokeDasharray="6 4" />
            <BadgePill x={16} y={18} text="Нет знаков и hajtænder → Помеха справа!" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_overkoersel_sidewalk':
        return (
          <CockpitFrame>
            {/* Driveway exiting over sidewalk and cykelsti */}
            <rect x="0" y="96" width="460" height="130" fill="#52525B" />
            <rect x="0" y="96" width="460" height="36" fill="#3F3F46" />
            <rect x="0" y="132" width="460" height="18" fill="#0284C7" opacity="0.85" />
            <rect x="0" y="150" width="460" height="22" fill="#D4D4D8" />
            {/* Pedestrian and cyclist */}
            <CyclistPOV x={140} y={136} scale={0.85} />
            <SideCar x={340} y={108} scale={0.78} flip color="#EF4444" />
            <BadgePill x={16} y={18} text="Выезд через тротуар / с парковки = уступить ВСЕМ!" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_rundkoersel':
        return (
          <CockpitFrame>
            <HorizonRoad withCenterDash={false} />
            {/* Roundabout island */}
            <ellipse cx="230" cy="138" rx="95" ry="26" fill="#22C55E" stroke="#FFFFFF" strokeWidth="3" />
            {/* Hajtænder */}
            {[170, 198, 226, 254].map((x) => (
              <polygon key={x} points={`${x},182 ${x + 16},182 ${x + 8},170`} fill="#FFFFFF" />
            ))}
            <SideCar x={175} y={122} scale={0.75} color="#EF4444" />
            <CyclistPOV x={295} y={148} scale={0.8} />
            <g transform="translate(362, 42) scale(0.54)">
              <DanishRoadSignSVG code="D12" size={110} />
            </g>
            <BadgePill x={16} y={18} text="Въезд: уступи всем на кругу · Съезд: правый поворотник" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_fletning_vs_skift':
        return (
          <CockpitFrame>
            <HorizonRoad withCenterDash={false} />
            {/* Two lanes merging (no dashed line near top) */}
            <line x1="230" y1="158" x2="230" y2="215" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="10 10" />
            <FrontCar x={182} y={132} scale={0.76} color="#0284C7" blinkRight />
            <g transform="translate(358, 46) scale(0.54)">
              <DanishRoadSignSVG code="B15" size={110} />
            </g>
            <BadgePill x={16} y={18} text="Нет линии / B15 = «Молния» · Через пунктир = твоя вина" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_left_turn_kort':
        return (
          <CockpitFrame>
            <HorizonRoad />
            <polygon points="80,120 380,120 420,148 40,148" fill="#52525B" />
            {/* Oncoming car also turning left (pass right-side to right-side) */}
            <FrontCar x={200} y={120} scale={0.68} color="#16A34A" blinkLeft />
            <path d="M 275 180 Q 255 138 145 130" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="6 4" />
            <BadgePill x={16} y={18} text="Короткий левый поворот: разъезд правыми бортами" tone="teal" />
            <BadgePill x={16} y={48} text="Колёса держите прямо, пока ждёте!" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_right_turn_solid_cykelsti':
        return (
          <CockpitFrame>
            <HorizonRoad withCykelsti="solid" />
            <CyclistPOV x={315} y={158} scale={0.95} />
            <path d="M 255 190 Q 260 155 340 150" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="6 4" />
            <BadgePill x={16} y={18} text="Сплошная велодорожка: держись своей полосы" tone="teal" />
            <BadgePill x={16} y={48} text="Велосипедист прямо = АБСОЛЮТНЫЙ приоритет" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_right_turn_dashed_opmarch':
        return (
          <CockpitFrame>
            <HorizonRoad withCykelsti="dashed" />
            <CyclistPOV x={300} y={136} scale={0.78} />
            <path d="M 250 188 Q 320 185 375 170" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="6 4" />
            <BadgePill x={16} y={18} text="Прерывистая (Opmarchbås): прижмись к бордюру!" tone="teal" />
            <BadgePill x={16} y={48} text="Сначала пропусти велосипедистов + skulderkig" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_bus_byzone':
        return (
          <CockpitFrame>
            <HorizonRoad />
            {/* Yellow Danish City Bus */}
            <rect x="260" y="102" width="84" height="58" rx="8" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
            <rect x="268" y="110" width="68" height="22" rx="3" fill="#1E293B" />
            <circle cx="264" cy="148" r="5.5" fill="#EA580C" />
            <text x="302" y="150" textAnchor="middle" fill="#18181B" fontSize="11" fontWeight="800">
              BUS
            </text>
            <g transform="translate(366, 48) scale(0.52)">
              <DanishRoadSignSVG code="E55" size={110} />
            </g>
            <BadgePill x={16} y={18} text="В городе (Byzone): УСТУПИ автобусу с остановки!" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_zebra_trap':
        return (
          <CockpitFrame>
            <HorizonRoad />
            {/* Zebra crossing */}
            {[160, 190, 220, 250, 280].map((x) => (
              <rect key={x} x={x} y="156" width="18" height="20" rx="2" fill="#FFFFFF" />
            ))}
            <FrontCar x={180} y={145} scale={0.85} color="#71717A" brake />
            {/* Pedestrian emerging */}
            <circle cx="242" cy="140" r="6" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="242" y1="146" x2="242" y2="164" stroke="#F97316" strokeWidth="4" />
            <g transform="translate(366, 44) scale(0.54)">
              <DanishRoadSignSVG code="E17" size={110} />
            </g>
            <BadgePill x={16} y={18} text="Соседняя машина тормозит — ОБГОН ЗАПРЕЩЁН!" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_spaerrelinje_spaerreflade':
        return (
          <CockpitFrame>
            <HorizonRoad withSolidCenter />
            {/* Spærreflade hatched island */}
            <polygon points="222,126 238,126 270,210 190,210" fill="#52525B" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="216" y1="146" x2="244" y2="146" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="208" y1="166" x2="252" y2="166" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="200" y1="188" x2="260" y2="188" stroke="#FFFFFF" strokeWidth="2.5" />
            <BadgePill x={16} y={18} text="Spærrelinje / Spærreflade = НЕ НАЕЗЖАТЬ КОЛЕСОМ!" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_undertavler':
        return (
          <CockpitFrame>
            <HorizonRoad />
            <g transform="translate(115, 24) scale(0.75)">
              <DanishRoadSignSVG code="E33" subPlaque="1 time 8-18 (8-14)" size={110} />
            </g>
            <g transform="translate(245, 24) scale(0.75)">
              <DanishRoadSignSVG code="A99" subPlaque="↑ 1,2 km ↑" size={110} />
            </g>
            <BadgePill x={16} y={168} text="Без стрелок = расстояние ДО · Со стрелками = длина зоны" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_speed_limits':
        return (
          <CockpitFrame>
            <HorizonRoad />
            <g transform="translate(65, 32) scale(0.7)">
              <DanishRoadSignSVG code="E55" size={110} />
            </g>
            <g transform="translate(182, 32) scale(0.7)">
              <DanishRoadSignSVG code="E43" size={110} />
            </g>
            <g transform="translate(298, 32) scale(0.7)">
              <DanishRoadSignSVG code="E42" size={110} />
            </g>
            <BadgePill x={56} y={122} text="50 км/ч" />
            <BadgePill x={166} y={122} text="80 км/ч (синий!)" tone="warn" />
            <BadgePill x={286} y={122} text="130 км/ч" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_trailer_weight':
        return (
          <g>
            <rect x="0" y="0" width="460" height="250" fill="#18181B" />
            <rect x="20" y="20" width="420" height="210" rx="16" fill="#27272A" stroke="#3F3F46" strokeWidth="2" />
            <text x="230" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="800">
              Registreringsattest · Категория B (макс. 3.500 kg)
            </text>
            <rect x="38" y="72" width="178" height="84" rx="12" fill="#0F172A" stroke="#0D9488" strokeWidth="2" />
            <text x="127" y="98" textAnchor="middle" fill="#5EEAD4" fontSize="12" fontWeight="700">
              Bil (Totalvægt)
            </text>
            <text x="127" y="126" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="800">
              напр. 2.100 kg
            </text>
            <text x="230" y="122" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="800">
              +
            </text>
            <rect x="244" y="72" width="178" height="84" rx="12" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
            <text x="333" y="98" textAnchor="middle" fill="#FDE68A" fontSize="12" fontWeight="700">
              Påhængsvogn (Totalvægt)
            </text>
            <text x="333" y="126" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="800">
              ≤ 1.400 kg (≤ 3.500)
            </text>
            <text x="230" y="186" textAnchor="middle" fill="#CBD5E1" fontSize="11.5" fontWeight="600">
              Исключение: лёгкий прицеп до 750 kg можно к авто 3.500 kg (итого до 4.250 kg)
            </text>
            <text x="230" y="208" textAnchor="middle" fill="#FCA5A5" fontSize="11" fontWeight="600">
              Всегда проверяйте max påhængsvægt в техпаспорте авто!
            </text>
          </g>
        );

      case 'pov_motorvej_merge':
        return (
          <CockpitFrame>
            <HorizonRoad withCenterDash />
            {/* Emergency nødspor on right */}
            <polygon points="272,98 292,98 440,220 370,220" fill="#52525B" />
            <line x1="272" y1="98" x2="370" y2="220" stroke="#FFFFFF" strokeWidth="3" />
            <FrontCar x={205} y={134} scale={0.75} color="#71717A" />
            <g transform="translate(364, 42) scale(0.54)">
              <DanishRoadSignSVG code="E42" size={110} />
            </g>
            <BadgePill x={16} y={18} text="Разгон в темпе потока (Fletning) · Nødspor = только авария!" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_parking_meters':
        return (
          <CockpitFrame>
            <HorizonRoad />
            <g transform="translate(72, 26) scale(0.66)">
              <DanishRoadSignSVG code="C61" size={110} />
            </g>
            <g transform="translate(182, 26) scale(0.66)">
              <DanishRoadSignSVG code="C62" size={110} />
            </g>
            <g transform="translate(298, 26) scale(0.68)">
              <PSkiveSVG size={110} />
            </g>
            <BadgePill x={34} y={120} text="5м переход · 10м перекрёсток · 12м автобус · 30м ж/д" tone="warn" />
            <BadgePill x={84} y={152} text="P-skive: округляй вперёд на 15 мин" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_night_fog_lights':
        return (
          <CockpitFrame night>
            <HorizonRoad />
            {/* Oncoming beams */}
            <circle cx="215" cy="112" r="5" fill="#FEF08A" />
            <circle cx="229" cy="112" r="5" fill="#FEF08A" />
            {/* Our dipped beam */}
            <polygon points="180,210 280,210 250,126 210,126" fill="#FEF08A" opacity="0.22" />
            <BadgePill x={16} y={18} text="Ночью kørelys мало! Ближний: 200–300 м / 100–150 м" tone="teal" />
            <BadgePill x={16} y={48} text="Tågebaglygte — ТОЛЬКО сильный туман / ливень" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_alcohol_klip_law':
        return (
          <g>
            <rect x="0" y="0" width="460" height="250" fill="#18181B" />
            <rect x="20" y="24" width="132" height="202" rx="14" fill="#27272A" stroke="#EF4444" strokeWidth="2" />
            <text x="86" y="72" textAnchor="middle" fill="#EF4444" fontSize="26" fontWeight="800">
              0,50‰
            </text>
            <text x="86" y="102" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
              Алкоголь
            </text>
            <text x="86" y="128" textAnchor="middle" fill="#A1A1AA" fontSize="10">
              ≥ 0,51‰ = лишение
            </text>
            <text x="86" y="148" textAnchor="middle" fill="#FCA5A5" fontSize="10">
              &gt; 2,00‰ = конфискация
            </text>

            <rect x="164" y="24" width="132" height="202" rx="14" fill="#27272A" stroke="#F59E0B" strokeWidth="2" />
            <text x="230" y="72" textAnchor="middle" fill="#F59E0B" fontSize="24" fontWeight="800">
              2 KLIP
            </text>
            <text x="230" y="102" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
              Новичок (0–3 года)
            </text>
            <text x="230" y="128" textAnchor="middle" fill="#FDE68A" fontSize="10">
              = Kørselsforbud!
            </text>
            <text x="230" y="148" textAnchor="middle" fill="#A1A1AA" fontSize="10">
              Опытный: 3 klip / 3 года
            </text>

            <rect x="308" y="24" width="132" height="202" rx="14" fill="#27272A" stroke="#0D9488" strokeWidth="2" />
            <text x="374" y="72" textAnchor="middle" fill="#5EEAD4" fontSize="24" fontWeight="800">
              112/114
            </text>
            <text x="374" y="102" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
              ДТП (Uheld)
            </text>
            <text x="374" y="128" textAnchor="middle" fill="#CBD5E1" fontSize="10">
              Треугольник: 50 / 100 м
            </text>
            <text x="374" y="148" textAnchor="middle" fill="#CBD5E1" fontSize="10">
              112 (травмы) · 114 (ДТП)
            </text>
          </g>
        );

      case 'pov_school_roadmap':
      default:
        return (
          <g>
            <rect x="0" y="0" width="460" height="250" fill="#18181B" />
            <text x="230" y="40" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="800">
              Обязательный путь в датской автошколе (Lovpakke B)
            </text>
            {[
              { x: 24, n: '1', t: '29 ч теории', s: 'Правила + тесты' },
              { x: 130, n: '2', t: '4 ч Manøvre', s: 'Закрытая площадка' },
              { x: 236, n: '3', t: '16 ч город', s: '+ mørkekørsel' },
              { x: 342, n: '4', t: '4 ч Glatbane', s: 'Лёд и заносы' },
            ].map((item) => (
              <g key={item.n} transform={`translate(${item.x}, 68)`}>
                <rect x="0" y="0" width="94" height="92" rx="12" fill="#27272A" stroke="#0D9488" strokeWidth="1.8" />
                <circle cx="47" cy="24" r="12" fill="#0D9488" />
                <text x="47" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="800">
                  {item.n}
                </text>
                <text x="47" y="56" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="700">
                  {item.t}
                </text>
                <text x="47" y="74" textAnchor="middle" fill="#A1A1AA" fontSize="9">
                  {item.s}
                </text>
              </g>
            ))}
            <rect x="24" y="178" width="412" height="46" rx="12" fill="#0F172A" stroke="#3F3F46" strokeWidth="1.5" />
            <text x="230" y="198" textAnchor="middle" fill="#5EEAD4" fontSize="11.5" fontWeight="700">
              Документы: Lægeattest (медсправка) + Førstehjælp (8 ч) + Tolk (при надобности)
            </text>
            <text x="230" y="214" textAnchor="middle" fill="#CBD5E1" fontSize="10.5">
              Финал: Teoriprøve (≥20/25) → Kontrolprøve + Praktisk køreprøve
            </text>
          </g>
        );
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 ${className}`}>
      <svg viewBox="0 0 460 250" className="h-auto w-full select-none" role="img" aria-label={presetId}>
        {renderContent()}
      </svg>

      {maneuverBadge && (
        <div className="border-t border-zinc-200/80 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          {maneuverBadge}
        </div>
      )}

      {signCode &&
        presetId !== 'pov_hajtaender_b11' &&
        presetId !== 'pov_rundkoersel' &&
        presetId !== 'pov_fletning_vs_skift' &&
        presetId !== 'pov_bus_byzone' &&
        presetId !== 'pov_zebra_trap' &&
        presetId !== 'pov_undertavler' &&
        presetId !== 'pov_speed_limits' &&
        presetId !== 'pov_motorvej_merge' &&
        presetId !== 'pov_parking_meters' && (
          <div className="absolute right-3 top-3 rounded-lg bg-white/90 p-1 shadow-sm backdrop-blur dark:bg-zinc-900/90">
            <DanishRoadSignSVG code={signCode} subPlaque={subPlaque} size={48} />
          </div>
        )}
    </div>
  );
};
