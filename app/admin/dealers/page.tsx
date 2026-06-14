'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dealer, DealerFormData, EMPTY_DEALER_FORM, INDIAN_STATES, VehicleType, toSlug } from '@/types/dealer'

// ─── Constants ───────────────────────────────────────────────
const VEHICLE_TYPE_OPTIONS: VehicleType[] = ['cars', 'bikes', 'scooters']

const KNOWN_BRANDS = [
  { slug: 'tata',          name: 'Tata Motors' },
  { slug: 'maruti-suzuki', name: 'Maruti Suzuki' },
  { slug: 'hyundai',       name: 'Hyundai' },
  { slug: 'mahindra',      name: 'Mahindra' },
  { slug: 'kia',           name: 'Kia India' },
  { slug: 'honda',         name: 'Honda Cars India' },
  { slug: 'toyota',        name: 'Toyota' },
  { slug: 'volkswagen',    name: 'Volkswagen' },
  { slug: 'skoda',         name: 'Skoda' },
  { slug: 'mg',            name: 'MG Motor India' },
  { slug: 'renault',       name: 'Renault' },
  { slug: 'nissan',        name: 'Nissan' },
  { slug: 'bmw',           name: 'BMW' },
  { slug: 'mercedes-benz', name: 'Mercedes-Benz' },
  { slug: 'audi',          name: 'Audi' },
  { slug: 'jeep',          name: 'Jeep' },
  { slug: 'hero',          name: 'Hero MotoCorp' },
  { slug: 'bajaj',         name: 'Bajaj Auto' },
  { slug: 'tvs',           name: 'TVS Motor Company' },
  { slug: 'honda-2w',      name: 'Honda 2Wheelers India' },
  { slug: 'royal-enfield', name: 'Royal Enfield' },
  { slug: 'yamaha',        name: 'Yamaha Motor India' },
  { slug: 'suzuki',        name: 'Suzuki Motorcycle India' },
  { slug: 'ola',           name: 'Ola Electric' },
  { slug: 'ather',         name: 'Ather Energy' },
  { slug: 'revolt',        name: 'Revolt Motors' },
]

