import React from 'react';

interface DanishRoadSignSVGProps {
  code: string;
  subPlaque?: string;
  size?: number;
  className?: string;
}

const RED = '#DC2626';
const BLUE = '#0259A5';
const YELLOW = '#FACC15';
const DARK = '#18181B';
const GREEN = '#047857';

const WarningTriangle: React.FC<{ bg?: string; children: React.ReactNode }> = ({
  bg = '#FFFFFF',
  children,
}) => (
  <g>
    <path
      d="M 60 10 L 112 102 Q 115 107 109 107 L 11 107 Q 5 107 8 102 Z"
      fill={RED}
      stroke={RED}
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path
      d="M 60 22 L 101 97 L 19 97 Z"
      fill={bg}
      stroke={bg}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {children}
  </g>
);

const ProhibitionCircle: React.FC<{ bg?: string; children?: React.ReactNode }> = ({
  bg = '#FFFFFF',
  children,
}) => (
  <g>
    <circle cx="60" cy="60" r="52" fill={bg} stroke={RED} strokeWidth="11" />
    {children}
  </g>
);

const MandatoryCircle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g>
    <circle cx="60" cy="60" r="52" fill={BLUE} stroke="#FFFFFF" strokeWidth="3" />
    <circle cx="60" cy="60" r="54" fill="none" stroke={BLUE} strokeWidth="2" />
    {children}
  </g>
);

