import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onUnitChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onUnitChange }: UnitToggleProps) {
  return (
    <fieldset className="inline-flex flex-col gap-2">
      <legend className="text-sm font-medium text-white">Unidade de temperatura</legend>
      <div className="inline-flex w-fit rounded-md border border-white/15 bg-night-800 p-1">
        <button
          type="button"
          aria-label="Celsius"
          aria-pressed={unit === 'celsius'}
          className={`min-h-10 min-w-12 rounded px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ${
            unit === 'celsius' ? 'bg-accent-500 text-night-900' : 'text-white hover:bg-white/10'
          }`}
          onClick={() => onUnitChange('celsius')}
        >
          °C
        </button>
        <button
          type="button"
          aria-label="Fahrenheit"
          aria-pressed={unit === 'fahrenheit'}
          className={`min-h-10 min-w-12 rounded px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ${
            unit === 'fahrenheit' ? 'bg-accent-500 text-night-900' : 'text-white hover:bg-white/10'
          }`}
          onClick={() => onUnitChange('fahrenheit')}
        >
          °F
        </button>
      </div>
    </fieldset>
  );
}
