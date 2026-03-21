<script setup lang="ts">
import { computed } from "vue";
import { Popup as VanPopup, Icon as VanIcon } from "vant";
import avatarImage from "@/assets/avatar.png";
import type { Conversation } from "@/types";

const props = withDefaults(
  defineProps<{
  show: boolean;
  activeId: string;
  conversations?: Conversation[];
}>(),
  {
    conversations: () => [],
  }
);

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "create"): void;
  (e: "select", id: string): void;
}>();

const popupStyle = computed(() => ({
  width: "78vw",
  maxWidth: "320px",
  height: "100%",
}));

const sessionGroups = computed(() => {
  const groups = new Map<string, Conversation[]>();
  const conversations = Array.isArray(props.conversations)
    ? props.conversations
    : [];

  conversations.forEach((conversation) => {
    const items = groups.get(conversation.groupLabel) ?? [];
    items.push(conversation);
    groups.set(conversation.groupLabel, items);
  });

  return Array.from(groups, ([label, items]) => ({ label, items }));
});

const handleClose = () => emit("update:show", false);

const handleSelect = (id: string) => {
  emit("select", id);
  handleClose();
};
</script>

<template>
  <VanPopup
    :show="show"
    position="left"
    :style="popupStyle"
    overlay-class="conversation-sidebar-overlay"
    @update:show="emit('update:show', $event)"
  >
    <aside class="conversation-sidebar">
      <div class="sidebar-header">
        <div class="brand">AI Agent</div>
        <button class="icon-btn" type="button" @click="handleClose">
          <van-icon name="cross" size="20px" />
        </button>
      </div>

      <button class="new-chat-btn" type="button" @click="emit('create')">
        <VanIcon name="add-o" />
        <span>开启新对话</span>
      </button>

      <div class="session-groups">
        <section
          v-for="group in sessionGroups"
          :key="group.label"
          class="session-group"
        >
          <h3 class="group-title">{{ group.label }}</h3>
          <div class="group-list">
            <button
              v-for="item in group.items"
              :key="item.id"
              type="button"
              class="session-item"
              :class="{ active: item.id === props.activeId }"
              @click="handleSelect(item.id)"
            >
              <div class="session-main">
                <div class="session-title">{{ item.title }}</div>
              </div>
              <VanIcon name="ellipsis" class="session-more" />
            </button>
          </div>
        </section>
      </div>

      <div class="sidebar-footer">
        <img class="avatar" :src="avatarImage" alt="avatar" />
        <div class="user-name">你好杰妮</div>
        <VanIcon name="ellipsis" />
      </div>
    </aside>
  </VanPopup>
</template>

<style scoped lang="less">
.conversation-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f7f8fb 0%, #f3f5f9 100%);
  color: #20242d;
  padding: 14px 12px 10px;
  box-sizing: border-box;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding: 2px 4px;
}

.brand {
  font-size: 20px;
  line-height: 1;
  font-weight: 700;
  color: #4e6bff;
  letter-spacing: -0.3px;
}

.icon-btn,
.new-chat-btn,
.session-item {
  border: none;
  outline: none;
  font: inherit;
}

.icon-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: transparent;
  color: #626b7f;
}

.new-chat-btn {
  width: 100%;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%);
  box-shadow:
    inset 0 0 0 1px #e8ebf2,
    0 1px 2px rgba(15, 23, 42, 0.03);
  color: #434b5c;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}

.new-chat-btn :deep(.van-icon) {
  font-size: 15px;
  color: #4b5565;
}

.session-groups {
  flex: 1;
  overflow-y: auto;
  padding-right: 2px;
}

.session-group + .session-group {
  margin-top: 14px;
}

.group-title {
  margin: 0 0 8px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.session-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  background: transparent;
  border-radius: 12px;
  padding: 10px 10px;
  color: #30384a;
}

.session-item.active {
  background: #dde8ff;
  color: #5b86ff;
}

.session-main {
  min-width: 0;
  flex: 1;
}

.session-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
}

.session-more {
  flex-shrink: 0;
  color: #98a1b3;
  font-size: 16px;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  margin-top: 10px;
  padding: 0 8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.68);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<style lang="less">
.conversation-sidebar-overlay {
  background: rgba(15, 23, 42, 0.34);
  backdrop-filter: blur(1px);
}
</style>
