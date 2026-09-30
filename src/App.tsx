import Attribution from './components/Attribution';
import CityResults from './components/CityResults';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import QueryStatus from './components/QueryStatus';
import SearchForm from './components/SearchForm';
import UnitToggle from './components/UnitToggle';
import { useWeatherApp } from './hooks/useWeatherApp';

export default function App() {
  const weatherApp = useWeatherApp();
  const cities = weatherApp.search.status === 'success' ? weatherApp.search.data : [];

  return (
    <main className="min-h-screen bg-night-900 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Weather App</h1>
          <p className="text-sm text-white/70">Consulte o clima da cidade que você escolher.</p>
        </header>

        <section aria-label="Buscar cidade" className="space-y-4">
          <SearchForm
            query={weatherApp.query}
            queryError={weatherApp.queryError}
            isLoading={weatherApp.search.status === 'loading'}
            onQueryChange={weatherApp.setQuery}
            onSubmit={weatherApp.submitSearch}
          />
          <QueryStatus
            search={weatherApp.search}
            weather={weatherApp.weather}
            onRetrySearch={weatherApp.retrySearch}
            onRetryForecast={weatherApp.retryForecast}
          />
          {weatherApp.search.status === 'success' && (
            <CityResults cities={cities} onSelectCity={weatherApp.selectCity} />
          )}
        </section>

        {weatherApp.selectedCity !== null && (
          <section aria-label="Clima da cidade selecionada" className="space-y-6">
            <header>
              <h2 className="text-xl font-semibold">{weatherApp.selectedCity.name}</h2>
              <p className="text-sm text-white/70">
                {[weatherApp.selectedCity.admin1, weatherApp.selectedCity.country]
                  .filter((detail): detail is string => detail !== null)
                  .join(', ')}
              </p>
            </header>
            <UnitToggle unit={weatherApp.unit} onUnitChange={weatherApp.setUnit} />
            {weatherApp.weather.status === 'success' && (
              <>
                <CurrentWeather
                  current={weatherApp.weather.data.current}
                  fetchedAt={weatherApp.weather.data.fetchedAt}
                  timezone={weatherApp.weather.data.timezone}
                  unit={weatherApp.unit}
                />
                <ForecastList
                  forecast={weatherApp.weather.data.forecast}
                  timezone={weatherApp.weather.data.timezone}
                  unit={weatherApp.unit}
                />
              </>
            )}
          </section>
        )}

        <Attribution />
      </div>
    </main>
  );
}
