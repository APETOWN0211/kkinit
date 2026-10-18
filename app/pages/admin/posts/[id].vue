<script setup lang="ts">
import { usePostForm } from '~/composables/usePostForm'
import { deleteStoragePaths } from '~/utils/storage-upload'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()
const postId = String(route.params.id)

const {
  state,
  authors,
  loadAuthors,
  loadPost,
  addTag,
  removeTag,
  addNewImages,
  removeImage,
  moveImage,
  addAuthor,
  submit
} = usePostForm()

const notFound = ref(false)
const initError = ref<string | null>(null)

onMounted(async () => {
  await loadAuthors()
  try {
    await loadPost(postId)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.toLowerCase().includes('not found')) {
      notFound.value = true
    } else {
      initError.value = msg
    }
  }
})

async function onSubmit(): Promise<void> {
  // For edit: collect images that were removed (existed before, no longer in state).
  const sb = await import('~/composables/useSupabaseTyped').then((m) =>
    m.useSupabaseAdmin()
  )
  if (!sb) return

  // Find removed existing image paths
  const { data: prevData } = await sb
    .from('post_images')
    .select('image_path')
    .eq('post_id', postId)
  const prevPaths = (prevData ?? []).map((r: { image_path: string }) => r.image_path)
  const currentExistingPaths = state.images
    .filter((i) => i.isExisting)
    .map((i) => (i as { path: string }).path)
  const removed = prevPaths.filter((p) => !currentExistingPaths.includes(p))

  const id = await submit('update', postId)
  if (id) {
    if (removed.length > 0) {
      await deleteStoragePaths(removed)
    }
    await router.push('/admin/posts')
  }
}

function onCancel(): void {
  router.push('/admin/posts')
}
</script>

<template>
  <div>
    <div v-if="notFound" class="admin-post-edit__missing">
      <p>게시글을 찾을 수 없습니다.</p>
      <button class="admin-post-edit__back" @click="onCancel">목록으로</button>
    </div>
    <div v-else-if="initError" class="admin-post-edit__missing">
      <p>{{ initError }}</p>
      <button class="admin-post-edit__back" @click="onCancel">목록으로</button>
    </div>
    <AdminPostForm
      v-else
      mode="update"
      :state="state"
      :authors="authors"
      :loading="state.loading"
      :add-author="addAuthor"
      @submit="onSubmit"
      @cancel="onCancel"
      @add-image="addNewImages"
      @remove-image="removeImage"
      @move-image="moveImage"
      @add-tag="addTag"
      @remove-tag="removeTag"
    />
  </div>
</template>

<style scoped>
.admin-post-edit__missing {
  max-width: 600px;
  margin: 60px auto;
  padding: 24px;
  background: #FFFFFF;
  border-radius: 12px;
  text-align: center;
}
.admin-post-edit__back {
  margin-top: 16px;
  height: 36px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  background: #FE5531;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
</style>
