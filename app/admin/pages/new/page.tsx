import PageSeoForm from '../PageSeoForm'

export default async function NewPageSeoPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>
}) {
  const { key } = await searchParams
  return <PageSeoForm initialKey={key} />
}
