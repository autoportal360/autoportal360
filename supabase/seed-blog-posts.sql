-- Seed 3 sample published blog posts
-- Run in Supabase SQL Editor

insert into blog_posts (title, slug, excerpt, content_html, author, tags, status, published_at, meta_title, meta_description)
values (

  -- ── Post 1: Best Cars 2026 ──────────────────────────────────────────────────
  $$Top 10 Best Cars to Buy in India in 2026$$,
  $$best-cars-india-2026$$,
  $$Looking for the best car in India? We've tested and compared the top 10 cars across all segments and budgets to help you make the right choice.$$,
  $$<h2>India's Best Cars in 2026: Our Expert Picks</h2>
<p>The Indian automotive market has exploded in 2026 with over 4.5 million passenger vehicles expected to be sold this financial year. With so many choices across segments, picking the right car can be overwhelming. Our team tested and compared over 50 models across all budgets to bring you the definitive list of the best cars you can buy in India today.</p>

<h2>1. Tata Punch — Best Car Under ₹10 Lakh</h2>
<p>The Tata Punch continues its reign as India's favourite micro-SUV. With a bold design, a 5-star Global NCAP safety rating, and features like a digital instrument cluster and wireless Android Auto, it punches well above its price. Starting from ₹6.13 lakh ex-showroom, it is the safest car you can buy for under ₹10 lakh. The 1.2-litre naturally aspirated engine returns 18.97 kmpl — practical for both city commutes and highway runs.</p>

<h2>2. Maruti Suzuki Swift — Best Hatchback</h2>
<p>The fourth-generation Swift arrived with a stronger Z-series engine, a sportier look, and improved claimed fuel efficiency of 24.8 kmpl. Its 1.2-litre petrol engine paired with a 5-speed AMT is smooth in city traffic, and the factory-fitted CNG option brings running costs down to under ₹2.5 per km. Priced from ₹6.49 lakh, the Swift remains the go-to hatchback for value buyers.</p>

<h2>3. Hyundai Creta — Best Mid-Size SUV</h2>
<p>No best-cars list in India is complete without the Creta. Now in its third generation, it offers ADAS (Advanced Driver Assistance Systems) across most variants, a panoramic sunroof, and dual 10.25-inch screens. Priced between ₹11 lakh and ₹20 lakh, the Creta is the benchmark compact SUV. The Creta Electric with a 473 km ARAI range makes the case for going EV even more compelling.</p>

<h2>4. Mahindra XUV700 — Best Value Flagship SUV</h2>
<p>The XUV700 with its twin-screen dashboard, Level 2 ADAS, and optional 2.0-litre turbocharged petrol engine making 200 PS represents extraordinary value at ₹14–25 lakh. The seven-seat layout, class-leading features, and Mahindra's expanding service network make it our pick for the best flagship SUV under ₹25 lakh. Its towing capacity and ride quality on bad roads are genuinely segment-best.</p>$$,
  $$AutoPortal360 Editorial$$,
  ARRAY['cars', 'buying guide', '2026'],
  'published',
  now() - interval '2 days',
  $$10 Best Cars in India 2026 | AutoPortal360$$,
  $$Our expert picks for the best cars to buy in India in 2026 — from hatchbacks under ₹7 lakh to flagship SUVs under ₹25 lakh, tested and compared.$$

), (

  -- ── Post 2: Himalayan 450 Review ─────────────────────────────────────────────
  $$Royal Enfield Himalayan 450 Review: Adventure Redefined$$,
  $$royal-enfield-himalayan-450-review$$,
  $$The new Himalayan 450 is the most capable Royal Enfield yet. We rode it for 500 km across Himachal Pradesh to find out if it lives up to the hype.$$,
  $$<h2>Royal Enfield Himalayan 450: Built for the Long Haul</h2>
<p>The original Himalayan with its 411cc single-cylinder engine was a cult classic — beloved for its simplicity but criticised for its dated engine and mediocre refinement. The new Himalayan 450 changes everything. Powered by a completely new 452cc liquid-cooled single-cylinder engine, it makes 40 PS and 40 Nm — figures that put it on par with the BMW G 310 GS and ahead of everything else in the adventure-touring segment under ₹3 lakh.</p>

<h2>Engine and Performance</h2>
<p>We rode the Himalayan 450 for five days across 500 km of Himachal Pradesh, covering smooth national highways, hairpin bends and rocky unpaved tracks at 3,800 metres above sea level. The Sherpa 450 engine is significantly smoother than the old 411cc unit. At highway speeds of 90–100 kmph, vibrations are minimal. The 6-speed gearbox slots precisely, and the 21-inch front wheel soaks up rough terrain with impressive composure. Our tested fuel economy was 28 kmpl across mixed terrain — better than the claimed 30 kmpl only when pushed hard uphill.</p>

<h2>Technology and Features</h2>
<p>The 450 gets a 4-inch round TFT display with Tripper navigation, Bluetooth connectivity and turn-by-turn guidance. LED lighting front and rear improves night visibility substantially. Multiple riding modes (Rain, Trail, Road, Off-Road), switchable traction control, and a new dual-channel ABS setup with an off-road mode add layers of sophistication that would have seemed impossible on a Royal Enfield five years ago. The 17-litre fuel tank gives a practical range of around 480 km between fills.</p>

<h2>Verdict: Should You Buy It?</h2>
<p>At ₹2.69 lakh ex-showroom, the Himalayan 450 is the most capable Royal Enfield ever made and one of the best adventure motorcycles available in India under ₹3 lakh. Minor gripes — the instrument cluster is slightly harder to read in direct sunlight, and the seat could be better contoured for long days in the saddle. But these are fixable with aftermarket accessories. If you want a machine that handles weekend trails and month-long Ladakh expeditions with equal ease, this is it. <strong>Rating: 9/10.</strong></p>$$,
  $$AutoPortal360 Editorial$$,
  ARRAY['bikes', 'review', 'royal enfield'],
  'published',
  now() - interval '5 days',
  $$Royal Enfield Himalayan 450 Review 2026 | AutoPortal360$$,
  $$Our full review of the Royal Enfield Himalayan 450 after 500 km across Himachal Pradesh — engine, features, ride quality and verdict.$$

), (

  -- ── Post 3: Electric Scooters Comparison ─────────────────────────────────────
  $$Electric Scooters in India 2026: Ather vs Ola vs TVS iQube Compared$$,
  $$electric-scooters-comparison-2026$$,
  $$Which electric scooter should you buy in India? We compare the Ather 450X Gen 4, Ola S1 Pro Gen 2 and TVS iQube S on range, performance and real-world ownership.$$,
  $$<h2>India's Top Three Electric Scooters: Who Wins in 2026?</h2>
<p>The electric scooter market in India has matured rapidly. Gone are the days of range anxiety, patchy service and software bugs. The Ather 450X Gen 4, Ola S1 Pro Gen 2, and TVS iQube S 5.1 kWh are now genuinely polished, daily-usable machines. We spent two weeks with each scooter — covering city commutes, expressway runs and charging tests — to give you the definitive 2026 comparison.</p>

<h2>Range: Who Goes the Furthest?</h2>
<p>On our standardised city-plus-highway test cycle, the TVS iQube S 5.1 kWh came out on top with 143 km of real-world range — impressive for its ₹1.48 lakh price. The Ather 450X Gen 4 managed 127 km in Warp mode and around 140 km in Eco, while the Ola S1 Pro Gen 2 delivered 120 km in Hyper mode and closer to 150 km in Eco. All three comfortably cover a full week of urban commuting on a single charge for riders who cover 30–40 km per day.</p>

<h2>Performance and Riding Experience</h2>
<p>The Ather 450X wins the performance crown with 6.2 kW peak power and a 0–40 kmph sprint of just 3.3 seconds in Warp mode. It's the most fun to ride — with precise handling and a kart-like feel that the others can't match. The Ola S1 Pro Gen 2 is the most powerful on paper (8.5 kW peak) but its throttle mapping feels aggressive in bursts rather than linear, which can unsettle new riders. The TVS iQube S is the smoothest and most approachable, with a progressive power delivery and rock-solid build quality that makes it ideal for daily family use.</p>

<h2>Charging Infrastructure and After-Sales</h2>
<p>Ather wins convincingly here. With over 1,500 Ather Grid fast-charging points across India, 100% home-charging compatibility and a dense service network in 100+ cities, real-world ownership anxiety is minimal. TVS iQube's service network is the largest (14,000+ dealer touchpoints) but fast charger rollout lags behind. Ola's Hypercharger network is expanding but still patchy outside Tier-1 cities — a real concern if you travel frequently.</p>

<h2>Our Verdict</h2>
<p><strong>Ather 450X Gen 4</strong> — Best for performance enthusiasts and tech lovers. <strong>TVS iQube S 5.1 kWh</strong> — Best for range, reliability and wide service access. <strong>Ola S1 Pro Gen 2</strong> — Best for features and connected experience if you live in a metro with good Hypercharger coverage. All three are excellent choices; the right one depends on where you live and what you prioritise.</p>$$,
  $$AutoPortal360 Editorial$$,
  ARRAY['scooters', 'electric', 'comparison'],
  'published',
  now() - interval '8 days',
  $$Ather 450X vs Ola S1 Pro vs TVS iQube 2026 | AutoPortal360$$,
  $$Full comparison of India's top electric scooters in 2026 — Ather 450X Gen 4, Ola S1 Pro Gen 2 and TVS iQube S tested for range, performance and ownership costs.$$

);
