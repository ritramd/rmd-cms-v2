<template>
  <!-- Keyed by route name so routes sharing a page component (Vending Sales / Sales Digital) start fresh. -->
  <RouterView v-slot="{ Component, route }">
    <component :is="Component" :key="route.name" />
  </RouterView>
</template>
