// This service provides population statistics using the World Bank API
// API docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/898581

interface GlobalPopulation {
  year: number;
  population: number; // in billions
  growthRate: number; // percentage
}

interface CountryPopulation {
  countryCode: string;
  countryName: string;
  continent:
    | "Asia"
    | "Africa"
    | "Europe"
    | "North America"
    | "South America"
    | "Oceania";
  population: number; // in millions
  year: number;
  growthRate: number;
}

interface GlobalPopulationFilter {
  startYear?: number;
  endYear?: number;
}

interface CountryPopulationFilter {
  continent?: string;
  sortBy?: "population" | "growthRate";
  limit?: number;
  order?: "asc" | "desc";
}

// World Bank API returns [metadata, data[]] — we only need the data array
// Indicator SP.POP.TOTL = total population
// Indicator SP.POP.GROW = population growth (annual %)

const WB_BASE = "https://api.worldbank.org/v2";

// Map ISO3 country codes to continents
const CONTINENT_MAP: Record<string, CountryPopulation["continent"]> = {
  CHN: "Asia",
  IND: "Asia",
  USA: "North America",
  IDN: "Asia",
  PAK: "Asia",
  BRA: "South America",
  NGA: "Africa",
  BGD: "Asia",
  RUS: "Europe",
  MEX: "North America",
  JPN: "Asia",
  ETH: "Africa",
  PHL: "Asia",
  EGY: "Africa",
  DEU: "Europe",
  TUR: "Europe",
  FRA: "Europe",
  GBR: "Europe",
  ITA: "Europe",
  ZAF: "Africa",
  KOR: "Asia",
  COL: "South America",
  ARG: "South America",
  KEN: "Africa",
  AUS: "Oceania",
  NZL: "Oceania",
  CAN: "North America",
  POL: "Europe",
  SAU: "Asia",
  THA: "Asia",
  VNM: "Asia",
  MYS: "Asia",
};

// Countries to fetch — covers all continents with high-population nations
const COUNTRY_CODES = [
  "CHN", "IND", "USA", "IDN", "PAK", "BRA", "NGA",
  "DEU", "AUS", "JPN", "GBR", "FRA", "MEX", "ETH",
  "EGY", "ZAF", "KOR", "ARG", "COL", "THA",
];

// Fallback data used when World Bank API is unreachable
const FALLBACK_GLOBAL_DATA: GlobalPopulation[] = [
  { year: 2023, population: 8.045, growthRate: 0.88 },
  { year: 2022, population: 7.975, growthRate: 0.83 },
  { year: 2021, population: 7.909, growthRate: 0.82 },
  { year: 2020, population: 7.841, growthRate: 0.87 },
  { year: 2019, population: 7.764, growthRate: 1.01 },
  { year: 2018, population: 7.683, growthRate: 1.05 },
  { year: 2017, population: 7.602, growthRate: 1.09 },
  { year: 2016, population: 7.52, growthRate: 1.12 },
  { year: 2015, population: 7.436, growthRate: 1.15 },
  { year: 2014, population: 7.351, growthRate: 1.17 },
  { year: 2013, population: 7.266, growthRate: 1.18 },
  { year: 2012, population: 7.181, growthRate: 1.2 },
  { year: 2011, population: 7.095, growthRate: 1.21 },
  { year: 2010, population: 6.957, growthRate: 1.22 },
  { year: 2009, population: 6.873, growthRate: 1.23 },
  { year: 2008, population: 6.79, growthRate: 1.24 },
  { year: 2007, population: 6.707, growthRate: 1.24 },
  { year: 2006, population: 6.625, growthRate: 1.25 },
  { year: 2005, population: 6.542, growthRate: 1.26 },
  { year: 2004, population: 6.46, growthRate: 1.27 },
];

const FALLBACK_COUNTRY_DATA: CountryPopulation[] = [
  { countryCode: "CHN", countryName: "China", continent: "Asia", population: 1425.67, year: 2023, growthRate: -0.02 },
  { countryCode: "IND", countryName: "India", continent: "Asia", population: 1428.63, year: 2023, growthRate: 0.81 },
  { countryCode: "USA", countryName: "United States", continent: "North America", population: 339.99, year: 2023, growthRate: 0.5 },
  { countryCode: "IDN", countryName: "Indonesia", continent: "Asia", population: 277.53, year: 2023, growthRate: 0.82 },
  { countryCode: "PAK", countryName: "Pakistan", continent: "Asia", population: 235.82, year: 2023, growthRate: 1.98 },
  { countryCode: "BRA", countryName: "Brazil", continent: "South America", population: 215.31, year: 2023, growthRate: 0.52 },
  { countryCode: "NGA", countryName: "Nigeria", continent: "Africa", population: 223.8, year: 2023, growthRate: 2.41 },
  { countryCode: "DEU", countryName: "Germany", continent: "Europe", population: 84.48, year: 2023, growthRate: 0.06 },
  { countryCode: "AUS", countryName: "Australia", continent: "Oceania", population: 26.44, year: 2023, growthRate: 2.01 },
  { countryCode: "JPN", countryName: "Japan", continent: "Asia", population: 123.29, year: 2023, growthRate: -0.53 },
];

