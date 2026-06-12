export default async function EditPageSeoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const PageSeoForm = (await import('../PageSeoForm')).default
  return <PageSeoForm recordId={id} />
}
