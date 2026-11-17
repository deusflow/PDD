import React, { useId } from 'react';
import { DanishRoadSignSVG } from './DanishRoadSignSVG';
import { DriverPOVSceneSVG } from './DriverPOVSceneSVG';

interface TrafficSceneSVGProps {
  presetId: string;
  signCode?: string;
  subPlaque?: string;
  maneuverBadge?: string;
  className?: string;
}

const TopCar: React.FC<{
  x: number | string;
  y: number | string;
  angle?: number;
  isPlayer?: boolean;
  color?: string;
  blinkRight?: boolean;
  blinkLeft?: boolean;
  label?: string;
  brakeLights?: boolean;
}> = ({
  x,
  y,
  angle = 0,
  isPlayer = false,
  color,
  blinkRight = false,
  blinkLeft = false,
  label,
  brakeLights = false,
}) => {
  const fill = color ?? (isPlayer ? '#0D9488' : '#475569');
  const roof = isPlayer ? '#5EEAD4' : '#94A3B8';
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
      {/* Car shadow */}
      <rect x="-15" y="-27" width="30" height="54" rx="8" fill="#09090B" opacity="0.26" transform="translate(2.5, 3)" />
      {/* Body */}
      <rect x="-15" y="-27" width="30" height="54" rx="8" fill={fill} stroke="#FFFFFF" strokeWidth="1.5" />
      {/* Windshield & cabin */}
      <rect x="-11" y="-14" width="22" height="28" rx="4.5" fill="#0F172A" opacity="0.88" />
      <rect x="-9" y="-6" width="18" height="14" rx="3" fill={roof} opacity="0.9" />
      <line x1="-8" y1="-12" x2="-2" y2="-8" stroke="#E0F2FE" strokeWidth="1.2" opacity="0.5" />
      {/* Headlights */}
      <rect x="-12" y="-26" width="6" height="3" rx="1.5" fill="#FEF08A" />
      <rect x="6" y="-26" width="6" height="3" rx="1.5" fill="#FEF08A" />
      {/* Brake lights */}
      {brakeLights && (
        <>
          <rect x="-13" y="24" width="7" height="3.5" rx="1.5" fill="#EF4444" />
          <rect x="6" y="24" width="7" height="3.5" rx="1.5" fill="#EF4444" />
        </>
      )}
      {/* Indicators */}
      {blinkLeft && (
        <>
          <circle cx="-15" cy="-22" r="4" fill="#F59E0B" />
          <circle cx="-15" cy="22" r="4" fill="#F59E0B" />
        </>
      )}
      {blinkRight && (
        <>
          <circle cx="15" cy="-22" r="4" fill="#F59E0B" />
          <circle cx="15" cy="22" r="4" fill="#F59E0B" />
        </>
      )}
      {(isPlayer || label) && (
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="8.5"
          fontWeight="800"
        >
          {label ?? 'DU'}
        </text>
      )}
    </g>
  );
};

const TreeTop: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 16 }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle cx="3" cy="4" r={r} fill="#09090B" opacity="0.14" />
    <circle cx="0" cy="0" r={r} fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" />
    <circle cx={-r * 0.25} cy={-r * 0.2} r={r * 0.55} fill="#86EFAC" opacity="0.55" />
  </g>
);

const CyclistTop: React.FC<{ x: number | string; y: number | string; angle?: number }> = ({ x, y, angle = 0 }) => (
  <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
    <ellipse cx="2" cy="2" rx="7" ry="13" fill="#09090B" opacity="0.22" />
    <rect x="-3" y="-14" width="6" height="28" rx="3" fill="#0EA5E9" stroke="#FFFFFF" strokeWidth="1" />
    <line x1="-8" y1="-6" x2="8" y2="-6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="0" cy="-2" r="5" fill="#FDE047" stroke="#18181B" strokeWidth="1.5" />
  </g>
);

const PedestrianTop: React.FC<{ x: number | string; y: number | string; label?: string }> = ({ x, y, label }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle cx="2" cy="2" r="7" fill="#09090B" opacity="0.2" />
    <circle cx="0" cy="0" r="7" fill="#F97316" stroke="#FFFFFF" strokeWidth="1.5" />
    <circle cx="0" cy="0" r="3.5" fill="#18181B" />
    {label && (
      <text x="0" y="18" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700">
        {label}
      </text>
    )}
  </g>
);

const HajtaenderRow: React.FC<{ x1: number; y1: number; count: number; horizontal?: boolean }> = ({
  x1,
  y1,
  count,
  horizontal = true,
}) => {
  const items = Array.from({ length: count });
  return (
    <g>
      {items.map((_, i) =>
        horizontal ? (
          <polygon
            key={i}
            points={`${x1 + i * 16},0 ${x1 + i * 16 + 12},0 ${x1 + i * 16 + 6},12`}
            transform={`translate(0, ${y1})`}
            fill="#FFFFFF"
          />
        ) : (
          <polygon
            key={i}
            points={`0,${y1 + i * 16} 0,${y1 + i * 16 + 12} 12,${y1 + i * 16 + 6}`}
            transform={`translate(${x1}, 0)`}
            fill="#FFFFFF"
          />
        )
      )}
    </g>
  );
};

