-- Brand SEO content table
CREATE TABLE IF NOT EXISTS brand_seo_content (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_slug     TEXT        NOT NULL UNIQUE,
  brand_name     TEXT        NOT NULL,
  seo_title      TEXT,
  seo_text       TEXT        NOT NULL DEFAULT '',
  meta_description TEXT,
  is_published   BOOLEAN     DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_brand_seo_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS brand_seo_updated_at ON brand_seo_content;
CREATE TRIGGER brand_seo_updated_at
  BEFORE UPDATE ON brand_seo_content
  FOR EACH ROW EXECUTE FUNCTION update_brand_seo_updated_at();

-- RLS
ALTER TABLE brand_seo_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_published" ON brand_seo_content
  FOR SELECT USING (is_published = true);
CREATE POLICY "service_role_all_seo" ON brand_seo_content
  FOR ALL USING (auth.role() = 'service_role');

-- ── Seed: 9 brand content pieces ─────────────────────────────────────────

INSERT INTO brand_seo_content (brand_slug, brand_name, seo_title, meta_description, seo_text) VALUES

('tata', 'Tata Motors',
'Tata Motors Dealers in India — Authorized Showrooms | AutoPortal360',
'Find authorized Tata Motors dealers across India. Compare Nexon, Punch, Harrier and Safari showrooms with contact info, ratings and directions.',
$$Tata Motors has emerged as one of India's most transformative automotive success stories. Founded in 1945 as part of the Tata Group, the company spent decades building trucks and commercial vehicles before pivoting dramatically toward passenger cars in the late 1990s. Today, Tata is one of the fastest-growing passenger vehicle brands in the country and the undisputed leader in electric vehicles.

The current lineup spans every price segment. The Tata Punch starts at around ₹6 lakh and has become India's best-selling car, combining tall-boy styling with surprising ground clearance. The Nexon — available in both petrol and electric variants — sits in the ₹8–16 lakh range and consistently earns top safety ratings. For families, the Harrier and Safari occupy the mid-size SUV segment between ₹15 lakh and ₹25 lakh, offering genuine seven-seat capability, diesel-AT drivetrains, and feature-rich cabins that rival European rivals at twice the price.

Safety has been Tata's single strongest differentiator. Models like the Nexon and Punch scored 5-star ratings from Global NCAP, making Tata the undisputed safety champion in India's mass-market segment. For families who prioritise occupant protection, no other Indian brand comes close to this track record.

Tata is also leading India's electric vehicle revolution. The Nexon EV, Tiago EV, Tigor EV, and Punch EV together give Tata the broadest EV portfolio of any Indian automaker. The company holds over 70% of the electric passenger car market, supported by Tata.ev's growing fast-charging network and Tata Power's charging infrastructure partnerships.

Dealer coverage is strong in metros, tier-2 cities, and increasingly in smaller markets. The company offers competitive financing through Tata Capital, and service quality has improved considerably in the last few years with digital booking and transparent billing now standard at most authorised outlets.$$),

('maruti-suzuki', 'Maruti Suzuki',
'Maruti Suzuki Dealers in India — Authorized Showrooms | AutoPortal360',
'Find authorized Maruti Suzuki dealers near you. Browse Swift, Brezza, Baleno and Grand Vitara showrooms with contact details and directions.',
$$Maruti Suzuki is India's largest car manufacturer and has been for over four decades. The joint venture between the Government of India and Japan's Suzuki Motor Corporation began operations in 1983 with the iconic Maruti 800 — a car that put India on four wheels and democratised personal mobility for the middle class. Today, the company commands over 40% of the Indian passenger vehicle market, a market-share dominance that no other major automotive brand in the world enjoys in its home country.

The lineup caters to every segment. Entry-level buyers choose the Alto K10 and S-Presso, priced between ₹4 lakh and ₹6 lakh. The Swift and Baleno remain perennial bestsellers in the premium hatchback space, while the Brezza and Grand Vitara lead the compact SUV segment. The Ertiga and XL6 serve family buyers looking for MPV practicality, and the Jimny has found a cult following among off-road enthusiasts despite its premium positioning.

What makes Maruti Suzuki unbeatable for most Indian buyers is its service network. With over 4,000 service centres across India — including small towns and rural areas where competing brands have no presence — owning a Maruti means never being far from a trained mechanic or genuine spare parts. Resale values consistently outperform competitors, which makes Maruti ownership particularly sensible for buyers who plan to upgrade every three to five years.

Fuel efficiency has always been a Maruti strength. The Swift and Baleno are benchmarks for real-world mileage, and the Grand Vitara is available with a self-charging mild hybrid system that delivers significantly better city economy. The CNG lineup — spanning the Alto, S-Presso, WagonR, Swift, Brezza, and Ertiga — is the most comprehensive in India.

For first-time car buyers in India, Maruti Suzuki remains the default recommendation: reliable, economical to service, easy to resell, and available everywhere.$$),

('hyundai', 'Hyundai',
'Hyundai Dealers in India — Authorized Showrooms | AutoPortal360',
'Find authorized Hyundai dealers across India. Explore Creta, Venue, Alcazar and Creta Electric showrooms with ratings and contact information.',
$$Hyundai Motor India has been a formidable force in the Indian automotive market since 1996, consistently ranking as the second-largest car manufacturer after Maruti Suzuki. What began with the Santro hatchback — a car that redefined the entry-level segment — has grown into a full-stack brand offering everything from budget hatchbacks to premium electric SUVs.

The current lineup reflects a brand that has matured considerably. The Grand i10 Nios and Exter cater to entry and sub-compact buyers, while the Venue and Creta dominate the compact SUV space. The Creta in particular is one of India's best-selling SUVs and is virtually unmatched in its segment for feature density — panoramic sunroof, ADAS with automatic emergency braking, connected car technology, and multiple engine options including petrol, diesel, and turbo petrol. The 2024 Creta refreshed its design and brought Level 2 ADAS features to the mainstream segment.

Hyundai's premium offering includes the Alcazar seven-seat family SUV, the Ioniq 5 and Ioniq 6 for buyers wanting imported premium EVs, and the Creta Electric — a locally manufactured electric SUV priced at ₹17–24 lakh that has generated massive buyer interest since its 2024 launch.

Technology and features have always been Hyundai's strength. The Bluelink connected car system, available across most models, enables remote start, climate pre-conditioning, geofencing, and live vehicle tracking — capabilities previously reserved for premium German brands priced double or triple the Hyundai.

The dealer network is robust with over 1,300 sales outlets and rapidly growing EV-specific service infrastructure. For buyers who want cutting-edge features, Korean design sensibility, and strong after-sales support, Hyundai consistently delivers one of the best ownership experiences available in India.$$),

('mahindra', 'Mahindra',
'Mahindra Dealers in India — Authorized Showrooms | AutoPortal360',
'Find authorized Mahindra dealers across India. Browse XUV700, Scorpio N, Thar and XUV400 showrooms with contact info, ratings and directions.',
$$Mahindra & Mahindra occupies a unique space in the Indian automotive landscape. The company built its early reputation on rugged utility vehicles — the iconic Bolero and the original Scorpio — before evolving into a sophisticated SUV-focused brand that now competes with European and Korean rivals on design, technology, and safety.

The current portfolio is anchored by the new-generation Scorpio N and Scorpio Classic, which together have become India's most aspirational mid-size SUVs. The XUV700 — Mahindra's technology flagship — has redefined expectations for an Indian-made vehicle, featuring ADAS with Level 2 capabilities, a panoramic sunroof, the Adrenox infotainment system with embedded Amazon Alexa, and diesel-AT combinations at prices that undercut similarly equipped rivals significantly. Waiting periods for the XUV700 have extended to months at peak demand periods.

The XUV400 is Mahindra's mass-market electric SUV, priced between ₹15 lakh and ₹19 lakh, while the more ambitious BE 6 and XEV 9e built on the new INGLO electric platform represent Mahindra's premium EV push and compete directly with Hyundai's Creta Electric and imported rivals.

Mahindra also retains its historic advantage in the off-road and rural utility segment. The Bolero continues to be India's most trusted workhorse in rural Maharashtra, Uttar Pradesh, and Madhya Pradesh. The Thar has become something of a cultural phenomenon among younger Indian buyers, offering genuine four-wheel drive capability wrapped in retro-modern styling at around ₹11–16 lakh.

Four-wheel drive strength, diesel engine durability, and best-in-class towing capacity make Mahindra the default choice for buyers in hilly regions, rural areas, and those requiring genuine off-road performance. Service quality has improved noticeably under recent management, with authorised workshops across tier-2 cities now offering digital service booking and competitive maintenance packages.$$),

('kia', 'Kia India',
'Kia Dealers in India — Authorized Showrooms | AutoPortal360',
'Find authorized Kia India dealers. Explore Seltos, Sonet and Carens showrooms with contact information, ratings and directions across India.',
$$Kia entered the Indian market in 2019 and immediately disrupted it. In just five years, the Korean brand — a sibling of Hyundai under the Hyundai Motor Group umbrella, manufactured at a dedicated plant in Andhra Pradesh — established itself as a credible premium alternative with exceptional value, building a loyal buyer base that typically skews younger and more urban than the mainstream.

The Seltos was Kia's debut product and it arrived fully loaded: panoramic sunroof, a large touchscreen, multiple engine options, and Level 1 ADAS — features that competitors charged significantly more for in 2019. The Sonet compact SUV followed and has been a consistent performer in the highly competitive sub-compact SUV segment. Both vehicles have featured regularly in India's top-10 monthly sales charts since launch.

The Carens MPV rounded out the lineup, offering seven-seat practicality in a design that avoided the bus-like appearance of traditional Indian MPVs. Its diesel-AT combination is one of the most refined driving experiences available in the ₹12–18 lakh range, particularly appreciated by families doing regular highway runs between cities.

Kia's EV6 is a lifestyle statement for premium buyers who want a sophisticated electric grand tourer, while the brand is widely expected to introduce more accessible electric vehicles for the Indian market as EV infrastructure matures.

Kia dealerships are modern and well-equipped, typically offering digital service booking, dedicated service advisors, and transparent billing. After-sales experience is consistently rated among the best in India across independent surveys. For buyers looking to step up from entry-level Maruti or Hyundai products, Kia represents one of the most compelling upgrade choices available in the current Indian market.$$),

('honda', 'Honda Cars India',
'Honda Cars Dealers in India — Authorized Showrooms | AutoPortal360',
'Find authorized Honda Cars India dealers. Explore City, Elevate and Amaze showrooms with contact information, ratings and directions.',
$$Honda Cars India established its presence in the Indian market in 1995 and built a reputation for vehicles that prioritised engineering refinement, durability, and driving quality over feature-count showmanship. Models like the City, Accord, and CR-V cultivated a fiercely loyal buyer community known for keeping their vehicles for unusually long periods — a testament to the brand's mechanical reliability.

The current Honda lineup in India is more focused than it once was. The City sedan — now in its fifth generation — remains the gold standard in its segment, offering VTEC turbocharged engine options, Honda Sensing ADAS features on the top variant, and a strong hybrid version that delivers exceptional city fuel economy without compromising performance. The City Hybrid is genuinely one of the most fuel-efficient cars in its class in India.

The Elevate compact SUV, launched in 2023, marked Honda's strategic re-entry into the mainstream SUV segment. The vehicle has been well received for its premium fit and finish, refined ride quality, and Honda's characteristic build solidity — attributes that set it apart from flashier rivals with more features but less refinement.

The Amaze compact sedan serves value-conscious buyers who prefer a traditional boot over a hatchback or SUV, and remains a strong choice in the fleet segment. The CR-V is available on order for buyers seeking a premium petrol SUV experience.

Honda's engineering hallmark is refinement: engines are smooth and willing, gearboxes are well-calibrated, and cabins remain solidly built years after purchase. This translates to lower long-term ownership costs and excellent resale values — the City consistently commands among the highest prices in the used sedan segment.

The service network is concentrated in metros and large cities, which is a limitation for buyers in smaller towns. However, service quality at Honda-authorised workshops is generally excellent, with transparent labour rates and reliable parts availability.$$),

('bajaj', 'Bajaj Auto',
'Bajaj Auto Dealers in India — Authorized Showrooms | AutoPortal360',
'Find authorized Bajaj Auto dealers. Browse Pulsar, Dominar, Avenger and Bajaj-Triumph showrooms across India with contact details.',
$$Bajaj Auto is one of India's oldest and most internationally export-oriented two-wheeler manufacturers, tracing its origins to 1945 when it began assembling Vespa scooters under licence. The company pivoted decisively toward motorcycles in the 1980s and today produces some of India's most iconic performance bikes while also manufacturing three-wheelers and supplying powertrains to Triumph Motorcycles.

The Pulsar brand is Bajaj's most significant innovation. The original Pulsar 150 redefined what Indian buyers expected from a commuter motorcycle when it launched in 2001 — sporty styling, twin-shock rear suspension, and a twin-spark engine were segment firsts. The Pulsar range now covers 125cc, 150cc, 160cc, 180cc, 250cc, and 400cc variants spanning ₹95,000 to ₹2.5 lakh, with the Pulsar N160 and F250 being current bestsellers in their respective price points.

The Bajaj Dominar 400 and Dominar 250 target touring riders who need highway cruising ability and low-cost reliability for long-distance travel. The Avenger series serves cruiser enthusiasts who want relaxed ergonomics without paying Royal Enfield premiums.

Most significantly, Bajaj's partnership with Triumph Motorcycles has produced the Speed 400 and Scrambler 400X — bikes that combine Royal Enfield-beating performance and Triumph's legendary global brand with accessible pricing under ₹3 lakh. The Speed 400 in particular has been praised by international motorcycling media and represents one of India's best engineering achievements in recent years.

The service and parts network is among the most extensive in Indian two-wheelers, covering virtually every town and city. Parts availability is excellent and service costs are low — important factors for the high-mileage commuters who form Bajaj's core customer base.$$),

('hero', 'Hero MotoCorp',
'Hero MotoCorp Dealers in India — Authorized Showrooms | AutoPortal360',
'Find authorized Hero MotoCorp dealers near you. Browse Splendor, Xtreme, HF Deluxe and Hero Vida EV showrooms across India.',
$$Hero MotoCorp holds a distinction that few companies in any industry anywhere in the world can claim: it is the world's largest manufacturer of two-wheelers by volume. The company — formed in 2010 when the joint venture between Hero Group and Honda was dissolved — sells tens of millions of motorcycles and scooters annually and maintains a dealer and service network that reaches villages where no car brand has a presence.

The Splendor is Hero's flagship commuter motorcycle and has been India's best-selling two-wheeler for over two decades. At ₹75,000–85,000 depending on variant and city, it offers exceptional real-world fuel efficiency of 50–65 kmpl, minimal maintenance requirements, and a parts network so ubiquitous that virtually any roadside mechanic in India can service it. For the daily commuter covering 40–60 km in a tier-2 or tier-3 city, nothing rivals the Splendor's total cost of ownership.

Beyond the Splendor, Hero offers the HF Deluxe for entry-level buyers, the Glamour for slightly more aspirational daily commuters, and the Xtreme 160R for sport-oriented riders who want performance without leaving the affordable segment. The Xpulse 200 and Xpulse 200T are Hero's adventure motorcycle offerings — genuinely capable off-road motorcycles at prices that significantly undercut international adventure bike rivals.

In scooters, Hero offers the Destini 125 and Pleasure+ for budget-conscious urban buyers. Hero Vida — the brand's dedicated electric two-wheeler division — is expanding with the Vida V1 and V2 models covering 100–150 km real-world range, targeting urban commuters ready to switch to electric.

Hero's service network of over 6,000 touch points across India is unmatched in the two-wheeler segment. For buyers in semi-urban and rural India, this accessibility is often the single most important factor in the purchase decision.$$),

('tvs', 'TVS Motor Company',
'TVS Motor Company Dealers in India — Authorized Showrooms | AutoPortal360',
'Find authorized TVS Motor dealers near you. Browse Apache, Jupiter, iQube Electric and Ronin showrooms across India.',
$$TVS Motor Company is India's third-largest two-wheeler manufacturer and arguably its most engineering-forward. Founded in 1978 in Hosur, Tamil Nadu, TVS has built a strong motorsport heritage through TVS Racing — India's oldest and most successful factory racing team — and channels that knowledge into road products that consistently punch above their price points.

The Apache RTR series is the crown jewel of the lineup. Spanning 160cc, 180cc, 200cc, and 310cc variants, the Apache has built a cult following among enthusiasts who want track-oriented performance at accessible prices. The Apache RR 310 at approximately ₹2.7 lakh competes with much more expensive European and Japanese motorcycles on outright performance, featuring ride-by-wire, multiple riding modes, cornering ABS, and a Bosch traction control system — technology that was unimaginable at this price point a decade ago.

The Jupiter scooter is TVS's flagship mass-market product and consistently ranks among India's top-three best-selling scooters. Its combination of excellent ride quality, practical storage, and refined engine makes it a strong alternative to the Honda Activa for urban and suburban daily riders who want slightly more refinement from their commuter.

TVS iQube is the brand's electric scooter, available at multiple price points from ₹1 lakh to ₹1.7 lakh. Real-world range has improved with successive hardware generations, and TVS has deployed a growing fast-charging infrastructure in major cities.

The TVS Ronin is a crossover motorcycle that blends classic aesthetics with contemporary performance specifications, attracting design-conscious buyers who find mainstream commuters uninspiring.

TVS's service network is particularly strong in South India — Karnataka, Tamil Nadu, Andhra Pradesh, and Telangana — but national coverage has improved significantly. For buyers who prioritise engineering innovation and performance credentials without premium pricing, TVS is consistently one of the most rewarding choices in India's two-wheeler market.$$)

ON CONFLICT (brand_slug) DO UPDATE SET
  brand_name       = EXCLUDED.brand_name,
  seo_title        = EXCLUDED.seo_title,
  seo_text         = EXCLUDED.seo_text,
  meta_description = EXCLUDED.meta_description,
  is_published     = EXCLUDED.is_published,
  updated_at       = NOW();
