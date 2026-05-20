import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { registerPlaygroundActions } from '../context/playgroundActions';
import { getModelCopy, getParamLabel } from '../i18n/modelCopy';
import { absoluteResidual, evaluateNepv, isSingularX, residual, RESIDUAL_FORMULA_PLAIN } from '../math/nepv';
import { residualAtTheta } from '../math/polar';
import { normalize, type Vec } from '../math/vector';
import { models } from '../models';
import type { ModelParams, ToyModel } from '../models/types';
import { IterationLab } from './IterationLab';
import { MatrixHeatmap } from './MatrixHeatmap';
import { ResidualFormulaBanner } from './ResidualFormulaBanner';
import { SpectrumChart } from './SpectrumChart';
import { VectorCompass } from './VectorCompass';
import { AIMathTutor } from './AIMathTutor';
import type { AIState } from '../ai/tutor';
import { PolarPlot } from './PolarPlot';

const FAR_START_2D: Vec = [0.92, 0.38];

export function Playground() {
  const { t } = useI18n();
  const [modelId, setModelId] = useState(models[0].id);
  const model = models.find((m) => m.id === modelId) ?? models[0];
  const modelCopy = getModelCopy(t, model.id);

  const [x, setX] = useState<Vec>(() => normalize([...FAR_START_2D]));
  const [params, setParams] = useState<ModelParams>(() => ({ ...model.defaultParams }));
  const [lambdaGuess, setLambdaGuess] = useState(1.5);
  const [freezeA, setFreezeA] = useState(false);
  const [frozenX, setFrozenX] = useState<Vec | null>(null);
  const [iterK, setIterK] = useState(0);
  const [iterNotConv, setIterNotConv] = useState(false);
  const [trajectory, setTrajectory] = useState<Vec[]>([]);

  const switchModel = (m: ToyModel, keepAngle = true) => {
    setModelId(m.id);
    if (!keepAngle) setX(normalize([...m.defaultX]));
    else if (m.dim === 2 && x.length >= 2) {
      setX(normalize([x[0], x[1]]));
    } else setX(normalize([...m.defaultX]));
    setParams({ ...m.defaultParams });
    if (!keepAngle) {
      setFrozenX(null);
      setFreezeA(false);
    }
  };

  const xNorm = useMemo(() => normalize(x.slice(0, model.dim)), [x, model.dim]);
  const singular = isSingularX(xNorm);

  const A = useMemo(
    () => (singular ? null : model.buildA(xNorm, params)),
    [model, xNorm, params, singular],
  );

  const Afrozen = useMemo(() => {
    if (!freezeA || !frozenX || singular) return null;
    return model.buildA(frozenX, params);
  }, [freezeA, frozenX, model, params, singular]);

  const state = useMemo(() => {
    if (!A) return null;
    return evaluateNepv(xNorm, lambdaGuess, A);
  }, [xNorm, lambdaGuess, A]);

  const frozenLinearAtX = useMemo(() => {
    if (!Afrozen || singular) return null;
    return evaluateNepv(xNorm, lambdaGuess, Afrozen);
  }, [Afrozen, xNorm, lambdaGuess, singular]);

  const rAbs = state && A ? absoluteResidual(xNorm, lambdaGuess, A) : null;

  const aiState: AIState | null = state
    ? {
        modelId,
        params,
        residual: state.residual,
        residualAbs: rAbs ?? undefined,
        lambdaGuess,
        freezeA,
        x: xNorm,
        iterationStep: iterK,
        notConverged: iterNotConv,
        spectralGap: undefined,
      }
    : null;

  const toggleFreeze = () => {
    if (!freezeA) {
      setFrozenX([...xNorm]);
      setFreezeA(true);
    } else {
      setFreezeA(false);
      setFrozenX(null);
    }
  };

  const resetAll = () => {
    const m = models.find((item) => item.id === modelId) ?? models[0];
    setParams({ ...m.defaultParams });
    setX(normalize(m.dim === 2 ? [...FAR_START_2D] : [...m.defaultX]));
    setLambdaGuess(1.5);
    setFreezeA(false);
    setFrozenX(null);
    setTrajectory([]);
    setIterK(0);
    setIterNotConv(false);
  };

  useEffect(() => {
    registerPlaygroundActions({
      setFreezeA: (on) => {
        if (on && !freezeA) {
          setFrozenX([...xNorm]);
          setFreezeA(true);
        } else if (!on) {
          setFreezeA(false);
          setFrozenX(null);
        }
      },
      setModelId: (id) => {
        const m = models.find((item) => item.id === id);
        if (m) switchModel(m, true);
      },
      setModelCParams: () => {
        const m = models.find((item) => item.id === 'nonsymmetric-2x2');
        if (m) {
          switchModel(m, false);
          setParams({ beta: 1.2, a: 0.8, b: 0.8, c: 0.1 });
        }
      },
      resetAll,
    });
    return () => registerPlaygroundActions(null);
  }, [freezeA, xNorm, modelId, params]);

  const handlePolarSelect = (theta: number) => {
    if (model.dim !== 2) return;
    const buildA = (v: Vec) => model.buildA(v, params);
    const sample = residualAtTheta(theta, buildA, params);
    setX(sample.x);
    setLambdaGuess(Number(sample.bestLambda.toFixed(4)));
  };

  const setX3 = (z: number) => {
    const xy = Math.hypot(xNorm[0], xNorm[1]);
    const maxZ = Math.sqrt(Math.max(0, 1 - Math.min(1, xy * xy)));
    const cz = Math.max(-maxZ, Math.min(maxZ, z));
    const scale = Math.sqrt(Math.max(1e-12, 1 - cz * cz)) / (xy || 1);
    setX([xNorm[0] * scale, xNorm[1] * scale, cz]);
  };

  const pitfallMismatch =
    freezeA &&
    frozenLinearAtX &&
    state &&
    frozenLinearAtX.residual < 0.01 &&
    state.residual > 0.05;

  return (
    <section id="playground">
      <div className="wide playground-wrap">
        <div className="playground-header">
          <div>
            <h2>{t.playground.title}</h2>
            <p className="lead playground-lead">{t.playground.lead}</p>
          </div>
          <ResidualFormulaBanner />
        </div>

        {singular && (
          <p className="singular-banner" role="alert">
            {t.playground.singularWarning}
          </p>
        )}

        <div className="playground-grid">
          <aside className={singular ? 'controls-disabled' : ''}>
            <div className="card">
              <label htmlFor="model-select">{t.playground.toyModel}</label>
              <select
                id="model-select"
                value={modelId}
                disabled={singular}
                onChange={(e) => {
                  const m = models.find((item) => item.id === e.target.value);
                  if (m) switchModel(m, true);
                }}
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {getModelCopy(t, m.id).name}
                  </option>
                ))}
              </select>
              <p className="model-desc">{modelCopy.description}</p>
              {modelCopy.physical && <p className="physical-note">{modelCopy.physical}</p>}
              {modelCopy.analyticNote && (
                <p className="control-value">{modelCopy.analyticNote}</p>
              )}
              {modelCopy.refs && <p className="refs-note">{modelCopy.refs}</p>}
            </div>

            {model.paramKeys.map((key) => {
              const meta = model.paramMeta[key];
              if (!meta) return null;
              return (
                <div className="control-row" key={key}>
                  <label htmlFor={key}>{getParamLabel(t, model.id, key)}</label>
                  <input
                    id={key}
                    type="range"
                    disabled={singular}
                    min={meta.min}
                    max={meta.max}
                    step={meta.step}
                    value={params[key] ?? 0}
                    onChange={(e) =>
                      setParams((p) => ({ ...p, [key]: parseFloat(e.target.value) }))
                    }
                  />
                  <input
                    type="number"
                    className="param-number"
                    step={meta.step}
                    min={meta.min}
                    max={meta.max}
                    disabled={singular}
                    value={Number((params[key] ?? 0).toFixed(4))}
                    onChange={(e) =>
                      setParams((p) => ({ ...p, [key]: parseFloat(e.target.value) }))
                    }
                  />
                </div>
              );
            })}

            <div className="control-row">
              <label htmlFor="lambda">{t.playground.lambdaGuessLabel}</label>
              <p className="control-hint">{t.playground.lambdaGuessHint}</p>
              <input
                id="lambda"
                type="range"
                disabled={singular}
                min={-1}
                max={4}
                step={0.01}
                value={lambdaGuess}
                onChange={(e) => setLambdaGuess(parseFloat(e.target.value))}
              />
              <input
                type="number"
                className="param-number"
                step={0.01}
                disabled={singular}
                value={Number(lambdaGuess.toFixed(4))}
                onChange={(e) => setLambdaGuess(parseFloat(e.target.value))}
              />
            </div>

            <div className={`toggle-row pitfall-toggle ${freezeA ? 'is-active' : ''}`}>
              <input
                id="freeze"
                type="checkbox"
                checked={freezeA}
                disabled={singular}
                onChange={toggleFreeze}
              />
              <label htmlFor="freeze">{t.playground.freezePitfall}</label>
              {freezeA && (
                <span className="pitfall-badge" title={t.playground.pitfallTooltip}>
                  ?? {t.playground.pitfallBadge}
                </span>
              )}
              <span className="pitfall-tooltip">{t.playground.pitfallTooltip}</span>
            </div>

            {freezeA && frozenLinearAtX && state && (
              <div className="card pitfall-compare-card">
                <h4>{t.playground.pitfallCompareTitle}</h4>
                <p>
                  {t.playground.pitfallFrozenResidual}:{' '}
                  <strong>{frozenLinearAtX.residual.toFixed(4)}</strong>
                </p>
                <p>
                  {t.playground.pitfallTrueResidual}:{' '}
                  <strong className={state.residual > 0.05 ? 'residual-high' : 'residual-low'}>
                    {state.residual.toFixed(4)}
                  </strong>
                </p>
                <p className="pitfall-linear-note">{t.playground.pitfallLinearNote}</p>
                {pitfallMismatch && (
                  <p className="pitfall-highlight" role="alert">
                    {t.playground.pitfallHighlight}
                  </p>
                )}
              </div>
            )}

            <div className="card">
              <label>{t.playground.residualRelLabel}</label>
              <div
                className={`metric ${state && state.residual < 0.01 ? 'residual-low' : state && state.residual > 0.1 ? 'residual-high' : ''}`}
              >
                {state ? state.residual.toFixed(4) : '?'}
              </div>
              <label>{t.playground.residualAbsLabel}</label>
              <div className="control-value">{rAbs != null ? rAbs.toFixed(4) : '?'}</div>
              <p className="residual-formula-foot">{RESIDUAL_FORMULA_PLAIN}</p>
              <p className="control-hint">{t.playground.residualZeroHint}</p>
              <div className="btn-row">
                <button type="button" onClick={() => resetAll()}>
                  {t.playground.resetAll}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ex =
                      model.id === 'rank-one-2x2'
                        ? { alpha: 0.4, x: [0.92, 0.39] as Vec }
                        : model.id === 'nonsymmetric-2x2'
                          ? { beta: 1.0, a: 0.8, b: 0.8, c: 0.2, x: [0.7, 0.71] as Vec }
                          : { alpha: 0.5, x: [0.707, 0.707] as Vec };
                    setParams((p) => ({ ...p, ...ex }));
                    if (ex.x) setX(normalize(ex.x));
                  }}
                >
                  {t.playground.loadExampleParams}
                </button>
              </div>
            </div>

            {!singular && (
              <IterationLab
                model={model}
                params={params}
                xCurrent={xNorm}
                lambdaGuess={lambdaGuess}
                onApplyX={(v) => setX(v)}
                onApplyLambda={setLambdaGuess}
                onTrajectoryChange={setTrajectory}
                onIterationMeta={({ k, notConverged }) => {
                  setIterK(k);
                  setIterNotConv(notConverged);
                }}
              />
            )}
          </aside>

          <main className={freezeA ? 'pitfall-active' : ''}>
            {model.dim === 2 ? (
              <VectorCompass
                x={xNorm}
                disabled={singular}
                onChange={(v) => setX(v)}
                dim={2}
                trajectory={trajectory}
                showAxes
              />
            ) : (
              <>
                <VectorCompass
                  x={xNorm}
                  disabled={singular}
                  onChange={(v) => setX(normalize([v[0], v[1], xNorm[2] ?? 0]))}
                  dim={3}
                  showAxes
                />
                <div className="control-row">
                  <label htmlFor="x3">{t.playground.x3Label}</label>
                  <input
                    id="x3"
                    type="range"
                    disabled={singular}
                    min={-1}
                    max={1}
                    step={0.02}
                    value={xNorm[2] ?? 0}
                    onChange={(e) => setX3(parseFloat(e.target.value))}
                  />
                </div>
              </>
            )}

            {A && state && (
              <>
                <p className="spectrum-hint-banner">{t.playground.spectrumHint}</p>
                <div className="viz-row">
                  <MatrixHeatmap A={A} title={t.playground.heatmapMoving} />
                  {freezeA && Afrozen && (
                    <MatrixHeatmap A={Afrozen} title={t.playground.heatmapFrozen} />
                  )}
                </div>
                <div className="viz-row spectrum-stack">
                  <SpectrumChart
                    eigenvalues={state.spectrum.eigenvalues}
                    sensitive={state.spectrum.sensitive}
                    label={t.playground.spectrumCurrent}
                  />
                  {freezeA && frozenLinearAtX && (
                    <SpectrumChart
                      eigenvalues={frozenLinearAtX.spectrum.eigenvalues}
                      sensitive={frozenLinearAtX.spectrum.sensitive}
                      frozen
                      label={t.playground.spectrumFrozen}
                    />
                  )}
                </div>
              </>
            )}

            {!singular && A && (
              <PolarPlot
                model={model}
                params={params}
                xCurrent={xNorm}
                lambdaGuess={lambdaGuess}
                onSelectTheta={handlePolarSelect}
              />
            )}

            <p className="singularity-note">{modelCopy.singularityNote}</p>
          </main>

          <AIMathTutor state={aiState} />
        </div>
      </div>
    </section>
  );
}