// Cache to avoid re-fetching during the same session
let globalCache: GlobalPopulation[] | null = null;
let countryCache: CountryPopulation[] | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchWorldBankJSON(url: string): Promise<any[]> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`World Bank API error: ${res.status}`);
  const json = await res.json();
  // World Bank returns [metadata, dataArray]
  if (!Array.isArray(json) || json.length < 2) return [];
  return json[1] ?? [];
}

async function fetchGlobalData(): Promise<GlobalPopulation[]> {
  if (globalCache) return globalCache;

  try {
    // Fetch world population (country code "WLD") and growth rate in parallel
    const [popData, growthData] = await Promise.all([
      fetchWorldBankJSON(
        `${WB_BASE}/country/WLD/indicator/SP.POP.TOTL?format=json&date=2004:2023&per_page=100`
      ),
      fetchWorldBankJSON(
        `${WB_BASE}/country/WLD/indicator/SP.POP.GROW?format=json&date=2004:2023&per_page=100`
      ),
    ]);

    const growthByYear = new Map<number, number>();
    for (const entry of growthData) {
      if (entry.value != null) {
        growthByYear.set(parseInt(entry.date), parseFloat(entry.value.toFixed(2)));
      }
    }

    const result: GlobalPopulation[] = [];
    for (const entry of popData) {
      if (entry.value != null) {
        const year = parseInt(entry.date);
        result.push({
          year,
          population: parseFloat((entry.value / 1e9).toFixed(3)),
          growthRate: growthByYear.get(year) ?? 0,
        });
      }
    }

    if (result.length === 0) throw new Error("No data returned from API");
    globalCache = result.sort((a, b) => b.year - a.year);
    return globalCache;
  } catch (error) {
    console.warn("World Bank API unavailable, using fallback data:", error);
    globalCache = FALLBACK_GLOBAL_DATA;
    return globalCache;
  }
}

async function fetchCountryData(): Promise<CountryPopulation[]> {
  if (countryCache) return countryCache;

  try {
    const codes = COUNTRY_CODES.join(";");

    // Fetch population and growth rate for all countries in parallel
    const [popData, growthData] = await Promise.all([
      fetchWorldBankJSON(
        `${WB_BASE}/country/${codes}/indicator/SP.POP.TOTL?format=json&date=2023&per_page=500`
      ),
      fetchWorldBankJSON(
        `${WB_BASE}/country/${codes}/indicator/SP.POP.GROW?format=json&date=2023&per_page=500`
      ),
    ]);

    const growthByCode = new Map<string, number>();
    for (const entry of growthData) {
      if (entry.value != null) {
        growthByCode.set(
          entry.countryiso3code,
          parseFloat(entry.value.toFixed(2))
        );
      }
    }

    const result: CountryPopulation[] = [];
    for (const entry of popData) {
      if (entry.value != null) {
        const code = entry.countryiso3code;
        const continent = CONTINENT_MAP[code];
        if (!continent) continue;

        result.push({
          countryCode: code,
          countryName: entry.country.value,
          continent,
          population: parseFloat((entry.value / 1e6).toFixed(2)),
          year: parseInt(entry.date),
          growthRate: growthByCode.get(code) ?? 0,
        });
      }
    }

    if (result.length === 0) throw new Error("No data returned from API");
    countryCache = result;
    return countryCache;
  } catch (error) {
    console.warn("World Bank API unavailable, using fallback country data:", error);
    countryCache = FALLBACK_COUNTRY_DATA;
    return countryCache;
  }
}

export const getGlobalPopulationTrend = async (
  filter?: GlobalPopulationFilter,
): Promise<GlobalPopulation[]> => {
  let data = await fetchGlobalData();

  if (filter) {
    if (filter.startYear) {
      data = data.filter((d) => d.year >= filter.startYear!);
    }
    if (filter.endYear) {
      data = data.filter((d) => d.year <= filter.endYear!);
    }
  }

  return data.sort((a, b) => b.year - a.year);
};

export const getCountryPopulations = async (
  filter?: CountryPopulationFilter,
): Promise<CountryPopulation[]> => {
  let data = await fetchCountryData();

  if (filter) {
    if (filter.continent) {
      data = data.filter((c) => c.continent === filter.continent);
    }

    if (filter.sortBy) {
      data = [...data].sort((a, b) => {
        const compareValue = filter.order === "asc" ? 1 : -1;
        return (a[filter.sortBy!] - b[filter.sortBy!]) * compareValue;
      });
    }

    if (filter.limit && filter.limit > 0) {
      data = data.slice(0, filter.limit);
    }
  }

  return data;
};

export type {
  CountryPopulation,
  CountryPopulationFilter,
  GlobalPopulation,
  GlobalPopulationFilter,
};
