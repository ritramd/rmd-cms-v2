import { ref, watch } from 'vue'
import type { OnboardingStep } from '@/types/flashsale'

const STORAGE_KEY = 'rmd_cms_onboarding_step'

const currentStep = ref<OnboardingStep>(null)

function initFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as OnboardingStep | null
    if (saved) currentStep.value = saved
  } catch {
    // Ignore storage errors
  }
}

initFromStorage()

watch(currentStep, (step) => {
  try {
    if (step) {
      localStorage.setItem(STORAGE_KEY, step)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore storage errors
  }
})

export function useOnboarding() {
  function startOnboarding() {
    currentStep.value = 'product_kelola_vending'
  }

  function nextStep() {
    switch (currentStep.value) {
      case 'product_kelola_vending':
        currentStep.value = 'product_endorse_flashsale'
        break
      case 'product_endorse_flashsale':
        currentStep.value = 'flashsale_tambah_button'
        break
      case 'flashsale_tambah_button':
        currentStep.value = 'flashsale_modal_info'
        break
      case 'flashsale_modal_info':
        currentStep.value = 'flashsale_modal_item'
        break
      case 'flashsale_modal_item':
        currentStep.value = 'flashsale_final_success'
        break
      case 'flashsale_final_success':
      default:
        currentStep.value = null
        break
    }
  }

  function setStep(step: OnboardingStep) {
    currentStep.value = step
  }

  function closeOnboarding() {
    currentStep.value = null
  }

  return {
    currentStep,
    startOnboarding,
    nextStep,
    setStep,
    closeOnboarding,
  }
}
