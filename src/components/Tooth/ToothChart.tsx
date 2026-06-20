import { KEY_TEETH } from '@/types';
import { clsx } from 'clsx';

interface Props {
  selectedTeeth: string[];
  onToggle: (tooth: string) => void;
  disabled?: boolean;
}

interface ToothPos {
  num: string;
  col: number;
  isKey: boolean;
  arch: 'upper' | 'lower';
  side: 'left' | 'right';
}

const buildPositions = (): ToothPos[] => {
  const pos: ToothPos[] = [];
  const upperRight = ['18', '17', '16', '15', '14', '13', '12', '11'];
  const upperLeft = ['21', '22', '23', '24', '25', '26', '27', '28'];
  const lowerRight = ['48', '47', '46', '45', '44', '43', '42', '41'];
  const lowerLeft = ['31', '32', '33', '34', '35', '36', '37', '38'];

  upperRight.forEach((n, i) =>
    pos.push({ num: n, col: i, isKey: KEY_TEETH.includes(n), arch: 'upper', side: 'right' })
  );
  upperLeft.forEach((n, i) =>
    pos.push({ num: n, col: 8 + i, isKey: KEY_TEETH.includes(n), arch: 'upper', side: 'left' })
  );
  lowerRight.forEach((n, i) =>
    pos.push({ num: n, col: i, isKey: KEY_TEETH.includes(n), arch: 'lower', side: 'right' })
  );
  lowerLeft.forEach((n, i) =>
    pos.push({ num: n, col: 8 + i, isKey: KEY_TEETH.includes(n), arch: 'lower', side: 'left' })
  );
  return pos;
};

