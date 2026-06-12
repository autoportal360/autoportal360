export default async function EditCityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const CityForm = (await import('../CityForm')).default
  return <CityForm cityId={id} />
}
