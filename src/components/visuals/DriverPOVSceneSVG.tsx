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
}> = ({ skyColor, night = false, children }) => (
  <g>
    <defs>
      <linearGradient id="povSkyDay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={skyColor ?? '#7DD3FC'} />
        <stop offset="65%" stopColor="#BAE6FD" />
        <stop offset="100%" stopColor="#F0F9FF" />
      </linearGradient>
      <linearGradient id="povSkyNight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#09090B" />
        <stop offset="70%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <linearGradient id="povDashGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#27272A" />
        <stop offset="100%" stopColor="#09090B" />
      </linearGradient>
      <linearGradient id="povGrassGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A7F3D0" />
        <stop offset="100%" stopColor="#6EE7B7" />
      </linearGradient>
      <linearGradient id="povAsphaltGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#52525B" />
        <stop offset="100%" stopColor="#3F3F46" />
      </linearGradient>
    </defs>

    {/* Sky / background */}
    <rect x="0" y="0" width="460" height="250" fill={night ? 'url(#povSkyNight)' : 'url(#povSkyDay)'} />

    {/* Soft clouds & sun/moon */}
    {!night ? (
      <g opacity="0.85">
        <circle cx="388" cy="34" r="14" fill="#FEF9C3" opacity="0.9" />
        <g fill="#FFFFFF" opacity="0.72">
          <ellipse cx="95" cy="32" rx="28" ry="10" />
          <ellipse cx="114" cy="28" rx="18" ry="9" />
          <ellipse cx="285" cy="40" rx="24" ry="8" />
          <ellipse cx="302" cy="37" rx="16" ry="7" />
        </g>
        {/* Distant Nordic horizon treeline & cozy gable silhouettes */}
        <path
          d="M 0 98 Q 38 82 78 96 T 158 94 T 242 98 L 460 98 L 460 104 L 0 104 Z"
          fill="#86EFAC"
          opacity="0.55"
        />
        <g opacity="0.68">
          <rect x="34" y="80" width="22" height="18" fill="#E11D48" opacity="0.45" />
          <polygon points="32,80 45,70 58,80" fill="#9F1239" opacity="0.55" />
          <circle cx="74" cy="87" r="11" fill="#22C55E" opacity="0.65" />
          <circle cx="394" cy="85" r="12" fill="#22C55E" opacity="0.6" />
          <rect x="412" y="79" width="24" height="19" fill="#F59E0B" opacity="0.4" />
          <polygon points="410,79 424,69 438,79" fill="#B45309" opacity="0.5" />
        </g>
      </g>
    ) : (
      <g opacity="0.75">
        <circle cx="392" cy="32" r="10" fill="#E2E8F0" opacity="0.75" />
        <circle cx="72" cy="26" r="1.2" fill="#FFFFFF" />
        <circle cx="148" cy="18" r="1" fill="#FFFFFF" />
        <circle cx="312" cy="24" r="1.3" fill="#FFFFFF" />
      </g>
    )}

    {children}

    {/* Subtle car hood reflection & dashboard */}
    <path d="M 0 212 Q 230 192 460 212 L 460 250 L 0 250 Z" fill="url(#povDashGrad)" />
    <path d="M 0 212 Q 230 192 460 212" fill="none" stroke="#52525B" strokeWidth="1.5" opacity="0.7" />
    {/* Subtle digital cluster glow */}
    <ellipse cx="143" cy="233" rx="28" ry="12" fill="#0F172A" stroke="#14B8A6" strokeWidth="1.2" opacity="0.85" />
    {/* Steering wheel top arc with grip highlight */}
    <path
      d="M 88 250 A 62 62 0 0 1 198 250"
      fill="none"
      stroke="#3F3F46"
      strokeWidth="12"
      strokeLinecap="round"
    />
    <path
      d="M 96 244 A 56 56 0 0 1 190 244"
      fill="none"
      stroke="#71717A"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.55"
    />
    {/* Windshield top A-pillars */}
    <polygon points="0,0 22,0 0,170" fill="#18181B" opacity="0.24" />
    <polygon points="460,0 438,0 460,170" fill="#18181B" opacity="0.24" />
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
    <rect x="0" y={horizonY} width="460" height={250 - horizonY} fill="url(#povGrassGrad)" opacity="0.58" />
    {/* Main asphalt */}
    <polygon points={`${vanishX - 42},${horizonY} ${vanishX + 42},${horizonY} 450,220 10,220`} fill="url(#povAsphaltGrad)" />
    {/* Left & right crisp road edge lines */}
    <line x1={vanishX - 40} y1={horizonY} x2="18" y2="220" stroke="#E4E4E7" strokeWidth="1.8" opacity="0.7" />
    {/* Right sidewalk */}
    <polygon points={`${vanishX + 42},${horizonY} ${vanishX + 66},${horizonY} 460,220 420,220`} fill="#E4E4E7" />
    <line x1={vanishX + 42} y1={horizonY} x2="420" y2="220" stroke="#A1A1AA" strokeWidth="2" />
    {/* Cykelsti */}
    {withCykelsti !== 'none' && (
      <g>
        <polygon
          points={`${vanishX + 26},${horizonY} ${vanishX + 42},${horizonY} 420,220 355,220`}
          fill="#0284C7"
          opacity="0.82"
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
}> = ({ x, y, scale = 1, color = '#475569', blinkLeft, blinkRight, brake }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <ellipse cx="0" cy="14" rx="34" ry="6" fill="#09090B" opacity="0.32" />
    <rect x="-32" y="-12" width="64" height="24" rx="6" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M -22 -12 L -14 -26 L 14 -26 L 22 -12 Z" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
    <rect x="-15" y="-23" width="30" height="10" rx="2.5" fill="#0F172A" />
    <line x1="-11" y1="-21" x2="2" y2="-15" stroke="#38BDF8" strokeWidth="1.2" opacity="0.45" />
    <rect x="-10" y="3" width="20" height="5" rx="1" fill="#F8FAFC" />
    {/* Taillights */}
    <rect x="-30" y="-7" width="10" height="5" rx="1.5" fill={brake ? '#EF4444' : '#991B1B'} />
    <rect x="20" y="-7" width="10" height="5" rx="1.5" fill={brake ? '#EF4444' : '#991B1B'} />
    {blinkLeft && <circle cx="-28" cy="-1" r="4" fill="#F59E0B" />}
    {blinkRight && <circle cx="28" cy="-1" r="4" fill="#F59E0B" />}
    <circle cx="-22" cy="12" r="5.5" fill="#18181B" />
    <circle cx="22" cy="12" r="5.5" fill="#18181B" />
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
    <ellipse cx="0" cy="15" rx="44" ry="6" fill="#09090B" opacity="0.28" />
    <rect x="-42" y="-14" width="84" height="24" rx="7" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M -24 -14 L -12 -28 L 18 -28 L 28 -14 Z" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
    <rect x="-13" y="-25" width="28" height="10" rx="2.5" fill="#0F172A" />
    <circle cx="-24" cy="11" r="7.5" fill="#18181B" stroke="#E4E4E7" strokeWidth="2" />
    <circle cx="24" cy="11" r="7.5" fill="#18181B" stroke="#E4E4E7" strokeWidth="2" />
    {/* Headlight */}
    <rect x="38" y="-9" width="5" height="6" rx="1.5" fill="#FEF08A" />
  </g>
);

const CyclistPOV: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <ellipse cx="0" cy="16" rx="11" ry="3.5" fill="#09090B" opacity="0.28" />
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
  const bg = tone === 'warn' ? '#B45309' : tone === 'teal' ? '#0F766E' : '#18181B';
  const width = Math.max(120, text.length * 6.5 + 24);
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x="0"
        y="0"
        width={width}
        height="24"
        rx="12"
        fill={bg}
        fillOpacity="0.9"
        stroke="#FFFFFF"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
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
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            {/* Side illustration of car + trailer pulling down scenic road */}
            <rect x="34" y="138" width="392" height="58" rx="14" fill="#0F172A" fillOpacity="0.88" stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="1.5" />
            {/* Mini car + trailer side silhouette */}
            <g transform="translate(88, 166)">
              {/* Trailer */}
              <rect x="-42" y="-16" width="38" height="20" rx="4" fill="#94A3B8" stroke="#FFFFFF" strokeWidth="1.4" />
              <circle cx="-23" cy="6" r="5.5" fill="#18181B" stroke="#E2E8F0" strokeWidth="1.5" />
              {/* Hitch */}
              <line x1="-4" y1="0" x2="10" y2="0" stroke="#E2E8F0" strokeWidth="2.5" />
              {/* Car */}
              <rect x="10" y="-12" width="54" height="16" rx="5" fill="#0D9488" stroke="#FFFFFF" strokeWidth="1.4" />
              <path d="M 18 -12 L 26 -22 L 46 -22 L 54 -12 Z" fill="#0D9488" stroke="#FFFFFF" strokeWidth="1.4" />
              <circle cx="22" cy="6" r="5.5" fill="#18181B" stroke="#E2E8F0" strokeWidth="1.5" />
              <circle cx="52" cy="6" r="5.5" fill="#18181B" stroke="#E2E8F0" strokeWidth="1.5" />
            </g>
            <text x="292" y="160" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="800">
              Bil + Påhængsvogn ≤ 3.500 kg
            </text>
            <text x="292" y="178" textAnchor="middle" fill="#5EEAD4" fontSize="9.8" fontWeight="600">
              Лёгкий прицеп ≤ 750 kg → итого до 4.250 kg
            </text>
            <BadgePill x={16} y={18} text="Сверяйте max påhængsvægt в Registreringsattest!" tone="teal" />
            <BadgePill x={16} y={48} text="Категория B: общий потолок по техпаспорту" tone="dark" />
          </CockpitFrame>
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
          <CockpitFrame night>
            <HorizonRoad withCenterDash />
            <g transform="translate(22, 26)">
              <rect x="0" y="0" width="130" height="162" rx="14" fill="#0F172A" fillOpacity="0.9" stroke="#EF4444" strokeWidth="1.8" />
              <circle cx="65" cy="36" r="18" fill="#7F1D1D" stroke="#EF4444" strokeWidth="2" />
              <text x="65" y="41" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="800">
                0,50‰
              </text>
              <text x="65" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                Алкоголь
              </text>
              <text x="65" y="102" textAnchor="middle" fill="#CBD5E1" fontSize="9.8">
                ≥ 0,51‰ = лишение
              </text>
              <text x="65" y="122" textAnchor="middle" fill="#FCA5A5" fontSize="9.5">
                &gt; 2,00‰ = конфискация
              </text>
            </g>

            <g transform="translate(165, 26)">
              <rect x="0" y="0" width="130" height="162" rx="14" fill="#0F172A" fillOpacity="0.9" stroke="#F59E0B" strokeWidth="1.8" />
              <rect x="33" y="20" width="64" height="30" rx="8" fill="#78350F" stroke="#F59E0B" strokeWidth="2" />
              <text x="65" y="40" textAnchor="middle" fill="#FDE68A" fontSize="12" fontWeight="800">
                2 KLIP
              </text>
              <text x="65" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                Новичок (0–3 г.)
              </text>
              <text x="65" y="102" textAnchor="middle" fill="#FDE68A" fontSize="9.8">
                = Kørselsforbud!
              </text>
              <text x="65" y="122" textAnchor="middle" fill="#CBD5E1" fontSize="9.5">
                Опытный: 3 klip / 3 г.
              </text>
            </g>

            <g transform="translate(308, 26)">
              <rect x="0" y="0" width="130" height="162" rx="14" fill="#0F172A" fillOpacity="0.9" stroke="#14B8A6" strokeWidth="1.8" />
              <polygon points="65,18 45,52 85,52" fill="#0F172A" stroke="#EF4444" strokeWidth="3.5" strokeLinejoin="round" />
              <text x="65" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                ДТП: 112 / 114
              </text>
              <text x="65" y="102" textAnchor="middle" fill="#5EEAD4" fontSize="9.8">
                Треугольник: 50 / 100 м
              </text>
              <text x="65" y="122" textAnchor="middle" fill="#CBD5E1" fontSize="9.5">
                112 травмы · 114 полиция
              </text>
            </g>
          </CockpitFrame>
        );

      case 'pov_t_kryds':
        return (
          <CockpitFrame skyColor="#E0F2FE">
            <rect x="0" y="96" width="460" height="154" fill="#D9F99D" opacity="0.35" />
            {/* Straight road continuing ahead + side road from RIGHT (T-intersection, no signs) */}
            <polygon points="160,96 290,96 420,220 40,220" fill="#3F3F46" />
            <rect x="290" y="130" width="170" height="62" fill="#52525B" />
            <line x1="225" y1="96" x2="225" y2="215" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="10 10" />
            {/* Side car coming from RIGHT leg of T */}
            <SideCar x={335} y={154} scale={0.78} flip color="#0284C7" />
            <path d="M 300 156 L 265 156" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
            <BadgePill x={14} y={14} text="T-kryds БЕЗ знаков: помеха СПРАВА!" tone="warn" />
            <BadgePill x={14} y={44} text="Едешь прямо — ВСЁ РАВНО уступи справа" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_knallert_cykelgade':
        return (
          <CockpitFrame skyColor="#E0F2FE">
            <HorizonRoad withCenterDash withCykelsti="dashed" />
            {/* Knallert 30 on cykelsti vs Knallert 45 in main car lane */}
            <CyclistPOV x={360} y={176} scale={0.95} />
            <g transform="translate(265, 164)">
              <rect x="-12" y="-20" width="24" height="32" rx="6" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="0" cy="-26" r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
              <rect x="-9" y="10" width="18" height="7" rx="1.5" fill="#FACC15" />
              <text x="0" y="16" textAnchor="middle" fill="#18181B" fontSize="6" fontWeight="900">
                45
              </text>
            </g>
            <BadgePill x={14} y={14} text="Knallert 30 → на cykelsti (как вело)" tone="teal" />
            <BadgePill x={14} y={44} text="Knallert 45 (номер) → ТОЛЬКО на дороге!" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_vejarbejde_yellow':
        return (
          <CockpitFrame skyColor="#FEF3C7">
            <HorizonRoad withCenterDash={false} />
            {/* Old white dashed lines (overridden) + bold YELLOW temporary lines */}
            <line x1="230" y1="98" x2="230" y2="215" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="8 8" opacity="0.45" />
            <line x1="175" y1="98" x2="120" y2="218" stroke="#FACC15" strokeWidth="4.5" />
            <line x1="258" y1="98" x2="292" y2="218" stroke="#FACC15" strokeWidth="4.5" />
            {/* Orange cones */}
            {[115, 145, 175].map((y, idx) => (
              <polygon
                key={idx}
                points={`${275 + idx * 24},${y} ${269 + idx * 24},${y + 16} ${281 + idx * 24},${y + 16}`}
                fill="#F97316"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            ))}
            <BadgePill x={14} y={14} text="Vejarbejde: ЖЁЛТАЯ разметка важнее белой!" tone="warn" />
            <BadgePill x={14} y={44} text="Временные знаки всегда приоритетнее" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_motortrafikvej':
        return (
          <CockpitFrame skyColor="#DBEAFE">
            <HorizonRoad withSolidCenter />
            <FrontCar x={265} y={154} scale={0.75} color="#0284C7" />
            <SideCar x={170} y={144} scale={0.62} color="#DC2626" />
            <g transform="translate(362, 74)">
              <DanishRoadSignSVG code="E43" size={52} />
            </g>
            <BadgePill x={14} y={14} text="Motortrafikvej (E43): 80 км/ч (НЕ 130!)" tone="warn" />
            <BadgePill x={14} y={44} text="Может быть встречка без отбойника · Нет тракторов/вело" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_overtake_bans':
        return (
          <CockpitFrame skyColor="#E0F2FE">
            {/* Hill crest curve ahead */}
            <rect x="0" y="96" width="460" height="154" fill="#D9F99D" opacity="0.35" />
            <path d="M 80 220 Q 170 118 250 116 L 310 116 Q 350 140 420 220 Z" fill="#3F3F46" />
            <line x1="210" y1="218" x2="275" y2="118" stroke="#FFFFFF" strokeWidth="3.5" />
            <FrontCar x={248} y={156} scale={0.85} color="#475569" />
            {/* Rear car overtaking indicator in left side mirror */}
            <rect x="16" y="120" width="76" height="44" rx="8" fill="#0F172A" stroke="#F59E0B" strokeWidth="2.5" />
            <circle cx="52" cy="142" r="8" fill="#EF4444" />
            <circle cx="38" cy="142" r="3" fill="#F59E0B" />
            <BadgePill x={14} y={14} text="НЕЛЬЗЯ обгонять: горка, закрытый поворот, переезд" tone="warn" />
            <BadgePill x={14} y={44} text="И если сзади УЖЕ начали обгонять тебя!" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_fatigue_medicine_syn':
        return (
          <CockpitFrame night>
            <HorizonRoad withCenterDash />
            {/* Medicine red triangle warning + Syn card (frosted over night road) */}
            <g transform="translate(26, 32)">
              <rect x="0" y="0" width="194" height="152" rx="14" fill="#0F172A" fillOpacity="0.9" stroke="#EF4444" strokeWidth="1.8" />
              <polygon points="97,22 65,78 129,78" fill="#FFFFFF" stroke="#EF4444" strokeWidth="5" strokeLinejoin="round" />
              <text x="97" y="68" textAnchor="middle" fill="#EF4444" fontSize="24" fontWeight="900">
                !
              </text>
              <text x="97" y="108" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="700">
                Лекарства / Усталость
              </text>
              <text x="97" y="128" textAnchor="middle" fill="#FCA5A5" fontSize="9.5">
                Приравнено к § 54 (как алкоголь!)
              </text>
            </g>
            <g transform="translate(240, 32)">
              <rect x="0" y="0" width="194" height="152" rx="14" fill="#0F172A" fillOpacity="0.9" stroke="#14B8A6" strokeWidth="1.8" />
              <circle cx="97" cy="30" r="14" fill="#134E4A" stroke="#5EEAD4" strokeWidth="1.6" />
              <text x="97" y="34" textAnchor="middle" fill="#5EEAD4" fontSize="10" fontWeight="800">
                SYN
              </text>
              <text x="97" y="64" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="700">
                Страховка + Техосмотр
              </text>
              <text x="97" y="86" textAnchor="middle" fill="#5EEAD4" fontSize="9.8" fontWeight="600">
                Ansvarsforsikring = ОБЯЗАТЕЛЬНА
              </text>
              <text x="97" y="108" textAnchor="middle" fill="#CBD5E1" fontSize="9.8">
                1-й Syn: 4 года · Далее: каждые 2 г.
              </text>
              <text x="97" y="128" textAnchor="middle" fill="#FDE68A" fontSize="9.5">
                Новичок 3 года: лишение за 2 klip!
              </text>
            </g>
          </CockpitFrame>
        );

      case 'pov_glass_wiper_exhaust':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            {/* Windshield wiper sweeps + washer spray droplets */}
            <path d="M 110 206 Q 165 130 228 150" fill="none" stroke="#18181B" strokeWidth="4" strokeLinecap="round" />
            <path d="M 275 206 Q 332 130 392 150" fill="none" stroke="#18181B" strokeWidth="4" strokeLinecap="round" />
            <g fill="#38BDF8" opacity="0.85">
              <circle cx="170" cy="145" r="2.8" />
              <circle cx="182" cy="132" r="2.2" />
              <circle cx="195" cy="142" r="2.5" />
              <circle cx="338" cy="144" r="2.8" />
              <circle cx="352" cy="133" r="2.2" />
              <circle cx="364" cy="145" r="2.5" />
            </g>
            <BadgePill x={14} y={16} text="Стекло + щётки + омыватель (Sprinklervæske)" tone="teal" />
            <BadgePill x={14} y={46} text="Зона обзора без сколов · Выхлоп без дыма и шума" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_stopping_math':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            <FrontCar x={230} y={122} scale={0.76} color="#475569" brake />
            {/* Braking distance bar */}
            <rect x="28" y="138" width="404" height="58" rx="14" fill="#0F172A" fillOpacity="0.9" stroke="#F59E0B" strokeOpacity="0.55" strokeWidth="1.5" />
            <rect x="46" y="152" width="110" height="12" rx="6" fill="#38BDF8" />
            <text x="166" y="162" fill="#E0F2FE" fontSize="10" fontWeight="700">
              Реакция (~1 сек): 2× скорость → 2× м
            </text>
            <rect x="46" y="172" width="215" height="12" rx="6" fill="#F59E0B" />
            <text x="270" y="182" fill="#FDE68A" fontSize="10" fontWeight="700">
              Торможение: 2× скорость → 4× м!
            </text>
            <BadgePill x={14} y={16} text="40 → 80 км/ч: тормозной путь растёт в 4 РАЗА!" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_udrykning_letbane':
        return (
          <CockpitFrame skyColor="#DBEAFE">
            <HorizonRoad withCykelsti="solid" />
            {/* Letbane rail tracks on left */}
            <line x1="158" y1="98" x2="72" y2="218" stroke="#94A3B8" strokeWidth="2.5" />
            <line x1="172" y1="98" x2="108" y2="218" stroke="#94A3B8" strokeWidth="2.5" />
            {/* Approaching Letbane tram */}
            <g transform="translate(152, 118) scale(0.75)">
              <rect x="-24" y="-26" width="48" height="44" rx="8" fill="#0D9488" stroke="#FFFFFF" strokeWidth="1.8" />
              <rect x="-18" y="-18" width="36" height="18" rx="3" fill="#0F172A" />
              <circle cx="-12" cy="10" r="3.5" fill="#FEF08A" />
              <circle cx="12" cy="10" r="3.5" fill="#FEF08A" />
            </g>
            {/* Rearview mirror showing flashing blue ambulance */}
            <rect x="172" y="12" width="116" height="34" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="2.5" />
            <rect x="178" y="17" width="104" height="24" rx="4" fill="#1E293B" />
            <circle cx="212" cy="27" r="4.5" fill="#3B82F6" />
            <circle cx="248" cy="27" r="4.5" fill="#3B82F6" />
            <rect x="218" y="25" width="24" height="10" rx="2" fill="#F8FAFC" />
            {/* Pull-right green arrow */}
            <path d="M 248 188 Q 292 178 334 186" fill="none" stroke="#4ADE80" strokeWidth="4" strokeDasharray="6 4" />
            <BadgePill x={14} y={54} text="Синий маячок сзади → сразу прими вправо!" tone="warn" />
            <BadgePill x={14} y={84} text="Рельсы Letbane всегда свободны · Не сигналь лошадям" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_sign_shapes_abcde':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            <g transform="translate(40, 26) scale(0.56)">
              <DanishRoadSignSVG code="A20" size={110} />
            </g>
            <g transform="translate(142, 26) scale(0.56)">
              <DanishRoadSignSVG code="C51" size={110} />
            </g>
            <g transform="translate(244, 26) scale(0.56)">
              <DanishRoadSignSVG code="D15" size={110} />
            </g>
            <g transform="translate(346, 26) scale(0.56)">
              <DanishRoadSignSVG code="E55" size={110} />
            </g>
            <BadgePill x={24} y={102} text="A Опасность" tone="warn" />
            <BadgePill x={142} y={102} text="C Запрет" tone="dark" />
            <BadgePill x={242} y={102} text="D Приказ" tone="teal" />
            <BadgePill x={346} y={102} text="E Зона" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_parking_night_tomgang':
        return (
          <CockpitFrame night>
            <HorizonRoad withCenterDash />
            {/* Parked car on dark shoulder with glowing positionslys */}
            <FrontCar x={315} y={150} scale={0.78} color="#475569" brake />
            <circle cx="292" cy="144" r="7" fill="#EF4444" opacity="0.45" />
            <circle cx="338" cy="144" r="7" fill="#EF4444" opacity="0.45" />
            <BadgePill x={14} y={16} text="Ночью за городом при стоянке — габариты (Positionslys)!" tone="warn" />
            <BadgePill x={14} y={46} text="Холостой ход (Tomgang): заглуши через 1–3 мин" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_school_roadmap':
      default:
        return (
          <g>
            <defs>
              <linearGradient id="roadmapBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#134E4A" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="460" height="250" fill="url(#roadmapBg)" />
            <text x="230" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="14.5" fontWeight="800">
              Путь в датской автошколе (Lovpakke B)
            </text>
            <line x1="65" y1="114" x2="395" y2="114" stroke="#5EEAD4" strokeWidth="3" strokeDasharray="6 6" opacity="0.45" />
            {[
              { x: 24, n: '1', t: '29 ч теории', s: 'Правила + тесты' },
              { x: 130, n: '2', t: '4 ч Manøvre', s: 'Площадка' },
              { x: 236, n: '3', t: '16 ч город', s: '+ ночное вожд.' },
              { x: 342, n: '4', t: '4 ч Glatbane', s: 'Лёд и заносы' },
            ].map((item) => (
              <g key={item.n} transform={`translate(${item.x}, 66)`}>
                <rect x="0" y="0" width="94" height="92" rx="14" fill="#0F172A" fillOpacity="0.82" stroke="#14B8A6" strokeWidth="1.6" />
                <circle cx="47" cy="24" r="12" fill="#0D9488" />
                <text x="47" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="800">
                  {item.n}
                </text>
                <text x="47" y="56" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="700">
                  {item.t}
                </text>
                <text x="47" y="74" textAnchor="middle" fill="#99F6E4" fontSize="9">
                  {item.s}
                </text>
              </g>
            ))}
            <rect x="24" y="176" width="412" height="48" rx="12" fill="#0F172A" fillOpacity="0.88" stroke="#5EEAD4" strokeOpacity="0.35" strokeWidth="1.4" />
            <text x="230" y="196" textAnchor="middle" fill="#5EEAD4" fontSize="11" fontWeight="700">
              Lægeattest + Førstehjælp (8 ч) + Tolk (при надобности)
            </text>
            <text x="230" y="213" textAnchor="middle" fill="#E2E8F0" fontSize="10.5">
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
        presetId !== 'pov_motortrafikvej' &&
        presetId !== 'pov_parking_meters' &&
        presetId !== 'pov_sign_shapes_abcde' && (
          <div className="absolute right-3 top-3 rounded-lg bg-white/90 p-1 shadow-sm backdrop-blur dark:bg-zinc-900/90">
            <DanishRoadSignSVG code={signCode} subPlaque={subPlaque} size={48} />
          </div>
        )}
    </div>
  );
};
