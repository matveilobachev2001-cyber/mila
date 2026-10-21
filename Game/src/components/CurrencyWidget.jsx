import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n';

export default function CurrencyWidget() {
  const [usdRate, setUsdRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('/api/cbr');
        if (!response.ok) throw new Error(`Server responded: ${response.status}`);
        const xmlText = await response.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        const valuteNodes = xmlDoc.getElementsByTagName('Valute');
        for (let node of valuteNodes) {
          const charCode = node.getElementsByTagName('CharCode')[0]?.textContent;
          if (charCode === 'USD') {
            const value = node.getElementsByTagName('Value')[0]?.textContent;
            setUsdRate(value);
            break;
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="widget">...</div>;
  if (error) return <div className="widget">{t('errorLabel')}: {error}</div>;

  return (
    <div className="widget">
      <h3>{t('usdRate')}</h3>
      <p>1 USD = {usdRate} RUB</p>
    </div>
  );
}