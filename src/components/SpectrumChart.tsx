import {
  eigenMagnitude,
  groupEigenvaluesForDisplay,
  type EigenPair,
} from '../math/eigen';
import { useI18n } from '../i18n';

interface Props {
  eigenvalues: EigenPair[];
  sensitive?: boolean;
  frozen?: boolean;
  label?: string;
}

function EigenBar({
  eigen,
  pct,
  frozen,
  label,
  imagNote,
}: {
  eigen: EigenPair;
  pct: number;
  frozen?: boolean;
  label: string;
  imagNote?: string;
}) {
  const re = eigen.value;
  return (
    <div className="eigen-row">
      <span className="eigen-label">{label}</span>
      <div className="eigen-bar-track">
        <div
          className="eigen-bar-fill"
          style={{
            width: `${pct}%`,
            background: frozen ? '#f59e0b' : '#2563eb',
          }}
        />
      </div>
      <span className="eigen-value">
        {re.toFixed(4)}
        {imagNote && <span className="eigen-imag"> {imagNote}</span>}
      </span>
    </div>
  );
}

export function SpectrumChart({
  eigenvalues,
  sensitive,
  frozen,
  label,
}: Props) {
  const { t } = useI18n();
  const title = label ?? t.spectrum.defaultLabel;
  const groups = groupEigenvaluesForDisplay(eigenvalues);
  const mags = eigenvalues.map(eigenMagnitude);
  const maxMag = Math.max(...mags, 0.01);

  return (
    <div className={`card spectrum-panel ${frozen ? 'pitfall-frozen' : ''}`}>
      <h3>{title}</h3>
      {frozen && (
        <p className="spectrum-pitfall-note">{t.spectrum.pitfallNote}</p>
      )}
      <div className="spectrum-bars">
        {groups.map((g) => {
          if (g.kind === 'real') {
            const pct = (eigenMagnitude(g.eigen) / maxMag) * 100;
            return (
              <EigenBar
                key={`r-${g.index}`}
                eigen={g.eigen}
                pct={pct}
                frozen={frozen}
                label={`${t.spectrum.eigenPrefix}${g.index}`}
              />
            );
          }
          const pctPlus = (eigenMagnitude(g.plus) / maxMag) * 100;
          const im = Math.abs(g.plus.imaginary);
          return (
            <div key={`c-${g.index}`} className="conjugate-group">
              <span className="conjugate-legend">{t.spectrum.conjugatePair}</span>
              <div className="conjugate-pair">
                <EigenBar
                  eigen={g.plus}
                  pct={pctPlus}
                  frozen={frozen}
                  label={`${t.spectrum.eigenPrefix}${g.index}+`}
                  imagNote={`+${im.toFixed(3)}i`}
                />
                <div className="conjugate-connector" aria-hidden />
                <EigenBar
                  eigen={g.minus}
                  pct={pctPlus}
                  frozen={frozen}
                  label={`${t.spectrum.eigenPrefix}${g.index}-`}
                  imagNote={`-${im.toFixed(3)}i`}
                />
              </div>
            </div>
          );
        })}
      </div>
      {sensitive && <p className="sensitive">{t.spectrum.sensitive}</p>}
    </div>
  );
}