// ─── Main Component ──────────────────────────────────────────
export default function AdminDealersPage() {
  const [dealers, setDealers]           = useState<Dealer[]>([])
  const [total, setTotal]               = useState(0)
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [deleting, setDeleting]         = useState<string | null>(null)

  // Filters & pagination
  const [search, setSearch]             = useState('')
  const [filterBrand, setFilterBrand]   = useState('')
  const [filterCity, setFilterCity]     = useState('')
  const [filterType, setFilterType]     = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [page, setPage]                 = useState(1)
  const perPage = 15

  // Modal state
  const [showModal, setShowModal]       = useState(false)
  const [editDealer, setEditDealer]     = useState<Dealer | null>(null)
  const [form, setForm]                 = useState<DealerFormData>(EMPTY_DEALER_FORM)
  const [formError, setFormError]       = useState('')

  // Load dealers
  const loadDealers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      })
      if (search)              params.set('search', search)
      if (filterBrand)         params.set('brand_slug', filterBrand)
      if (filterCity)          params.set('city_slug', filterCity)
      if (filterType)          params.set('vehicle_type', filterType)
      if (filterActive !== '') params.set('is_active', filterActive)

      const res  = await fetch(`/api/dealers?${params}`)
      const json = await res.json()
      setDealers(json.dealers ?? [])
      setTotal(json.total ?? 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, filterBrand, filterCity, filterType, filterActive, page])

  useEffect(() => { loadDealers() }, [loadDealers])

  // Auto-fill city_slug and brand_slug
  const handleFormChange = (field: keyof DealerFormData, value: unknown) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value }
      if (field === 'city') updated.city_slug = toSlug(value as string)
      if (field === 'brand_slug') {
        const found = KNOWN_BRANDS.find(b => b.slug === value)
        if (found) updated.brand_name = found.name
      }
      return updated
    })
  }

  const openAddModal = () => {
    setEditDealer(null)
    setForm(EMPTY_DEALER_FORM)
    setFormError('')
    setShowModal(true)
  }

  const openEditModal = (dealer: Dealer) => {
    setEditDealer(dealer)
    setForm({
      name:            dealer.name,
      brand_slug:      dealer.brand_slug,
      brand_name:      dealer.brand_name,
      city:            dealer.city,
      city_slug:       dealer.city_slug,
      state:           dealer.state,
      address:         dealer.address,
      locality:        dealer.locality        ?? '',
      pincode:         dealer.pincode         ?? '',
      phone:           dealer.phone           ?? '',
      email:           dealer.email           ?? '',
      website:         dealer.website         ?? '',
      google_maps_url: dealer.google_maps_url ?? '',
      vehicle_types:   dealer.vehicle_types,
      is_authorized:   dealer.is_authorized,
      is_active:       dealer.is_active,
      working_hours:   dealer.working_hours   ?? 'Mon-Sat: 9 AM – 7 PM',
    })
    setFormError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.brand_slug || !form.city || !form.state || !form.address) {
      setFormError('Name, Brand, City, State, and Address are required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const method = editDealer ? 'PUT' : 'POST'
      const url    = editDealer ? `/api/dealers/${editDealer.id}` : '/api/dealers'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) {
        setFormError(json.error ?? 'Save failed')
        return
      }
      setShowModal(false)
      loadDealers()
    } catch {
      setFormError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await fetch(`/api/dealers/${id}`, { method: 'DELETE' })
      loadDealers()
    } catch {
      alert('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (dealer: Dealer) => {
    try {
      await fetch(`/api/dealers/${dealer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !dealer.is_active }),
      })
      loadDealers()
    } catch {
      alert('Update failed')
    }
  }

  const totalPages = Math.ceil(total / perPage)

  const vehicleTypeLabel = (types: string[]) =>
    types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')

  return (
    <div className="min-h-screen bg-[#06142D] p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dealers Management</h1>
          <p className="text-[#C0C0C0] text-sm mt-1">
            {total} dealer{total !== 1 ? 's' : ''} in database
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#00D4FF] text-[#06142D] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4DEBFF] transition-colors text-sm"
        >
          + Add Dealer
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="bg-[#0A1F44] rounded-xl p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name, city, brand..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 min-w-[200px] bg-[#111] border border-[#1e3a6e] rounded-lg px-4 py-2 text-white text-sm placeholder-[#666] focus:outline-none focus:border-[#00D4FF]"
        />
        <select
          value={filterBrand}
          onChange={e => { setFilterBrand(e.target.value); setPage(1) }}
          className="bg-[#111] border border-[#1e3a6e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D4FF]"
        >
          <option value="">All Brands</option>
          {KNOWN_BRANDS.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
        </select>
        <input
          type="text"
          placeholder="Filter by city slug..."
          value={filterCity}
          onChange={e => { setFilterCity(e.target.value.toLowerCase()); setPage(1) }}
          className="w-44 bg-[#111] border border-[#1e3a6e] rounded-lg px-3 py-2 text-white text-sm placeholder-[#666] focus:outline-none focus:border-[#00D4FF]"
        />
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value); setPage(1) }}
          className="bg-[#111] border border-[#1e3a6e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D4FF]"
        >
          <option value="">All Types</option>
          <option value="cars">Cars</option>
          <option value="bikes">Bikes</option>
          <option value="scooters">Scooters</option>
        </select>
        <select
          value={filterActive}
          onChange={e => { setFilterActive(e.target.value); setPage(1) }}
          className="bg-[#111] border border-[#1e3a6e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D4FF]"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-[#0A1F44] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#C0C0C0]">
            Loading dealers...
          </div>
        ) : dealers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <p className="text-[#C0C0C0]">No dealers found.</p>
            <button onClick={openAddModal} className="text-[#00D4FF] text-sm hover:underline">
              Add your first dealer →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e3a6e] text-[#C0C0C0] text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Dealer</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Brand</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">City / State</th>
                <th className="text-left px-4 py-3 hidden xl:table-cell">Types</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Rating</th>
                <th className="text-center px-4 py-3">Auth</th>
                <th className="text-center px-4 py-3">Active</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3a6e]">
              {dealers.map(dealer => (
                <tr key={dealer.id} className="hover:bg-[#0d2a5a] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{dealer.name}</div>
                    <div className="text-[#C0C0C0] text-xs mt-0.5 truncate max-w-[220px]">
                      {dealer.address}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="bg-[#111] border border-[#1e3a6e] text-[#00D4FF] text-xs px-2 py-1 rounded-full">
                      {dealer.brand_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-[#C0C0C0]">
                    <div>{dealer.city}</div>
                    <div className="text-xs text-[#888]">{dealer.state}</div>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-[#C0C0C0] text-xs">
                    {vehicleTypeLabel(dealer.vehicle_types)}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-white text-xs">{dealer.rating}</span>
                      <span className="text-[#666] text-xs">({dealer.review_count})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      dealer.is_authorized
                        ? 'bg-green-900/40 text-green-400 border border-green-700'
                        : 'bg-gray-900/40 text-gray-500 border border-gray-700'
                    }`}>
                      {dealer.is_authorized ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(dealer)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        dealer.is_active ? 'bg-[#00D4FF]' : 'bg-[#333]'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        dealer.is_active ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(dealer)}
                        className="text-[#00D4FF] hover:text-[#4DEBFF] text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dealer.id, dealer.name)}
                        disabled={deleting === dealer.id}
                        className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {deleting === dealer.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-[#C0C0C0] text-sm">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-[#0A1F44] border border-[#1e3a6e] text-white rounded text-sm disabled:opacity-40 hover:border-[#00D4FF] transition-colors"
            >
              ← Prev
            </button>
            <span className="px-3 py-1.5 text-[#C0C0C0] text-sm">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-[#0A1F44] border border-[#1e3a6e] text-white rounded text-sm disabled:opacity-40 hover:border-[#00D4FF] transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#0A1F44] border border-[#1e3a6e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0A1F44] border-b border-[#1e3a6e] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-white">
                {editDealer ? `Edit: ${editDealer.name}` : 'Add New Dealer'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#C0C0C0] hover:text-white text-xl">×</button>
            </div>

            <div className="p-6 space-y-5">
              {formError && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
                  {formError}
                </div>
              )}

              {/* Row 1: Name */}
              <div>
                <label className="block text-[#C0C0C0] text-xs font-medium uppercase tracking-wider mb-1.5">
                  Dealer Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleFormChange('name', e.target.value)}
                  placeholder="e.g. Tata Motors – Karol Bagh"
                  className="w-full bg-[#111] border border-[#1e3a6e] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00D4FF]"
                />
              </div>

              {/* Row 2: Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C0C0C0] text-xs font-medium uppercase tracking-wider mb-1.5">
                    Brand *
                  </label>
                  <select
                    value={form.brand_slug}
                    onChange={e => handleFormChange('brand_slug', e.target.value)}
                    className="w-full bg-[#111] border border-[#1e3a6e] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                  >
                    <option value="">Select brand...</option>
                    {KNOWN_BRANDS.map(b => (
                      <option key={b.slug} value={b.slug}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#C0C0C0] text-xs font-medium uppercase tracking-wider mb-1.5">
                    Brand Display Name *
                  </label>
                  <input
                    type="text"
                    value={form.brand_name}
                    onChange={e => handleFormChange('brand_name', e.target.value)}
                    placeholder="Auto-filled from brand"
                    className="w-full bg-[#111] border border-[#1e3a6e] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>

              {/* Row 3: City + State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C0C0C0] text-xs font-medium uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => handleFormChange('city', e.target.value)}
                    placeholder="e.g. Delhi, Mumbai, Bengaluru"
                    className="w-full bg-[#111] border border-[#1e3a6e] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00D4FF]"
                  />
                  {form.city_slug && (
                    <p className="text-[#666] text-xs mt-1">slug: {form.city_slug}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[#C0C0C0] text-xs font-medium uppercase tracking-wider mb-1.5">
                    State *
                  </label>
                  <select
                    value={form.state}
                    onChange={e => handleFormChange('state', e.target.value)}
                    className="w-full bg-[#111] border border-[#1e3a6e] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]"
                  >
                    <option value="">Select state...</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Locality + Pincode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C0C0C0] text-xs font-medium uppercase tracking-wider mb-1.5">
                    Locality / Area
                  </label>
                  <input
                    type="text"
                    value={form.locality}
                    onChange={e => handleFormChange('locality', e.target.value)}
                    placeholder="e.g. Karol Bagh, Andheri West"
                    className="w-full bg-[#111] border border-[#1e3a6e] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
                <div>
                  <label className="block text-[#C0C0C0] text-xs font-medium uppercase tracking-wider mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={e => handleFormChange('pincode', e.target.value)}
                    placeholder="e.g. 110005"
                    maxLength={6}
                    className="w-full bg-[#111] border border-[#1e3a6e] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>

              {/* Row 5: Address */}
              <div>
                <label className="block text-[#C0C0C0] text-xs font-medium uppercase tracking-wider mb-1.5">
                  Full Address *
                </label>
                <textarea
                  value={form.address}
                  onChange={e => handleFormChange('address', e.target.value)}
                  rows={2}
                  placeholder="Street address, landmark, city"
                  className="w-full bg-[#111] border border-[#1e3a6e] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00D4FF] resize-none"
                />
              </div>

              {/* Row 6: Phone + Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C0C0C0] text-xs font-medium uppercase tracking-wider mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => handleFormChange('phone', e.target.value)}
                    placeholder="+91-11-12345678"
                    className="w-full bg-[#111] border border-[#1e3a6e] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
                <div>
                  <label className="block text-[#C0C0C0] text-xs font-medium uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handleFormChange('email', e.target.value)}
                    placeholder="dealer@brand.com"
                    className="w-full bg-[#111] border border-[#1e3a6e] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>

              {/* Row 7: Working Hours + Google Maps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C0C0C0] text-xs font-medium uppercase tracking-wider mb-1.5">
                    Working Hours
                  </label>
                  <input
                    type="text"
                    value={form.working_hours}
                    onChange={e => handleFormChange('working_hours', e.target.value)}
                    placeholder="Mon-Sat: 9 AM – 7 PM"
                    className="w-full bg-[#111] border border-[#1e3a6e] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
                <div>
                  <label className="block text-[#C0C0C0] text-xs font-medium uppercase tracking-wider mb-1.5">
                    Google Maps URL
                  </label>
                  <input
                    type="url"
                    value={form.google_maps_url}
                    onChange={e => handleFormChange('google_maps_url', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-[#111] border border-[#1e3a6e] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>

              {/* Row 8: Vehicle Types */}
              <div>
                <label className="block text-[#C0C0C0] text-xs font-medium uppercase tracking-wider mb-2">
                  Vehicle Types *
                </label>
                <div className="flex gap-4">
                  {VEHICLE_TYPE_OPTIONS.map(vt => (
                    <label key={vt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.vehicle_types.includes(vt)}
                        onChange={e => {
                          const types = e.target.checked
                            ? [...form.vehicle_types, vt]
                            : form.vehicle_types.filter(t => t !== vt)
                          handleFormChange('vehicle_types', types)
                        }}
                        className="w-4 h-4 accent-[#00D4FF]"
                      />
                      <span className="text-white text-sm capitalize">{vt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Row 9: Toggles */}
              <div className="flex gap-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => handleFormChange('is_authorized', !form.is_authorized)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                      form.is_authorized ? 'bg-[#00D4FF]' : 'bg-[#333]'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      form.is_authorized ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </div>
                  <span className="text-white text-sm">Authorized Dealer</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => handleFormChange('is_active', !form.is_active)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                      form.is_active ? 'bg-[#00D4FF]' : 'bg-[#333]'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      form.is_active ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </div>
                  <span className="text-white text-sm">Active / Visible</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[#0A1F44] border-t border-[#1e3a6e] px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-[#1e3a6e] text-[#C0C0C0] rounded-lg hover:border-white hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-[#00D4FF] text-[#06142D] font-semibold rounded-lg hover:bg-[#4DEBFF] transition-colors text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : editDealer ? 'Update Dealer' : 'Create Dealer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
