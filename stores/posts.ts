import { defineStore } from 'pinia'
import { Post } from '~/classes/post.class'
import type { RAW_USER_POST_RESPONSE_DATA } from '~/types/api-spec.types'
import type { IPost } from '~/types/post.interface'

export const usePostsStore = defineStore({
  id: 'postsStore',
  state: () => ({
    mainFeed: [] as IPost[],
    newPosts: [] as IPost[],
    usersPosts: [] as IPost[],

    highlightedPostId: null as string | null,

    refreshPostsInterval: null as NodeJS.Timeout | null,

    loadingMainFeed: false,
    loadingUsersPosts: false,
  }),
  actions: {
    addNewCreatedPost(post: IPost) {
      this.mainFeed.unshift(post)
      this.usersPosts.unshift(post)
    },
    updateFavsOfPost(postId: string, favCount: number) {
      const post = this.mainFeed.find((postOnStore) => postOnStore.id === postId)
      if (post) {
        post.fav_count = favCount
      }
    },
    async fetchMainFeed(sharedPostId?: string) {
      if (this.loadingMainFeed) {
        return
      }

      const toast = useToast()
      const favsStore = useFavsStore()

      try {
        this.loadingMainFeed = true

        await favsStore.fetchUserFavsIds()

        if (sharedPostId) {
          const response = await $fetch<RAW_USER_POST_RESPONSE_DATA[]>(`/api/posts/${sharedPostId}`)

          this.mainFeed = response.map((rawPost) => {
            return new Post(rawPost)
          })
        } else {
          if (this.mainFeed.length === 0) {
            const response = await $fetch<RAW_USER_POST_RESPONSE_DATA[]>('/api/posts')
    
            this.mainFeed = response.map((rawPost) => {
              return new Post(rawPost)
            })
          }
        }

        this.setRefreshInterval()

      } catch {
        toast.add({
          color: 'red',
          icon: 'i-heroicons-x-mark',
          title: 'Ocurrió un error al cargar nuevos chismes',
          description: 'Intenta recargar la página'
        })
      } finally {
        this.loadingMainFeed = false
      }
    },
    async refreshMainFeed() {
      const toast = useToast()

      try {
        const response = await $fetch<RAW_USER_POST_RESPONSE_DATA[]>('/api/posts')

        const parsedPosts = response.map((rawPost) => new Post(rawPost))

        const currentPostsIds = this.mainFeed.map((post) => post.id)

        this.newPosts = parsedPosts.filter((newPost) => !currentPostsIds.includes(newPost.id))
      } catch (_) {}
    },
    updateMainFeedPostList() {
      this.mainFeed = [...this.newPosts, ...this.mainFeed]
      this.newPosts = []
    },
    fetchUsersPosts() {

    },

    setRefreshInterval() {
      if (!!this.refreshPostsInterval) {
        return
      }

      this.refreshPostsInterval = setInterval(async () => {
        await this.refreshMainFeed()
      }, 1000*60) // One minute
    },
    clearRefreshInterval() {
      if (this.refreshPostsInterval) {
        clearInterval(this.refreshPostsInterval)
      }
    }
  }
})
