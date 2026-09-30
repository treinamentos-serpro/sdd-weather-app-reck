/** Unidade usada para apresentar temperaturas. */
export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  /** ID da localidade no geocoding, quando fornecido. */
  id: number | null;
  /** Nome da cidade retornado pelo geocoding. */
  name: string;
  /** Subdivisão administrativa, quando fornecida. */
  admin1: string | null;
  /** Nome do país, quando fornecido. */
  country: string | null;
  /** Código ISO do país, quando fornecido. */
  countryCode: string | null;
  /** Latitude usada na consulta meteorológica. */
  latitude: number;
  /** Longitude usada na consulta meteorológica. */
  longitude: number;
}

export interface CurrentWeather {
  /** Horário de referência de `current.time`. */
  observedAt: string | null;
  /** `temperature_2m`, normalizada para Celsius. */
  temperatureC: number | null;
  /** `apparent_temperature`, normalizada para Celsius. */
  apparentTemperatureC: number | null;
  /** Código WMO de `weather_code`. */
  weatherCode: number | null;
  /** `relative_humidity_2m`, em porcentagem. */
  relativeHumidity: number | null;
  /** `wind_speed_10m`, normalizada para km/h. */
  windSpeedKmh: number | null;
}

export interface ForecastDay {
  /** Data local de `daily.time`, no formato YYYY-MM-DD. */
  localDate: string;
  /** Código WMO de `weather_code`. */
  weatherCode: number | null;
  /** `temperature_2m_min`, normalizada para Celsius. */
  temperatureMinC: number | null;
  /** `temperature_2m_max`, normalizada para Celsius. */
  temperatureMaxC: number | null;
  /** `precipitation_probability_max`, em porcentagem. */
  precipitationProbabilityMax: number | null;
}

export interface WeatherData {
  /** Localidade selecionada. */
  city: City;
  /** Fuso IANA retornado pela API meteorológica. */
  timezone: string;
  /** Horário de conclusão da consulta, em ISO 8601. */
  fetchedAt: string;
  /** Condições meteorológicas atuais normalizadas. */
  current: CurrentWeather;
  /** Cinco dias locais em ordem cronológica. */
  forecast: [ForecastDay, ForecastDay, ForecastDay, ForecastDay, ForecastDay];
  /** Indica se algum campo ou dia está indisponível. */
  isPartial: boolean;
}

/** Categorias de falha de uma requisição. */
export type RequestErrorKind = 'network' | 'http' | 'timeout' | 'invalid-response';

export interface RequestError {
  /** Categoria da falha. */
  kind: RequestErrorKind;
  /** Status HTTP, quando houver. */
  statusCode?: number;
}

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'error'; error: RequestError };
