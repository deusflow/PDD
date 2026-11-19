import React, { createContext, useContext, useId } from 'react';
import { DanishRoadSignSVG, PSkiveSVG } from './DanishRoadSignSVG';

const SvgIdContext = createContext<{ uid: string; hideHints: boolean }>({
  uid: 'pov',
  hideHints: false,
});

interface DriverPOVSceneSVGProps {
  presetId: string;
  imageSrc?: string;
  signCode?: string;
  subPlaque?: string;
  maneuverBadge?: string;
  hideHints?: boolean;
  className?: string;
}

const CockpitFrame: React.FC<{
  skyColor?: string;
  night?: boolean;
  children: React.ReactNode;
}> = ({ skyColor, night = false, children }) => {
  const { uid } = useContext(SvgIdContext);
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}_skyDay`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyColor ?? '#7DD3FC'} />
          <stop offset="65%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#F0F9FF" />
        </linearGradient>
        <linearGradient id={`${uid}_skyNight`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#09090B" />
          <stop offset="70%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id={`${uid}_dash`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#27272A" />
          <stop offset="100%" stopColor="#09090B" />
        </linearGradient>
        <linearGradient id={`${uid}_grass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="100%" stopColor="#6EE7B7" />
        </linearGradient>
        <linearGradient id={`${uid}_asphalt`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#52525B" />
          <stop offset="100%" stopColor="#3F3F46" />
        </linearGradient>
      </defs>

      {/* Sky / background */}
      <rect
        x="0"
        y="0"
        width="460"
        height="250"
        fill={night ? `url(#${uid}_skyNight)` : `url(#${uid}_skyDay)`}
      />

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
    <path d="M 0 212 Q 230 192 460 212 L 460 250 L 0 250 Z" fill={`url(#${uid}_dash)`} />
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
};

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
}) => {
  const { uid } = useContext(SvgIdContext);
  return (
  <g>
    {/* Grass / ground */}
    <rect x="0" y={horizonY} width="460" height={250 - horizonY} fill={`url(#${uid}_grass)`} opacity="0.58" />
    {/* Main asphalt */}
    <polygon points={`${vanishX - 42},${horizonY} ${vanishX + 42},${horizonY} 450,220 10,220`} fill={`url(#${uid}_asphalt)`} />
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
};

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
  const { hideHints } = useContext(SvgIdContext);
  if (hideHints) return null;
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

const MountedRoadSignPost: React.FC<{
  signCode?: string;
  subPlaque?: string;
  x?: number;
  baseY?: number;
}> = ({ signCode, subPlaque, x = 356, baseY = 182 }) => {
  if (!signCode) return null;
  const signSize = 72;
  const topY = baseY - (subPlaque ? 114 : 96);
  return (
    <g>
      <ellipse cx={x} cy={baseY + 2} rx="12" ry="3.5" fill="#09090B" opacity="0.26" />
      <rect
        x={x - 2.5}
        y={topY + 42}
        width="5"
        height={baseY - (topY + 42)}
        rx="2"
        fill="#CBD5E1"
        stroke="#475569"
        strokeWidth="1"
      />
      <g transform={`translate(${x - signSize / 2}, ${topY})`}>
        <DanishRoadSignSVG code={signCode} subPlaque={subPlaque} size={signSize} />
      </g>
    </g>
  );
};

export const DriverPOVSceneSVG: React.FC<DriverPOVSceneSVGProps> = ({
  presetId,
  imageSrc,
  signCode,
  subPlaque,
  maneuverBadge,
  hideHints = false,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
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
            <FrontCar x={230} y={136} scale={0.78} color="#0D9488" />
            {!hideHints && (
              <>
                <rect x="34" y="138" width="392" height="58" rx="14" fill="#0F172A" fillOpacity="0.88" stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="1.5" />
                <g transform="translate(88, 166)">
                  <rect x="-42" y="-16" width="38" height="20" rx="4" fill="#94A3B8" stroke="#FFFFFF" strokeWidth="1.4" />
                  <circle cx="-23" cy="6" r="5.5" fill="#18181B" stroke="#E2E8F0" strokeWidth="1.5" />
                  <line x1="-4" y1="0" x2="10" y2="0" stroke="#E2E8F0" strokeWidth="2.5" />
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
              </>
            )}
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
                ‰
              </text>
              <text x="65" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                Алкоголь
              </text>
              {!hideHints && (
                <>
                  <text x="65" y="102" textAnchor="middle" fill="#CBD5E1" fontSize="9.2">
                    0,20‰ нов. / 0,50‰ общ.
                  </text>
                  <text x="65" y="122" textAnchor="middle" fill="#FCA5A5" fontSize="9.5">
                    &gt; 2,00‰ = конфискация
                  </text>
                </>
              )}
            </g>

            <g transform="translate(165, 26)">
              <rect x="0" y="0" width="130" height="162" rx="14" fill="#0F172A" fillOpacity="0.9" stroke="#F59E0B" strokeWidth="1.8" />
              <rect x="33" y="20" width="64" height="30" rx="8" fill="#78350F" stroke="#F59E0B" strokeWidth="2" />
              <text x="65" y="40" textAnchor="middle" fill="#FDE68A" fontSize="12" fontWeight="800">
                KLIP
              </text>
              <text x="65" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                Новичок (0–3 г.)
              </text>
              {!hideHints && (
                <>
                  <text x="65" y="102" textAnchor="middle" fill="#FDE68A" fontSize="9.8">
                    2 klip = Kørselsforbud!
                  </text>
                  <text x="65" y="122" textAnchor="middle" fill="#CBD5E1" fontSize="9.5">
                    Опытный: 3 klip / 3 г.
                  </text>
                </>
              )}
            </g>

            <g transform="translate(308, 26)">
              <rect x="0" y="0" width="130" height="162" rx="14" fill="#0F172A" fillOpacity="0.9" stroke="#14B8A6" strokeWidth="1.8" />
              <polygon points="65,18 45,52 85,52" fill="#0F172A" stroke="#EF4444" strokeWidth="3.5" strokeLinejoin="round" />
              <text x="65" y="76" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                ДТП и помощь
              </text>
              {!hideHints && (
                <>
                  <text x="65" y="102" textAnchor="middle" fill="#5EEAD4" fontSize="9.8">
                    Треугольник: 50 / 100 м
                  </text>
                  <text x="65" y="122" textAnchor="middle" fill="#CBD5E1" fontSize="9.5">
                    112 травмы · 114 полиция
                  </text>
                </>
              )}
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
              {!hideHints && (
                <text x="97" y="128" textAnchor="middle" fill="#FCA5A5" fontSize="9.5">
                  Приравнено к § 54 (как алкоголь!)
                </text>
              )}
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
              {!hideHints && (
                <>
                  <text x="97" y="86" textAnchor="middle" fill="#5EEAD4" fontSize="9.8" fontWeight="600">
                    Ansvarsforsikring = ОБЯЗАТЕЛЬНА
                  </text>
                  <text x="97" y="108" textAnchor="middle" fill="#CBD5E1" fontSize="9.8">
                    1-й Syn: 4 года · Далее: каждые 2 г.
                  </text>
                  <text x="97" y="128" textAnchor="middle" fill="#FDE68A" fontSize="9.5">
                    Новичок 3 года: лишение за 2 klip!
                  </text>
                </>
              )}
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
            {!hideHints && (
              <>
                <rect x="28" y="138" width="404" height="58" rx="14" fill="#0F172A" fillOpacity="0.9" stroke="#F59E0B" strokeOpacity="0.55" strokeWidth="1.5" />
                <rect x="46" y="152" width="110" height="12" rx="6" fill="#38BDF8" />
                <text x="166" y="162" fill="#E0F2FE" fontSize="10" fontWeight="700">
                  Реакция (~1 сек): 2× скорость → 2× м
                </text>
                <rect x="46" y="172" width="215" height="12" rx="6" fill="#F59E0B" />
                <text x="270" y="182" fill="#FDE68A" fontSize="10" fontWeight="700">
                  Торможение: 2× скорость → 4× м!
                </text>
              </>
            )}
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

      case 'pov_sign_city':
        return (
          <CockpitFrame skyColor="#7DD3FC">
            <HorizonRoad withCenterDash withCykelsti="solid" />
            <FrontCar x={204} y={136} scale={0.7} color="#0D9488" />
            <CyclistPOV x={315} y={176} scale={0.82} />
            <MountedRoadSignPost signCode={signCode} subPlaque={subPlaque} />
          </CockpitFrame>
        );

      case 'pov_sign_country':
        return (
          <CockpitFrame skyColor="#7DD3FC">
            <HorizonRoad withCenterDash />
            {/* White-amber Danish roadside delineators */}
            <rect x="148" y="112" width="4" height="18" rx="1" fill="#FFFFFF" />
            <rect x="148" y="115" width="4" height="4" fill="#F59E0B" />
            <rect x="308" y="112" width="4" height="18" rx="1" fill="#FFFFFF" />
            <rect x="308" y="115" width="4" height="4" fill="#F59E0B" />
            <FrontCar x={208} y={134} scale={0.68} color="#475569" />
            <MountedRoadSignPost signCode={signCode} subPlaque={subPlaque} />
          </CockpitFrame>
        );

      case 'pov_sign_intersection':
        return (
          <CockpitFrame skyColor="#7DD3FC">
            <HorizonRoad withCenterDash={false} />
            {/* Crossroad ahead */}
            <polygon points="80,116 380,116 420,148 40,148" fill="#52525B" />
            {signCode === 'B13' && (
              <line x1="150" y1="158" x2="310" y2="158" stroke="#FFFFFF" strokeWidth="4.5" />
            )}
            <SideCar x={148} y={122} scale={0.72} color="#E11D48" />
            <MountedRoadSignPost signCode={signCode} subPlaque={subPlaque} />
          </CockpitFrame>
        );

      case 'pov_sign_parking':
        return (
          <CockpitFrame skyColor="#7DD3FC">
            <HorizonRoad withCenterDash />
            <FrontCar x={286} y={156} scale={0.76} color="#475569" />
            {signCode === 'E33' && (
              <g transform="translate(22, 22) scale(0.56)">
                <PSkiveSVG size={104} />
              </g>
            )}
            <MountedRoadSignPost signCode={signCode} subPlaque={subPlaque} x={364} />
          </CockpitFrame>
        );

      case 'pov_police_signal':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash={false} />
            <polygon points="80,118 380,118 425,148 35,148" fill="#52525B" />
            {/* Traffic light showing green behind officer (overridden!) */}
            <rect x="336" y="42" width="22" height="54" rx="5" fill="#18181B" />
            <circle cx="347" cy="54" r="5" fill="#450A0A" />
            <circle cx="347" cy="69" r="5" fill="#422006" />
            <circle cx="347" cy="84" r="5" fill="#22C55E" />
            {/* Police officer in hi-vis vest raising arm STOP */}
            <g transform="translate(230, 146)">
              <ellipse cx="0" cy="22" rx="14" ry="4" fill="#09090B" opacity="0.28" />
              <rect x="-8" y="-8" width="16" height="22" rx="4" fill="#FACC15" stroke="#0F172A" strokeWidth="1.5" />
              <line x1="-8" y1="3" x2="8" y2="3" stroke="#0F172A" strokeWidth="2.5" />
              <rect x="-6" y="12" width="5" height="11" fill="#0F172A" />
              <rect x="1" y="12" width="5" height="11" fill="#0F172A" />
              <circle cx="0" cy="-16" r="6" fill="#FED7AA" stroke="#0F172A" strokeWidth="1.2" />
              <rect x="-6" y="-23" width="12" height="4" rx="1" fill="#0F172A" />
              {/* Raised arm */}
              <path d="M 8 -4 L 18 -24" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
            </g>
            <BadgePill x={14} y={16} text="Жест полицейского ОТМЕНЯЕТ зелёный свет!" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_green_arrow_signal':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            <polygon points="80,118 380,118 425,148 35,148" fill="#52525B" />
            <FrontCar x={188} y={136} scale={0.72} color="#E11D48" />
            {/* Traffic light with green arrow */}
            <g transform="translate(332, 34)">
              <rect x="0" y="0" width="32" height="82" rx="8" fill="#18181B" stroke="#52525B" strokeWidth="1.5" />
              <circle cx="16" cy="17" r="8" fill="#450A0A" />
              <circle cx="16" cy="41" r="8" fill="#422006" />
              <circle cx="16" cy="65" r="9" fill="#064E3B" />
              <path d="M 21 65 L 11 65 M 15 60 L 10 65 L 15 70" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <BadgePill x={14} y={16} text="Зелёная стрелка = встречные СТОЯТ на красный!" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_rail_no_barrier':
        return (
          <CockpitFrame skyColor="#DBEAFE">
            <HorizonRoad withCenterDash={false} />
            {/* Railway tracks crossing road */}
            <rect x="0" y="138" width="460" height="22" fill="#78716C" />
            <line x1="0" y1="143" x2="460" y2="143" stroke="#18181B" strokeWidth="3.5" />
            <line x1="0" y1="155" x2="460" y2="155" stroke="#18181B" strokeWidth="3.5" />
            {/* Red flashing warning post + St. Andrew's cross */}
            <g transform="translate(342, 48)">
              <rect x="-2" y="28" width="4" height="92" fill="#71717A" />
              <line x1="-18" y1="4" x2="18" y2="26" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
              <line x1="18" y1="4" x2="-18" y2="26" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
              <line x1="-18" y1="4" x2="18" y2="26" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
              <line x1="18" y1="4" x2="-18" y2="26" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
              <rect x="-14" y="34" width="28" height="42" rx="6" fill="#18181B" />
              <circle cx="0" cy="46" r="6" fill="#EF4444" />
              <circle cx="0" cy="64" r="5" fill="#F8FAFC" opacity="0.4" />
            </g>
            <BadgePill x={14} y={16} text="Без шлагбаума: красный огонь = ПОЛНЫЙ СТОП!" tone="warn" />
            <BadgePill x={14} y={46} text="Ехать можно только когда огонь ПОГАС" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_motorway_exit_frakoersel':
        return (
          <CockpitFrame skyColor="#7DD3FC">
            <HorizonRoad withCenterDash />
            {/* Right deceleration exit branch */}
            <polygon points="274,108 308,108 446,204 374,218" fill="#475569" />
            <line x1="274" y1="108" x2="374" y2="218" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="8 8" />
            {/* Overhead green exit gantry */}
            <rect x="200" y="20" width="210" height="36" rx="6" fill="#047857" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M 305 30 L 305 46 M 298 40 L 305 47 L 312 40" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
            <FrontCar x={204} y={136} scale={0.72} color="#475569" />
            <BadgePill x={14} y={16} text="Съезд (Frakørsel): тормозите на полосе съезда!" tone="teal" />
            <BadgePill x={14} y={46} text="На автобане: всегда держитесь правой полосы" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_winter_glatbane_esp':
        return (
          <CockpitFrame skyColor="#CBD5E1">
            {/* Snowy / icy ground & slick curve */}
            <rect x="0" y="98" width="460" height="152" fill="#E2E8F0" opacity="0.88" />
            <polygon points="185,98 275,98 445,220 15,220" fill="#64748B" />
            <line x1="230" y1="98" x2="230" y2="215" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="10 10" />
            {/* Icy shimmer patch */}
            <ellipse cx="240" cy="166" rx="76" ry="20" fill="#BAE6FD" opacity="0.55" />
            <FrontCar x={234} y={144} scale={0.8} color="#0284C7" brake />
            <BadgePill x={14} y={16} text="Гололёд (Glatbane) и крутой спуск: низкая передача!" tone="warn" />
            <BadgePill x={14} y={46} text="ABS даёт рулить · ESP гасит занос" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_tunnel_lights':
        return (
          <CockpitFrame night>
            <HorizonRoad withCenterDash />
            {/* Arched tunnel portal */}
            <path d="M 85 210 L 85 110 A 145 78 0 0 1 375 110 L 375 210" fill="none" stroke="#94A3B8" strokeWidth="14" />
            <circle cx="165" cy="56" r="4" fill="#FDE047" />
            <circle cx="230" cy="48" r="4" fill="#FDE047" />
            <circle cx="295" cy="56" r="4" fill="#FDE047" />
            <FrontCar x={230} y={144} scale={0.76} color="#64748B" />
            <BadgePill x={14} y={16} text="В туннеле: ОБЯЗАТЕЛЬНО включите Nærlys (ближний)!" tone="warn" />
            <BadgePill x={14} y={46} text="Снимите солнцезащитные очки · Разворот запрещён" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_vanvidskorsel_law':
        return (
          <CockpitFrame night>
            <HorizonRoad withCenterDash />
            <FrontCar x={230} y={144} scale={0.78} color="#EF4444" brake />
            {!hideHints && (
              <>
                <rect x="315" y="84" width="60" height="44" rx="10" fill="#0F172A" stroke="#EF4444" strokeWidth="2.5" />
                <text x="345" y="104" textAnchor="middle" fill="#EF4444" fontSize="13" fontWeight="900">
                  200+
                </text>
                <text x="345" y="119" textAnchor="middle" fill="#CBD5E1" fontSize="9">
                  km/t
                </text>
                <rect x="44" y="34" width="372" height="148" rx="16" fill="#0F172A" fillOpacity="0.92" stroke="#EF4444" strokeWidth="2" />
                <text x="230" y="64" textAnchor="middle" fill="#FCA5A5" fontSize="13.5" fontWeight="800">
                  VANVIDSKØRSEL = КОНФИСКАЦИЯ АВТО!
                </text>
                <text x="230" y="96" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                  • Скорость &gt; 200 км/ч ИЛИ ≥ +100% (при &gt;100 км/ч)
                </text>
                <text x="230" y="122" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                  • Алкоголь &gt; 2,00‰ (даже на чужой машине!)
                </text>
                <text x="230" y="152" textAnchor="middle" fill="#FDE68A" fontSize="10.5" fontWeight="600">
                  Штраф + тюрьма + лишение прав + продажа авто на аукционе
                </text>
              </>
            )}
          </CockpitFrame>
        );

      case 'pov_child_seat_airbag':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            {/* Dashboard passenger airbag OFF icon + baby seat outline */}
            <rect x="330" y="136" width="84" height="52" rx="10" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
            <circle cx="354" cy="156" r="10" fill="#F59E0B" />
            <text x="386" y="160" textAnchor="middle" fill="#FDE68A" fontSize="10" fontWeight="800">
              AIRBAG
            </text>
            <text x="372" y="177" textAnchor="middle" fill="#CBD5E1" fontSize="8.5" fontWeight="700">
              &lt; 135 cm
            </text>
            {!hideHints && (
              <>
                <rect x="34" y="32" width="392" height="156" rx="16" fill="#0F172A" fillOpacity="0.9" stroke="#38BDF8" strokeWidth="1.8" />
                <text x="230" y="62" textAnchor="middle" fill="#5EEAD4" fontSize="13.5" fontWeight="800">
                  Дети (&lt; 135 см) и подушка безопасности
                </text>
                <text x="230" y="94" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="700">
                  Автокресло / бустер обязательны до роста 135 см
                </text>
                <text x="230" y="122" textAnchor="middle" fill="#FCA5A5" fontSize="11.5" fontWeight="700">
                  Спереди спиной вперёд = AIRBAG ОБЯЗАТЕЛЬНО ОТКЛЮЧИТЬ!
                </text>
                <text x="230" y="152" textAnchor="middle" fill="#CBD5E1" fontSize="10.5" fontWeight="600">
                  Водитель отвечает за пристёгивание всех пассажиров до 15 лет
                </text>
              </>
            )}
          </CockpitFrame>
        );

      case 'pov_horn_warning_only':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash withCykelsti="solid" />
            <CyclistPOV x={316} y={162} scale={0.95} />
            <FrontCar x={198} y={138} scale={0.76} color="#475569" brake />
            <BadgePill x={14} y={16} text="Звуковой сигнал (Horn): ТОЛЬКО для предотвращения ДТП!" tone="warn" />
            <BadgePill x={14} y={46} text="Вне города при угрозе допускается световой/звуковой" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_horse_rider_slow':
        return (
          <CockpitFrame skyColor="#7DD3FC">
            <HorizonRoad withCenterDash />
            {/* Stylized horse & rider silhouette on right shoulder */}
            <g transform="translate(318, 152)">
              <ellipse cx="0" cy="22" rx="16" ry="4" fill="#09090B" opacity="0.28" />
              <rect x="-14" y="-8" width="28" height="14" rx="5" fill="#78350F" />
              <rect x="-11" y="4" width="4" height="16" fill="#78350F" />
              <rect x="7" y="4" width="4" height="16" fill="#78350F" />
              <path d="M 8 -6 L 16 -22 L 22 -18" stroke="#78350F" strokeWidth="6" strokeLinecap="round" fill="none" />
              {/* Rider */}
              <circle cx="-2" cy="-22" r="5" fill="#F59E0B" stroke="#18181B" strokeWidth="1.2" />
              <rect x="-6" y="-17" width="8" height="11" rx="3" fill="#0D9488" />
            </g>
            {/* Wide safe passing arc */}
            <path d="M 225 192 Q 202 150 218 118" fill="none" stroke="#4ADE80" strokeWidth="3.5" strokeDasharray="6 4" />
            <BadgePill x={14} y={16} text="Всадники: снизить скорость + широкий интервал" tone="teal" />
            <BadgePill x={14} y={46} text="ЗАПРЕЩЕНО сигналить и моргать дальним светом!" tone="warn" />
          </CockpitFrame>
        );

      case 'pov_motorway_breakdown_100m':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            {/* Stopped car on right shoulder + warning triangle */}
            <FrontCar x={338} y={142} scale={0.72} color="#EF4444" blinkLeft blinkRight />
            <polygon points="354,174 366,194 342,194" fill="#FACC15" stroke="#DC2626" strokeWidth="3" strokeLinejoin="round" />
            <BadgePill x={14} y={16} text="Поломка на автобане: съезд на Nødspor + жилет + за отбойник!" tone="warn" />
            <BadgePill x={14} y={46} text="Треугольник на автобане: минимум 100 м позади" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_towing_max30':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            {/* Towed car behind lead car on street */}
            <FrontCar x={230} y={136} scale={0.82} color="#475569" blinkLeft blinkRight />
            <line x1="230" y1="150" x2="230" y2="188" stroke="#FACC15" strokeWidth="3.5" strokeDasharray="5 3" />
            <BadgePill x={14} y={16} text="Буксировка (Slæbetov): макс. 30 км/ч · трос 2–4 м" tone="warn" />
            <BadgePill x={14} y={46} text="На Motorvej и Motortrafikvej буксировка тросом ЗАПРЕЩЕНА!" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_cockpit_seat_mirror':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash withCykelsti="dashed" />
            {/* Mirror horizon check */}
            <rect x="200" y="12" width="60" height="22" rx="4" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.6" />
            <rect x="219" y="18" width="22" height="10" rx="2" fill="#94A3B8" />
            {/* Left & Right mirror view hints */}
            <rect x="4" y="114" width="44" height="28" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.6" />
            <rect x="412" y="114" width="44" height="28" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.6" />
            <circle cx="428" cy="128" r="4" fill="#FACC15" />
            {/* Driver headrest diagram indicator on left */}
            <g transform="translate(22, 20)">
              <rect x="0" y="0" width="118" height="72" rx="10" fill="#0F172A" fillOpacity="0.88" stroke="#5EEAD4" strokeWidth="1.4" />
              <circle cx="28" cy="30" r="10" fill="#CBD5E1" />
              <rect x="42" y="16" width="12" height="24" rx="4" fill="#0D9488" />
              <line x1="16" y1="20" x2="60" y2="20" stroke="#5EEAD4" strokeWidth="1.5" strokeDasharray="3 2" />
              <rect x="64" y="20" width="42" height="20" rx="4" fill="#1E293B" stroke="#5EEAD4" strokeWidth="1" />
              <line x1="66" y1="30" x2="104" y2="30" stroke="#38BDF8" strokeWidth="1.2" />
              {!hideHints && (
                <text x="59" y="60" textAnchor="middle" fill="#5EEAD4" fontSize="8.8" fontWeight="700">
                  Подголовник = верх
                </text>
              )}
            </g>
            <BadgePill x={154} y={16} text="1. Посадка · 2. Подголовник · 3. 3 зеркала" tone="teal" />
          </CockpitFrame>
        );

      case 'pov_cockpit_blind_spot':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash withCykelsti="dashed" />
            <FrontCar x={208} y={142} scale={0.72} color="#64748B" />
            {/* Cyclist right in the blind spot just beside right mirror/A-pillar */}
            <CyclistPOV x={365} y={178} scale={1.15} />
            <circle cx="385" cy="154" r="14" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="4 3" />
            {/* Right mirror warning dot */}
            <rect x="404" y="116" width="50" height="32" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.8" />
            <circle cx="426" cy="132" r="5" fill="#FACC15" />
            <BadgePill x={14} y={16} text="Правое зеркало + SKULDERKIG через плечо!" tone="warn" />
            <BadgePill x={14} y={46} text="Велосипедист в слепой зоне перед поворотом/дверью" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_curb_departure':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash withCykelsti="solid" />
            {/* Sidewalk curb right next to bumper */}
            <polygon points="392,98 424,98 460,220 408,220" fill="#CBD5E1" />
            {/* Parked car ahead & cyclist passing on cykelsti */}
            <FrontCar x={332} y={146} scale={0.76} color="#475569" />
            <CyclistPOV x={374} y={176} scale={1.05} />
            {/* Approaching car visible in left wing mirror */}
            <rect x="6" y="114" width="60" height="36" rx="7" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
            <circle cx="28" cy="134" r="4" fill="#FEF08A" />
            <circle cx="42" cy="134" r="4" fill="#FEF08A" />
            {/* Left blinker arrow on cockpit cluster */}
            <polygon points="122,232 132,226 132,238" fill="#22C55E" />
            <BadgePill x={14} y={16} text="Старт от бордюра: пропустите ВСЕХ (авто + вело)!" tone="warn" />
            <BadgePill x={14} y={46} text="Включите левый поворотник и сделайте skulderkig" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_school_children_a22':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            {/* Parked cars along right curb hiding view */}
            <FrontCar x={324} y={166} scale={0.85} color="#475569" />
            <FrontCar x={294} y={132} scale={0.56} color="#64748B" />
            {/* Child darting out between parked cars */}
            <circle cx="278" cy="160" r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.4" />
            <rect x="273" y="166" width="10" height="16" rx="3" fill="#EF4444" />
            <path d="M 272 174 L 245 174" stroke="#FACC15" strokeWidth="2.5" strokeDasharray="4 3" />
            <MountedRoadSignPost signCode="A22" x={392} baseY={184} />
            <BadgePill x={14} y={16} text="A22 Дети! Снизьте скорость и уберите ногу с газа" tone="warn" />
            <BadgePill x={14} y={46} text="Школьный патруль обязателен для остановки" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_yellow_traffic_light':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            {/* Cross street & white stop line */}
            <line x1="88" y1="162" x2="386" y2="162" stroke="#FFFFFF" strokeWidth="5.5" />
            {/* Signal pole with illuminated yellow lamp */}
            <rect x="334" y="54" width="24" height="62" rx="6" fill="#18181B" stroke="#71717A" strokeWidth="1.5" />
            <line x1="346" y1="116" x2="346" y2="178" stroke="#94A3B8" strokeWidth="4" />
            <circle cx="346" cy="70" r="6" fill="#450A0A" />
            <circle cx="346" cy="85" r="7" fill="#FACC15" />
            <circle cx="346" cy="100" r="6" fill="#052E16" />
            <BadgePill x={14} y={16} text="Жёлтый свет: СТОП перед линией, если безопасно (≥ 35 м)" tone="warn" />
            <BadgePill x={14} y={46} text="Приоритет: 1. Полиция → 2. Светофор → 3. Знаки → 4. Правила" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_parking_5m_10m':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash withCykelsti="solid" />
            {/* Crosswalk zebra ahead */}
            {[172, 198, 224, 250, 276, 302].map((zx) => (
              <rect key={zx} x={zx} y="142" width="14" height="18" rx="1.5" fill="#FFFFFF" opacity="0.92" />
            ))}
            {/* Red curb zone right before crosswalk */}
            <line x1="358" y1="158" x2="418" y2="216" stroke="#EF4444" strokeWidth="6" opacity="0.82" />
            {!hideHints && (
              <text x="360" y="192" fill="#FCA5A5" fontSize="11" fontWeight="900">
                5 m
              </text>
            )}
            <BadgePill x={14} y={16} text="Запрет остановки/стоянки: 5 м перед зеброй и велопереездом" tone="warn" />
            <BadgePill x={14} y={46} text="10 м от ближайшего края пересекаемой проезжей части" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_parking_oneway_ensrettet':
        return (
          <CockpitFrame skyColor="#E0F2FE">
            <HorizonRoad withCenterDash={false} />
            {/* Parked car on left side and parked car on right side both facing forward */}
            <FrontCar x={126} y={156} scale={0.76} color="#0D9488" />
            <FrontCar x={334} y={156} scale={0.76} color="#64748B" />
            <MountedRoadSignPost signCode="E19" x={392} baseY={184} />
            <BadgePill x={14} y={16} text="Односторонняя улица (E19): парковка слева и справа OK!" tone="teal" />
            <BadgePill x={14} y={46} text="Следите за шириной проезда (3 м+) и знаками C61/C62" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_parking_bus_driveway':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            {/* Bus stop sign on right */}
            <rect x="366" y="72" width="18" height="24" rx="4" fill="#FACC15" stroke="#18181B" strokeWidth="1.5" />
            <text x="375" y="88" textAnchor="middle" fill="#18181B" fontSize="8" fontWeight="800">
              BUS
            </text>
            <line x1="375" y1="96" x2="375" y2="174" stroke="#64748B" strokeWidth="3.5" />
            {/* Red bus stop restriction curb zone */}
            <line x1="342" y1="154" x2="412" y2="212" stroke="#EF4444" strokeWidth="5.5" opacity="0.85" />
            {/* Driveway cutout ahead on right */}
            <polygon points="295,126 340,126 355,140 298,140" fill="#CBD5E1" opacity="0.7" />
            <BadgePill x={14} y={16} text="Остановка автобуса: 12 м до и 12 м после запрет парковки" tone="warn" />
            <BadgePill x={14} y={46} text="Перед выездом (Indkørsel): остановка ≤ 3 мин разрешена" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_accident_triangle_112':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            {/* Broken car ahead with hazard blinkers */}
            <FrontCar x={294} y={136} scale={0.68} color="#DC2626" blinkLeft blinkRight />
            {/* Warning triangle placed on road behind broken car */}
            <polygon points="348,166 334,190 362,190" fill="#FACC15" stroke="#EF4444" strokeWidth="3" strokeLinejoin="round" />
            <BadgePill x={14} y={16} text="ДТП: аварийка + треугольник на 50 м (100 м на автомагистрали)" tone="warn" />
            <BadgePill x={14} y={46} text="Травмы / угроза → 112 · Нет травм → обмен данными (114)" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_motorcycle_junction':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            {/* Side junction opening on left */}
            <polygon points="0,126 168,126 142,158 0,158" fill="#475569" />
            {/* Approaching narrow motorcycle silhouette with bright headlight */}
            <g transform="translate(178, 122)">
              <circle cx="0" cy="-16" r="5" fill="#18181B" />
              <rect x="-4" y="-10" width="8" height="14" rx="2" fill="#334155" />
              <line x1="-10" y1="-4" x2="10" y2="-4" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="0" cy="4" r="6" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1.5" />
              <rect x="-2.5" y="10" width="5" height="10" rx="2" fill="#18181B" />
            </g>
            <BadgePill x={14} y={16} text="Мотоцикл: узкий силуэт → скорость кажется ниже!" tone="warn" />
            <BadgePill x={14} y={46} text="Высокий тормозной путь в наклоне · Не резать дистанцию" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_narrow_bridge_b18':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash={false} />
            {/* Bridge parapets narrowing road */}
            <polygon points="105,112 182,112 162,175 18,175" fill="#94A3B8" opacity="0.85" />
            <polygon points="278,112 355,112 442,175 298,175" fill="#94A3B8" opacity="0.85" />
            <FrontCar x={225} y={126} scale={0.56} color="#16A34A" />
            <MountedRoadSignPost signCode="B18" x={368} baseY={184} />
            <BadgePill x={14} y={16} text="Узкий проезд: красная стрелка B18 = ВЫ уступаете!" tone="warn" />
            <BadgePill x={14} y={46} text="Белая стрелка B19 = приоритет у вас (но не рискуйте)" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_railway_crossing':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            {/* Steel railway rails crossing road */}
            <rect x="30" y="132" width="400" height="16" fill="#78716C" />
            <line x1="20" y1="135" x2="440" y2="135" stroke="#18181B" strokeWidth="2.5" />
            <line x1="20" y1="145" x2="440" y2="145" stroke="#18181B" strokeWidth="2.5" />
            {/* White stop line */}
            <line x1="115" y1="168" x2="345" y2="168" stroke="#FFFFFF" strokeWidth="5.5" />
            {/* Flashing red railway signal mast */}
            <rect x="364" y="64" width="22" height="44" rx="4" fill="#18181B" stroke="#71717A" strokeWidth="1.5" />
            <line x1="375" y1="108" x2="375" y2="176" stroke="#CBD5E1" strokeWidth="4" />
            <circle cx="375" cy="79" r="6" fill="#EF4444" />
            <circle cx="375" cy="95" r="5" fill="#FEF2F2" />
            <MountedRoadSignPost signCode="A74" x={338} baseY={176} />
            <BadgePill x={14} y={16} text="Ж/д переезд: красный мигающий свет = АБСОЛЮТНЫЙ СТОП!" tone="warn" />
            <BadgePill x={14} y={46} text="Не ехать после 1-го поезда, пока красный огонь не погаснет" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_u_turn_city':
        return (
          <CockpitFrame skyColor="#E0F2FE">
            <HorizonRoad withCenterDash />
            <FrontCar x={182} y={128} scale={0.58} color="#EF4444" />
            <CyclistPOV x={366} y={176} scale={1.0} />
            <rect x="6" y="114" width="56" height="34" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.8" />
            <circle cx="34" cy="131" r="4" fill="#FEF08A" />
            <BadgePill x={14} y={16} text="Разворот / задний ход: уступите ВСЕМ (вперед и назад)" tone="warn" />
            <BadgePill x={14} y={46} text="Запрещено на переходе, перекрёстке с плохим обзором и на Motorvej" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_overtake_right_exception':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash />
            {/* Front car shifted toward center blinking LEFT */}
            <FrontCar x={198} y={142} scale={0.82} color="#64748B" blinkLeft brake />
            <BadgePill x={14} y={16} text="Справа можно объехать: машина спереди мигает НАЛЕВО" tone="teal" />
            <BadgePill x={14} y={46} text="Нельзя выезжать на велодорожку (Cykelsti) или тротуар!" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_soft_shoulder_rabat':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash={false} />
            {/* Highlighted steep drop-off grass/gravel verge on the right side */}
            <polygon points="274,98 330,98 460,220 356,220" fill="#A16207" opacity="0.65" />
            <line x1="274" y1="98" x2="356" y2="220" stroke="#FDE047" strokeWidth="3.5" strokeDasharray="6 4" />
            <FrontCar x={192} y={132} scale={0.62} color="#475569" />
            <BadgePill x={14} y={16} text="Съезд на высокую/мягкую обочину (Høj rabat):" tone="warn" />
            <BadgePill x={14} y={46} text="НЕ крутите руль резко влево! Плавно газ ↓ → выровняйтесь → вернитесь" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_doorzone_passing':
        return (
          <CockpitFrame skyColor="#BAE6FD">
            <HorizonRoad withCenterDash withCykelsti="none" />
            {/* Parked cars lining right side with door opening threat */}
            <FrontCar x={338} y={168} scale={0.95} color="#0284C7" />
            <FrontCar x={312} y={132} scale={0.58} color="#475569" />
            {/* Open door swing zone highlight */}
            <path d="M 294 176 L 268 164 L 274 156" fill="none" stroke="#EF4444" strokeWidth="3" />
            <FrontCar x={175} y={128} scale={0.58} color="#E11D48" />
            <BadgePill x={14} y={16} text="Объезд припаркованных авто: держите ≥ 1 м (дверная зона!)" tone="warn" />
            <BadgePill x={14} y={46} text="Препятствие на вашей полосе → пропускаете встречного!" tone="dark" />
          </CockpitFrame>
        );

      case 'pov_school_roadmap':
      default:
        return (
          <g>
            <defs>
              <linearGradient id={`${uid}_roadmap`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#134E4A" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="460" height="250" fill={`url(#${uid}_roadmap)`} />
            <text x="230" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="14.5" fontWeight="800">
              Путь в датской автошколе (Lovpakke B)
            </text>
            <line x1="65" y1="114" x2="395" y2="114" stroke="#5EEAD4" strokeWidth="3" strokeDasharray="6 6" opacity="0.45" />
            {[
              { x: 24, n: '1', t: hideHints ? 'Теория' : '29 ч теории', s: 'Правила + тесты' },
              { x: 130, n: '2', t: hideHints ? 'Площадка' : '4 ч Manøvre', s: 'Manøvrebane' },
              { x: 236, n: '3', t: hideHints ? 'Город' : '16 ч город', s: '+ ночное вожд.' },
              { x: 342, n: '4', t: hideHints ? 'Glatbane' : '4 ч Glatbane', s: 'KTA заносы' },
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
            {!hideHints && (
              <>
                <rect x="24" y="176" width="412" height="48" rx="12" fill="#0F172A" fillOpacity="0.88" stroke="#5EEAD4" strokeOpacity="0.35" strokeWidth="1.4" />
                <text x="230" y="196" textAnchor="middle" fill="#5EEAD4" fontSize="11" fontWeight="700">
                  Pasfoto + Lægeattest + Førstehjælp (8 ч) + Fuldmagt
                </text>
                <text x="230" y="213" textAnchor="middle" fill="#E2E8F0" fontSize="10.5">
                  Финал: Teoriprøve (≥20/25) → Kontrolprøve + Praktisk køreprøve
                </text>
              </>
            )}
          </g>
        );
    }
  };

  return (
    <SvgIdContext.Provider value={{ uid, hideHints }}>
      <div className={`relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 ${className}`}>
        {imageSrc ? (
          <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
            <img
              src={imageSrc}
              alt={maneuverBadge ?? presetId}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <svg viewBox="0 0 460 250" className="h-auto w-full select-none" role="img" aria-label={presetId}>
            {renderContent()}
          </svg>
        )}

        {!hideHints && maneuverBadge && (
          <div className="border-t border-zinc-200/80 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            {maneuverBadge}
          </div>
        )}

        {signCode &&
          (Boolean(imageSrc) ||
            (presetId !== 'pov_hajtaender_b11' &&
              presetId !== 'pov_rundkoersel' &&
              presetId !== 'pov_fletning_vs_skift' &&
              presetId !== 'pov_bus_byzone' &&
              presetId !== 'pov_zebra_trap' &&
              presetId !== 'pov_undertavler' &&
              presetId !== 'pov_speed_limits' &&
              presetId !== 'pov_motorvej_merge' &&
              presetId !== 'pov_motortrafikvej' &&
              presetId !== 'pov_parking_meters' &&
              presetId !== 'pov_sign_shapes_abcde' &&
              presetId !== 'pov_school_children_a22' &&
              presetId !== 'pov_parking_oneway_ensrettet' &&
              presetId !== 'pov_narrow_bridge_b18' &&
              presetId !== 'pov_railway_crossing' &&
              !presetId.startsWith('pov_sign_'))) && (
            <div className="absolute right-3 top-3 rounded-lg bg-white/90 p-1 shadow-sm backdrop-blur dark:bg-zinc-900/90">
              <DanishRoadSignSVG code={signCode} subPlaque={subPlaque} size={48} />
            </div>
          )}
      </div>
    </SvgIdContext.Provider>
  );
};
