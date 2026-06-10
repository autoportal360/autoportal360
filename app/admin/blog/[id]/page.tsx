'use client'

import { useParams } from 'next/navigation'
import BlogForm from '../BlogForm'

export default function EditBlogPostPage() {
  const { id } = useParams() as { id: string }
  return <BlogForm postId={id} />
}
