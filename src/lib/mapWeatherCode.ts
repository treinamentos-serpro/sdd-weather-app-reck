const WEATHER_CODE_LABELS: Readonly<Record<number, string>> = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Encoberto',
  45: 'Nevoeiro',
  48: 'Nevoeiro com geada',
  51: 'Chuvisco fraco',
  53: 'Chuvisco moderado',
  55: 'Chuvisco intenso',
  56: 'Chuvisco congelante fraco',
  57: 'Chuvisco congelante intenso',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva intensa',
  66: 'Chuva congelante fraca',
  67: 'Chuva congelante intensa',
  71: 'Neve fraca',
  73: 'Neve moderada',
  75: 'Neve intensa',
  77: 'Grãos de neve',
  80: 'Pancadas de chuva fracas',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva fortes',
  85: 'Pancadas de neve fracas',
  86: 'Pancadas de neve fortes',
  95: 'Trovoada',
  96: 'Trovoada com granizo fraco ou moderado',
  99: 'Trovoada com granizo forte',
};

export function mapWeatherCode(weatherCode: number | null): string | null {
  if (weatherCode === null || !Number.isInteger(weatherCode)) {
    return null;
  }

  return WEATHER_CODE_LABELS[weatherCode] ?? null;
}
