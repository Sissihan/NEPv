import { useMemo } from 'react';
import { useI18n } from '../i18n';
import {
  findPolarMinima,
  sweepPolarLandscape,
  thetaFromX,
  type PolarSample,
} from '../math/polar';
import type { ModelParams, ToyModel } from '../models/types';
import type { Vec } from '../math/vector';

const SIZE = 260;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 100;

interface Props {
  model: ToyModel;
  params: ModelParams;
  xCurrent: Vec;
  lambdaGuess: number;
  onSelectTheta?: (theta: number, sample: PolarSample) => void;
  embedded?: boolean;
}

export function PolarPlot({
  model,
  params,
  xCurrent,
  onSelectTheta,
  embedded = false,
}: Props) {
  const { t } = useI18n();

  const samples = useMemo(
    () => (model.dim === 2 ? sweepPolarLandscape(model, params, 80) : []),
    [model, params],
  );

  const { globalIdx, localIndices } = useMemo(
    () => findPolarMinima(samples),
    [samples],
  );

  const currentTheta = useMemo(() => thetaFromX(xCurrent), [xCurrent]);

  const points = useMemo(() => {
    const maxR = Math.max(...samples.map((s) => s.rRel), 1e-6);
    return samples.map((s) => {
      const rad = (s.rRel / maxR) * R;
      return {
        ...s,
        sx: CX + rad * Math.cos(s.theta),
        sy: CY - rad * Math.sin(s.theta),
      };
    });
  }, [samples]);

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.sx.toFixed(1)} ${p.sy.toFixed(1)}`)
    .join(' ');

  const currentIdx = useMemo(() => {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const d = Math.abs(samples[i].theta - currentTheta);
      const dd = Math.min(d, Math.PI * 2 - d);
      if (dd < bestD) {
        bestD = dd;
        best = i;
      }
    }
    return best;
  }, [samples, currentTheta]);

  if (model.dim !== 2) {
    return (
      <div className="polar-plot card">
        <p className="control-value">{t.playground.polarCaption}</p>
        <p className="control-value">Polar plot available for 2D models only.</p>
      </div>
    );
  }

  return (
    <div className={`polar-plot ${embedded ? 'polar-plot--embedded' : 'card'}`}>
      {!embedded && (
        <>
          <h3>{t.playground.polarTitle}</h3>
          <p className="polar-caption">{t.playground.polarCaption}</p>
        </>
      )}
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={t.playground.polarTitle}
      >
        <line x1={CX} y1={20} x2={CX} y2={SIZE - 20} stroke="#cbd5e1" strokeDasharray="4" />
        <line x1={20} y1={CY} x2={SIZE - 20} y2={CY} stroke="#cbd5e1" strokeDasharray="4" />
        <text x={CX - 8} y={18} fontSize={10} fill="#64748b">
          90°
        </text>
        <text x={SIZE - 28} y={CY + 4} fontSize={10} fill="#64748b">
          0°
        </text>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e2e8f0" strokeWidth={1.5} />
        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth={2} />
        {localIndices.map((idx) => (
          <circle
            key={`loc-${idx}`}
            cx={points[idx].sx}
            cy={points[idx].sy}
            r={5}
            fill="#f59e0b"
            stroke="#fff"
            strokeWidth={1}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectTheta?.(samples[idx].theta, samples[idx])}
          >
            <title>{`${t.playground.polarLocalMin} θ=${((samples[idx].theta * 180) / Math.PI).toFixed(1)}° r=${samples[idx].rRel.toFixed(4)}`}</title>
          </circle>
        ))}
        {points[globalIdx] && (
          <circle
            cx={points[globalIdx].sx}
            cy={points[globalIdx].sy}
            r={7}
            fill="#dc2626"
            stroke="#fff"
            strokeWidth={2}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectTheta?.(samples[globalIdx].theta, samples[globalIdx])}
          >
            <title>{`${t.playground.polarGlobalMin} r=${samples[globalIdx].rRel.toFixed(4)}`}</title>
          </circle>
        )}
        {points[currentIdx] && (
          <polygon
            points={`${points[currentIdx].sx},${points[currentIdx].sy - 8} ${points[currentIdx].sx + 7},${points[currentIdx].sy + 6} ${points[currentIdx].sx - 7},${points[currentIdx].sy + 6}`}
            fill="#059669"
            stroke="#fff"
            strokeWidth={1}
          />
        )}
      </svg>
      <p className="control-value">{t.playground.polarClickHint}</p>
      <div className="polar-legend">
        <span>★ {t.playground.polarGlobalMin}</span>
        <span>● {t.playground.polarLocalMin}</span>
        <span>◆ {t.playground.polarCurrent}</span>
      </div>
    </div>
  );
}
