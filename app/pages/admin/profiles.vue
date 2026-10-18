<script setup lang="ts">
/*
 * /admin/profiles — list & edit profiles.
 * spec #13 — minimal profile management.
 */
import type { ProfileRow } from '~/types/cms'
import { useSupabaseAdmin } from '~/composables/useSupabaseTyped'
import { publicUrl } from '~/utils/admin-helpers'
import { uploadProfileAvatar } from '~/utils/profile-avatar'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const router = useRouter()

const profiles = ref<ProfileRow[]>([])
const loading = ref(true)
const errorMessage = ref<string | null>(null)
const editing = ref<ProfileRow | null>(null)
const saving = ref(false)
const uploading = ref(false)
const editDisplayName = ref('')
const editUsername = ref('')
const editBio = ref('')
const editAvatarFile = ref<File | null>(null)
const editAvatarPreview = ref<string | null>(null)
const newMode = ref(false)
const newUsername = ref('')
const newDisplayName = ref('')
const newAvatarFile = ref<File | null>(null)
const newAvatarPreview = ref<string | null>(null)
const newFileInput = ref<HTMLInputElement | null>(null)
const editFileInput = ref<HTMLInputElement | null>(null)

async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = null
  try {
    const sb = await useSupabaseAdmin()
    if (!sb) {
      errorMessage.value = 'Supabase 환경변수가 설정되지 않았습니다.'
      return
    }
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    profiles.value = (data ?? []) as ProfileRow[]
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)

function startEdit(p: ProfileRow): void {
  editing.value = p
  editDisplayName.value = p.display_name
  editUsername.value = p.username
  editBio.value = p.bio ?? ''
  editAvatarFile.value = null
  editAvatarPreview.value = null
}

function cancelEdit(): void {
  editing.value = null
  if (editAvatarPreview.value) URL.revokeObjectURL(editAvatarPreview.value)
  editAvatarPreview.value = null
  editAvatarFile.value = null
}

function onEditFileChange(e: Event): void {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]!
  editAvatarFile.value = file
  if (editAvatarPreview.value) URL.revokeObjectURL(editAvatarPreview.value)
  editAvatarPreview.value = URL.createObjectURL(file)
  input.value = ''
}

function onNewFileChange(e: Event): void {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]!
  newAvatarFile.value = file
  if (newAvatarPreview.value) URL.revokeObjectURL(newAvatarPreview.value)
  newAvatarPreview.value = URL.createObjectURL(file)
  input.value = ''
}

async function saveEdit(): Promise<void> {
  if (!editing.value) return
  saving.value = true
  errorMessage.value = null
  try {
    const sb = await useSupabaseAdmin()
    if (!sb) return

    let avatarPath = editing.value.avatar_path
    if (editAvatarFile.value) {
      uploading.value = true
      const r = await uploadProfileAvatar(editUsername.value || editing.value.username, editAvatarFile.value)
      avatarPath = r.path
      uploading.value = false
    }

    const { error } = await sb
      .from('profiles')
      .update({
        display_name: editDisplayName.value,
        username: editUsername.value,
        bio: editBio.value || null,
        avatar_path: avatarPath
      })
      .eq('id', editing.value.id)
    if (error) throw error

    cancelEdit()
    await load()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e)
  } finally {
    saving.value = false
    uploading.value = false
  }
}

async function createNew(): Promise<void> {
  if (!newUsername.value.trim() || !newDisplayName.value.trim()) {
    errorMessage.value = 'username과 display_name을 입력하세요.'
    return
  }
  saving.value = true
  errorMessage.value = null
  try {
    const sb = await useSupabaseAdmin()
    if (!sb) return

    let avatarPath: string | null = null
    if (newAvatarFile.value) {
      uploading.value = true
      const r = await uploadProfileAvatar(newUsername.value, newAvatarFile.value)
      avatarPath = r.path
      uploading.value = false
    }

    const { error } = await sb
      .from('profiles')
      .insert({
        username: newUsername.value.trim(),
        display_name: newDisplayName.value.trim(),
        avatar_path: avatarPath
      })
    if (error) throw error

    newMode.value = false
    if (newAvatarPreview.value) URL.revokeObjectURL(newAvatarPreview.value)
    newAvatarPreview.value = null
    newAvatarFile.value = null
    newUsername.value = ''
    newDisplayName.value = ''
    await load()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e)
  } finally {
    saving.value = false
    uploading.value = false
  }
}

function avatarForRow(row: ProfileRow): string {
  return publicUrl(row.avatar_path ?? '')
}
</script>

