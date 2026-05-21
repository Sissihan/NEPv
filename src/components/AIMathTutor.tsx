import { useState } from 'react';
import { useI18n } from '../i18n';
import type { AIState } from '../ai/tutor';
import { askAI } from '../ai/tutor';

interface Props {
  state: AIState | null;
  layout?: 'sidebar' | 'bar' | 'centered';
}

const PRESET_KEYS = ['q1', 'q2', 'q3'] as const;

export function AIMathTutor({ state, layout = 'sidebar' }: Props) {
  const { locale, t } = useI18n();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isBar = layout === 'bar';
  const isCentered = layout === 'centered';

  const handleAsk = (q?: string) => {
    const text = (q ?? question).trim();
    if (!state || !text) return;
    setLoading(true);
    window.setTimeout(() => {
      setAnswer(askAI(text, state, locale));
      setLoading(false);
    }, 350);
  };

  const statusChips = state ? (
    <div className="ai-status-chips" role="list">
      <span className="ai-chip" role="listitem">
        <span className="ai-chip-label">r_rel</span>
        <strong className="ai-chip-value">{state.residual?.toFixed(4) ?? '—'}</strong>
      </span>
      <span className="ai-chip" role="listitem">
        <span className="ai-chip-label">λ</span>
        <strong className="ai-chip-value">{state.lambdaGuess.toFixed(4)}</strong>
      </span>
      {state.params.alpha !== undefined && (
        <span className="ai-chip" role="listitem">
          <span className="ai-chip-label">α</span>
          <strong className="ai-chip-value">{state.params.alpha.toFixed(2)}</strong>
        </span>
      )}
      <span
        className={`ai-chip ai-chip--mode ${state.freezeA ? 'ai-chip--frozen' : 'ai-chip--dynamic'}`}
        role="listitem"
      >
        <strong className="ai-chip-value">
          {state.freezeA ? t.ai.modeFrozen : t.ai.modeDynamic}
        </strong>
      </span>
    </div>
  ) : (
    <p className="ai-hint">{t.ai.hint}</p>
  );

  const legacyMetrics = state ? (
    <div className="ai-state">
      <div className="ai-metric">
        <span>r_rel</span>
        <strong>{state.residual?.toFixed(4) ?? '—'}</strong>
      </div>
      <div className="ai-metric">
        <span>λ</span>
        <strong>{state.lambdaGuess.toFixed(4)}</strong>
      </div>
      {state.params.alpha !== undefined && (
        <div className="ai-metric">
          <span>α</span>
          <strong>{state.params.alpha.toFixed(2)}</strong>
        </div>
      )}
      <div className="ai-metric small">
        {state.freezeA ? t.ai.modeFrozen : t.ai.modeDynamic}
      </div>
    </div>
  ) : (
    <p className="ai-hint">{t.ai.hint}</p>
  );

  const presets = (
    <div className="ai-presets">
      {PRESET_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className="ai-preset-btn"
          disabled={!state}
          onClick={() => {
            setQuestion(t.ai[key]);
            handleAsk(t.ai[key]);
          }}
        >
          {t.ai[key]}
        </button>
      ))}
    </div>
  );

  const compose = isCentered ? (
    <>
      <div className="ai-compose-row">
        <textarea
          id="ai-q"
          className="ai-compose-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          placeholder={t.ai.hint}
          aria-label={t.ai.hint}
        />
        <button
          type="button"
          className={`btn-primary ai-ask-btn ${loading ? 'is-loading' : ''}`}
          onClick={() => handleAsk()}
          disabled={loading || !state}
        >
          <span className="btn-label">{loading ? t.ai.thinking : t.ai.ask}</span>
        </button>
      </div>
      <p className="ai-compose-hint">{t.ai.composeHint}</p>
    </>
  ) : (
    <div className="ai-question">
      {!isBar && <label htmlFor="ai-q">{t.ai.hint}</label>}
      <textarea
        id="ai-q"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={isBar ? 1 : 2}
        placeholder={isBar ? t.ai.hint : undefined}
      />
      <button type="button" className="btn-primary" onClick={() => handleAsk()} disabled={loading || !state}>
        {loading ? t.ai.thinking : t.ai.ask}
      </button>
    </div>
  );

  if (isCentered) {
    return (
      <aside className="ai-tutor ai-tutor--centered card" aria-label={t.ai.title}>
        <header className="ai-tutor-header">
          <div>
            <h3 className="ai-tutor-title">{t.ai.title}</h3>
            <p className="ai-verified-badge">AI-assisted, human-verified</p>
          </div>
        </header>

        <section className="ai-section ai-section--status" aria-labelledby="ai-status-heading">
          <h4 id="ai-status-heading" className="ai-section-label">
            {t.ai.statusLabel}
          </h4>
          {statusChips}
        </section>

        <section className="ai-section ai-section--presets" aria-labelledby="ai-presets-heading">
          <h4 id="ai-presets-heading" className="ai-section-label">
            {t.ai.presetsLabel}
          </h4>
          {presets}
        </section>

        <section className="ai-section ai-section--compose" aria-labelledby="ai-compose-heading">
          <h4 id="ai-compose-heading" className="ai-section-label visually-hidden">
            {t.ai.ask}
          </h4>
          {compose}
        </section>

        {answer && (
          <section className="ai-section ai-section--answer" role="status" aria-live="polite">
            <h4 className="ai-section-label">{t.ai.responseLabel}</h4>
            <div className="ai-answer">
              <pre>{answer}</pre>
            </div>
          </section>
        )}

        <p className="ai-footnote">{t.ai.footnote}</p>
      </aside>
    );
  }

  if (isBar) {
    return (
      <section className="ai-tutor ai-tutor--bar card" aria-label={t.ai.title}>
        <div className="ai-bar-row ai-bar-row--head">
          <h3 className="ai-bar-title">{t.ai.title}</h3>
          <span className="ai-verified-badge">AI-assisted, human-verified</span>
          {legacyMetrics}
          {presets}
        </div>
        <div className="ai-bar-row ai-bar-row--compose">{compose}</div>
        {answer && (
          <div className="ai-bar-row ai-bar-row--answer">
            <div className="ai-answer" role="status">
              <strong>{t.ai.responseLabel}</strong>
              <pre>{answer}</pre>
            </div>
          </div>
        )}
        <p className="ai-footnote">{t.ai.footnote}</p>
      </section>
    );
  }

  return (
    <aside className="ai-tutor card" aria-label={t.ai.title}>
      <h3>{t.ai.title}</h3>
      <p className="ai-verified-badge">AI-assisted, human-verified</p>
      {legacyMetrics}
      {presets}
      {compose}
      {answer && (
        <div className="ai-answer" role="status">
          <strong>{t.ai.responseLabel}</strong>
          <pre>{answer}</pre>
        </div>
      )}
      <p className="ai-footnote">{t.ai.footnote}</p>
    </aside>
  );
}
