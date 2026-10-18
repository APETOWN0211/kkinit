<script setup lang="ts">
import { usePostForm } from '~/composables/usePostForm'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const router = useRouter()
const {
  state,
  authors,
  loadAuthors,
  addAuthor,
  addTag,
  removeTag,
  addNewImages,
  removeImage,
  moveImage,
  submit
} = usePostForm()

onMounted(loadAuthors)

async function onSubmit(): Promise<void> {
  const id = await submit('create')
  if (id) {
    await router.push('/admin/posts')
  }
}

function onCancel(): void {
  router.push('/admin/posts')
}
</script>

<template>
  <div>
    <AdminPostForm
      mode="create"
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
