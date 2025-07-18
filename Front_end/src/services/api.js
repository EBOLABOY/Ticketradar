import axios from "axios";
import { getLocaleSettings } from '../utils/localeSettings';

// 使用统一的语言环境设置 - 这些常量作为后备值保留

export const Api = axios.create({
  method: "GET",
  //url: "https://sky-scrapper.p.rapidapi.com/api/v1/getLocale",
  baseURL: "https://sky-scrapper.p.rapidapi.com/",
  headers: {
    "x-rapidapi-key": import.meta.env.VITE_API_KEY,
    "x-rapidapi-host": "sky-scrapper.p.rapidapi.com",
  },
});

export const getNearByAirports = async (position) => {
  // 修复安全问题：移除敏感信息的console.log输出
  

  const settings = getLocaleSettings();
  return await Api.get(
    `api/v1/flights/getNearByAirports?lat=${position[0]}&lng=${position[1]}&locale=${settings.locale}`
  );
};

export const getSearchAirports = async (query) => {
  const settings = getLocaleSettings();
  return await Api.get(
    `api/v1/flights/searchAirport?query=${query}&locale=${settings.locale}`
  );
};

export const getSearchFlights = async (params) => {
  console.log(params);
  const settings = getLocaleSettings();
  return await Api.get(
    `api/v2/flights/searchFlights?originSkyId=${params.originSky[0].skyId}&destinationSkyId=${params.destinationSky[0].skyId}&originEntityId=${params.originSky[0].entityId}&destinationEntityId=${params.destinationSky[0].entityId}&cabinClass=${params.cabinClass}&adults=${params.passenger.adults}&sortBy=best&currency=${settings.currency}&market=${settings.locale}&countryCode=${settings.countryCode}&date=${params.oneDate}`
  );
};
