import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { BASELINE_MODEL_A, BASELINE_MODEL_B } from '../math/baseline';
import { absoluteResidual, residual } from '../math/nepv';
import {
  convergenceDiagnostics,
  ITERATION_START_X_2D,
  iterationStep,
  MAX_ITER_STEPS,
  NONCONVERGE_RESIDUAL,
  runIterationUntil,
  type EigenPickMode,
  type IterationStepResult,
} from '../math/iteration';
import type { ModelParams, ToyModel } from '../models/types';
import type { Vec } from '../math/vector';

interface Props {
  model: ToyModel;
  params: ModelParams;
  xCurrent: Vec;
  lambdaGuess: number;
  onApplyX: (x: Vec) => void;
  onApplyLambda?: (l: number) => void;
  onTrajectoryChange?: (path: Vec[]) => void;
  onIterationMeta?: (meta: { k: number; r: number; notConverged: boolean }) => void;
  embedded?: boolean;
}

function prdBaselineX(model: ToyModel): Vec {
  if (model.id === 'rank-one-2x2') return [...BASELINE_MODEL_A.x];
  if (model.id === 'diagonal-3x3') return [...BASELINE_MODEL_B.x];
  return [...model.defaultX];
}

export function IterationLab({
  model,
  params,
  xCurrent,
  lambdaGuess,
  onApplyX,
  onApplyLambda,
  onTrajectoryChange,
  onIterationMeta,
  embedded = false,
}: Props) {
  const { t } = useI18n();
  const [k, setK] = useState(0);
  const [r, setR] = useState<number | null>(null);
  const [rAbs, setRAbs] = useState<number | null>(null);
  const [notConverged, setNotConverged] = useState(false);
  const [mode, setMode] = useState<EigenPickMode>('max');
  const [trajectory, setTrajectory] = useState<Vec[]>([]);
  const [busy, setBusy] = useState(false);
  const [metricFlash, setMetricFlash] = useState(false);

  const buildA = useCallback(
    (x: Vec) => model.buildA(x, params),
    [model, params],
  );

  const syncCurrentResidual = useCallback(() => {
    const A = buildA(xCurrent);
    const rRel = residual(xCurrent, lambdaGuess, A);
    const rA = absoluteResidual(xCurrent, lambdaGuess, A);
    setR(rRel);
    setRAbs(rA);
    setK(0);
    setTrajectory([xCurrent]);
    onTrajectoryChange?.([xCurrent]);
    onIterationMeta?.({ k: 0, r: rRel, notConverged: false });
  }, [xCurrent, lambdaGuess, buildA, onTrajectoryChange, onIterationMeta]);

  useEffect(() => {
    syncCurrentResidual();
  }, [syncCurrentResidual]);

  useEffect(() => {
    if (r == null) return;
    setMetricFlash(true);
    const id = window.setTimeout(() => setMetricFlash(false), 550);
    return () => window.clearTimeout(id);
  }, [r]);

  const applySteps = (steps: IterationStepResult[], stoppedEarly: boolean) => {
    const last = steps[steps.length - 1];
    if (last) {
      setK(last.k);
      setR(last.residual);
      setRAbs(last.residualAbs);
      onApplyX(last.x);
      onApplyLambda?.(last.lambda);
    }
    setNotConverged(stoppedEarly);
    const path = steps.map((s) => s.x);
    setTrajectory(path);
    onTrajectoryChange?.(path);
    onIterationMeta?.({
      k: last?.k ?? 0,
      r: last?.residual ?? 0,
      notConverged: stoppedEarly,
    });
  };

  const resetFar = () => {
    const x0 = model.dim === 2 ? [...ITERATION_START_X_2D] : [...model.defaultX];
    setK(0);
    setNotConverged(false);
    onApplyX(x0);
    const A = buildA(x0);
    const rRel = residual(x0, lambdaGuess, A);
    setR(rRel);
    setRAbs(absoluteResidual(x0, lambdaGuess, A));
    setTrajectory([x0]);
    onTrajectoryChange?.([x0]);
  };

  const resetRef = () => {
    const x0 = prdBaselineX(model);
    setK(0);
    setNotConverged(false);
    onApplyX(x0);
    const A = buildA(x0);
    setR(residual(x0, lambdaGuess, A));
    setRAbs(absoluteResidual(x0, lambdaGuess, A));
    setTrajectory([x0]);
    onTrajectoryChange?.([x0]);
  };

  const runAuto = () => {
    setBusy(true);
    window.setTimeout(() => {
      const x0 = trajectory[0] ?? xCurrent;
      const { steps, stoppedEarly } = runIterationUntil(
        x0,
        buildA,
        MAX_ITER_STEPS,
        mode,
        lambdaGuess,
      );
      applySteps(steps, stoppedEarly);
      setBusy(false);
    }, 0);
  };

  const stepOnce = () => {
    setBusy(true);
    const { xNext, lambda: lNext, r: rNext, rAbs: rNextAbs } = iterationStep(
      xCurrent,
      buildA,
      mode,
      lambdaGuess,
    );
    const nk = k + 1;
    setK(nk);
    setR(rNext);
    setRAbs(rNextAbs);
    onApplyX(xNext);
    onApplyLambda?.(lNext);
    const path = [...trajectory, xNext];
    setTrajectory(path);
    onTrajectoryChange?.(path);
    if (nk >= MAX_ITER_STEPS && rNext > NONCONVERGE_RESIDUAL) {
      setNotConverged(true);
      onIterationMeta?.({ k: nk, r: rNext, notConverged: true });
    }
    setBusy(false);
  };

  const alpha = params.alpha ?? params.beta ?? params.beta1 ?? 0;
  const Acur = buildA(xCurrent);
  const diag = convergenceDiagnostics(Acur, alpha);

  const statusClass =
    r != null && r < 0.001
      ? 'iter-status--ok'
      : notConverged
        ? 'iter-status--bad'
        : k > 0
          ? 'iter-status--run'
          : '';

  const statusLabel =
    r != null && r < 0.001
      ? t.iteration.convergedSummary
      : notConverged
        ? t.iteration.notConvergedSummary
        : k > 0
          ? t.iteration.inProgressSummary
          : '—';

  return (
    <div className={`iteration-lab ${embedded ? 'iteration-lab--embedded' : ''}`}>
      {!embedded && (
        <>
          <h3>{t.iteration.title}</h3>
          <p className="iteration-scf-note">{t.iteration.scfNote}</p>
        </>
      )}

      <div className="iteration-status-bar">
        <div className={`iter-status-pill ${statusClass}`}>
          <span className="iter-status-label">{statusLabel}</span>
        </div>
        <dl className="iter-metrics">
          <div>
            <dt>{t.iteration.stepLabel}</dt>
            <dd>{k}</dd>
          </div>
          <div>
            <dt>r_rel</dt>
            <dd className={metricFlash ? 'value-flash' : ''}>
              {r != null ? r.toFixed(4) : '—'}
            </dd>
          </div>
          <div>
            <dt>|r|_abs</dt>
            <dd className={metricFlash ? 'value-flash' : ''}>
              {rAbs != null ? rAbs.toFixed(4) : '—'}
            </dd>
          </div>
          {trajectory.length > 1 && (
            <div>
              <dt>path</dt>
              <dd>{trajectory.length}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="iteration-body">
        <div className="iteration-col iteration-col-settings">
          <label htmlFor="iter-mode">{t.iteration.modeLabel}</label>
          <select
            id="iter-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as EigenPickMode)}
          >
            <option value="max">{t.iteration.modeMax}</option>
            <option value="min">{t.iteration.modeMin}</option>
            <option value="closest">{t.iteration.modeClosest}</option>
          </select>
          {embedded && <p className="iteration-scf-note">{t.iteration.scfNote}</p>}
        </div>

        <div className="iteration-col iteration-col-actions">
          <div className="iteration-btn-group iteration-btn-group--primary">
            <button
              type="button"
              className={`btn-primary ${busy ? 'is-loading' : ''}`}
              onClick={runAuto}
              disabled={busy}
            >
              <span className="btn-label">{t.iteration.play}</span>
            </button>
            <button
              type="button"
              className={`btn-primary ${busy ? 'is-loading' : ''}`}
              onClick={stepOnce}
              disabled={notConverged || busy}
            >
              <span className="btn-label">{t.iteration.step}</span>
            </button>
          </div>
          <div className="iteration-btn-group iteration-btn-group--secondary">
            <button type="button" className="btn-secondary" onClick={resetFar}>
              {t.iteration.resetFar}
            </button>
            <button type="button" className="btn-secondary" onClick={resetRef}>
              {t.iteration.resetRef}
            </button>
          </div>
        </div>
      </div>

      {diag.warn && (
        <p className="iteration-warn" role="alert">
          {t.iteration.diagWarn} ({t.iteration.diagGap}={diag.gap.toFixed(3)},{' '}
          {t.iteration.diagLipschitz}≈{diag.lipschitzEstimate.toFixed(2)})
        </p>
      )}
      {notConverged && (
        <p className="iteration-warn" role="alert">
          {t.iteration.notConverged}
        </p>
      )}
    </div>
  );
}
