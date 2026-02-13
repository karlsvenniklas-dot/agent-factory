import { useState, useCallback } from 'react';
import { Window } from '../common/Window';

const EQ_BANDS = [
  { freq: '60', label: '60' },
  { freq: '170', label: '170' },
  { freq: '310', label: '310' },
  { freq: '600', label: '600' },
  { freq: '1K', label: '1K' },
  { freq: '3K', label: '3K' },
  { freq: '6K', label: '6K' },
  { freq: '12K', label: '12K' },
  { freq: '14K', label: '14K' },
  { freq: '16K', label: '16K' },
];

const DEFAULT_VALUES = [50, 50, 50, 50, 50, 50, 50, 50, 50, 50];

export function Equalizer() {
  const [values, setValues] = useState<number[]>(DEFAULT_VALUES);
  const [preamp, setPreamp] = useState(50);
  const [enabled, setEnabled] = useState(true);

  const handleSliderChange = useCallback((index: number, value: number) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleReset = () => {
    setValues(DEFAULT_VALUES);
    setPreamp(50);
  };

  return (
    <Window
      title="Equalizer"
      initialPosition={{ x: 50, y: 340 }}
      width={275}
      height={130}
      className="eq-window"
    >
      <div className="eq-container">
        <div className="eq-header">
          <button
            className={`eq-toggle ${enabled ? 'active' : ''}`}
            onClick={() => setEnabled(!enabled)}
          >
            ON
          </button>
          <span className="eq-label">EQ</span>
          <button className="eq-reset" onClick={handleReset}>
            RESET
          </button>
        </div>

        <div className="eq-sliders">
          <div className="eq-band preamp-band">
            <input
              type="range"
              min="0"
              max="100"
              value={preamp}
              onChange={(e) => setPreamp(Number(e.target.value))}
              className="eq-slider"
              orient="vertical"
              aria-label="Preamp"
            />
            <span className="eq-freq">PRE</span>
          </div>

          <div className="eq-divider" />

          {EQ_BANDS.map((band, i) => (
            <div key={band.freq} className="eq-band">
              <input
                type="range"
                min="0"
                max="100"
                value={enabled ? values[i] : 50}
                onChange={(e) => handleSliderChange(i, Number(e.target.value))}
                className="eq-slider"
                orient="vertical"
                disabled={!enabled}
                aria-label={`${band.label} Hz`}
              />
              <span className="eq-freq">{band.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}
