// ============================================================
// aplikacje/pogoda.js – Weather App (Open-Meteo)
// ============================================================

export default function Weather() {
    const container = document.createElement('div');
    container.className = 'weather-wrap';
    container.setAttribute('role', 'application');
    container.setAttribute('aria-label', 'Weather');

    const search = document.createElement('div');
    search.className = 'weather-search';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter city name...';
    const btn = document.createElement('button');
    btn.textContent = 'Search';
    search.append(input, btn);

    const info = document.createElement('div');
    info.className = 'weather-info';
    info.innerHTML = '<div style="color:var(--text-secondary);">Enter a city to get weather</div>';

    container.append(search, info);

    async function fetchWeather(city) {
        try {
            // Geocode
            const geoRes = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`
            );
            const geoData = await geoRes.json();
            if (!geoData.results || geoData.results.length === 0) {
                info.innerHTML = '<div style="color:#ff6b6b;">City not found.</div>';
                return;
            }
            const { latitude, name, country } = geoData.results[0];

            // Weather
            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${geoData.results[0].longitude}&current_weather=true&timezone=auto`
            );
            const weatherData = await weatherRes.json();
            const current = weatherData.current_weather;

            const temp = current.temperature;
            const wind = current.windspeed;
            const weatherCode = current.weathercode;

            const codeMap = {
                0: '☀️ Clear',
                1: '🌤️ Partly cloudy',
                2: '⛅ Cloudy',
                3: '☁️ Overcast',
                45: '🌫️ Fog',
                48: '🌫️ Fog',
                51: '🌧️ Drizzle',
                53: '🌧️ Drizzle',
                55: '🌧️ Drizzle',
                61: '🌧️ Rain',
                63: '🌧️ Rain',
                65: '🌧️ Rain',
                71: '❄️ Snow',
                73: '❄️ Snow',
                75: '❄️ Snow',
                80: '🌧️ Rain showers',
                81: '🌧️ Rain showers',
                82: '🌧️ Rain showers',
                95: '⛈️ Thunderstorm',
                96: '⛈️ Thunderstorm',
                99: '⛈️ Thunderstorm',
            };
            const desc = codeMap[weatherCode] || `Code ${weatherCode}`;

            info.innerHTML = `
                <div style="font-size:28px;font-weight:600;">${name}, ${country}</div>
                <div class="temp">${temp}°C</div>
                <div class="desc">${desc}</div>
                <div class="details">
                    <div>💨 Wind: ${wind} km/h</div>
                    <div>🕐 ${new Date(current.time).toLocaleTimeString()}</div>
                </div>
            `;

            import('../main.js').then(({ showToast }) => {
                showToast('🌤️', `Weather updated for ${name}`);
            });
        } catch (err) {
            info.innerHTML =
                `<div style="color:#ff6b6b;">Error fetching weather: ${err.message}</div>`;
        }
    }

    btn.addEventListener('click', () => {
        const city = input.value.trim();
        if (city) fetchWeather(city);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const city = input.value.trim();
            if (city) fetchWeather(city);
        }
    });

    // Try geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
                    );
                    const data = await res.json();
                    const current = data.current_weather;
                    const temp = current.temperature;
                    const wind = current.windspeed;
                    const code = current.weathercode;
                    const codeMap = {
                        0: '☀️ Clear',
                        1: '🌤️ Partly cloudy',
                        2: '⛅ Cloudy',
                        3: '☁️ Overcast',
                        51: '🌧️ Drizzle',
                        53: '🌧️ Drizzle',
                        55: '🌧️ Drizzle',
                        61: '🌧️ Rain',
                        63: '🌧️ Rain',
                        65: '🌧️ Rain',
                        71: '❄️ Snow',
                        73: '❄️ Snow',
                        75: '❄️ Snow',
                        80: '🌧️ Rain showers',
                        81: '🌧️ Rain showers',
                        82: '🌧️ Rain showers',
                        95: '⛈️ Thunderstorm',
                        96: '⛈️ Thunderstorm',
                        99: '⛈️ Thunderstorm',
                    };
                    info.innerHTML = `
                        <div style="font-size:28px;font-weight:600;">📍 Your Location</div>
                        <div class="temp">${temp}°C</div>
                        <div class="desc">${codeMap[code] || `Code ${code}`}</div>
                        <div class="details">
                            <div>💨 Wind: ${wind} km/h</div>
                            <div>🕐 ${new Date(current.time).toLocaleTimeString()}</div>
                        </div>
                    `;
                } catch (_) { /* ignore */ }
            },
            () => { /* ignore */ }
        );
    }

    return container;
}
