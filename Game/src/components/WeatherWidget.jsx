import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('/api/weather');

        if (!response.ok) {
          throw new Error(`Server responded: ${response.status}`);
        }

        const data = await response.json();
        const current = data.current_condition[0];

        const weatherData = {
          temperature: Math.round(parseFloat(current.temp_C)),
          windspeed: parseFloat(current.windspeedKmph),
          description: current.weatherDesc[0].value,
        };

        setWeather(weatherData);
        setError(null);
        localStorage.setItem('cyberDodgeWeather', JSON.stringify(weatherData));
      } catch (err) {
        console.error('Weather fetch error:', err);
        const saved = localStorage.getItem('cyberDodgeWeather');
        if (saved) {
          setWeather(JSON.parse(saved));
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="widget">{t('weatherLoading')}</div>;
  if (error && !weather) return <div className="widget">{t('errorLabel')}: {error}</div>;

  return (
    <div className="widget">
      <h3>{t('weatherIn')}</h3>
      <p>{t('weatherTemperature')}: {weather?.temperature}°C</p>
      <p>{t('weatherWind')}: {weather?.windspeed} km/h</p>
    </div>
  );
}