<template>
  <div class="admin-profiles">
    <header class="admin-profiles__header">
      <h1 class="admin-profiles__title">프로필 관리</h1>
      <div class="admin-profiles__header-actions">
        <button class="admin-profiles__back" @click="router.push('/admin/posts')">← 게시글 관리</button>
        <button class="admin-profiles__new" @click="newMode = !newMode">
          {{ newMode ? '취소' : '+ 새 프로필' }}
        </button>
      </div>
    </header>

    <div v-if="newMode" class="admin-profiles__new-form">
      <h2>새 프로필</h2>
      <label>username
        <input v-model="newUsername" type="text" class="admin-profiles__input" />
      </label>
      <label>display_name
        <input v-model="newDisplayName" type="text" class="admin-profiles__input" />
      </label>
      <label>avatar
        <input
          ref="newFileInput"
          type="file"
          accept="image/*"
          class="admin-profiles__file-input"
          @change="onNewFileChange"
        />
        <button type="button" class="admin-profiles__file-btn" @click="newFileInput?.click()">파일 선택</button>
        <img v-if="newAvatarPreview" :src="newAvatarPreview" class="admin-profiles__avatar-preview" alt="" />
      </label>
      <button class="admin-profiles__save" :disabled="saving" @click="createNew">
        {{ saving ? (uploading ? '업로드 중...' : '저장 중...') : '추가' }}
      </button>
    </div>

    <p v-if="errorMessage" class="admin-profiles__error">{{ errorMessage }}</p>
    <div v-if="loading" class="admin-profiles__loading">불러오는 중...</div>

    <div v-else class="admin-profiles__list">
      <div
        v-for="p in profiles"
        :key="p.id"
        class="admin-profiles__row"
      >
        <template v-if="editing?.id === p.id">
          <div class="admin-profiles__edit-form">
            <label>display_name
              <input v-model="editDisplayName" type="text" class="admin-profiles__input" />
            </label>
            <label>username
              <input v-model="editUsername" type="text" class="admin-profiles__input" />
            </label>
            <label>bio
              <textarea v-model="editBio" rows="2" class="admin-profiles__textarea" />
            </label>
            <label>avatar
              <input
                ref="editFileInput"
                type="file"
                accept="image/*"
                class="admin-profiles__file-input"
                @change="onEditFileChange"
              />
              <button type="button" class="admin-profiles__file-btn" @click="editFileInput?.click()">파일 선택</button>
              <div v-if="editAvatarPreview" class="admin-profiles__avatar-row">
                <img :src="editAvatarPreview" class="admin-profiles__avatar-preview" alt="" />
                <span>새 미리보기</span>
              </div>
              <div v-else-if="p.avatar_path" class="admin-profiles__avatar-row">
                <img :src="avatarForRow(p)" class="admin-profiles__avatar-preview" alt="" />
                <span>현재 avatar</span>
              </div>
            </label>
            <div class="admin-profiles__edit-actions">
              <button class="admin-profiles__cancel" @click="cancelEdit">취소</button>
              <button class="admin-profiles__save" :disabled="saving" @click="saveEdit">
                {{ saving ? (uploading ? '업로드 중...' : '저장 중...') : '저장' }}
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <img
            v-if="p.avatar_path"
            class="admin-profiles__avatar"
            :src="avatarForRow(p)"
            :alt="p.display_name"
          />
          <span v-else class="admin-profiles__avatar admin-profiles__avatar--empty" />
          <div class="admin-profiles__info">
            <div class="admin-profiles__name">{{ p.display_name }}</div>
            <div class="admin-profiles__handle">@{{ p.username }}</div>
            <div v-if="p.bio" class="admin-profiles__bio">{{ p.bio }}</div>
          </div>
          <button class="admin-profiles__edit" @click="startEdit(p)">수정</button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-profiles {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}
.admin-profiles__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.admin-profiles__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #191919;
}
.admin-profiles__header-actions {
  display: flex;
  gap: 8px;
}
.admin-profiles__back,
.admin-profiles__new {
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.admin-profiles__back {
  background: #F5F6F8;
  color: #4D5160;
}
.admin-profiles__new {
  background: #FE5531;
  color: #FFFFFF;
}

.admin-profiles__new-form {
  background: #FFFFFF;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.admin-profiles__new-form h2 {
  margin: 0;
  font-size: 16px;
}
.admin-profiles__new-form label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #4D5160;
}

.admin-profiles__error {
  margin: 0 0 12px;
  padding: 10px 14px;
  background: #FEE2E2;
  color: #B91C1C;
  border-radius: 8px;
  font-size: 13px;
}
.admin-profiles__loading {
  padding: 60px 0;
  text-align: center;
  color: #73787E;
}
.admin-profiles__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.admin-profiles__row {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.admin-profiles__avatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  object-fit: cover;
  background: #F3F4F6;
  flex-shrink: 0;
}
.admin-profiles__avatar--empty { display: inline-block; }
.admin-profiles__info { flex: 1; min-width: 0; }
.admin-profiles__name { font-weight: 600; color: #191919; }
.admin-profiles__handle { color: #73787E; font-size: 12px; }
.admin-profiles__bio { color: #4D5160; font-size: 12px; margin-top: 4px; }
.admin-profiles__edit {
  height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  background: #F5F6F8;
  color: #191919;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.admin-profiles__edit:hover { background: #ECEEF1; }

.admin-profiles__edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.admin-profiles__edit-form label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #4D5160;
}
.admin-profiles__input,
.admin-profiles__textarea {
  padding: 8px 10px;
  border: 1px solid #E2E5EA;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  color: #191919;
}
.admin-profiles__input:focus,
.admin-profiles__textarea:focus { border-color: #FE5531; }
.admin-profiles__file-input { display: none; }
.admin-profiles__file-btn {
  align-self: flex-start;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #E2E5EA;
  border-radius: 6px;
  background: #FFFFFF;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  color: #4D5160;
}
.admin-profiles__avatar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #73787E;
}
.admin-profiles__avatar-preview {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
}
.admin-profiles__edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.admin-profiles__cancel {
  height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  background: #F5F6F8;
  color: #4D5160;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
}
.admin-profiles__save {
  height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  background: #FE5531;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.admin-profiles__save:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