export const TrafficSceneSVG: React.FC<TrafficSceneSVGProps> = ({
  presetId,
  signCode,
  subPlaque,
  maneuverBadge,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  if (presetId.startsWith('pov_')) {
    return (
      <DriverPOVSceneSVG
        presetId={presetId}
        signCode={signCode}
        subPlaque={subPlaque}
        maneuverBadge={maneuverBadge}
        className={className}
      />
    );
  }

  const renderScene = () => {
    switch (presetId) {
      case 'cockpit_blind_spot':
      case 'cockpit_seat_mirror': {
        const isBlindSpot = presetId === 'cockpit_blind_spot';
        return (
          <g>
            {/* Sky & road inside windshield */}
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsGrassBg)`} />
            <rect x="0" y="0" width="440" height="105" fill={`url(#${uid}_tsSkyGrad)`} />
            <circle cx="382" cy="28" r="13" fill="#FEF9C3" opacity="0.9" />
            <ellipse cx="82" cy="30" rx="26" ry="9" fill="#FFFFFF" opacity="0.7" />
            <rect x="34" y="84" width="22" height="20" fill="#E11D48" opacity="0.5" />
            <polygon points="32,84 45,74 58,84" fill="#9F1239" opacity="0.6" />
            <polygon points="110,105 330,105 440,210 0,210" fill={`url(#${uid}_tsAsphalt)`} />
            <line x1="220" y1="105" x2="220" y2="210" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="10 8" />
            {/* Blue bike lane on right */}
            <polygon points="315,105 350,105 440,190 400,210" fill="#0284C7" opacity="0.85" />
            {/* Dashboard */}
            <path d="M 0 185 Q 220 165 440 185 L 440 240 L 0 240 Z" fill="#18181B" />
            <path d="M 0 185 Q 220 165 440 185" fill="none" stroke="#52525B" strokeWidth="1.5" opacity="0.7" />
            {/* Steering wheel */}
            <circle cx="145" cy="222" r="46" fill="none" stroke="#3F3F46" strokeWidth="10" />
            <circle cx="145" cy="222" r="14" fill="#27272A" />
            {/* Center rearview mirror */}
            <rect x="168" y="14" width="104" height="32" rx="8" fill="#0F172A" stroke="#71717A" strokeWidth="2.5" />
            <rect x="174" y="19" width="92" height="22" rx="4" fill="#334155" />
            <rect x="208" y="25" width="22" height="11" rx="2" fill="#94A3B8" />
            <rect x="176" y="48" width="88" height="17" rx="8.5" fill="#0F172A" fillOpacity="0.85" />
            <text x="220" y="59.5" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700">
              1. Bakspejl
            </text>
            {/* Right side mirror */}
            <rect x="336" y="102" width="84" height="44" rx="8" fill="#0F172A" stroke="#71717A" strokeWidth="2.5" />
            <rect x="342" y="108" width="72" height="32" rx="4" fill="#334155" />
            <rect x="345" y="114" width="12" height="22" rx="2" fill="#0D9488" />
            <rect x="335" y="149" width="86" height="17" rx="8.5" fill="#0F172A" fillOpacity="0.85" />
            <text x="378" y="160.5" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700">
              2. Sidespejl
            </text>
            {isBlindSpot ? (
              <g>
                {/* Blind spot cyclist badge */}
                <rect x="298" y="168" width="136" height="26" rx="13" fill="#DC2626" stroke="#FFFFFF" strokeOpacity="0.25" />
                <text x="366" y="184" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
                  3. SKULDERKIG! (Cyklist)
                </text>
                <circle cx="385" cy="84" r="16" fill="#FEF08A" stroke="#DC2626" strokeWidth="2.5" />
                <text x="385" y="88.5" textAnchor="middle" fill="#DC2626" fontSize="12" fontWeight="900">
                  !
                </text>
              </g>
            ) : (
              <g>
                {/* Headrest alignment callout */}
                <rect x="16" y="16" width="136" height="42" rx="10" fill="#0F172A" fillOpacity="0.9" stroke="#38BDF8" strokeWidth="1.6" />
                <text x="84" y="34" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
                  Nakkestøtte =
                </text>
                <text x="84" y="49" textAnchor="middle" fill="#5EEAD4" fontSize="10" fontWeight="700">
                  hovedets top
                </text>
              </g>
            )}
          </g>
        );
      }

      case 'curb_departure':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsGrassBg)`} />
            <TreeTop x={28} y={145} r={20} />
            <TreeTop x={418} y={55} r={18} />
            <TreeTop x={418} y={185} r={16} />
            <rect x="65" y="0" width="310" height="240" fill={`url(#${uid}_tsAsphalt)`} />
            {/* Cykelsti */}
            <rect x="315" y="0" width="44" height="240" fill="#0284C7" opacity="0.85" />
            {/* Curb / sidewalk */}
            <rect x="359" y="0" width="32" height="240" fill="#E4E4E7" />
            <line x1="190" y1="0" x2="190" y2="240" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="14 10" />
            {/* Parked car pulling out */}
            <TopCar x="288" y="162" angle={-14} isPlayer blinkLeft />
            <path d="M 278 134 Q 256 105 244 82" fill="none" stroke="#5EEAD4" strokeWidth="3" strokeDasharray="5 4" />
            {/* Approaching car + cyclist */}
            <TopCar x="242" y="210" color="#64748B" />
            <CyclistTop x="337" y="205" />
            <rect x="12" y="14" width="164" height="44" rx="10" fill="#0F172A" fillOpacity="0.9" stroke="#FFFFFF" strokeOpacity="0.2" />
            <text x="94" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
              Igangsætning fra kantsten
            </text>
            <text x="94" y="48" textAnchor="middle" fill="#FDE047" fontSize="9.5" fontWeight="600">
              Vigepligt for bil + cyklist!
            </text>
          </g>
        );

      case 'following_distance_2s':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill="#BBF7D0" opacity="0.3" />
            <rect x="0" y="62" width="440" height="116" fill="#3F3F46" />
            <line x1="0" y1="120" x2="440" y2="120" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="16 12" />
            {/* Reference pole */}
            <rect x="275" y="34" width="8" height="34" fill="#71717A" />
            <circle cx="279" cy="34" r="6" fill="#FACC15" />
            <line x1="279" y1="62" x2="279" y2="178" stroke="#FACC15" strokeWidth="2" strokeDasharray="4 4" />
            {/* Cars */}
            <TopCar x="320" y="148" angle={90} color="#71717A" label="BIL" brakeLights />
            <TopCar x="115" y="148" angle={90} isPlayer />
            {/* 2s brace */}
            <line x1="150" y1="95" x2="279" y2="95" stroke="#38BDF8" strokeWidth="3" />
            <rect x="160" y="75" width="108" height="22" rx="6" fill="#0F172A" />
            <text x="214" y="89" textAnchor="middle" fill="#38BDF8" fontSize="10.5" fontWeight="800">
              Min. 2 sekunder!
            </text>
            <rect x="16" y="190" width="408" height="36" rx="8" fill="#18181B" opacity="0.9" />
            <text x="220" y="212" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="700">
              2× fart (40 → 80 km/t) = 2× reaktionslængde, men 4× bremselængde!
            </text>
          </g>
        );

      case 'u_turn_city':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill="#E4E4E7" />
            <rect x="0" y="55" width="440" height="130" fill="#3F3F46" />
            <line x1="0" y1="120" x2="440" y2="120" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="14 10" />
            {/* U-turn arrow */}
            <path
              d="M 185 152 L 220 152 A 30 30 0 0 0 220 90 L 155 90"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="4"
              strokeDasharray="6 4"
            />
            <polygon points="160,82 145,90 160,98" fill="#F59E0B" />
            <TopCar x="155" y="152" angle={90} isPlayer blinkLeft />
            <TopCar x="340" y="88" angle={-90} color="#EF4444" label="MOD" />
            <rect x="16" y="12" width="245" height="32" rx="7" fill="#18181B" />
            <text x="138" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="700">
              Vending / bakning: Aldrig til fare eller ulempe
            </text>
          </g>
        );

      case 'intersection_hajtaender':
      case 'intersection_hojre': {
        const isHajtander = presetId === 'intersection_hajtaender';
        return (
          <g>
            {/* Grass quadrants + Nordic trees */}
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsGrassBg)`} />
            <TreeTop x={44} y={36} r={20} />
            <TreeTop x={392} y={40} r={18} />
            <TreeTop x={402} y={205} r={22} />
            <TreeTop x={46} y={204} r={18} />
            {/* Cross roads */}
            <rect x="0" y="75" width="440" height="90" fill={`url(#${uid}_tsAsphalt)`} />
            <rect x="165" y="0" width="110" height="240" fill={`url(#${uid}_tsAsphalt)`} />
            <line x1="0" y1="120" x2="165" y2="120" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="10 8" />
            <line x1="275" y1="120" x2="440" y2="120" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="10 8" />
            <line x1="220" y1="0" x2="220" y2="75" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="10 8" />
            <line x1="220" y1="165" x2="220" y2="240" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="10 8" />

            {isHajtander ? (
              <>
                <HajtaenderRow x1={222} y1={165} count={3} horizontal />
                <g transform="translate(290, 165) scale(0.45)">
                  <DanishRoadSignSVG code="B11" size={110} />
                </g>
                <TopCar x="100" y="142" angle={90} color="#E11D48" label="1" />
                <TopCar x="345" y="98" angle={-90} color="#E11D48" label="1" />
                <TopCar x="247" y="205" angle={0} isPlayer />
              </>
            ) : (
              <>
                {/* Unmarked equal intersection */}
                <TopCar x="247" y="202" angle={0} isPlayer />
                <TopCar x="345" y="98" angle={-90} color="#16A34A" label="HØJRE" />
                <TopCar x="95" y="142" angle={90} color="#71717A" label="VENSTRE" />
                {/* Priority arc */}
                <path d="M 305 100 Q 275 100 265 150" fill="none" stroke="#FACC15" strokeWidth="3" strokeDasharray="5 4" />
                <rect x="12" y="12" width="142" height="44" rx="8" fill="#18181B" opacity="0.9" />
                <text x="83" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
                  Ingen skilte/striber
                </text>
                <text x="83" y="45" textAnchor="middle" fill="#4ADE80" fontSize="10" fontWeight="800">
                  → HØJREVIGEPLIGT
                </text>
              </>
            )}
          </g>
        );
      }

      case 'driveway_overkoersel':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsGrassBg)`} />
            <TreeTop x={42} y={208} r={18} />
            <TreeTop x={398} y={208} r={18} />
            {/* Main road top */}
            <rect x="0" y="24" width="440" height="96" fill={`url(#${uid}_tsAsphalt)`} />
            <line x1="0" y1="72" x2="440" y2="72" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="12 10" />
            {/* Cykelsti */}
            <rect x="0" y="120" width="440" height="24" fill="#0284C7" opacity="0.86" />
            {/* Sidewalk */}
            <rect x="0" y="144" width="440" height="24" fill="#E4E4E7" stroke="#A1A1AA" strokeWidth="1" />
            {/* Driveway / P-plads */}
            <rect x="175" y="168" width="90" height="72" fill="#64748B" />
            <text x="342" y="206" textAnchor="middle" fill="#1E293B" fontSize="11" fontWeight="700">
              P-PLADS / GÅRD
            </text>
            <TopCar x="220" y="202" isPlayer />
            <CyclistTop x="120" y="132" angle={90} />
            <TopCar x="350" y="96" angle={-90} color="#E11D48" label="BIL" />
            <rect x="14" y="182" width="150" height="44" rx="10" fill="#0F172A" fillOpacity="0.92" stroke="#FFFFFF" strokeOpacity="0.2" />
            <text x="89" y="200" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700">
              Over fortov / kantsten
            </text>
            <text x="89" y="216" textAnchor="middle" fill="#F87171" fontSize="9.5" fontWeight="800">
              Ubetinget vigepligt!
            </text>
          </g>
        );

      case 'rundkoersel_entry':
      case 'rundkoersel_exit_cyclist': {
        const isExit = presetId === 'rundkoersel_exit_cyclist';
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsGrassBg)`} />
            <TreeTop x={46} y={40} r={18} />
            <TreeTop x={392} y={40} r={18} />
            <TreeTop x={392} y={200} r={18} />
            {/* Road arms */}
            <rect x="175" y="0" width="90" height="240" fill={`url(#${uid}_tsAsphalt)`} />
            <rect x="0" y="80" width="440" height="80" fill={`url(#${uid}_tsAsphalt)`} />
            {/* Outer roundabout ring */}
            <circle cx="220" cy="120" r="88" fill={`url(#${uid}_tsAsphalt)`} />
            {/* Cykelsti around roundabout */}
            <circle cx="220" cy="120" r="78" fill="none" stroke="#0284C7" strokeWidth="14" opacity="0.8" />
            {/* Inner island */}
            <circle cx="220" cy="120" r="36" fill="#22C55E" stroke="#FFFFFF" strokeWidth="3" />
            {isExit ? (
              <>
                <TopCar x="242" y="170" angle={70} isPlayer blinkRight />
                <CyclistTop x="294" y="138" angle={12} />
                <path d="M 252 162 Q 295 145 340 135" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray="5 4" />
                <rect x="12" y="12" width="150" height="44" rx="8" fill="#18181B" opacity="0.9" />
                <text x="87" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700">
                  Udkørsel + Blink højre
                </text>
                <text x="87" y="45" textAnchor="middle" fill="#38BDF8" fontSize="9.5" fontWeight="700">
                  Skulderkig for cyklist!
                </text>
              </>
            ) : (
              <>
                <HajtaenderRow x1={222} y1={198} count={3} horizontal />
                <TopCar x="242" y="216" angle={0} isPlayer />
                <TopCar x="165" y="120" angle={180} color="#EF4444" label="I RING" />
                <CyclistTop x="220" y="198" angle={90} />
                <g transform="translate(290, 178) scale(0.45)">
                  <DanishRoadSignSVG code="D12" size={110} />
                </g>
              </>
            )}
          </g>
        );
      }

      case 'fletning_b15':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsGrassBg)`} />
            <TreeTop x={55} y={32} r={18} />
            <TreeTop x={385} y={208} r={18} />
            {/* Merging road shape */}
            <polygon points="0,70 250,70 440,95 440,145 250,170 0,170" fill={`url(#${uid}_tsAsphalt)`} />
            {/* Dashed line ends early -> fletning! */}
            <line x1="0" y1="120" x2="175" y2="120" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="12 10" />
            <TopCar x="125" y="146" angle={90} isPlayer />
            <TopCar x="165" y="94" angle={90} color="#16A34A" label="1" />
            <TopCar x="65" y="94" angle={90} color="#71717A" label="2" />
            <path d="M 190 98 L 280 120" fill="none" stroke="#4ADE80" strokeWidth="3" strokeDasharray="5 4" />
            <path d="M 155 146 L 235 124" fill="none" stroke="#60A5FA" strokeWidth="3" strokeDasharray="5 4" />
            <g transform="translate(335, 16) scale(0.55)">
              <DanishRoadSignSVG code="B15" size={110} />
            </g>
            <rect x="14" y="188" width="295" height="36" rx="8" fill="#18181B" />
            <text x="161" y="210" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
              Ingen stribe = FLETNING (lynlås). Over stribe = Vognbaneskift!
            </text>
          </g>
        );

      case 'narrow_bridge_b18':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill="#E0F2FE" />
            {/* Water under narrow bridge */}
            <rect x="160" y="0" width="120" height="240" fill="#38BDF8" opacity="0.55" />
            {/* Narrow road */}
            <rect x="0" y="75" width="150" height="90" fill="#3F3F46" />
            <rect x="150" y="95" width="140" height="50" fill="#52525B" stroke="#D4D4D8" strokeWidth="4" />
            <rect x="290" y="75" width="150" height="90" fill="#3F3F46" />
            <TopCar x="80" y="142" angle={90} isPlayer />
            <TopCar x="315" y="120" angle={-90} color="#16A34A" label="MOD" />
            <g transform="translate(18, 12) scale(0.52)">
              <DanishRoadSignSVG code="B18" size={110} />
            </g>
            <g transform="translate(362, 12) scale(0.52)">
              <DanishRoadSignSVG code="B19" size={110} />
            </g>
          </g>
        );

      case 'right_turn_cykelsti':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsTownBg)`} />
            <TreeTop x={48} y={202} r={19} />
            <TreeTop x={388} y={202} r={19} />
            {/* Roads */}
            <rect x="155" y="0" width="130" height="240" fill={`url(#${uid}_tsAsphalt)`} />
            <rect x="0" y="70" width="440" height="90" fill={`url(#${uid}_tsAsphalt)`} />
            {/* Cykelsti */}
            <rect x="255" y="0" width="28" height="240" fill="#0284C7" opacity="0.85" />
            <line x1="255" y1="0" x2="255" y2="70" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="255" y1="160" x2="255" y2="240" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="205" y1="0" x2="205" y2="70" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="10 8" />
            <line x1="205" y1="160" x2="205" y2="240" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="10 8" />
            {/* Turning player car */}
            <TopCar x="230" y="185" isPlayer blinkRight />
            <path d="M 230 155 Q 235 125 320 128" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeDasharray="6 4" />
            {/* Cyclist going straight */}
            <CyclistTop x="269" y="175" />
            <line x1="269" y1="160" x2="269" y2="45" stroke="#38BDF8" strokeWidth="3.5" />
            <polygon points="262,50 269,36 276,50" fill="#38BDF8" />
            <rect x="12" y="12" width="132" height="44" rx="8" fill="#18181B" />
            <text x="78" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700">
              Cyklist ligeud =
            </text>
            <text x="78" y="45" textAnchor="middle" fill="#38BDF8" fontSize="9.5" fontWeight="800">
              ALTID FØRST!
            </text>
          </g>
        );

      case 'bus_stop_byzone':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsTownBg)`} />
            <TreeTop x={48} y={208} r={16} />
            <TreeTop x={388} y={208} r={18} />
            <rect x="0" y="65" width="440" height="110" fill={`url(#${uid}_tsAsphalt)`} />
            <line x1="0" y1="120" x2="440" y2="120" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="12 10" />
            {/* Bus */}
            <rect x="215" y="138" width="96" height="34" rx="6" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
            <text x="263" y="159" textAnchor="middle" fill="#18181B" fontSize="11" fontWeight="800">
              BUS
            </text>
            {/* Bus left blinker */}
            <circle cx="215" cy="140" r="5" fill="#EA580C" />
            <circle cx="311" cy="140" r="5" fill="#EA580C" />
            <path d="M 295 140 Q 325 130 355 138" fill="none" stroke="#FACC15" strokeWidth="3" strokeDasharray="5 4" />
            <TopCar x="125" y="148" angle={90} isPlayer brakeLights />
            <g transform="translate(18, 10) scale(0.45)">
              <DanishRoadSignSVG code="E55" size={110} />
            </g>
            <rect x="135" y="14" width="285" height="38" rx="8" fill="#18181B" />
            <text x="277" y="31" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
              I byzone: Hold tilbage for rutebus fra stoppested!
            </text>
            <text x="277" y="45" textAnchor="middle" fill="#A1A1AA" fontSize="9.5">
              Uden for byzone (80 km/t): bussen har vigepligt
            </text>
          </g>
        );

      case 'fodgaengerfelt_zebra':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsTownBg)`} />
            <TreeTop x={402} y={56} r={19} />
            <TreeTop x={402} y={196} r={19} />
            <rect x="85" y="0" width="270" height="240" fill={`url(#${uid}_tsAsphalt)`} />
            <line x1="220" y1="0" x2="220" y2="240" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="12 10" />
            {/* Zebra stripes */}
            {[95, 125, 155, 185, 215, 245, 275, 305, 335].map((x) => (
              <rect key={x} x={x} y="82" width="16" height="44" rx="2" fill="#FFFFFF" />
            ))}
            {/* Neighbor car stopping */}
            <TopCar x="255" y="165" color="#71717A" brakeLights label="STOP" />
            <TopCar x="315" y="182" isPlayer brakeLights />
            {/* Pedestrian hidden behind car */}
            <PedestrianTop x="258" y="104" label="Fodgænger" />
            <g transform="translate(16, 16) scale(0.55)">
              <DanishRoadSignSVG code="E17" size={110} />
            </g>
            <rect x="16" y="186" width="168" height="38" rx="8" fill="#991B1B" />
            <text x="100" y="209" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">
              OVERHALING FORBUDT!
            </text>
          </g>
        );

      case 'children_school_a22':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsGrassBg)`} />
            <TreeTop x={46} y={136} r={18} />
            <TreeTop x={392} y={56} r={20} />
            <TreeTop x={392} y={196} r={18} />
            <rect x="100" y="0" width="240" height="240" fill={`url(#${uid}_tsAsphalt)`} />
            <line x1="220" y1="0" x2="220" y2="240" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="10 8" />
            <TopCar x="312" y="110" color="#64748B" />
            <TopCar x="312" y="178" color="#64748B" />
            {/* Child running between parked cars */}
            <circle cx="290" cy="144" r="7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M 282 144 L 250 144" stroke="#EF4444" strokeWidth="3" strokeDasharray="4 3" />
            <TopCar x="255" y="195" isPlayer brakeLights />
            <g transform="translate(14, 16) scale(0.6)">
              <DanishRoadSignSVG code="A22" size={110} />
            </g>
            <rect x="14" y="180" width="154" height="42" rx="10" fill="#0F172A" fillOpacity="0.92" stroke="#FFFFFF" strokeOpacity="0.2" />
            <text x="91" y="198" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700">
              Børn mellem biler:
            </text>
            <text x="91" y="213" textAnchor="middle" fill="#FACC15" fontSize="9.5" fontWeight="800">
              Sænk farten + beredskab!
            </text>
          </g>
        );

      case 'road_markings_lines':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill="#3F3F46" />
            <rect x="0" y="0" width="440" height="30" fill="#D4D4D8" />
            <rect x="0" y="210" width="440" height="30" fill="#D4D4D8" />
            {/* 1. Vognbanelinje (short dash) */}
            <line x1="15" y1="80" x2="135" y2="80" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="12 16" />
            {/* 2. Varslingslinje (long dash, short gap) */}
            <line x1="145" y1="80" x2="290" y2="80" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="24 8" />
            {/* 3. Spærrelinje (solid) */}
            <line x1="295" y1="80" x2="425" y2="80" stroke="#FFFFFF" strokeWidth="4.5" />
            {/* Labels */}
            <text x="75" y="64" textAnchor="middle" fill="#4ADE80" fontSize="10" fontWeight="700">
              1. Vognbanelinje
            </text>
            <text x="218" y="64" textAnchor="middle" fill="#FACC15" fontSize="10" fontWeight="700">
              2. Varslingslinje
            </text>
            <text x="360" y="64" textAnchor="middle" fill="#F87171" fontSize="10" fontWeight="700">
              3. Spærrelinje
            </text>
            {/* Double line demo */}
            <line x1="40" y1="165" x2="400" y2="165" stroke="#FFFFFF" strokeWidth="4" />
            <line x1="40" y1="175" x2="400" y2="175" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="16 12" />
            <TopCar x="160" y="196" angle={90} isPlayer />
            <rect x="85" y="122" width="270" height="30" rx="6" fill="#18181B" opacity="0.9" />
            <text x="220" y="141" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
              Dobbeltlinje: Den linje NÆRMEST din bane gælder!
            </text>
          </g>
        );

      case 'traffic_light_yellow':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsTownBg)`} />
            <TreeTop x={46} y={196} r={18} />
            <TreeTop x={392} y={196} r={18} />
            <rect x="130" y="0" width="180" height="240" fill={`url(#${uid}_tsAsphalt)`} />
            {/* Stop line */}
            <line x1="220" y1="125" x2="310" y2="125" stroke="#FFFFFF" strokeWidth="6" />
            {/* Traffic light */}
            <rect x="330" y="25" width="42" height="105" rx="10" fill="#18181B" />
            <circle cx="351" cy="48" r="11" fill="#450A0A" />
            <circle cx="351" cy="77" r="11" fill="#FACC15" />
            <circle cx="351" cy="106" r="11" fill="#052E16" />
            <TopCar x="265" y="185" isPlayer brakeLights />
            <line x1="265" y1="158" x2="265" y2="128" stroke="#FACC15" strokeWidth="2.5" strokeDasharray="4 3" />
            <text x="295" y="148" fill="#FACC15" fontSize="10" fontWeight="800">
              35 m
            </text>
            <rect x="12" y="16" width="110" height="90" rx="8" fill="#18181B" />
            <text x="67" y="34" textAnchor="middle" fill="#FACC15" fontSize="10" fontWeight="800">
              HIERARKI:
            </text>
            <text x="67" y="51" textAnchor="middle" fill="#FFFFFF" fontSize="9.5">
              1. Politiets tegn
            </text>
            <text x="67" y="66" textAnchor="middle" fill="#FFFFFF" fontSize="9.5">
              2. Lyssignal
            </text>
            <text x="67" y="81" textAnchor="middle" fill="#FFFFFF" fontSize="9.5">
              3. Færdselstavler
            </text>
            <text x="67" y="96" textAnchor="middle" fill="#FFFFFF" fontSize="9.5">
              4. Færdselsregler
            </text>
          </g>
        );

      case 'railway_crossing':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsGrassBg)`} />
            <TreeTop x={48} y={32} r={16} />
            <TreeTop x={392} y={32} r={16} />
            <TreeTop x={392} y={204} r={18} />
            {/* Tracks */}
            <rect x="0" y="58" width="440" height="44" fill="#78716C" />
            <line x1="0" y1="68" x2="440" y2="68" stroke="#18181B" strokeWidth="4" />
            <line x1="0" y1="92" x2="440" y2="92" stroke="#18181B" strokeWidth="4" />
            {/* Road */}
            <rect x="160" y="0" width="120" height="240" fill="#3F3F46" opacity="0.92" />
            <line x1="0" y1="68" x2="440" y2="68" stroke="#D4D4D8" strokeWidth="3" />
            <line x1="0" y1="92" x2="440" y2="92" stroke="#D4D4D8" strokeWidth="3" />
            {/* Stop line */}
            <line x1="220" y1="128" x2="280" y2="128" stroke="#FFFFFF" strokeWidth="5" />
            {/* Blinking red light */}
            <rect x="295" y="106" width="24" height="46" rx="4" fill="#18181B" />
            <circle cx="307" cy="121" r="7" fill="#EF4444" />
            <circle cx="307" cy="138" r="5" fill="#FFFFFF" />
            <TopCar x="250" y="185" isPlayer brakeLights />
            <rect x="14" y="140" width="136" height="44" rx="8" fill="#991B1B" />
            <text x="82" y="159" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">
              Rødt blink = STOP!
            </text>
            <text x="82" y="174" textAnchor="middle" fill="#FECACA" fontSize="9">
              Vent til lyset er slukket
            </text>
          </g>
        );

      case 'motorway_trailer':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill="#D9F99D" opacity="0.3" />
            <rect x="0" y="65" width="440" height="110" fill="#3F3F46" />
            <line x1="0" y1="120" x2="440" y2="120" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="14 10" />
            {/* Car + Trailer */}
            <TopCar x="245" y="148" angle={90} isPlayer />
            <line x1="205" y1="148" x2="218" y2="148" stroke="#E4E4E7" strokeWidth="3" />
            <rect x="145" y="133" width="60" height="30" rx="4" fill="#94A3B8" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="175" y="151" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="800">
              TRAILER
            </text>
            <g transform="translate(18, 12) scale(0.45)">
              <DanishRoadSignSVG code="E43" size={110} />
            </g>
            <g transform="translate(82, 12) scale(0.45)">
              <DanishRoadSignSVG code="E42" size={110} />
            </g>
            <rect x="150" y="14" width="274" height="42" rx="8" fill="#18181B" />
            <text x="287" y="31" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
              Motortrafikvej (blå E43): max 80 km/t
            </text>
            <text x="287" y="46" textAnchor="middle" fill="#38BDF8" fontSize="9.5" fontWeight="700">
              Personbil + trailer: max 80 km/t (100 med Tempo 100)
            </text>
          </g>
        );

      case 'motorway_merge_nodspor':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill="#D9F99D" opacity="0.3" />
            {/* Highway lanes */}
            <rect x="0" y="55" width="440" height="100" fill="#3F3F46" />
            {/* Emergency lane (nødspor) */}
            <rect x="0" y="155" width="200" height="26" fill="#52525B" />
            <line x1="0" y1="155" x2="200" y2="155" stroke="#FFFFFF" strokeWidth="3" />
            {/* Acceleration lane */}
            <polygon points="0,210 210,155 440,155 440,185 0,235" fill="#3F3F46" />
            <line x1="0" y1="105" x2="440" y2="105" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="16 12" />
            <line x1="200" y1="155" x2="320" y2="155" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="8 8" />
            {/* Cars */}
            <TopCar x="160" y="130" angle={90} color="#71717A" />
            <TopCar x="310" y="80" angle={90} color="#71717A" />
            <TopCar x="135" y="192" angle={78} isPlayer blinkLeft />
            <path d="M 175 186 Q 230 175 275 135" fill="none" stroke="#60A5FA" strokeWidth="3" strokeDasharray="6 4" />
            <g transform="translate(16, 10) scale(0.42)">
              <DanishRoadSignSVG code="E42" size={110} />
            </g>
            <text x="90" y="172" textAnchor="middle" fill="#FCA5A5" fontSize="9" fontWeight="800">
              NØDSPOR (Kun havari!)
            </text>
          </g>
        );

      case 'overtaking_right_exception':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill="#E4E4E7" />
            <rect x="95" y="0" width="250" height="240" fill="#3F3F46" />
            <rect x="0" y="65" width="440" height="90" fill="#3F3F46" />
            <line x1="220" y1="0" x2="220" y2="65" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="10 8" />
            <line x1="220" y1="155" x2="220" y2="240" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="10 8" />
            {/* Front car turning left */}
            <TopCar x="242" y="110" angle={-15} color="#71717A" blinkLeft />
            <path d="M 235 80 Q 220 55 130 92" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray="5 4" />
            {/* Player passing on the right */}
            <TopCar x="305" y="165" isPlayer />
            <path d="M 305 135 L 305 35" fill="none" stroke="#4ADE80" strokeWidth="3" strokeDasharray="5 4" />
            <polygon points="299,40 305,26 311,40" fill="#4ADE80" />
            <rect x="10" y="176" width="150" height="48" rx="8" fill="#18181B" />
            <text x="85" y="195" textAnchor="middle" fill="#4ADE80" fontSize="9.5" fontWeight="800">
              Forbikørsel til højre OK:
            </text>
            <text x="85" y="210" textAnchor="middle" fill="#FFFFFF" fontSize="9">
              Når forankørende blinker venstre!
            </text>
          </g>
        );

      case 'overtaking_hill_curve':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsSkyGrad)`} />
            {/* Hill profile */}
            <path d="M 0 185 Q 220 65 440 185 L 440 240 L 0 240 Z" fill={`url(#${uid}_tsGrassBg)`} />
            <path d="M 0 190 Q 220 80 440 190" fill="none" stroke="#3F3F46" strokeWidth="26" />
            <path d="M 0 190 Q 220 80 440 190" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="10 8" />
            <TopCar x="125" y="150" angle={68} isPlayer />
            <TopCar x="200" y="132" angle={82} color="#52525B" label="LAST" />
            <TopCar x="325" y="148" angle={-68} color="#EF4444" label="?" />
            <g transform="translate(18, 16) scale(0.55)">
              <DanishRoadSignSVG code="C51" size={110} />
            </g>
            <rect x="115" y="18" width="305" height="38" rx="8" fill="#18181B" />
            <text x="267" y="34" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
              C51: Forbudt for biler (tohjulede cykler må overhales)
            </text>
            <text x="267" y="48" textAnchor="middle" fill="#F87171" fontSize="9.5" fontWeight="700">
              Aldrig overhale op mod bakketop uden frit udsyn!
            </text>
          </g>
        );

      case 'parking_5m_10m_rules':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsTownBg)`} />
            <TreeTop x={42} y={208} r={16} />
            <TreeTop x={392} y={145} r={19} />
            <TreeTop x={392} y={205} r={16} />
            <rect x="145" y="0" width="150" height="240" fill={`url(#${uid}_tsAsphalt)`} />
            <rect x="0" y="30" width="440" height="70" fill={`url(#${uid}_tsAsphalt)`} />
            {/* Zebra */}
            {[160, 185, 210, 235, 260].map((x) => (
              <rect key={x} x={x} y="106" width="14" height="32" rx="2" fill="#FFFFFF" />
            ))}
            {/* 5m danger zone */}
            <rect x="270" y="138" width="25" height="40" fill="#EF4444" opacity="0.45" />
            <line x1="302" y1="138" x2="302" y2="178" stroke="#EF4444" strokeWidth="2.5" />
            <text x="326" y="162" fill="#DC2626" fontSize="11" fontWeight="800">
              5 m
            </text>
            {/* 10m junction zone */}
            <line x1="125" y1="100" x2="125" y2="188" stroke="#D97706" strokeWidth="2.5" />
            <text x="84" y="148" fill="#B45309" fontSize="11" fontWeight="800">
              10 m (kryds)
            </text>
            <TopCar x="275" y="210" isPlayer />
            <rect x="14" y="184" width="126" height="42" rx="10" fill="#0F172A" fillOpacity="0.92" stroke="#FFFFFF" strokeOpacity="0.2" />
            <text x="77" y="201" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700">
              5 m før felt/cykelsti
            </text>
            <text x="77" y="216" textAnchor="middle" fill="#FACC15" fontSize="9.5" fontWeight="700">
              10 m fra vejskæring
            </text>
          </g>
        );

      case 'parking_bus_driveway':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsTownBg)`} />
            <TreeTop x={392} y={202} r={19} />
            <rect x="0" y="45" width="440" height="105" fill={`url(#${uid}_tsAsphalt)`} />
            <line x1="0" y1="97" x2="440" y2="97" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="12 10" />
            {/* Driveway on bottom */}
            <rect x="65" y="150" width="75" height="90" fill="#64748B" />
            <text x="102" y="198" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700">
              INDKØRSEL
            </text>
            <TopCar x="102" y="128" angle={90} isPlayer label="≤3m" />
            {/* Bus stop zone */}
            <rect x="260" y="150" width="12" height="35" fill="#0284C7" />
            <circle cx="266" cy="150" r="8" fill="#FACC15" stroke="#18181B" strokeWidth="1.5" />
            <line x1="190" y1="158" x2="266" y2="158" stroke="#EF4444" strokeWidth="3" />
            <line x1="266" y1="158" x2="342" y2="158" stroke="#EF4444" strokeWidth="3" />
            <text x="228" y="176" textAnchor="middle" fill="#DC2626" fontSize="10" fontWeight="800">
              12 m
            </text>
            <text x="304" y="176" textAnchor="middle" fill="#DC2626" fontSize="10" fontWeight="800">
              12 m
            </text>
            <rect x="14" y="10" width="412" height="28" rx="10" fill="#0F172A" fillOpacity="0.92" stroke="#FFFFFF" strokeOpacity="0.2" />
            <text x="220" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
              Indkørsel: standsning OK (≤3 min). Busstop: 12 m før/efter forbudt!
            </text>
          </g>
        );

      case 'parking_oneway_ensrettet':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsTownBg)`} />
            <TreeTop x={388} y={48} r={20} />
            <TreeTop x={388} y={192} r={20} />
            <rect x="110" y="0" width="220" height="240" fill={`url(#${uid}_tsAsphalt)`} />
            {/* One-way arrows */}
            <path d="M 220 190 L 220 50" stroke="#FFFFFF" strokeWidth="5" strokeOpacity="0.45" />
            <polygon points="208,58 220,34 232,58" fill="#FFFFFF" fillOpacity="0.45" />
            {/* Legal parking on BOTH left and right */}
            <TopCar x="138" y="120" isPlayer label="OK" />
            <TopCar x="302" y="120" color="#16A34A" label="OK" />
            <g transform="translate(18, 18) scale(0.55)">
              <DanishRoadSignSVG code="E19" size={110} />
            </g>
            <rect x="14" y="174" width="84" height="46" rx="10" fill="#0F172A" fillOpacity="0.92" stroke="#FFFFFF" strokeOpacity="0.2" />
            <text x="56" y="194" textAnchor="middle" fill="#4ADE80" fontSize="9.5" fontWeight="800">
              Ensrettet:
            </text>
            <text x="56" y="209" textAnchor="middle" fill="#FFFFFF" fontSize="9">
              Venstre side OK!
            </text>
          </g>
        );

      case 'night_driving_lights':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill="#09090B" />
            <polygon points="150,70 290,70 420,240 20,240" fill="#27272A" />
            <line x1="220" y1="70" x2="220" y2="240" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="10 10" />
            {/* Oncoming car */}
            <circle cx="192" cy="94" r="5" fill="#FEF08A" />
            <circle cx="204" cy="94" r="5" fill="#FEF08A" />
            {/* Player beam */}
            <polygon points="246,195 292,195 340,95 215,95" fill="#FEF08A" opacity="0.22" />
            <TopCar x="268" y="202" isPlayer />
            <rect x="14" y="14" width="210" height="44" rx="8" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
            <text x="119" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700">
              Blænd ned: 200–300 m (modkørende)
            </text>
            <text x="119" y="47" textAnchor="middle" fill="#38BDF8" fontSize="9.5" fontWeight="700">
              100–150 m (forankørende)
            </text>
          </g>
        );

      case 'fog_and_aquaplaning':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill="#CBD5E1" />
            <rect x="90" y="0" width="260" height="240" fill="#475569" />
            {/* Water puddle */}
            <ellipse cx="255" cy="142" rx="45" ry="22" fill="#38BDF8" opacity="0.65" />
            <TopCar x="255" y="185" isPlayer />
            {/* Fog overlay */}
            <rect x="0" y="0" width="440" height="90" fill="#F1F5F9" opacity="0.72" />
            <rect x="14" y="14" width="412" height="44" rx="8" fill="#0F172A" opacity="0.9" />
            <text x="220" y="32" textAnchor="middle" fill="#38BDF8" fontSize="10" fontWeight="800">
              Akvaplaning: Slip speederen + hold rattet lige!
            </text>
            <text x="220" y="47" textAnchor="middle" fill="#FFFFFF" fontSize="9.5">
              Tågebaglygte KUN ved tæt tåge/kraftig nedbør (sluk når bil er bag dig)
            </text>
          </g>
        );

      case 'alcohol_klip_law':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill="#18181B" />
            <rect x="20" y="24" width="124" height="190" rx="12" fill="#27272A" stroke="#EF4444" strokeWidth="2" />
            <text x="82" y="64" textAnchor="middle" fill="#EF4444" fontSize="26" fontWeight="800">
              0,50‰
            </text>
            <text x="82" y="92" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="700">
              Promillegrænse
            </text>
            <text x="82" y="114" textAnchor="middle" fill="#A1A1AA" fontSize="9.5">
              ≥ 0,51‰ = Spiritus
            </text>
            <text x="82" y="132" textAnchor="middle" fill="#FCA5A5" fontSize="9.5">
              &gt; 2,00‰ = Konfiskation
            </text>

            <rect x="158" y="24" width="124" height="190" rx="12" fill="#27272A" stroke="#F59E0B" strokeWidth="2" />
            <text x="220" y="64" textAnchor="middle" fill="#F59E0B" fontSize="24" fontWeight="800">
              2 KLIP
            </text>
            <text x="220" y="92" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="700">
              Ny bilist (0–3 år)
            </text>
            <text x="220" y="116" textAnchor="middle" fill="#FDE68A" fontSize="9.5">
              = Kørselsforbud!
            </text>
            <text x="220" y="140" textAnchor="middle" fill="#A1A1AA" fontSize="9">
              Erfaren: 3 klip / 3 år
            </text>

            <rect x="296" y="24" width="124" height="190" rx="12" fill="#27272A" stroke="#38BDF8" strokeWidth="2" />
            <text x="358" y="64" textAnchor="middle" fill="#38BDF8" fontSize="22" fontWeight="800">
              MOBIL
            </text>
            <text x="358" y="92" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="700">
              Håndholdt =
            </text>
            <text x="358" y="116" textAnchor="middle" fill="#BAE6FD" fontSize="9.5">
              1 klip + bøde
            </text>
            <text x="358" y="140" textAnchor="middle" fill="#A1A1AA" fontSize="9">
              Også ved rødt lys!
            </text>
          </g>
        );

      case 'accident_triangle_112':
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill={`url(#${uid}_tsGrassBg)`} />
            <TreeTop x={46} y={204} r={18} />
            <TreeTop x={386} y={204} r={20} />
            <rect x="0" y="60" width="440" height="110" fill={`url(#${uid}_tsAsphalt)`} />
            <line x1="0" y1="115" x2="440" y2="115" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="14 10" />
            {/* Broken car with hazard */}
            <TopCar x="340" y="146" angle={90} color="#EF4444" blinkLeft blinkRight label="STOP" />
            {/* Warning triangle behind */}
            <polygon
              points="115,132 127,154 103,154"
              fill="#FACC15"
              stroke="#EF4444"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <line x1="125" y1="146" x2="310" y2="146" stroke="#FACC15" strokeWidth="2.5" strokeDasharray="5 4" />
            <rect x="155" y="122" width="132" height="22" rx="8" fill="#0F172A" fillOpacity="0.92" />
            <text x="221" y="137" textAnchor="middle" fill="#FACC15" fontSize="10" fontWeight="800">
              50 m (100 m motorvej)
            </text>
            <rect x="16" y="14" width="408" height="32" rx="10" fill="#991B1B" stroke="#FFFFFF" strokeOpacity="0.2" />
            <text x="220" y="34" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="800">
              112 = Personskade / Akut • 114 = Politi (ej akut)
            </text>
          </g>
        );

      case 'fatigue_seatbelt_children':
      default:
        return (
          <g>
            <rect x="0" y="0" width="440" height="240" fill="#1E293B" />
            <rect x="24" y="28" width="184" height="184" rx="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
            <text x="116" y="70" textAnchor="middle" fill="#38BDF8" fontSize="24" fontWeight="800">
              &lt; 135 cm
            </text>
            <text x="116" y="100" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="700">
              Godkendt autostol / pude
            </text>
            <text x="116" y="128" textAnchor="middle" fill="#94A3B8" fontSize="9.5">
              Fører har ansvaret for børn &lt; 15 år
            </text>
            <text x="116" y="148" textAnchor="middle" fill="#FCA5A5" fontSize="9.5">
              Bagudvendt foran = Airbag FRA!
            </text>

            <rect x="232" y="28" width="184" height="184" rx="14" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
            <text x="324" y="70" textAnchor="middle" fill="#F59E0B" fontSize="22" fontWeight="800">
              TRÆTHED
            </text>
            <text x="324" y="100" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="700">
              Hold ind og sov!
            </text>
            <text x="324" y="128" textAnchor="middle" fill="#94A3B8" fontSize="9.5">
              Åbent vindue / høj musik
            </text>
            <text x="324" y="146" textAnchor="middle" fill="#FCA5A5" fontSize="9.5">
              fjerner IKKE mikrosøvn!
            </text>
          </g>
        );
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700/80 dark:bg-zinc-900 ${className}`}>
      <svg viewBox="0 0 440 240" className="h-auto w-full select-none" role="img" aria-label={`Trafiksituation ${presetId}`}>
        <defs>
          <linearGradient id={`${uid}_tsSkyGrad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
          <linearGradient id={`${uid}_tsGrassBg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#DCFCE7" />
            <stop offset="100%" stopColor="#BBF7D0" />
          </linearGradient>
          <linearGradient id={`${uid}_tsTownBg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F4F4F5" />
            <stop offset="100%" stopColor="#E4E4E7" />
          </linearGradient>
          <linearGradient id={`${uid}_tsAsphalt`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>
        {renderScene()}
      </svg>
      {signCode && presetId !== 'intersection_hajtaender' && presetId !== 'rundkoersel_entry' && presetId !== 'fletning_b15' && presetId !== 'narrow_bridge_b18' && presetId !== 'fodgaengerfelt_zebra' && presetId !== 'children_school_a22' && presetId !== 'bus_stop_byzone' && presetId !== 'motorway_trailer' && presetId !== 'motorway_merge_nodspor' && presetId !== 'overtaking_hill_curve' && presetId !== 'parking_oneway_ensrettet' && (
        <div className="absolute right-3 top-3 rounded-lg bg-white/90 p-1.5 shadow-md backdrop-blur dark:bg-zinc-900/90">
          <DanishRoadSignSVG code={signCode} subPlaque={subPlaque} size={56} />
        </div>
      )}
    </div>
  );
};
