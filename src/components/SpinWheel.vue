<template>
  <ShareLink class="w-full flex justify-content-center mt-3" style="z-index: 150; position: relative;" />
  <div ref="container" class="flex spin-container">
    <picture>
      <source srcset="/img/image.avif" type="image/avif" />
      <source srcset="/img/image.webp" type="image/webp" />
      <img src="/img/image.png" class="image" alt="background image" />
    </picture>
    <div
      class="icon"
      @click="spin"
      @keyup.enter="spin"
      @keyup.space="spin"
      v-tooltip.bottom="{
        value: `↻ Spin!`,
        class: 'text-xl',
        escape: true
      }"
      tabindex="0"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import random from 'random';
import { Wheel, type WheelProps } from 'spin-wheel';
import { useDialog } from 'primevue/usedialog';
import { TickSound, LabelLength } from '@/services/SettingService';
import { Items } from '@/services/ItemService';
import { addHistory } from '@/services/HistoryService';
import CongratulationDialog from '@/components/CongratulationDialog.vue';

const properties: WheelProps = {
  // debug: import.meta.env.DEV,
  isInteractive: false,
  radius: 0.48,
  rotationResistance: 0,
  itemLabelRadius: 0.92,
  itemLabelRadiusMax: 0.3,
  itemLabelRotation: 180,
  itemLabelAlign: 'left',
  itemLabelColors: ['#fff'],
  itemLabelBaselineOffset: -0.07,
  // 3D text effect with stroke
  itemLabelStrokeColor: '#000000',
  itemLabelStrokeWidth: 3,
  // Should also change app.scss
  itemLabelFont:
    '"Suez One", "Mochiy Pop P One", "Jua", "Unbounded", "Mitr", "Noto Sans TC", "Noto Sans SC", "Noto Sans Lao", "Noto Color Emoji"',
  itemLabelFontSizeMax: 70, // Larger for better visibility
  itemBackgroundColors: [
    '#fdc963',
    '#00cca8',
    '#2b87e9',
    '#fd775b',
    '#ff4b78',
    '#c88857',
    '#a64a97',
    '#5b7c7d',
    '#715344',
    '#904e55',
    '#8b7856'
  ],
  rotationSpeedMax: 2000,
  lineWidth: 2, // Thicker lines for modern look
  lineColor: '#ffffff',
  // 3D border effect
  borderColor: '#ffffff',
  borderWidth: 4,
  items: []
};

const container = ref();

let spinCount = 0;
let wheel: Wheel | undefined = undefined;

const stopAndClearSound = () => {
  if (!wheel) return;

  wheel.onCurrentIndexChange = () => {};
  wheel.stop();
};

const playSound = () => {
  if (!TickSound.value) return;

  var src = TickSound.value.value.startsWith('data:')
    ? TickSound.value.value
    : `/sound/${TickSound.value.value}`;
  const audio = new Audio(src);
  audio.volume = 0.3;
  audio.play();
};

const spin = () => {
  if (!wheel) return;

  wheel.onCurrentIndexChange = () => {
    if (!wheel) return;

    playSound();

    // Change rotation resistance based on current speed.
    // Provide a more entertaining performance.
    switch (true) {
      case wheel.rotationSpeed < 400:
        wheel.rotationResistance = -100;
        break;
      case wheel.rotationSpeed < 100:
        wheel.rotationResistance = -30;
        break;
      case wheel.rotationSpeed < 30:
        wheel.rotationResistance = -10;
        break;
    }
  };

  wheel.rotationResistance = -400;
  wheel.spin(wheel.rotationSpeed + random.int(1000, 1600));
};

const dialog = useDialog();
const openCongratulationDialog = ($event: {
  type: 'rest';
  currentIndex: number;
  rotation: number;
}) => {
  dialog.open(CongratulationDialog, {
    props: {
      modal: true,
      showHeader: false,
      style: 'border: 0',
      contentStyle: 'border: 0; backgroundColor: transparent',
      dismissableMask: true
    },
    data: {
      item: Items.value![$event.currentIndex]
    }
  });
};

