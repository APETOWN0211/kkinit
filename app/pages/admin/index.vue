<script setup lang="ts">
/*
 * /admin — entry. Redirects to /admin/posts.
 * Middleware ensures auth; the page itself is just a redirect.
 */
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const router = useRouter()
onMounted(() => {
  router.replace('/admin/posts')
})
</script>

<template>
  <div />
</template>
