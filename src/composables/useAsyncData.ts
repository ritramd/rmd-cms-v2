import { ref, shallowRef } from 'vue'
import { ApiError } from '@/services/api'

/** Loads data once on call and exposes loading / error state plus `reload` for retry buttons. */
export function useAsyncData<T>(load: () => Promise<T>, fallbackError: string) {
  const data = shallowRef<T | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function reload() {
    loading.value = true
    error.value = null
    try {
      data.value = await load()
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : fallbackError
    } finally {
      loading.value = false
    }
  }

  void reload()
  return { data, loading, error, reload }
}