export const DanishRoadSignSVG: React.FC<DanishRoadSignSVGProps> = ({
  code,
  subPlaque,
  size = 112,
  className = '',
}) => {
  const hasSub = Boolean(subPlaque);
  const viewBoxHeight = hasSub ? 156 : 120;

  const renderSignBody = () => {
    switch (code) {
      // --- A: Warning Triangles ---
      case 'A11': // Farligt vejkryds (højrevigepligt)
        return (
          <WarningTriangle>
            <path d="M 60 44 L 60 88 M 43 67 L 77 67" stroke={DARK} strokeWidth="7" strokeLinecap="round" />
          </WarningTriangle>
        );
      case 'A19': // Lyssignal
        return (
          <WarningTriangle>
            <rect x="52" y="45" width="16" height="44" rx="4" fill={DARK} />
            <circle cx="60" cy="54" r="4.5" fill={RED} />
            <circle cx="60" cy="67" r="4.5" fill={YELLOW} />
            <circle cx="60" cy="80" r="4.5" fill="#16A34A" />
          </WarningTriangle>
        );
      case 'A21': // Cyklister
        return (
          <WarningTriangle>
            <circle cx="48" cy="81" r="8" fill="none" stroke={DARK} strokeWidth="3" />
            <circle cx="74" cy="81" r="8" fill="none" stroke={DARK} strokeWidth="3" />
            <path
              d="M 48 81 L 57 67 L 69 67 L 74 81 M 57 67 L 54 61 M 69 67 L 66 59 L 71 59 M 57 67 L 62 81 L 74 81"
              fill="none"
              stroke={DARK}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </WarningTriangle>
        );
      case 'A22': // Børn
        return (
          <WarningTriangle>
            {/* Child 1 running */}
            <circle cx="51" cy="57" r="4.5" fill={DARK} />
            <path
              d="M 51 62 L 50 75 L 43 89 M 50 75 L 57 89 M 44 69 L 58 67"
              stroke={DARK}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Child 2 */}
            <circle cx="69" cy="61" r="4" fill={DARK} />
            <path
              d="M 69 65 L 68 77 L 63 89 M 68 77 L 75 89 M 62 70 L 74 71"
              stroke={DARK}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </WarningTriangle>
        );
      case 'A31': // Glat vej
        return (
          <WarningTriangle>
            <rect x="52" y="45" width="16" height="10" rx="2" fill={DARK} />
            <path
              d="M 51 58 C 44 68 68 75 49 90 M 69 58 C 76 68 52 75 71 90"
              fill="none"
              stroke={DARK}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </WarningTriangle>
        );
      case 'A43': // Indsnævring af vej
        return (
          <WarningTriangle>
            <path d="M 48 48 L 48 64 L 54 76 L 54 90" fill="none" stroke={DARK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 72 48 L 72 64 L 66 76 L 66 90" fill="none" stroke={DARK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </WarningTriangle>
        );
      case 'A73': // Vejarbejde (Danish yellow warning background)
        return (
          <WarningTriangle bg={YELLOW}>
            <circle cx="63" cy="53" r="4.5" fill={DARK} />
            <path
              d="M 61 58 L 57 73 L 52 89 M 57 73 L 64 89 M 60 63 L 49 71 L 43 85"
              stroke={DARK}
              strokeWidth="3.8"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M 41 85 L 49 89 L 38 91 Z" fill={DARK} />
          </WarningTriangle>
        );
      case 'A99': // Anden fare
        return (
          <WarningTriangle>
            <rect x="56.5" y="46" width="7" height="27" rx="3.5" fill={DARK} />
            <circle cx="60" cy="83" r="4.5" fill={DARK} />
          </WarningTriangle>
        );

      // --- B: Priority ---
      case 'B11': // Ubetinget vigepligt
        return (
          <g>
            <path
              d="M 10 16 L 110 16 Q 114 16 111 21 L 63 105 Q 60 110 57 105 L 9 21 Q 6 16 10 16 Z"
              fill={RED}
              stroke={RED}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M 21 25 L 99 25 L 60 93 Z" fill="#FFFFFF" stroke="#FFFFFF" strokeLinejoin="round" />
          </g>
        );
      case 'B13': // STOP
        return (
          <g>
            <polygon
              points="38,10 82,10 110,38 110,82 82,110 38,110 10,82 10,38"
              fill={RED}
              stroke="#FFFFFF"
              strokeWidth="3"
            />
            <polygon
              points="40,14 80,14 106,40 106,80 80,106 40,106 14,80 14,40"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <text
              x="60"
              y="69"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="27"
              fontWeight="800"
              letterSpacing="1"
            >
              STOP
            </text>
          </g>
        );
      case 'B15': // Sammenfletning
        return (
          <WarningTriangle>
            <path d="M 52 89 L 52 58" stroke={DARK} strokeWidth="5" strokeLinecap="round" />
            <path d="M 46 62 L 52 50 L 58 62 Z" fill={DARK} />
            <path d="M 70 89 L 70 72 L 54 58" fill="none" stroke={DARK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </WarningTriangle>
        );
      case 'B16': // Hovedvej
        return (
          <g transform="rotate(45 60 60)">
            <rect x="20" y="20" width="80" height="80" rx="4" fill="#FFFFFF" stroke={DARK} strokeWidth="2.5" />
            <rect x="33" y="33" width="54" height="54" rx="2" fill={YELLOW} stroke={DARK} strokeWidth="2" />
          </g>
        );
      case 'B17': // Hovedvej ophører
        return (
          <g>
            <g transform="rotate(45 60 60)">
              <rect x="20" y="20" width="80" height="80" rx="4" fill="#FFFFFF" stroke={DARK} strokeWidth="2.5" />
              <rect x="33" y="33" width="54" height="54" rx="2" fill={YELLOW} stroke={DARK} strokeWidth="2" />
            </g>
            <line x1="25" y1="95" x2="95" y2="25" stroke={DARK} strokeWidth="8" strokeLinecap="round" />
          </g>
        );
      case 'B18': // Hold tilbage for modkørende
        return (
          <ProhibitionCircle>
            {/* Red arrow up (you yield) */}
            <path d="M 45 86 L 45 45" stroke={RED} strokeWidth="7" strokeLinecap="round" />
            <path d="M 36 48 L 45 31 L 54 48 Z" fill={RED} />
            {/* Black arrow down (oncoming priority) */}
            <path d="M 75 34 L 75 75" stroke={DARK} strokeWidth="7" strokeLinecap="round" />
            <path d="M 66 72 L 75 89 L 84 72 Z" fill={DARK} />
          </ProhibitionCircle>
        );
      case 'B19': // Modkørende skal holde tilbage
        return (
          <g>
            <rect x="14" y="14" width="92" height="92" rx="10" fill={BLUE} />
            <rect x="18" y="18" width="84" height="84" rx="7" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
            {/* Large white arrow up */}
            <path d="M 70 88 L 70 43" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
            <path d="M 56 46 L 70 26 L 84 46 Z" fill="#FFFFFF" />
            {/* Small red arrow down */}
            <path d="M 40 34 L 40 73" stroke={RED} strokeWidth="6" strokeLinecap="round" />
            <path d="M 32 70 L 40 86 L 48 70 Z" fill={RED} />
          </g>
        );

      // --- C: Prohibition ---
      case 'C11': // Indkørsel forbudt
        return (
          <g>
            <circle cx="60" cy="60" r="52" fill={RED} />
            <rect x="20" y="51" width="80" height="18" rx="2" fill="#FFFFFF" />
          </g>
        );
      case 'C19': // Kørsel i begge retninger forbudt
        return <ProhibitionCircle />;
      case 'C51': // Overhaling forbudt
        return (
          <ProhibitionCircle>
            {/* Left red car overtaking */}
            <rect x="28" y="47" width="26" height="22" rx="5" fill={RED} />
            <rect x="32" y="42" width="18" height="9" rx="3" fill={RED} />
            <circle cx="34" cy="70" r="4" fill={RED} />
            <circle cx="48" cy="70" r="4" fill={RED} />
            {/* Right black car */}
            <rect x="66" y="47" width="26" height="22" rx="5" fill={DARK} />
            <rect x="70" y="42" width="18" height="9" rx="3" fill={DARK} />
            <circle cx="72" cy="70" r="4" fill={DARK} />
            <circle cx="86" cy="70" r="4" fill={DARK} />
          </ProhibitionCircle>
        );
      case 'C55-50':
      case 'C55-60':
      case 'C55-80':
      case 'C55-110':
      case 'C55-130': {
        const limit = code.split('-')[1];
        const fontSize = limit.length >= 3 ? '34' : '42';
        return (
          <ProhibitionCircle>
            <text
              x="60"
              y={limit.length >= 3 ? '72' : '75'}
              textAnchor="middle"
              fill={DARK}
              fontSize={fontSize}
              fontWeight="800"
              letterSpacing="-1"
            >
              {limit}
            </text>
          </ProhibitionCircle>
        );
      }
      case 'C61': // Standsning forbudt
        return (
          <g>
            <circle cx="60" cy="60" r="52" fill={BLUE} stroke={RED} strokeWidth="11" />
            <line x1="27" y1="27" x2="93" y2="93" stroke={RED} strokeWidth="10" />
            <line x1="93" y1="27" x2="27" y2="93" stroke={RED} strokeWidth="10" />
          </g>
        );
      case 'C62': // Parkering forbudt
        return (
          <g>
            <circle cx="60" cy="60" r="52" fill={BLUE} stroke={RED} strokeWidth="11" />
            <line x1="27" y1="27" x2="93" y2="93" stroke={RED} strokeWidth="10" />
          </g>
        );

      // --- D: Mandatory ---
      case 'D11-right':
        return (
          <MandatoryCircle>
            <path d="M 30 60 L 76 60" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
            <path d="M 65 40 L 92 60 L 65 80 Z" fill="#FFFFFF" />
          </MandatoryCircle>
        );
      case 'D11-straight':
        return (
          <MandatoryCircle>
            <path d="M 60 90 L 60 44" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
            <path d="M 40 55 L 60 28 L 80 55 Z" fill="#FFFFFF" />
          </MandatoryCircle>
        );
      case 'D12': // Rundkørsel
        return (
          <MandatoryCircle>
            <path
              d="M 60 28 A 32 32 0 0 0 29 52"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="7.5"
              strokeLinecap="round"
            />
            <path d="M 22 47 L 28 63 L 39 51 Z" fill="#FFFFFF" />
            <path
              d="M 33 78 A 32 32 0 0 0 85 80"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="7.5"
              strokeLinecap="round"
            />
            <path d="M 88 86 L 91 70 L 75 77 Z" fill="#FFFFFF" />
            <path
              d="M 90 54 A 32 32 0 0 0 69 29"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="7.5"
              strokeLinecap="round"
            />
            <path d="M 74 22 L 58 28 L 71 38 Z" fill="#FFFFFF" />
          </MandatoryCircle>
        );
      case 'D15': // Påbudt passage til højre
        return (
          <MandatoryCircle>
            <path d="M 38 38 L 75 75" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
            <path d="M 83 83 L 78 58 L 58 78 Z" fill="#FFFFFF" />
          </MandatoryCircle>
        );
      case 'D21': // Cykelsti
        return (
          <MandatoryCircle>
            <circle cx="42" cy="70" r="11" fill="none" stroke="#FFFFFF" strokeWidth="4" />
            <circle cx="78" cy="70" r="11" fill="none" stroke="#FFFFFF" strokeWidth="4" />
            <path
              d="M 42 70 L 55 50 L 71 50 L 78 70 M 55 50 L 50 41 M 71 50 L 66 39 L 74 39 M 55 50 L 60 70 L 78 70"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </MandatoryCircle>
        );

      // --- E: Information ---
      case 'E17': // Fodgængerfelt
        return (
          <g>
            <rect x="12" y="12" width="96" height="96" rx="8" fill={BLUE} />
            <rect x="15" y="15" width="90" height="90" rx="6" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M 60 28 L 94 92 L 26 92 Z" fill="#FFFFFF" />
            {/* Zebra stripes + pedestrian */}
            <rect x="44" y="83" width="6" height="9" fill={DARK} />
            <rect x="57" y="83" width="6" height="9" fill={DARK} />
            <rect x="70" y="83" width="6" height="9" fill={DARK} />
            <circle cx="60" cy="49" r="5" fill={DARK} />
            <path
              d="M 60 55 L 59 69 L 51 82 M 59 69 L 68 82 M 51 62 L 69 61"
              stroke={DARK}
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
      case 'E19': // Ensrettet
        return (
          <g>
            <rect x="12" y="28" width="96" height="64" rx="8" fill={BLUE} />
            <rect x="15" y="31" width="90" height="58" rx="6" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M 28 60 L 74 60" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
            <path d="M 68 43 L 94 60 L 68 77 Z" fill="#FFFFFF" />
          </g>
        );
      case 'E33': // Parkering
        return (
          <g>
            <rect x="12" y="12" width="96" height="96" rx="8" fill={BLUE} />
            <rect x="15" y="15" width="90" height="90" rx="6" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            <text x="60" y="86" textAnchor="middle" fill="#FFFFFF" fontSize="74" fontWeight="800">
              P
            </text>
          </g>
        );
      case 'E42': // Motorvej
        return (
          <g>
            <rect x="12" y="12" width="96" height="96" rx="8" fill={GREEN} />
            <rect x="15" y="15" width="90" height="90" rx="6" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            {/* Lanes */}
            <path d="M 45 30 L 28 92 L 54 92 L 57 30 Z" fill="#FFFFFF" />
            <path d="M 75 30 L 92 92 L 66 92 L 63 30 Z" fill="#FFFFFF" />
            {/* Bridge */}
            <rect x="24" y="48" width="72" height="10" fill={GREEN} />
            <rect x="24" y="50" width="72" height="7" fill="#FFFFFF" />
          </g>
        );
      case 'E43': // Motortrafikvej
        return (
          <g>
            <rect x="12" y="12" width="96" height="96" rx="8" fill={BLUE} />
            <rect x="15" y="15" width="90" height="90" rx="6" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            {/* Car front silhouette */}
            <path d="M 38 42 L 82 42 L 88 58 L 32 58 Z" fill="#FFFFFF" />
            <rect x="28" y="57" width="64" height="20" rx="4" fill="#FFFFFF" />
            <rect x="33" y="76" width="11" height="10" rx="2" fill="#FFFFFF" />
            <rect x="76" y="76" width="11" height="10" rx="2" fill="#FFFFFF" />
            <rect x="40" y="46" width="40" height="10" rx="2" fill={BLUE} />
            <circle cx="39" cy="67" r="4.5" fill={BLUE} />
            <circle cx="81" cy="67" r="4.5" fill={BLUE} />
          </g>
        );
      case 'E55': // Byzone
      case 'E56': // Ophør af byzone
        return (
          <g>
            <rect x="10" y="22" width="100" height="76" rx="6" fill="#FFFFFF" stroke={DARK} strokeWidth="3" />
            {/* Danish town silhouette */}
            <path
              d="M 18 82 L 18 65 L 26 55 L 34 65 L 34 82 Z M 38 82 L 38 56 L 46 47 L 54 56 L 54 82 Z M 59 82 L 59 42 L 64 31 L 69 42 L 69 57 L 82 57 L 82 82 Z M 85 82 L 85 62 L 93 52 L 101 62 L 101 82 Z"
              fill={DARK}
            />
            <line x1="16" y1="83" x2="104" y2="83" stroke={DARK} strokeWidth="3" />
            {code === 'E56' && (
              <line x1="16" y1="92" x2="104" y2="28" stroke={RED} strokeWidth="9" strokeLinecap="round" />
            )}
          </g>
        );
      default:
        return (
          <WarningTriangle>
            <text x="60" y="84" textAnchor="middle" fill={DARK} fontSize="20" fontWeight="700">
              {code}
            </text>
          </WarningTriangle>
        );
    }
  };

  return (
    <svg
      width={size}
      height={(size * viewBoxHeight) / 120}
      viewBox={`0 0 120 ${viewBoxHeight}`}
      className={`select-none ${className}`}
      role="img"
      aria-label={`Færdselstavle ${code}`}
    >
      {renderSignBody()}
      {subPlaque && (
        <g transform="translate(8, 118)">
          <rect
            x="0"
            y="0"
            width="104"
            height="32"
            rx="5"
            fill="#FFFFFF"
            stroke={DARK}
            strokeWidth="2.5"
          />
          <text
            x="52"
            y="20.5"
            textAnchor="middle"
            fill={DARK}
            fontSize={subPlaque.length > 14 ? '10.5' : '12.5'}
            fontWeight="700"
          >
            {subPlaque}
          </text>
        </g>
      )}
    </svg>
  );
};

export const PSkiveSVG: React.FC<{ size?: number }> = ({ size = 112 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    className="select-none"
    role="img"
    aria-label="Dansk P-skive (10:15)"
  >
    <rect x="6" y="6" width="108" height="108" rx="14" fill={BLUE} stroke="#FFFFFF" strokeWidth="2.5" />
    <circle cx="60" cy="62" r="40" fill="#FFFFFF" />
    <text x="60" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800" letterSpacing="1">
      P-SKIVE
    </text>
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
      <line
        key={deg}
        x1="60"
        y1="26"
        x2="60"
        y2={deg % 90 === 0 ? '33' : '30'}
        stroke={DARK}
        strokeWidth={deg % 90 === 0 ? '2.5' : '1.5'}
        transform={`rotate(${deg} 60 62)`}
      />
    ))}
    <text x="60" y="42" textAnchor="middle" fill={DARK} fontSize="8" fontWeight="800">
      12
    </text>
    <text x="86" y="65" textAnchor="middle" fill={DARK} fontSize="8" fontWeight="800">
      3
    </text>
    <text x="60" y="92" textAnchor="middle" fill={DARK} fontSize="8" fontWeight="800">
      6
    </text>
    <text x="34" y="65" textAnchor="middle" fill={DARK} fontSize="8" fontWeight="800">
      9
    </text>
    {/* Pointer at 10:15 */}
    <line x1="60" y1="62" x2="43" y2="52" stroke={RED} strokeWidth="3" strokeLinecap="round" />
    <line x1="60" y1="62" x2="84" y2="62" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="60" cy="62" r="3.5" fill={RED} />
  </svg>
);

