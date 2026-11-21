const API_BASE = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_BASE = "https://geocoding-api.open-meteo.com/v1/search";

const weatherDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Rain showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Heavy thunderstorm"
};

const elements = {
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#city-search"),
  locationButton: document.querySelector("#location-button"),
  cityName: document.querySelector("#city-name"),
  cityRegion: document.querySelector("#city-region"),
  temperature: document.querySelector("#current-temperature"),
  currentIcon: document.querySelector("#current-icon"),
  description: document.querySelector("#weather-description"),
  feelsLike: document.querySelector("#feels-like"),
  humidity: document.querySelector("#humidity-value"),
  wind: document.querySelector("#wind-value"),
  sunrise: document.querySelector("#sunrise-value"),
  sunset: document.querySelector("#sunset-value"),
  hourly: document.querySelector("#hourly-forecast"),
  weekly: document.querySelector("#weekly-forecast"),
  status: document.querySelector("#status-message"),
  date: document.querySelector("#today-date"),
  unitButtons: document.querySelectorAll(".unit-button")
};

let selectedUnit = "c";
let latestWeather = null;
let requestId = 0;

const weatherIcon = (code, isDay = true) => {
  const sun = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="8" fill="#FFD267"/><g stroke="#FFE7A6" stroke-width="2.6" stroke-linecap="round"><path d="M24 4v5M24 39v5M4 24h5m30 0h5M9.9 9.9l3.6 3.6m21 21 3.6 3.6m0-28.2-3.6 3.6m-21 21-3.6 3.6"/></g></svg>`;
  const moon = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M34.5 29.5A16 16 0 0 1 18 8.6 16 16 0 1 0 39.4 29a15.9 15.9 0 0 1-4.9.5Z" fill="#FFE39A"/><path d="m35 8 .8 2.2L38 11l-2.2.8L35 14l-.8-2.2L32 11l2.2-.8L35 8Z" fill="#FFF2C5"/></svg>`;
  const cloud = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M13.5 37h21a8.5 8.5 0 0 0 .7-17 12.5 12.5 0 0 0-23.7 3.7A6.8 6.8 0 0 0 13.5 37Z" fill="#EEF4FF" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><path d="M16 31h16" stroke="#D1DFFF" stroke-width="1.4" stroke-linecap="round"/></svg>`;
  const partlyCloudy = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="29" cy="17" r="8" fill="#FFD267"/><g stroke="#FFE7A6" stroke-width="2" stroke-linecap="round"><path d="M29 4v3m0 20v3m13-13h-3m-20 0h-3m22.2-9.2-2.1 2.1m-14.2 14.2-2.1 2.1"/></g><path d="M12.5 38h21a8.5 8.5 0 0 0 .7-17 12.5 12.5 0 0 0-23.7 3.7A6.8 6.8 0 0 0 12.5 38Z" fill="#EEF4FF" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  const rain = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M13 30h21a8 8 0 0 0 .7-16 12 12 0 0 0-22.8 3.6A6.5 6.5 0 0 0 13 30Z" fill="#EEF4FF" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><path d="m17 35-2 4m11-4-2 4m11-4-2 4" stroke="#B9D2FF" stroke-width="2.6" stroke-linecap="round"/></svg>`;
  const snow = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M13 29h21a8 8 0 0 0 .7-16 12 12 0 0 0-22.8 3.6A6.5 6.5 0 0 0 13 29Z" fill="#EEF4FF" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><g fill="#D6E6FF"><circle cx="17" cy="36" r="2"/><circle cx="27" cy="38" r="2"/><circle cx="35" cy="35" r="2"/></g></svg>`;
  const thunder = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M13 29h21a8 8 0 0 0 .7-16 12 12 0 0 0-22.8 3.6A6.5 6.5 0 0 0 13 29Z" fill="#EEF4FF" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><path d="m25 28-6 10h6l-2 7 9-12h-6l3-5h-4Z" fill="#FFD267"/></svg>`;
  const fog = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M14 25h20a7 7 0 0 0 .6-14 10 10 0 0 0-19 3A5.5 5.5 0 0 0 14 25Z" fill="#EEF4FF" stroke="#fff" stroke-width="1.5"/><path d="M9 31h30m-25 6h20m-16 6h12" stroke="#D1DFFF" stroke-width="2.5" stroke-linecap="round"/></svg>`;

  if ([0].includes(code)) return isDay ? sun : moon;
  if ([1, 2].includes(code)) return partlyCloudy;
  if ([45, 48].includes(code)) return fog;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return rain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return snow;
  if ([95, 96, 99].includes(code)) return thunder;
  return cloud;
};

