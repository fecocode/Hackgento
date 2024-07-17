import { defineStore } from 'pinia'
import type { IPost } from '~/types/post.interface'

export const useEditStore = defineStore({
  id: 'editStore',
  state: () => ({
    postToEdit: null as IPost | null,
    postToDelete: null as IPost | null,

    deleting: false,
    updating: false,
  }),
  actions: {
    setPostToDelete(post: IPost) {
      const modalsStore = useModalsStore()
      this.postToDelete = post
      modalsStore.openDeletePostModal()
    },
    resetPostToDelete() {
      this.postToDelete = null
    },
    setPostToEdit(post: IPost) {
      const modalsStore = useModalsStore()
      this.postToEdit = {...post} // Make a copy
      modalsStore.openEditPostModal()
    },
    resetPostToEdit() {
      this.postToEdit = null
    },

    async deletePost() {
      if (!this.postToDelete) {
        return
      }

      const toast = useToast()
      const favsStore = useFavsStore()
      const postsStore = usePostsStore()
      const modalsStore = useModalsStore()

      try {
        this.deleting = true

        await $fetch(`/api/posts/${this.postToDelete.id}`, {
          method: 'DELETE'
        })

        favsStore.removeFavPost(this.postToDelete)
        postsStore.removePost(this.postToDelete)

        this.postToDelete = null

        modalsStore.closeDeletePostModal()

        toast.add({
          color: 'green',
          icon: 'i-heroicons-check',
          title: 'Se eliminó tu chisme',
        })
      } catch (_) {
        modalsStore.closeDeletePostModal()

        toast.add({
          color: 'red',
          icon: 'i-heroicons-x-mark',
          title: 'Ocurrió un error al eliminar',
          description: 'Intenta nuevamente en unos minutos'
        })
      } finally {
        this.deleting = false
      }
    },

    async saveEditedPost(newContent: string) {
      if (!this.postToEdit) {
        return
      }

      const toast = useToast()
      const favsStore = useFavsStore()
      const postsStore = usePostsStore()
      const modalsStore = useModalsStore()

      try {
        this.updating = true

        await $fetch(`/api/posts/${this.postToEdit.id}`, {
          method: 'PATCH',
          body: {
            text: newContent,
          }
        })

        this.postToEdit.text = newContent

        favsStore.updateRecentEditedFavPost(this.postToEdit)
        postsStore.updateRecentEditedPost(this.postToEdit)

        this.postToEdit = null

        modalsStore.closeEditPostModal()

        toast.add({
          color: 'green',
          icon: 'i-heroicons-check',
          title: 'Se guardó tu chisme',
        })
      } catch (_) {
        modalsStore.closeEditPostModal()

        toast.add({
          color: 'red',
          icon: 'i-heroicons-x-mark',
          title: 'Ocurrió un error al guardar',
          description: 'Intenta nuevamente en unos minutos'
        })
      } finally {
        this.updating = false
      }
    }
  }
})