onMounted(() => {
  watch(Items, (newValue) => (wheel!.items = newValue || []));
  watch(LabelLength, (newValue) => {
    wheel!.itemLabelRadiusMax = 1 - newValue;
  });

  wheel = new Wheel(container.value, {
    ...properties,
    items: Items.value,
    itemLabelRadiusMax: 1 - LabelLength.value
  });

  wheel.spin(10);

  wheel.onRest = ($event) => {
    const hitItem = Items.value?.[$event.currentIndex];
    if (hitItem) {
      // Record history of this spin result
      addHistory(hitItem);
    }

    stopAndClearSound();
    openCongratulationDialog($event);
  };

  wheel.onSpin = () => {
    gtag('event', 'spin');
    gtag('event', 'spin_count', {
      count: ++spinCount
    });
  };

  // Workaround for itemLabelRadiusMax not working on first load.
  setTimeout(() => {
    wheel!.itemLabelRadiusMax = 1 - LabelLength.value;
  }, 50);
});
</script>

<style lang="scss" scoped>
@import 'primeflex/core/_variables.scss';

.spin-container {
  aspect-ratio: 1/1;
  width: 200vw;
  height: 90vh;

  margin-top: -3.5rem;
  margin-bottom: -10vh;
  position: relative;

  // 3D container effect
  perspective: 1500px;
  transform-style: preserve-3d;

  // Modern depth with shadows
  filter: drop-shadow(0 25px 70px rgba(0, 0, 0, 0.6))
    drop-shadow(0 10px 30px rgba(0, 0, 0, 0.4));

  // Subtle 3D perspective tilt
  transform: perspective(1500px) rotateX(3deg);

  // 3D canvas styling - pointer/indicator rendered here, must be at top
  :deep(canvas) {
    border-radius: 50%;
    position: relative;
    z-index: 100; // Highest - pointer/indicator must be visible above everything
    transform: translateZ(30px);
    filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.5))
      drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
    transition: filter 0.4s ease, transform 0.4s ease;
  }

  // Enhanced glow on hover
  &:hover :deep(canvas) {
    transform: translateZ(50px);
    filter: drop-shadow(0 25px 60px rgba(255, 255, 255, 0.15))
      drop-shadow(0 20px 50px rgba(0, 0, 0, 0.5))
      drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
  }

  @media (min-width: map-get($breakpoints, 'sm')) {
    height: 100vh;
  }

  @media (min-width: map-get($breakpoints, 'md')) {
    height: 110vh;
  }
}

.image {
  object-position: center;
  object-fit: contain;

  aspect-ratio: 1/1;
  width: 200vw;
  height: 90vh;

  position: absolute;
  z-index: 1; // Background layer - lowest
  top: calc(calc(50%) - calc(90vh / 2));
  left: calc(calc(50%) - calc(200vw / 2));

  @media (min-width: map-get($breakpoints, 'sm')) {
    height: 100vh;
    top: calc(calc(50%) - calc(100vh / 2));
  }

  @media (min-width: map-get($breakpoints, 'md')) {
    height: 110vh;
    top: calc(calc(50%) - calc(110vh / 2));
  }
}

.button-container {
  margin-top: -5.5rem;

  button {
    z-index: 2;
    position: relative;

    $background-color: #0c0f1d;
    background: $background-color;

    &:hover {
      filter: brightness(1.3);
    }
  }
}

.icon {
  $icon-size: 13vh;
  cursor: pointer;
  z-index: 200; // Absolute top - must be clickable above everything including pointer

  width: $icon-size;
  height: $icon-size;
  border-radius: 50%;

  background-image: url(/img/icon.png);
  background-image: -webkit-image-set(
    url(/img/icon.avif) type('image/avif'),
    url(/img/icon.webp) type('image/webp'),
    url(/img/icon.png) type('image/png')
  );
  background-image: image-set(
    url(/img/icon.avif) type('image/avif'),
    url(/img/icon.webp) type('image/webp'),
    url(/img/icon.png) type('image/png')
  );

  background-size: contain;

  position: absolute;
  top: calc(calc(50%) - calc($icon-size / 2));
  left: calc(calc(50%) - calc($icon-size / 2));

  // 3D button effect
  transform: translateZ(80px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 12px 30px rgba(0, 0, 0, 0.6))
    drop-shadow(0 5px 15px rgba(255, 255, 255, 0.1));

  &:hover {
    transform: translateZ(100px) scale(1.08);
    filter: drop-shadow(0 18px 40px rgba(0, 0, 0, 0.7))
      drop-shadow(0 8px 20px rgba(255, 255, 255, 0.2))
      brightness(1.15);
  }

  &:active {
    transform: translateZ(70px) scale(0.98);
  }
}
</style>
