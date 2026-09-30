import type { City } from '../types/weather';

interface CityResultsProps {
  cities: readonly City[];
  onSelectCity: (city: City) => void;
}

function cityKey(city: City): number | string {
  return (
    city.id ??
    `${city.name}:${city.admin1 ?? ''}:${city.countryCode ?? city.country ?? ''}:${city.latitude}:${city.longitude}`
  );
}

export default function CityResults({ cities, onSelectCity }: CityResultsProps) {
  if (cities.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-2" aria-label="Resultados da busca">
      {cities.map((city) => {
        const locationDetails = [city.admin1, city.country ?? city.countryCode]
          .filter((detail): detail is string => detail !== null)
          .join(', ');
        const accessibleName =
          locationDetails.length > 0 ? `${city.name}, ${locationDetails}` : city.name;

        return (
          <li key={cityKey(city)}>
            <button
              type="button"
              aria-label={accessibleName}
              className="flex w-full flex-col items-start rounded-md border border-white/10 bg-white/5 px-4 py-3 text-left text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
              onClick={() => onSelectCity(city)}
            >
              <span className="font-medium">{city.name}</span>
              {locationDetails.length > 0 && (
                <span className="text-sm text-white/70">{locationDetails}</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
