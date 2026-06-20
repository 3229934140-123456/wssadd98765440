import { KEY_TEETH, ALL_TEETH } from '@/types';
import { clsx } from 'clsx';

interface Props {
  selectedTeeth: string[];
  onToggle: (tooth: string) => void;
  disabled?: boolean;
}

interface ToothPos {
  num: string;
  row: number;
  col: number;
  isKey: boolean;
  arch: 'upper' | 'lower';
  mirrorX: boolean;
}

const buildPositions = (): ToothPos[] => {
  const pos: ToothPos[] = [];
  const upperLeft = ['18', '17', '16', '15', '14', '13', '12', '11'];
  const upperRight = ['21', '22', '23', '24', '25', '26', '27', '28'];
  const lowerRight = ['48', '47', '46', '45', '44', '43', '42', '41'];
  const lowerLeft = ['31', '32', '33', '34', '35', '36', '37', '38'];

  upperLeft.forEach((n, i) =>
    pos.push({ num: n, row: 0, col: i, isKey: KEY_TEETH.includes(n), arch: 'upper', mirrorX: true })
  );
  upperRight.forEach((n, i) =>
    pos.push({ num: n, row: 0, col: 8 + i, isKey: KEY_TEETH.includes(n), arch: 'upper', mirrorX: false })
  );
  lowerRight.forEach((n, i) =>
    pos.push({ num: n, row: 1, col: i, isKey: KEY_TEETH.includes(n), arch: 'lower', mirrorX: true })
  );
  lowerLeft.forEach((n, i) =>
    pos.push({ num: n, row: 1, col: 8 + i, isKey: KEY_TEETH.includes(n), arch: 'lower', mirrorX: false })
  );
  return pos;
};