export default function ToothChart({ selectedTeeth, onToggle, disabled }: Props) {
  const positions = buildPositions();

  const padL = 60;
  const padR = 60;
  const padT = 40;
  const padB = 50;
  const cellW = 116;
  const cellH = 175;
  const gapX = 10;
  const gapY = 28;
  const midlineGap = 20;

  const totalW = cellW * 16 + gapX * 15 + midlineGap;
  const svgW = totalW + padL + padR;
  const svgH = cellH * 2 + gapY + padT + padB;
  const startX = padL;
  const startY = padT;

  const getX = (col: number) => {
    const offset = col * (cellW + gapX);
    return col >= 8
      ? startX + offset + midlineGap - (cellW + gapX) * 0
      : startX + offset;
  };

  const getY = (row: number) => startY + row * (cellH + gapY);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warm-500" />
            重点牙位（第一恒磨牙）
          </span>
          <span className="text-slate-300">|</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-medical-500" />
            已选中
          </span>
          <span className="text-slate-300">|</span>
          <span>共 32 颗恒牙，点击任意牙位进行勾选</span>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          ← 左右滑动查看完整牙列 →
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>

      <div
        className="overflow-x-auto pb-3 scroll-smooth"
        style={{
          WebkitOverflowScrolling: 'touch',
          marginLeft: '-24px',
          marginRight: '-24px',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <div style={{ minWidth: `${svgW}px`, width: `${svgW}px` }}>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            width={svgW}
            height={svgH}
            preserveAspectRatio="xMinYMid meet"
            style={{ display: 'block' }}
          >
            <defs>
              <linearGradient id="toothFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
              <linearGradient id="toothFillKey" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="100%" stopColor="#FEF3C7" />
              </linearGradient>
              <linearGradient id="toothSelected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DBEAFE" />
                <stop offset="50%" stopColor="#93C5FD" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <linearGradient id="rootGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
              <linearGradient id="rootGradSelected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#BFDBFE" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <filter id="toothShadow" x="-30%" y="-20%" width="160%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.12" />
              </filter>
              <filter id="keyGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="selectedGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <text
              x={svgW / 2}
              y={startY - 18}
              textAnchor="middle"
              className="fill-slate-400"
              fontSize="14"
              fontWeight="500"
            >
              ───────  上颌（上牙弓）  ───────
            </text>
            <text
              x={svgW / 2}
              y={startY + cellH * 2 + gapY + 34}
              textAnchor="middle"
              className="fill-slate-400"
              fontSize="14"
              fontWeight="500"
            >
              ───────  下颌（下牙弓）  ───────
            </text>

            <line
              x1={svgW / 2}
              y1={startY - 10}
              x2={svgW / 2}
              y2={startY + cellH * 2 + gapY + 16}
              stroke="#E2E8F0"
              strokeWidth="1.5"
              strokeDasharray="8 5"
            />
            <text
              x={svgW / 2}
              y={startY + cellH + gapY / 2 + 5}
              textAnchor="middle"
              className="fill-slate-300"
              fontSize="12"
              fontWeight="500"
            >
              中 线
            </text>
            <text
              x={svgW / 2 - 6}
              y={startY + cellH + gapY / 2 + 19}
              textAnchor="end"
              className="fill-slate-300"
              fontSize="10"
            >
              右侧
            </text>
            <text
              x={svgW / 2 + 6}
              y={startY + cellH + gapY / 2 + 19}
              textAnchor="start"
              className="fill-slate-300"
              fontSize="10"
            >
              左侧
            </text>

            {positions.map((p) => {
              const x = getX(p.col);
              const y = getY(p.arch === 'upper' ? 0 : 1);
              const selected = selectedTeeth.includes(p.num);

              const crownH = cellH * 0.42;
              const rootH = cellH * 0.58;
              const neckW = cellW * 0.58;
              const crownW = cellW * 0.75;
              const rootW = cellW * 0.32;
              const cx = x + cellW / 2;

              const crownTop = p.arch === 'upper' ? y : y + rootH;
              const crownBot = p.arch === 'upper' ? y + crownH : y + rootH + crownH;
              const rootTop = p.arch === 'upper' ? y + crownH : y;
              const rootBot = p.arch === 'upper'
                ? y + crownH + rootH * 0.85
                : y + rootH * 0.85;
              const rootTipY = p.arch === 'upper' ? rootBot + 6 : rootBot - 6;

              const toothPath = `
                M ${cx - crownW / 2} ${crownTop + 5}
                Q ${cx - crownW * 0.55} ${p.arch === 'upper' ? crownTop - 3 : crownBot + 3},
                  ${cx} ${p.arch === 'upper' ? crownTop : crownBot}
                Q ${cx + crownW * 0.55} ${p.arch === 'upper' ? crownTop - 3 : crownBot + 3},
                  ${cx + crownW / 2} ${crownTop + 5}
                L ${cx + neckW / 2} ${p.arch === 'upper' ? crownBot - 3 : crownTop + 3}
                L ${cx + rootW / 2} ${rootBot}
                Q ${cx + rootW * 0.35} ${rootTipY},
                  ${cx} ${p.arch === 'upper' ? rootBot + 4 : rootBot - 4}
                Q ${cx - rootW * 0.35} ${rootTipY},
                  ${cx - rootW / 2} ${rootBot}
                L ${cx - neckW / 2} ${p.arch === 'upper' ? crownBot - 3 : crownTop + 3}
                Z
              `;

              const numY = p.arch === 'upper' ? y + cellH + 22 : y - 8;

              return (
                <g
                  key={p.num}
                  onClick={() => !disabled && onToggle(p.num)}
                  className={clsx(
                    'cursor-pointer transition-all duration-200',
                    disabled ? 'cursor-not-allowed opacity-60' : 'hover:opacity-95'
                  )}
                  style={{ transformOrigin: `${cx}px ${y + cellH / 2}px` }}
                >
                  <rect
                    x={x - 8}
                    y={y - 10}
                    width={cellW + 16}
                    height={cellH + 20}
                    fill="transparent"
                    className="pointer-events-auto"
                  />
                  {!selected && p.isKey && (
                    <ellipse
                      cx={cx}
                      cy={y + cellH / 2}
                      rx={cellW * 0.6}
                      ry={cellH * 0.45}
                      fill="rgba(245,158,11,0.12)"
                      className="animate-pulse-soft"
                    />
                  )}

                  <path
                    d={toothPath}
                    fill={selected ? 'url(#toothSelected)' : p.isKey ? 'url(#toothFillKey)' : 'url(#toothFill)'}
                    stroke={
                      selected
                        ? '#1D4ED8'
                        : p.isKey
                        ? '#F59E0B'
                        : '#CBD5E1'
                    }
                    strokeWidth={selected ? 2.5 : p.isKey ? 2.2 : 1.5}
                    strokeDasharray={p.isKey && !selected ? '5 4' : undefined}
                    filter={selected ? 'url(#selectedGlow)' : p.isKey ? 'url(#keyGlow)' : 'url(#toothShadow)'}
                    className="transition-all duration-200"
                  />

                  <path
                    d={`
                      M ${cx - neckW * 0.28} ${p.arch === 'upper' ? crownBot - 10 : crownTop + 10}
                      Q ${cx} ${p.arch === 'upper' ? crownBot - 16 : crownTop + 16},
                        ${cx + neckW * 0.28} ${p.arch === 'upper' ? crownBot - 10 : crownTop + 10}
                    `}
                    fill="none"
                    stroke={selected ? 'rgba(29,78,216,0.4)' : 'rgba(148,163,184,0.5)'}
                    strokeWidth="1.5"
                  />

                  <path
                    d={`
                      M ${cx - crownW * 0.15} ${crownTop + (crownH * 0.3)}
                      L ${cx - crownW * 0.05} ${crownTop + (crownH * 0.5)}
                      L ${cx + crownW * 0.05} ${crownTop + (crownH * 0.5)}
                      L ${cx + crownW * 0.15} ${crownTop + (crownH * 0.3)}
                    `}
                    fill={selected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.5)'}
                    stroke="none"
                  />

                  <text
                    x={cx}
                    y={numY}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight={selected ? 700 : 600}
                    className={clsx(
                      'select-none transition-colors',
                      selected ? 'fill-medical-700' : p.isKey ? 'fill-warm-700' : 'fill-slate-500'
                    )}
                  >
                    {p.num}
                  </text>

                  {p.isKey && !selected && (
                    <g>
                      <rect
                        x={cx - 24}
                        y={p.arch === 'upper' ? numY + 6 : numY - 22}
                        width="48"
                        height="18"
                        rx="9"
                        fill="#FEF3C7"
                        stroke="#F59E0B"
                        strokeWidth="1"
                      />
                      <text
                        x={cx}
                        y={p.arch === 'upper' ? numY + 19 : numY - 9}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        className="fill-warm-700 select-none"
                      >
                        ★ 重点
                      </text>
                    </g>
                  )}

                  {selected && (
                    <g>
                      <circle
                        cx={cx + crownW / 2 - 4}
                        cy={crownTop + (p.arch === 'upper' ? 0 : 8)}
                        r="12"
                        fill="#10B981"
                        stroke="white"
                        strokeWidth="2.5"
                      />
                      <path
                        d={`M ${cx + crownW / 2 - 9} ${crownTop + (p.arch === 'upper' ? 4 : 12)}
                            L ${cx + crownW / 2 - 3} ${crownTop + (p.arch === 'upper' ? 10 : 18)}
                            L ${cx + crownW / 2 + 7} ${crownTop + (p.arch === 'upper' ? 0 : 8)}`}
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  )}
                </g>
              );
            })}

            <text
              x={startX - 30}
              y={startY + cellH / 2 + 4}
              textAnchor="middle"
              className="fill-slate-300"
              fontSize="11"
              transform={`rotate(-90 ${startX - 30} ${startY + cellH / 2})`}
            >
              右上颌
            </text>
            <text
              x={svgW - startX + 30}
              y={startY + cellH / 2 + 4}
              textAnchor="middle"
              className="fill-slate-300"
              fontSize="11"
              transform={`rotate(90 ${svgW - startX + 30} ${startY + cellH / 2})`}
            >
              左上颌
            </text>
            <text
              x={startX - 30}
              y={startY + cellH + gapY + cellH / 2 + 4}
              textAnchor="middle"
              className="fill-slate-300"
              fontSize="11"
              transform={`rotate(-90 ${startX - 30} ${startY + cellH + gapY + cellH / 2})`}
            >
              右下颌
            </text>
            <text
              x={svgW - startX + 30}
              y={startY + cellH + gapY + cellH / 2 + 4}
              textAnchor="middle"
              className="fill-slate-300"
              fontSize="11"
              transform={`rotate(90 ${svgW - startX + 30} ${startY + cellH + gapY + cellH / 2})`}
            >
              左下颌
            </text>
          </svg>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs bg-slate-50 rounded-xl p-3 border border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-5 h-7 rounded border-2 border-warm-500 border-dashed bg-warm-50/60" />
          <span className="text-slate-600">
            <b className="text-warm-700">重点推荐封闭</b> —— 第一恒磨牙 16/26/36/46
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-7 rounded border-2 border-medical-500 bg-medical-200 shadow-[0_0_6px_rgba(37,99,235,0.4)]" />
          <span className="text-slate-600">已勾选需处理的牙位</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-7 rounded border border-slate-300 bg-white" />
          <span className="text-slate-600">其他恒牙位（按需勾选）</span>
        </div>
      </div>
    </div>
  );
}
