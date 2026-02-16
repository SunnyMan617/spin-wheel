<template>
  <div class="p-inputgroup">
    <Button
      class="mr-2 item-drag-handle"
      icon="pi pi-arrows-alt"
      severity="secondary"
      outlined
      aria-label="Reorder item (use Up/Down keys)"
      tabindex="-1"
    />
    <InputText
      ref="focusMe"
      :model-value="label"
      @blur="updateLabel($event)"
      @submit="updateLabel($event)"
      @keydown.up.prevent="moveUp"
      @keydown.down.prevent="moveDown"
    ></InputText>
    <Button
      icon="pi pi-trash"
      severity="danger"
      outlined
      aria-label="Remove"
      @click="removeItem"
      tabindex="-1"
    />
    <InputNumber
      v-if="!Fairmode"
      :modelValue="weight"
      @update:modelValue="updateWeight($event)"
      @change="updateWeight($event)"
      showButtons
      :step="1"
      decrementButtonClass="p-button-secondary"
      incrementButtonClass="p-button-secondary"
      mode="decimal"
      :style="{
        maxWidth: 'fit-content'
      }"
      :pt="{
        input: {
          style: { minWidth: '4em', maxWidth: '4em', borderRadius: '0', textAlign: 'center' }
        }
      }"
      :min="1"
    >
      <template #incrementbuttonicon><i class="pi pi-plus"></i></template>
      <template #decrementbuttonicon><i class="pi pi-minus"></i></template>
    </InputNumber>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted } from 'vue';
import { ItemService } from '@/services/ItemService';
import { Fairmode } from '@/services/SettingService';

const props = defineProps(['modelValue']);

const itemService = inject<ItemService>('ItemService');

const label = ref(props.modelValue.label);
const weight = ref(props.modelValue.weight);
const focusMe = ref();

function updateLabel(value: Event) {
  const input = value.target as HTMLInputElement;
  const item = props.modelValue;
  if (input.value === item.label) return;

  label.value = input.value;
  item.label = input.value;
  itemService?.updateItem(item);
}

function updateWeight(value: Number) {
  const item = props.modelValue;
  if (value === item.weight) return;

  weight.value = value;
  item.weight = value;
  itemService?.updateItem(item);
}

function removeItem() {
  itemService?.removeItem(props.modelValue);
}

async function moveUp() {
  if (!itemService) return;

  await itemService.moveItem(props.modelValue, -1);
}

async function moveDown() {
  if (!itemService) return;

  await itemService.moveItem(props.modelValue, 1);
}

onMounted(() => {
  focusMe.value.$el.focus();
});
</script>

<style scoped></style>