export default function ToothChart({ selectedTeeth, onToggle, disabled }: Props) {
  const positions = buildPositions();
  const w = 800;
  const h = 360;
  const cellW = 86;
  const cellH = 150;
  const gapX = 6;
  const gapY = 20;
  const startX = (w - (cellW * 16 + gapX * 15)) / 2;
  const startY = (h - (cellH * 2 + gapY)) / 2;
  const midlineGap = 12;

  const getX = (col: number) => {
    const offsetCol = col >= 8 ? col : col;
    const x = startX + offsetCol * (cellW + gapX);
    return col >= 8 ? x + midlineGap : x - midlineGap / 2;
  };

  const getY = (row: number) => startY + row * (cellH + gapY);

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-[860px] mx-auto h-auto"
      >
        <defs>
          <linearGradient id="toothFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
          <linearGradient id="toothSelected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="selectedGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <text x={w / 2} y={getY(0) - 14} textAnchor="middle" className="fill-slate-400" fontSize="13" fontWeight="500">
          ─── 上颌（上排牙齿） ───
        </text>
        <text x={w / 2} y={getY(1) + cellH + 28} textAnchor="middle" className="fill-slate-400" fontSize="13" fontWeight="500">
          ─── 下颌（下排牙齿） ───
        </text>

        <line
          x1={w / 2}
          y1={startY - 10}
          x2={w / 2}
          y2={startY + cellH * 2 + gapY + 10}
          stroke="#E2E8F0"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
        <text x={w / 2} y={startY + cellH + gapY / 2 + 4} textAnchor="middle" className="fill-slate-300" fontSize="11">
          中 线
        </text>

        {positions.map((p) => {
          const x = getX(p.col);
          const y = getY(p.row);
          const selected = selectedTeeth.includes(p.num);

          const crownH = cellH * 0.45;
          const rootH = cellH * 0.5;
          const neckW = cellW * 0.62;
          const crownW = cellW * 0.78;
          const rootW = cellW * 0.35;
          const cx = x + cellW / 2;
          const crownTop = p.arch === 'upper' ? y : y + rootH;
          const crownBot = p.arch === 'upper' ? y + crownH : y + rootH + crownH;
          const rootTop = p.arch === 'upper' ? y + crownH : y;
          const rootBot = p.arch === 'upper' ? y + crownH + rootH * 0.82 : y + rootH * 0.82;

          const toothPath = `
            M ${cx - crownW / 2} ${crownTop + 4}
            Q ${cx - crownW * 0.52} ${p.arch === 'upper' ? crownTop - 2 : crownBot + 2},
              ${cx} ${p.arch === 'upper' ? crownTop : crownBot}
            Q ${cx + crownW * 0.52} ${p.arch === 'upper' ? crownTop - 2 : crownBot + 2},
              ${cx + crownW / 2} ${crownTop + 4}
            L ${cx + neckW / 2} ${p.arch === 'upper' ? crownBot - 4 : crownTop + 4}
            L ${cx + rootW / 2} ${p.arch === 'upper' ? rootBot : rootTop}
            Q ${cx + rootW * 0.35} ${p.arch === 'upper' ? rootBot + 8 : rootTop - 8},
              ${cx} ${p.arch === 'upper' ? rootBot + 4 : rootTop - 4}
            Q ${cx - rootW * 0.35} ${p.arch === 'upper' ? rootBot + 8 : rootTop - 8},
              ${cx - rootW / 2} ${p.arch === 'upper' ? rootBot : rootTop}
            L ${cx - neckW / 2} ${p.arch === 'upper' ? crownBot - 4 : crownTop + 4}
            Z
          `;

          return (
            <g
              key={p.num}
              onClick={() => !disabled && onToggle(p.num)}
              className={clsx(
                'cursor-pointer transition-all duration-200',
                disabled ? 'cursor-not-allowed opacity-60' : 'hover:opacity-90'
              )}
              style={{ transformOrigin: `${cx}px ${y + cellH / 2}px` }}
            >
              {!selected && (
                <path
                  d={toothPath}
                  fill="rgba(0,0,0,0.08)"
                  transform="translate(1.5, 2)"
                  filter="url(#softShadow)"
                />
              )}

              <path
                d={toothPath}
                fill={selected ? 'url(#toothSelected)' : 'url(#toothFill)'}
                stroke={selected ? '#1D4ED8' : p.isKey ? '#F59E0B' : '#CBD5E1'}
                strokeWidth={selected ? 2.2 : p.isKey ? 2 : 1.3}
                strokeDasharray={p.isKey && !selected ? '4 3' : undefined}
                className={clsx(
                  'transition-all duration-200',
                  selected && 'drop-shadow-[0_0_6px_rgba(37,99,235,0.5)]'
                )}
                rx="4"
              />

              <path
                d={`M ${cx - neckW * 0.3} ${p.arch === 'upper' ? crownBot - 8 : crownTop + 8}
                    Q ${cx} ${p.arch === 'upper' ? crownBot - 12 : crownTop + 12},
                      ${cx + neckW * 0.3} ${p.arch === 'upper' ? crownBot - 8 : crownTop + 8}`}
                fill="none"
                stroke={selected ? 'rgba(29,78,216,0.4)' : 'rgba(148,163,184,0.5)'}
                strokeWidth="1"
              />

              <text
                x={cx}
                y={p.arch === 'upper' ? y + cellH + 16 : y - 6}
                textAnchor="middle"
                fontSize="13"
                fontWeight={selected ? 700 : 600}
                className={clsx(
                  'select-none transition-colors',
                  selected ? 'fill-medical-700' : p.isKey ? 'fill-warm-600' : 'fill-slate-500'
                )}
              >
                {p.num}
              </text>

              {p.isKey && (
                <circle
                  cx={cx}
                  cy={p.arch === 'upper' ? y + cellH + 26 : y - 16}
                  r="9"
                  fill="rgba(245,158,11,0.1)"
                  stroke="#F59E0B"
                  strokeWidth="1"
                />
              )}
              {p.isKey && (
                <text
                  x={cx}
                  y={p.arch === 'upper' ? y + cellH + 30 : y - 12}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  className="fill-warm-600 select-none"
                >
                  重点
                </text>
              )}
            </g>
          );
        })}

        <g transform={`translate(${startX - 30}, ${getY(0) + cellH / 2})`}>
          <rect x="0" y="0" width="18" height="18" rx="4" fill="rgba(245,158,11,0.15)" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3 2" />
        </g>
      </svg>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded border-2 border-warm-500 border-dashed bg-warm-50/50" />
          <span className="text-slate-600">重点推荐封闭（第一恒磨牙 16/26/36/46）</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded border border-medical-500 bg-medical-200 shadow-[0_0_4px_rgba(37,99,235,0.4)]" />
          <span className="text-slate-600">已勾选需处理的牙位</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded border border-slate-300 bg-white" />
          <span className="text-slate-600">其他恒牙位（按需勾选）</span>
        </div>
      </div>
    </div>
  );
}

export { ALL_TEETH };
