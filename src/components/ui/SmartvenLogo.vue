<script setup lang="ts">
// Figma: white "smartven" wordmark (1097:12974), 210.6 × 32.
// Each letter is a vector clipped by two clip paths; positions are relative to the logo frame.
const files = import.meta.glob<string>('../../assets/brand/logo/*.svg', { eager: true, import: 'default' })
const asset = (n: number) => files[`../../assets/brand/logo/g${n}.svg`]

interface Part {
  x: number
  y: number
  w: number
  h: number
  /** [x, y] offsets of the two masks */
  maskPos: [string, string]
  maskSize: [string, string]
  masks: [number, number]
  image: number
}

const parts: Part[] = [
  { x: 0.11, y: 6.77, w: 21.265, h: 25.17, maskPos: ['-0.083px -0.007px', '-0.001px 0px'], maskSize: ['21.432px 25.177px', '21.267px 25.16px'], masks: [0, 1], image: 2 },
  { x: 23.72, y: 5.55, w: 33.692, h: 27.555, maskPos: ['10.12px 1.205px', '10.202px 1.246px'], maskSize: ['22.389px 25.166px', '22.228px 25.065px'], masks: [3, 4], image: 5 },
  { x: 23.73, y: 5.55, w: 33.692, h: 27.555, maskPos: ['1.185px 1.205px', '1.243px 1.246px'], maskSize: ['7.212px 25.166px', '7.116px 25.065px'], masks: [6, 7], image: 5 },
  { x: 59.81, y: 6.88, w: 25.523, h: 25.033, maskPos: ['0px 0px', '0px 0px'], maskSize: ['25.563px 25.131px', '25.531px 25.034px'], masks: [8, 9], image: 10 },
  { x: 89.12, y: 6.81, w: 15.973, h: 25.083, maskPos: ['-0.041px -0.047px', '0px 0px'], maskSize: ['16.076px 25.13px', '15.974px 25.059px'], masks: [11, 12], image: 13 },
  { x: 107.48, y: -1.25, w: 75.442, h: 34.365, maskPos: ['50.608px 8.005px', '50.665px 8.048px'], maskSize: ['23.626px 25.151px', '23.56px 25.065px'], masks: [14, 15], image: 16 },
  { x: 107.46, y: -1.24, w: 75.442, h: 34.365, maskPos: ['25.103px 8.005px', '25.184px 8.044px'], maskSize: ['23.76px 25.151px', '23.619px 25.066px'], masks: [17, 18], image: 16 },
  { x: 107.48, y: -1.16, w: 75.442, h: 34.365, maskPos: ['8.323px 5.639px', '8.401px 5.727px'], maskSize: ['0.134px 1.303px', '0.005px 1.167px'], masks: [19, 20], image: 16 },
  { x: 107.47, y: -1.16, w: 75.442, h: 34.365, maskPos: ['8.323px 6.847px', '8.386px 6.894px'], maskSize: ['0.134px 0.805px', '0.015px 0.637px'], masks: [21, 22], image: 16 },
  { x: 107.52, y: -1.17, w: 75.442, h: 34.365, maskPos: ['1.208px 1.209px', '1.245px 1.245px'], maskSize: ['22.163px 31.948px', '22.113px 31.879px'], masks: [23, 24], image: 16 },
  { x: 185.38, y: 6.8, w: 25.165, h: 25.067, maskPos: ['0px -0.039px', '0px -0.001px'], maskSize: ['25.263px 25.204px', '25.201px 25.068px'], masks: [25, 26], image: 27 },
]

function partStyle(part: Part) {
  return {
    left: `${part.x}px`,
    top: `${part.y}px`,
    width: `${part.w}px`,
    height: `${part.h}px`,
    maskImage: `url("${asset(part.masks[0])}"), url("${asset(part.masks[1])}")`,
    maskPosition: part.maskPos.join(', '),
    maskSize: part.maskSize.join(', '),
    maskRepeat: 'no-repeat',
    maskComposite: 'intersect',
  }
}
</script>

<template>
  <div class="relative h-8 w-[210.62px]" role="img" aria-label="Smartven">
    <div v-for="(part, i) in parts" :key="i" class="absolute" :style="partStyle(part)">
      <img :src="asset(part.image)" alt="" class="absolute inset-0 block size-full max-w-none" />
    </div>
  </div>
</template>
