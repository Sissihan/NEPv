import { useState } from 'react';
import { useI18n } from '../i18n';
import type { AIState } from '../ai/tutor';
import { askAI } from '../ai/tutor';

interface Props {
  state: AIState | null;
}

const PRESET_KEYS = ['q1', 'q2', 'q3'] as const;

export function AIMathTutor({ state }: Props) {
  const { locale, t } = useI18n();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = (q?: string) => {
    const text = (q ?? question).trim();
    if (!state || !text) return;
    setLoading(true);
    window.setTimeout(() => {
      setAnswer(askAI(text, state, locale));
      setLoading(false);
    }, 350);
  };

  return (
    <aside className="ai-tutor card" aria-label={t.ai.title}>
      <h3>{t.ai.title}</h3>
      <p className="ai-verified-badge">AI-assisted, human-verified</p>

      {state ? (
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
          <div className="ai-metric small">{state.freezeA ? 'Frozen A' : 'Dynamic NEPv'}</div>
        </div>
      ) : (
        <p className="ai-hint">{t.ai.hint}</p>
      )}

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

      <div className="ai-question">
        <label htmlFor="ai-q">{t.ai.hint}</label>
        <textarea
          id="ai-q"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
        />
        <button type="button" onClick={() => handleAsk()} disabled={loading || !state}>
          {loading ? t.ai.thinking : t.ai.ask}
        </button>
      </div>

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
