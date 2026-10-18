<script setup lang="ts">
/*
 * /admin/login
 * spec #7 — Supabase Auth (magic link OR password).
 * This page uses the email+password sign-in.
 * If a session already exists and the user is an admin, redirect to /admin/posts.
 */
import { useSupabaseAuth } from '~/composables/useSupabaseTyped'
import { isCurrentUserAdmin } from '~/composables/useSupabaseTyped'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const reasonMessage = computed(() => {
  const r = route.query.reason
  if (r === 'no-env') return 'Supabase 환경변수가 설정되지 않았습니다.'
  if (r === 'no-session') return '관리자 로그인이 필요합니다.'
  if (r === 'not-admin') return '관리자 권한이 없습니다. 운영자에게 admin_users 등록을 요청하세요.'
  return null
})

async function tryAutoRedirect(): Promise<void> {
  const isAdmin = await isCurrentUserAdmin()
  if (isAdmin) {
    await router.replace('/admin/posts')
  }
}

onMounted(() => {
  tryAutoRedirect()
})

async function onSubmit(): Promise<void> {
  if (!email.value || !password.value) {
    errorMessage.value = '이메일과 비밀번호를 입력해 주세요.'
    return
  }
  errorMessage.value = null
  loading.value = true
  try {
    const sb = await useSupabaseAuth()
    if (!sb) {
      errorMessage.value = 'Supabase 환경변수가 설정되지 않았습니다.'
      return
    }
    const { data, error } = await sb.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    if (error) {
      errorMessage.value = error.message
      return
    }
    if (!data.session) {
      errorMessage.value = '로그인에 실패했습니다.'
      return
    }
    const ok = await isCurrentUserAdmin()
    if (!ok) {
      await sb.auth.signOut()
      errorMessage.value = '관리자 권한이 없습니다.'
      return
    }
    await router.replace('/admin/posts')
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="admin-login">
    <div class="admin-login__card">
      <h1 class="admin-login__title">끼닛 관리자</h1>
      <p class="admin-login__subtitle">Supabase Auth 으로 로그인하세요.</p>

      <p v-if="reasonMessage" class="admin-login__notice">{{ reasonMessage }}</p>

      <form class="admin-login__form" @submit.prevent="onSubmit">
        <label class="admin-login__label">
          이메일
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="admin-login__input"
            :disabled="loading"
            required
          />
        </label>
        <label class="admin-login__label">
          비밀번호
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="admin-login__input"
            :disabled="loading"
            required
          />
        </label>
        <p v-if="errorMessage" class="admin-login__error">{{ errorMessage }}</p>
        <button
          type="submit"
          class="admin-login__submit"
          :disabled="loading"
        >
          {{ loading ? '로그인 중...' : '로그인' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.admin-login {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.admin-login__card {
  width: 100%;
  max-width: 420px;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.admin-login__title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: #191919;
}
.admin-login__subtitle {
  margin: 0 0 24px;
  color: #73787E;
  font-size: 14px;
}
.admin-login__notice {
  margin: 0 0 16px;
  padding: 12px 14px;
  background: #FEF3C7;
  border-radius: 8px;
  color: #92400E;
  font-size: 13px;
  line-height: 1.5;
}
.admin-login__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.admin-login__label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #4D5160;
}
.admin-login__input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #E2E5EA;
  border-radius: 8px;
  background: #FFFFFF;
  font-size: 14px;
  color: #191919;
  font-family: inherit;
  transition: border-color 120ms ease;
}
.admin-login__input:focus {
  outline: none;
  border-color: #FE5531;
}
.admin-login__error {
  margin: 0;
  color: #C7392C;
  font-size: 13px;
}
.admin-login__submit {
  height: 44px;
  border: 0;
  border-radius: 8px;
  background: #FE5531;
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms ease, opacity 120ms ease;
  font-family: inherit;
}
.admin-login__submit:hover {
  background: #E64A2A;
}
.admin-login__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
