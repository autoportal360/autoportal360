export default async function EditStatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const StateForm = (await import('../StateForm')).default
  return <StateForm stateId={id} />
}
