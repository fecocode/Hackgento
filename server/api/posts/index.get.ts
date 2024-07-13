import RedisSingleton from "~/classes/redis-singletone.class"

import admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { RAW_USER_POST_RESPONSE_DATA } from "~/types/api-spec.types";
import { createClerkClient } from "@clerk/clerk-sdk-node"

function parseFirestoreTimeStampFormatToDate(firestoreFormatedDate: {_seconds: number, _nanoseconds: number} | null) {
  if (firestoreFormatedDate) {
    return new Date(
      firestoreFormatedDate._seconds * 1000 + firestoreFormatedDate._nanoseconds / 1000000
    )
  } else {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()

  const redis = RedisSingleton.getInstance(runtimeConfig)

  const recentPostIds = await redis.lrange('recent_posts', 0, 99);

  if (!admin.apps.length) {  
    initializeApp({
      credential: admin.credential.cert(JSON.parse(runtimeConfig.FIREBASE_ADMIN_KEY)),
      databaseURL: runtimeConfig.FIREBASE_DATABASE_ID,
    })
  }

  const clerk = createClerkClient({
    secretKey: runtimeConfig.CLERK_SECRET_KEY!,
    publishableKey: runtimeConfig.public.CLERK_PUBLISHABLE_KEY!,
  })

  const recentPostsObjects = []

  for (let postId of recentPostIds) {
    const rawCatchedPost = await redis.get(`post:${postId}`)
    let postObject = null

    if (!rawCatchedPost) {
      const querySnapshotOfPostSearch = await admin
        .firestore()
        .collection('user-posts')
        .doc(postId)
        .get()

      const storedPostOnDatabase = querySnapshotOfPostSearch.data()

      if (!storedPostOnDatabase || storedPostOnDatabase.deleted) {
        continue
      }

      const parsedFoundedPost = {
        id: storedPostOnDatabase.id,
        text: storedPostOnDatabase.text,
        created_at: parseFirestoreTimeStampFormatToDate(storedPostOnDatabase.created_at),
        updated_at: parseFirestoreTimeStampFormatToDate(storedPostOnDatabase.updated_at),
        deleted_at: parseFirestoreTimeStampFormatToDate(storedPostOnDatabase.deleted_at),
        user_id: storedPostOnDatabase.user_id,
        deleted: storedPostOnDatabase.deleted,
      }

      await redis.set(`post:${postId}`, JSON.stringify(parsedFoundedPost), 'EX', 60*60*24)
      postObject = parsedFoundedPost
    } else {
      postObject = JSON.parse(rawCatchedPost)
    }

    let author = null

    const catchedAuthor = await redis.get(`author:${postObject.user_id}`)

    if (!catchedAuthor) {
      const authorClerkData = await clerk.users.getUser(postObject.user_id)

      author = {
        username: authorClerkData.username!,
        avatar: authorClerkData.imageUrl,
      }

      await redis.set(`author:${postObject.user_id}`, JSON.stringify(author))
    } else {
      author = JSON.parse(catchedAuthor)
    }

    const postFormatedForFrontend: RAW_USER_POST_RESPONSE_DATA = {
      id: postObject.id,
      text: postObject.text,
      created_at: postObject.created_at,
      user_id: postObject.user_id,
      fav_count: 0,
      author: {
        username: author.username!,
        avatar: author.imageUrl,
      }
    }

    recentPostsObjects.push(postFormatedForFrontend)
  }

  return recentPostsObjects
})