function displayTemperature(value) {
  const converted = selectedUnit === "f" ? (value * 9) / 5 + 32 : value;
  return `${Math.round(converted)}°`;
}

function displayWind(value) {
  const converted = selectedUnit === "f" ? value * 0.621371 : value;
  return `${Math.round(converted)} ${selectedUnit === "f" ? "mph" : "km/h"}`;
}

function displayTime(value) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(new Date(`${value}Z`));
}

function displayHour(value, index) {
  if (index === 0) return "Now";
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}Z`));
}

function displayDay(value, index) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(`${value}T12:00:00`));
}

function showStatus(message) {
  elements.status.textContent = message;
  elements.status.hidden = false;
}

function clearStatus() {
  elements.status.hidden = true;
  elements.status.textContent = "";
}

async function fetchWeather(location) {
  const currentRequest = ++requestId;
  clearStatus();
  elements.cityName.textContent = location.name;
  elements.cityRegion.textContent = [location.admin1, location.country].filter(Boolean).join(", ");
  elements.temperature.textContent = "--°";
  elements.description.textContent = "Loading forecast...";
  elements.feelsLike.textContent = "";
  elements.hourly.innerHTML = '<p class="loading-placeholder">Loading hourly forecast...</p>';
  elements.weekly.innerHTML = '<p class="loading-placeholder">Loading weekly forecast...</p>';

  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "7"
  });

  try {
    const response = await fetch(`${API_BASE}?${params}`);
    if (!response.ok) throw new Error("Weather data is temporarily unavailable.");
    const weather = await response.json();
    if (currentRequest !== requestId) return;
    latestWeather = { location, weather };
    renderWeather(location, weather);
  } catch (error) {
    if (currentRequest !== requestId) return;
    elements.description.textContent = "Forecast unavailable";
    showStatus(`${error.message} Please check your connection and try again.`);
  }
}

function renderWeather(location, weather) {
  const current = weather.current;
  elements.cityName.textContent = location.name;
  elements.cityRegion.textContent = [location.admin1, location.country].filter(Boolean).join(", ");
  elements.temperature.textContent = displayTemperature(current.temperature_2m);
  elements.currentIcon.innerHTML = weatherIcon(current.weather_code, current.is_day === 1);
  elements.description.textContent = weatherDescriptions[current.weather_code] || "Variable conditions";
  elements.feelsLike.textContent = `Feels like ${displayTemperature(current.apparent_temperature)}`;
  elements.humidity.textContent = `${current.relative_humidity_2m}%`;
  elements.wind.textContent = displayWind(current.wind_speed_10m);
  elements.sunrise.textContent = displayTime(weather.daily.sunrise[0]);
  elements.sunset.textContent = displayTime(weather.daily.sunset[0]);
  renderHourly(weather.hourly, current.time);
  renderWeekly(weather.daily);
}

function renderHourly(hourly, currentTime) {
  const currentHour = currentTime.slice(0, 13);
  let startIndex = hourly.time.findIndex((time) => time.slice(0, 13) >= currentHour);
  if (startIndex < 0) startIndex = 0;
  const hours = hourly.time.slice(startIndex, startIndex + 8);

  elements.hourly.innerHTML = hours.map((time, index) => {
    const dataIndex = startIndex + index;
    const code = hourly.weather_code[dataIndex];
    const rain = hourly.precipitation_probability[dataIndex];
    return `
      <article class="hour-item${index === 0 ? " is-now" : ""}">
        <span class="hour-time">${displayHour(time, index)}</span>
        <span class="weather-icon hour-icon">${weatherIcon(code)}</span>
        <strong class="hour-temp">${displayTemperature(hourly.temperature_2m[dataIndex])}</strong>
        <span class="hour-rain">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2S3.5 7 3.5 10a4.5 4.5 0 0 0 9 0C12.5 7 8 2 8 2Z" stroke="currentColor" stroke-width="1.4"/></svg>
          ${rain ?? 0}%
        </span>
      </article>`;
  }).join("");
}

function renderWeekly(daily) {
  elements.weekly.innerHTML = daily.time.map((date, index) => {
    const code = daily.weather_code[index];
    const rain = daily.precipitation_probability_max[index];
    return `
      <article class="day-row">
        <span class="day-name${index === 0 ? " today" : ""}">${displayDay(date, index)}</span>
        <span class="day-condition">
          <span class="weather-icon day-icon">${weatherIcon(code)}</span>
          <span>${weatherDescriptions[code] || "Variable"}</span>
        </span>
        <span class="day-rain">${rain ? `${rain}% rain` : ""}</span>
        <span class="day-temperatures">
          <strong class="day-high">${displayTemperature(daily.temperature_2m_max[index])}</strong>
          <span class="day-low">${displayTemperature(daily.temperature_2m_min[index])}</span>
        </span>
      </article>`;
  }).join("");
}

async function searchCity(query) {
  clearStatus();
  try {
    const params = new URLSearchParams({ name: query, count: "1", language: "en", format: "json" });
    const response = await fetch(`${GEOCODING_BASE}?${params}`);
    if (!response.ok) throw new Error("City search is temporarily unavailable.");
    const data = await response.json();
    if (!data.results?.length) {
      showStatus(`We couldn’t find “${query}”. Try another city name.`);
      return;
    }
    await fetchWeather(data.results[0]);
  } catch (error) {
    showStatus(`${error.message} Please check your connection and try again.`);
  }
}

function findMyLocation() {
  if (!navigator.geolocation) {
    showStatus("Location access isn’t supported by this browser. Try searching for a city instead.");
    return;
  }
  clearStatus();
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const params = new URLSearchParams({
          latitude: coords.latitude,
          longitude: coords.longitude,
          count: "1",
          language: "en",
          format: "json"
        });
        const response = await fetch(`${GEOCODING_BASE}?${params}`);
        if (!response.ok) throw new Error("Could not look up your location.");
        const data = await response.json();
        const place = data.results?.[0] || {
          name: "Your location",
          latitude: coords.latitude,
          longitude: coords.longitude
        };
        await fetchWeather(place);
      } catch (error) {
        showStatus(`${error.message} Please try searching for a city instead.`);
      }
    },
    (error) => {
      const message = error.code === error.PERMISSION_DENIED
        ? "Location access was denied. You can still search for a city."
        : "We couldn’t determine your location. Please try searching for a city.";
      showStatus(message);
    },
    { timeout: 10000 }
  );
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = elements.searchInput.value.trim();
  if (query) searchCity(query);
});

elements.locationButton.addEventListener("click", findMyLocation);

elements.unitButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedUnit = button.dataset.unit;
    elements.unitButtons.forEach((unitButton) => {
      const isActive = unitButton === button;
      unitButton.classList.toggle("is-active", isActive);
      unitButton.setAttribute("aria-pressed", String(isActive));
    });
    if (latestWeather) renderWeather(latestWeather.location, latestWeather.weather);
  });
});

elements.date.textContent = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric"
}).format(new Date());

fetchWeather({
  name: "New York",
  admin1: "New York",
  country: "United States",
  latitude: 40.7128,
  longitude: -74.006
});
