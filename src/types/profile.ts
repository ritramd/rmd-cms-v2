// Domain types for User Profile and Password Management.
// Mirrored from legacy rmd-cms (pages/ganti-password/index.vue) and rmd-api-cms (/change-pwd).

export interface ChangePasswordPayload {
  pwd: string
  retype_pwd: string
  old_pwd?: string
}

export interface ChangePasswordResponse {
  code?: number
  message: string
}
