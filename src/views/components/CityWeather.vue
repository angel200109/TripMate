<script setup lang="ts">
import { ServerQueryWeatherType } from "@/types/index";
defineProps<{ weatherData: ServerQueryWeatherType }>();
</script>

<template>
  <div class="city-weather">
    <div class="weather" v-for="item in weatherData">
      <div class="weather-date">
        {{ item.daytime.slice(0, 4) }}/{{ item.daytime.slice(4, 6) }}/{{
          item.daytime.slice(6)
        }}
      </div>
      <div class="weather-condition">
        <img :src="item.day_weather_pic" alt="" />
        {{ item.day_weather }}
      </div>
      <div class="weather-temp">
        {{ item.night_air_temperature }}~{{ item.day_air_temperature }}℃
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.city-weather {
  width: 90%;
  padding-bottom: 10px;
  padding-top: 10px;
  margin: auto;
  margin-bottom: 20px;
  border-radius: 10px;
  background-color: rgb(244, 247, 255);
  border: 2px solid rgb(220, 225, 248);
}

.weather {
  margin: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  padding: 10px 20px;
}

.weather-date,
.weather-condition,
.weather-temp {
  flex: 1;
  text-align: center;
}

.weather-condition {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  img {
    width: 30px;
    margin-right: 5px;
  }
}
</style>
