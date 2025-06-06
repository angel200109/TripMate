<script setup lang="ts">
import { ServerTrainTicketsType } from "@/types/index";
const { data: ticketList } = defineProps<{ data: ServerTrainTicketsType[] }>();

console.log(ticketList);
</script>

<template>
  <div class="train-tickets">
    <div class="ticket" v-for="ticket in ticketList">
      <div class="departure-info">
        <div class="time">{{ ticket.departuretime }}</div>
        <div class="place">{{ ticket.station }}</div>
      </div>
      <div class="duration-and-trainNumber">
        <div class="center">{{ ticket.costtime }}</div>
        <div class="line"></div>
        <div class="center">{{ ticket.trainno }}</div>
      </div>
      <div class="destination-info">
        <div class="time">{{ ticket.arrivaltime }}</div>
        <div class="place">{{ ticket.endstation }}</div>
      </div>
      <div class="price">
        <div class="center">￥{{ ticket.priceed }}</div>
      </div>
    </div>
    <div class="h"></div>
  </div>
</template>

<style scoped>
.train-tickets {
  width: 100%;
  height: 200px;
  padding-bottom: 100px;
  /* background-color: aqua; */
}
.h {
  height: 20px;
}
.ticket {
  width: 85%;
  margin: auto;
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  font-size: 16px;
  border: 1px solid #d0dcf1;
  background: linear-gradient(to bottom, #e8eefb 0%, #fefefe 100%);
  border-radius: 8px;
  padding: 10px 5px;
}
.departure-info {
  width: 50px;
  padding-left: 15px;
}
.duration-and-trainNumber {
  flex: 2;
  font-size: 10px;
  color: gray;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.destination-info {
  flex: 1;
}
.price {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform: translateY(-1.5px);
  font-size: 13px;
  font-weight: 500;
}
.center {
  text-align: center;
}
.time {
  font-size: 16px;
  font-weight: 500;
}
.place {
  font-size: 10px;
  transform: translateY(-1px);
}
.line {
  height: 2px;
  background-color: rgb(220, 220, 220);
  width: 85%;
  margin: 1px auto;
}
</style>
