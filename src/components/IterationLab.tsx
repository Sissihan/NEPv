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
}: Props) {
  const { t } = useI18n();
  const [k, setK] = useState(0);
  const [r, setR] = useState<number | null>(null);
  const [rAbs, setRAbs] = useState<number | null>(null);
  const [notConverged, setNotConverged] = useState(false);
  const [mode, setMode] = useState<EigenPickMode>('max');
  const [trajectory, setTrajectory] = useState<Vec[]>([]);

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
    const x0 = trajectory[0] ?? xCurrent;
    const { steps, stoppedEarly } = runIterationUntil(
      x0,
      buildA,
      MAX_ITER_STEPS,
      mode,
      lambdaGuess,
    );
    applySteps(steps, stoppedEarly);
  };

  const stepOnce = () => {
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
  };

  const alpha = params.alpha ?? params.beta ?? params.beta1 ?? 0;
  const Acur = buildA(xCurrent);
  const diag = convergenceDiagnostics(Acur, alpha);

  return (
    <div className="card iteration-lab">
      <h3>{t.iteration.title}</h3>
      <p className="iteration-scf-note">{t.iteration.scfNote}</p>

      <div className="control-row">
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
      </div>

      <div className="iteration-controls">
        <button type="button" onClick={runAuto}>
          {t.iteration.play}
        </button>
        <button type="button" onClick={stepOnce} disabled={notConverged}>
          {t.iteration.step}
        </button>
        <button type="button" onClick={resetFar}>
          {t.iteration.resetFar}
        </button>
        <button type="button" onClick={resetRef}>
          {t.iteration.resetRef}
        </button>
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

      <p className="control-value">
        {t.iteration.stepLabel} = {k}, r_rel = {r != null ? r.toFixed(4) : '—'},{' '}
        |r|_abs = {rAbs != null ? rAbs.toFixed(4) : '—'}
      </p>

      {k > 0 && r != null && (
        <div className="iteration-summary">
          {r < 0.001
            ? `${t.iteration.convergedSummary} (${k} steps, r_rel=${r.toFixed(4)})`
            : notConverged
              ? `${t.iteration.notConvergedSummary} (${k} steps)`
              : `${t.iteration.inProgressSummary} (r_rel=${r.toFixed(4)})`}
        </div>
      )}
      {trajectory.length > 1 && (
        <p className="control-value">Trajectory points: {trajectory.length}</p>
      )}
    </div>
  );
}
