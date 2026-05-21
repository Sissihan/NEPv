import { useCallback, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { normalize, norm2, type Vec } from '../math/vector';

interface Props {
  x: Vec;
  onChange: (x: Vec) => void;
  dim: 2 | 3;
  disabled?: boolean;
  onNormalized?: () => void;
  trajectory?: Vec[];
  showAxes?: boolean;
}

const DEFAULT_SIZE = 200;

export function VectorCompass({
  x,
  onChange,
  dim,
  disabled,
  onNormalized,
  trajectory = [],
  showAxes = false,
  size = DEFAULT_SIZE,
}: Props & { size?: number }) {
  const SIZE = size;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = SIZE * 0.4;
  const { t } = useI18n();
  const dragging = useRef(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  const applyX = (v: Vec, wasClipped: boolean) => {
    const n = normalize(v);
    onChange(n);
    if (wasClipped) {
      showToast(t.compass.normalizedToast);
      onNormalized?.();
    }
  };

  const toScreen = (v: Vec) => ({
    sx: CX + (v[0] ?? 0) * R,
    sy: CY - (v[1] ?? 0) * R,
  });

  const fromEvent = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const nx = (clientX - rect.left - CX) / R;
      const ny = -(clientY - rect.top - CY) / R;
      const len = Math.hypot(nx, ny);
      if (len < 1e-6) return;
      const wasClipped = len > 1.001;
      const x2 = nx / len;
      const y2 = ny / len;
      if (dim === 2) {
        applyX([x2, y2], wasClipped);
      } else {
        const z = x[2] ?? 0.3;
        const s = Math.sqrt(Math.max(0, 1 - x2 * x2 - y2 * y2));
        const sign = z >= 0 ? 1 : -1;
        applyX([x2, y2, sign * s], wasClipped);
      }
    },
    [dim, x, onChange, t.compass.normalizedToast, onNormalized],
  );

  const setFromNumeric = (x1: number, x2: number) => {
    const v = dim === 2 ? [x1, x2] : [x1, x2, x[2] ?? 0];
    if (norm2(v) < 1e-12) return;
    applyX(v, true);
  };

  const pointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (disabled) return;
    dragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    fromEvent(e.clientX, e.clientY, rect);
  };

  const pointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (disabled || !dragging.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    fromEvent(e.clientX, e.clientY, rect);
  };

  const pointerUp = () => {
    dragging.current = false;
  };

  const { sx, sy } = toScreen(x);

  return (
    <div className={`vector-compass ${disabled ? 'is-disabled' : ''}`}>
      <label>{t.compass.label}</label>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={t.compass.ariaLabel}
        aria-disabled={disabled}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        style={{
          touchAction: 'none',
          cursor: disabled ? 'not-allowed' : 'grab',
          display: 'block',
          opacity: disabled ? 0.45 : 1,
        }}
      >
        {showAxes && (
          <>
            <line x1={CX} y1={12} x2={CX} y2={SIZE - 12} stroke="#e2e8f0" strokeDasharray="4" />
            <line x1={12} y1={CY} x2={SIZE - 12} y2={CY} stroke="#e2e8f0" strokeDasharray="4" />
            <text x={CX - 10} y={14} fontSize={9} fill="#94a3b8">
              90°
            </text>
            <text x={SIZE - 22} y={CY + 4} fontSize={9} fill="#94a3b8">
              0°
            </text>
          </>
        )}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#cbd5e1" strokeWidth={2} />
        {trajectory.length > 1 && (
          <polyline
            points={trajectory
              .map((v) => {
                const p = toScreen(v);
                return `${p.sx},${p.sy}`;
              })
              .join(' ')}
            fill="none"
            stroke="#059669"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            opacity={0.85}
          />
        )}
        {trajectory.map((v, i) => {
          const p = toScreen(v);
          return (
            <circle
              key={`tr-${i}`}
              cx={p.sx}
              cy={p.sy}
              r={i === trajectory.length - 1 ? 4 : 2}
              fill={i === trajectory.length - 1 ? '#059669' : '#86efac'}
              opacity={0.9}
            />
          );
        })}
        <line x1={CX} y1={CY} x2={sx} y2={sy} stroke="#2563eb" strokeWidth={3} />
        <circle cx={sx} cy={sy} r={10} fill="#2563eb" stroke="#fff" strokeWidth={2} />
        <text x={8} y={16} fontSize={11} fill="#64748b">
          {t.compass.x1}
        </text>
        <text x={SIZE - 24} y={CY + 4} fontSize={11} fill="#64748b">
          {t.compass.x2}
        </text>
      </svg>
      <div className="compass-numeric mobile-numeric">
        <label>
          {t.compass.numericX1}
          <input
            type="number"
            step={0.01}
            min={-1}
            max={1}
            disabled={disabled}
            value={Number(x[0]?.toFixed(3))}
            onChange={(e) => setFromNumeric(parseFloat(e.target.value), x[1] ?? 0)}
          />
        </label>
        <label>
          {t.compass.numericX2}
          <input
            type="number"
            step={0.01}
            min={-1}
            max={1}
            disabled={disabled}
            value={Number(x[1]?.toFixed(3))}
            onChange={(e) => setFromNumeric(x[0] ?? 0, parseFloat(e.target.value))}
          />
        </label>
      </div>
      <p className="control-value">
        x = [{x.map((v) => v.toFixed(3)).join(', ')}]
        {dim === 3 && t.compass.zHint}
      </p>
      {toast && <p className="compass-toast" role="status">{toast}</p>}
    </div>
  );
}
