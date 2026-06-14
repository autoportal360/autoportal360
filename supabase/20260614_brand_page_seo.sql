-- Brand page SEO table
CREATE TABLE IF NOT EXISTS brand_page_seo (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_slug   TEXT    NOT NULL UNIQUE,
  brand_name   TEXT    NOT NULL,
  vehicle_type TEXT    NOT NULL DEFAULT 'cars',
  seo_heading  TEXT,
  seo_text     TEXT    NOT NULL DEFAULT '',
  top_models   JSONB   NOT NULL DEFAULT '[]',
  is_published BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_brand_page_seo_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS brand_page_seo_updated_at ON brand_page_seo;
CREATE TRIGGER brand_page_seo_updated_at
  BEFORE UPDATE ON brand_page_seo
  FOR EACH ROW EXECUTE FUNCTION update_brand_page_seo_updated_at();

ALTER TABLE brand_page_seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_brand_page_seo" ON brand_page_seo FOR SELECT USING (is_published = true);
CREATE POLICY "service_all_brand_page_seo"  ON brand_page_seo FOR ALL   USING (auth.role() = 'service_role');

-- ── Seed: 22 brand pages ─────────────────────────────────────────────────

INSERT INTO brand_page_seo (brand_slug, brand_name, vehicle_type, seo_heading, seo_text, top_models) VALUES

-- ── CARS ──────────────────────────────────────────────────────────────────

('tata-cars', 'Tata Motors', 'cars', 'Everything About Tata Cars in India 2026',
$TATA$
Tata Motors stands as India's most transformed automotive brand — a company that went from building trucks and buses to leading the passenger vehicle revolution and dominating the country's electric vehicle market. Founded in 1945 as part of the Tata Group, the company entered passenger cars with the Indica in 1998 and spent the 2000s building affordable hatchbacks. The turning point came in the 2010s when Tata invested heavily in the IMPACT design language and OMEGA platform architecture, leveraging engineering learnings from its acquisition of Jaguar Land Rover.

Today, Tata is India's third-largest car brand by volume and the undisputed number one in electric vehicles, commanding over 60% of the EV passenger car market. The lineup spans every mainstream segment. The Tiago hatchback anchors the entry level, while the Altroz premium hatchback competes against the Maruti Baleno and Hyundai i20. The Nexon compact SUV — India's first five-star GNCAP-rated vehicle — consistently ranks among the top-three selling cars in the country. The Punch micro-SUV has been a chart-topper since its 2021 launch. Above these, the Harrier and Safari offer genuine midsize-SUV capability on the OMEGA architecture derived from Land Rover's D8 platform.

What distinguishes Tata from the competition is a systematic commitment to crash safety. The Nexon, Punch, Tiago, and Altroz have all been independently tested by Global NCAP and earned four or five stars — a standard that remains rare in India's value-first market. Tata cars are built for Indian road conditions: high ground clearance, robust suspension calibration, and a dense service network across all states.

The electric range deserves separate attention. The Nexon EV, Tiago EV, and Punch EV form a comprehensive electric lineup supported by Tata Power's nationwide charging infrastructure. With FAME-II subsidies and state EV incentives, the total cost of ownership for Tata EVs has become competitive with equivalent petrol variants over a three-to-five year horizon.

Tata cars are priced from ₹5.65 Lakh (Tiago base) to ₹28.49 Lakh (Safari top trim), with EV variants carrying a premium. The brand is the right choice for buyers who want modern safety engineering, SUV styling, and strong resale values at accessible price points.
$TATA$,
'[{"name":"Nexon","price":"₹8.10 – ₹15.50 Lakh"},{"name":"Punch","price":"₹6.13 – ₹10.50 Lakh"},{"name":"Harrier","price":"₹15.49 – ₹26.44 Lakh"},{"name":"Safari","price":"₹16.19 – ₹28.49 Lakh"},{"name":"Tiago","price":"₹5.65 – ₹7.80 Lakh"}]'::jsonb
),

('maruti-suzuki-cars', 'Maruti Suzuki', 'cars', 'Everything About Maruti Suzuki Cars in India 2026',
$MARUTI$
Maruti Suzuki is India's most dominant car brand and has been for over four decades. A joint venture between Suzuki Motor Corporation and the Government of India that began production in 1983, Maruti transformed private car ownership in India — the Maruti 800 was for millions of families the very first car they ever owned. Today the brand commands more than 40% of India's passenger vehicle market share, a feat unmatched by any single brand in any major global car market.

The product range is the widest in India. At the entry level, the Alto K10 and S-Presso keep aspirational buyers within reach, starting below ₹4 Lakh. The Swift hatchback has been a bestseller for over 18 years and remains India's favourite fun-to-drive family car. The Baleno premium hatchback and the Brezza compact SUV consistently rank in the national top-five. The Grand Vitara, jointly developed with Toyota, introduces strong-hybrid technology at ₹10-20 Lakh, delivering over 21 km/l fuel efficiency. The Ertiga and XL6 MPVs dominate the family mover segment, while the Jimny brought genuine off-road credibility to the brand.

Maruti's primary advantage is total cost of ownership. Spare parts are available at every corner of India, the service network exceeds 3,500 centres nationwide, and maintenance costs are among the lowest in the industry. The brand also leads India's CNG vehicle market — nearly every popular model is available in factory-fitted CNG, making daily running costs dramatically lower for high-mileage commuters.

Historically criticised for below-average crash-safety ratings, Maruti has responded with improved body structures across newer models. The Swift, Brezza, Baleno, and Grand Vitara have all shown meaningful safety improvements over their predecessors, and the new Swift earned a four-star Global NCAP rating.

Maruti Suzuki cars range from ₹3.99 Lakh (Alto K10) to over ₹21 Lakh (Grand Vitara top trim). For buyers who prioritise service accessibility, resale value, fuel efficiency, and brand trust built over four decades, Maruti Suzuki remains India's most practical car choice.
$MARUTI$,
'[{"name":"Swift","price":"₹6.49 – ₹9.64 Lakh"},{"name":"Brezza","price":"₹8.34 – ₹14.14 Lakh"},{"name":"Baleno","price":"₹6.66 – ₹9.88 Lakh"},{"name":"Grand Vitara","price":"₹10.70 – ₹20.27 Lakh"},{"name":"Ertiga","price":"₹8.69 – ₹12.39 Lakh"}]'::jsonb
),

('hyundai-cars', 'Hyundai', 'cars', 'Everything About Hyundai Cars in India 2026',
$HYUNDAI$
Hyundai Motor India has been among the top-three car brands in India since the late 1990s. The South Korean giant entered India in 1996 and launched the Santro in 1998 — a hatchback that redefined what affordable cars could look and feel like. Two and a half decades later, Hyundai operates one of India's largest car manufacturing facilities in Sriperumbudur, Tamil Nadu, producing vehicles for both domestic sales and global export markets.

The brand's strength lies in consistently delivering feature-rich, well-designed vehicles at competitive prices. The Creta compact SUV has been India's bestselling mid-size SUV for years and virtually created the category's mass-market appeal. The i20 premium hatchback is considered the benchmark in its segment for fit, finish, and equipment levels. The Venue compact SUV anchors the sub-₹14 Lakh space, while the Alcazar and Tucson serve family buyers who need three rows or global-spec engineering. The Exter micro-SUV, launched in 2023, quickly found its audience among first-time SUV buyers seeking the SUV stance at a hatchback budget.

Hyundai's technology credentials are strong. The brand regularly delivers segment-first features: connected car technology through BlueLink, ventilated front seats in the Creta, panoramic sunroofs as standard in higher trims, and advanced driver-assistance systems in premium models. The Ioniq 5 and Ioniq 6 electric vehicles signal where the brand's premium trajectory is headed.

Build quality and after-sales service are key differentiators. Hyundai's pan-India service network is comparable to Maruti's in reach and often rated higher in quality. Resale values for Creta, i20, and Venue are consistently strong in the used car market.

Hyundai cars are priced from ₹6.13 Lakh (Exter base) to over ₹56 Lakh (Tucson top trim). The Creta sweet spot at ₹11-20 Lakh remains one of the best-value propositions in Indian automotive. Hyundai is the right choice for buyers who want Korean design, premium features, and a reliable service experience without moving to a luxury segment.
$HYUNDAI$,
'[{"name":"Creta","price":"₹11.11 – ₹20.44 Lakh"},{"name":"i20","price":"₹7.04 – ₹11.89 Lakh"},{"name":"Venue","price":"₹7.94 – ₹13.72 Lakh"},{"name":"Alcazar","price":"₹14.99 – ₹21.45 Lakh"},{"name":"Exter","price":"₹6.13 – ₹10.27 Lakh"}]'::jsonb
),

('mahindra-cars', 'Mahindra', 'cars', 'Everything About Mahindra Cars in India 2026',
$MAHINDRA$
Mahindra & Mahindra is India's oldest surviving automotive brand and the largest SUV manufacturer in the country. Founded in 1945 — the same year as Tata — the company built its reputation on rugged, ladder-frame 4x4 vehicles that served India's defence forces, rural communities, and adventure seekers. The Bolero, a simple and indestructible ladder-frame SUV, has sold remarkable volumes for over two decades and remains the bestseller in rural India's utilitarian vehicle segment.

The modern Mahindra has reinvented itself. The Gen-3 Scorpio-N, launched in 2022, was a defining moment — it brought global-standard refinement and safety engineering to a nameplate synonymous with rough-and-ready capability. The XUV700 followed with class-leading technology: Level-1 ADAS, a panoramic sunroof, and a dual-screen dashboard in a sub-₹27 Lakh package. The XUV 3XO compact SUV, refreshed in 2024, has become a serious mid-segment contender with turbo petrol and diesel options.

Mahindra is perhaps the only Indian brand with a credible premium SUV trajectory. The Thar remains the definitive answer for buyers who want a proper 4WD off-roader under ₹18 Lakh. The three-row Scorpio-N and XUV700 offer commanding road presence and genuine third-row usability at prices that undercut equivalent Japanese and Korean offerings.

On the electric front, Mahindra's BE and XEV series — built on the new INGLO electric-native platform — represent a serious effort to lead in the EV SUV space. The BE 6e and XEV 9e have generated strong pre-booking interest, signalling consumer confidence in the brand's electric future.

Mahindra cars range from ₹9.30 Lakh (Bolero) to ₹30 Lakh-plus (XUV700 diesel AWD). The brand is the first choice for buyers who want genuine SUV capability, strong warranties, and proud Indian engineering — backed by one of India's largest and most diversified conglomerates.
$MAHINDRA$,
'[{"name":"Scorpio-N","price":"₹13.99 – ₹24.54 Lakh"},{"name":"XUV700","price":"₹13.99 – ₹26.99 Lakh"},{"name":"Thar","price":"₹11.35 – ₹17.60 Lakh"},{"name":"XUV 3XO","price":"₹7.49 – ₹15.49 Lakh"},{"name":"Bolero","price":"₹9.30 – ₹10.61 Lakh"}]'::jsonb
),

('kia-cars', 'Kia', 'cars', 'Everything About Kia Cars in India 2026',
$KIA$
Kia's Indian journey is one of the fastest success stories in the country's automotive history. The South Korean brand, part of Hyundai Motor Group, entered India in 2019 with the Seltos compact SUV and within 18 months became one of India's top-five car brands by volume. Unlike legacy players who spent decades building market share, Kia arrived with premium positioning, modern designs, and segment-leading technology that connected immediately with aspirational Indian buyers.

The Seltos remains the brand's flagship. Available with three engine options — a 1.5-litre naturally aspirated petrol, a 1.5-litre turbo petrol, and a 1.5-litre diesel — the Seltos covers a price band from ₹10.90 Lakh to over ₹20 Lakh. Higher trims offer ADAS, a panoramic sunroof, Bose audio, and a 360-degree camera. The Sonet compact SUV brought Kia's design and feature DNA to the sub-₹16 Lakh segment. The Carens MPV proved that three-row family vehicles need not look dull or be expensive to run.

Kia's after-sales network has expanded rapidly from a standing start. Over 600 dealerships and service points across India now give the brand a footprint comparable to established players twice its age in the market. Customer satisfaction scores for Kia consistently rank among the highest in J.D. Power India quality studies.

At the premium end, Kia offers the EV6 electric crossover built on the E-GMP platform and the Carnival luxury MPV for buyers seeking chauffeur-driven comfort. Both products demonstrate the brand's ambition to move upmarket alongside its volume growth.

Kia cars are priced from ₹7.79 Lakh (Sonet base) to over ₹65 Lakh (EV6 GT Line). The brand targets buyers who want maximum features for the price, European-inspired design, and a global manufacturer's quality assurance. If comparing Kia with Hyundai, expect slightly bolder styling and stronger feature leadership at similar price points.
$KIA$,
'[{"name":"Seltos","price":"₹10.90 – ₹20.40 Lakh"},{"name":"Sonet","price":"₹7.79 – ₹15.90 Lakh"},{"name":"Carens","price":"₹10.45 – ₹19.05 Lakh"},{"name":"EV6","price":"₹60.95 – ₹65.40 Lakh"},{"name":"Carnival","price":"₹36.65 – ₹37.40 Lakh"}]'::jsonb
),

('toyota-cars', 'Toyota', 'cars', 'Everything About Toyota Cars in India 2026',
$TOYOTA$
Toyota's reputation in India is built on one word: reliability. The Japanese giant has operated in India since 1997 through its joint venture Toyota Kirloskar Motor and has become synonymous with vehicles that deliver exceptional longevity, efficient service, and strong residual values. In a market dominated by value-focused Indian and Korean brands, Toyota occupies a distinct premium-mainstream space — the destination for buyers who will keep their car for a decade or more.

The Innova Crysta remains India's most popular MPV by a wide margin, holding that position for nearly two decades. It serves as the backbone of India's cab economy, the preferred wedding convoy vehicle, and the family road-tripper for buyers who cover long distances regularly. Above it, the Fortuner is India's aspirational ladder-frame SUV — a vehicle that signals achievement in a way few others do at its price point. Both are offered with powerful diesel engines tuned for Indian highway running and long-distance durability.

Toyota's mainstream credentials have strengthened through its alliance with Suzuki Motor Corporation. The Urban Cruiser Hyryder, co-developed with Maruti Suzuki, brings Toyota's strong-hybrid system to the competitive compact SUV segment, delivering 21+ km/l fuel efficiency. The Glanza extends Toyota's reach into the mass hatchback market. The Camry hybrid continues to make a statement — executive-class luxury delivering 18-20 km/l of real-world efficiency.

Toyota cars in India range from approximately ₹6.72 Lakh (Glanza base) to well over ₹2 Crore (Land Cruiser). The sweet spot for most buyers is ₹19-50 Lakh, where the Innova Crysta, Fortuner, and Hyryder offer compelling long-term value propositions. Toyota is the right choice when resale value, reliability over 10-15 years, and a reassuring ownership experience matter more than cutting-edge design features or the lowest entry price.
$TOYOTA$,
'[{"name":"Innova Crysta","price":"₹19.99 – ₹26.19 Lakh"},{"name":"Fortuner","price":"₹33.43 – ₹50.78 Lakh"},{"name":"Urban Cruiser Hyryder","price":"₹10.90 – ₹20.45 Lakh"},{"name":"Camry Hybrid","price":"₹48.12 – ₹48.12 Lakh"},{"name":"Glanza","price":"₹6.72 – ₹10.06 Lakh"}]'::jsonb
),

('honda-cars', 'Honda Cars India', 'cars', 'Everything About Honda Cars in India 2026',
$HONDA_CARS$
Honda Cars India occupies a distinctive niche — a Japanese brand that has always stood for premium engineering, driver-focused dynamics, and interior refinement rather than outright affordability or feature-per-rupee value. Honda entered India in 1995 and introduced generations of Indians to the idea that a family sedan could be genuinely pleasurable to drive. The City sedan, launched in 1998, remains a definitive benchmark in the mid-size sedan segment nearly three decades later.

The current lineup is compact but carefully chosen. The Honda City in its fifth generation continues to lead the mid-size sedan category, offering a 1.5-litre DOHC petrol with a ride quality and refinement level that few competitors match at ₹11-16 Lakh. The City Hybrid, powered by Honda's i-MMD two-motor system, delivers 26.5 km/l and represents one of the best hybrid value propositions in India today. The Amaze compact sedan serves budget-conscious buyers who want Honda reliability in a ₹8-12 Lakh package. The Elevate, launched in 2023, is Honda's first genuine compact SUV in India and has earned praise for its spacious cabin and composed ride quality.

Honda's engine technology is a consistent differentiator. The brand's naturally aspirated petrol units are smooth, durable, and have among the best sustained performance records in the industry. Honda's after-sales network is smaller than Maruti or Hyundai's, but individual dealership quality is consistently rated among the highest.

Honda's challenge in India is maintaining relevance as buyers shift toward SUVs and electric vehicles. The global hybrid technology is strong, but the local EV roadmap remains limited compared to domestic and Korean rivals.

Honda cars are priced from ₹7.99 Lakh (Amaze base) to ₹20.29 Lakh (City Hybrid). Honda is the best choice for buyers who value engineering integrity, smooth powertrains, and long-term ownership satisfaction over maximum features or the lowest entry price.
$HONDA_CARS$,
'[{"name":"City","price":"₹11.89 – ₹15.65 Lakh"},{"name":"Elevate","price":"₹11.69 – ₹15.98 Lakh"},{"name":"Amaze","price":"₹7.99 – ₹11.75 Lakh"},{"name":"City Hybrid","price":"₹20.29 – ₹20.29 Lakh"},{"name":"WR-V","price":"₹9.99 – ₹11.49 Lakh"}]'::jsonb
),

('mg-cars', 'MG Motor India', 'cars', 'Everything About MG Motor Cars in India 2026',
$MG$
MG Motor India, carrying the legacy of British brand Morris Garages and backed by China's SAIC Motor, has been one of the more disruptive entrants in the Indian market since launching in 2019. The brand's debut product — the Hector midsize SUV — arrived with a 10.4-inch portrait touchscreen at a time when connected car features were rare in the ₹13-20 Lakh segment. That technology-forward positioning has defined MG's identity in India ever since.

The Hector remains the brand's core volume driver, available with petrol, diesel, and hybrid powertrains, plus a three-row Hector Plus for larger families. The Astor compact SUV brought advanced driver-assistance systems including forward collision warning, lane departure warning, and autonomous emergency braking to the ₹10-17 Lakh segment — among the first in this price band to do so. The ZS EV is a consistent volume leader among long-range electric vehicles in India, offering 461 km WLTP-rated range. The Comet EV, a micro electric city car, has attracted attention as an ultra-urban second vehicle option.

At the premium end, MG's Gloster three-row SUV competes directly with the Toyota Fortuner, featuring twin-turbocharged diesel, a 360-degree camera system, and Level-1 autonomous driving capability at a competitive price.

MG's i-SMART connected car ecosystem, over-the-air software updates, and in-car internet connectivity are genuine technological advances that resonate with younger, tech-oriented buyers. The brand's service network has also expanded meaningfully since launch.

MG cars are priced from ₹6.99 Lakh (Comet EV base) to ₹44.49 Lakh (Gloster top trim). The brand is the right choice for buyers who want maximum technology in their cabin, are early EV adopters, or want a premium-feeling SUV with an unconventional presence on Indian roads.
$MG$,
'[{"name":"Hector","price":"₹13.99 – ₹21.92 Lakh"},{"name":"ZS EV","price":"₹18.98 – ₹24.18 Lakh"},{"name":"Astor","price":"₹9.98 – ₹16.78 Lakh"},{"name":"Gloster","price":"₹40.80 – ₹44.49 Lakh"},{"name":"Comet EV","price":"₹6.99 – ₹9.69 Lakh"}]'::jsonb
),

('skoda-cars', 'Skoda', 'cars', 'Everything About Skoda Cars in India 2026',
$SKODA$
Skoda Auto India represents one of the most successful repositioning stories in the Indian premium market. The Czech automaker, part of Volkswagen Group, entered India in 2001 and spent a decade as a niche luxury player selling imported Octavia and Superb sedans. The transformation came with the India 2.0 project announced in 2019 — a commitment to produce Volkswagen Group vehicles locally on the India-specific MQB-A0-IN platform, dramatically reducing prices and unlocking volume potential.

The Kushaq compact SUV and Slavia midsize sedan, both launched in 2021, form the backbone of the new Skoda India. The Kushaq has been praised for its European build quality, engaging handling, and a 1.0-litre TSI turbocharged petrol engine that delivers a genuine driving experience rarely found at ₹11-19 Lakh in India. The Slavia brought the refinement and dynamics of a European sedan to a segment that competes with the Honda City and Hyundai Verna.

At the premium end, Skoda's Kodiaq 7-seat SUV and the Superb executive sedan serve buyers who want prestige engineering without moving to German luxury prices. Both are now locally assembled, making them significantly more accessible than their imported predecessors.

Skoda's target buyer is the automotive enthusiast — someone who researches specifications, values driving dynamics over raw feature counts, and appreciates the difference a turbocharged engine makes. The warranty program (5 years/1 lakh km) and extended service intervals reduce maintenance anxiety for buyers new to the brand.

Skoda cars in India range from approximately ₹10.90 Lakh (Kushaq base) to ₹54.39 Lakh (Superb). The brand is ideal for buyers who want European engineering quality, a premium interior experience, and genuinely fun driving characteristics at a price significantly below German luxury.
$SKODA$,
'[{"name":"Slavia","price":"₹10.99 – ₹19.49 Lakh"},{"name":"Kushaq","price":"₹10.90 – ₹19.40 Lakh"},{"name":"Superb","price":"₹54.39 – ₹54.39 Lakh"},{"name":"Kodiaq","price":"₹44.99 – ₹46.99 Lakh"},{"name":"Octavia","price":"₹36.99 – ₹36.99 Lakh"}]'::jsonb
),

('volkswagen-cars', 'Volkswagen', 'cars', 'Everything About Volkswagen Cars in India 2026',
$VW$
Volkswagen India shares its story closely with Skoda's. Both brands are part of the Volkswagen Group's India 2.0 project, using the same MQB-A0-IN platform built locally at the Chakan plant near Pune. Where Skoda focuses on Czech premium value, VW leans into the German precision-engineering narrative — a subtle but important distinction in how each brand positions itself to discerning Indian buyers.

The Taigun compact SUV and Virtus midsize sedan are VW India's core products and direct siblings to the Skoda Kushaq and Slavia. The Taigun, with its 1.0-litre TSI turbo and 1.5-litre TSI EVO options, delivers some of the sharpest driving dynamics in the compact SUV segment. The Virtus GT Plus, powered by the 1.5-litre TSI with 150 PS and a 7-speed DSG gearbox, has developed a genuine enthusiast following for its performance at under ₹20 Lakh — competing with cars costing ₹10-15 Lakh more on a driving dynamics basis.

At the premium end, VW imports the Tiguan 4MOTION midsize SUV, competing in the ₹38-50 Lakh space. VW's commitment to structural rigidity and passive safety is reflected in strong Euro NCAP ratings across its global portfolio.

VW's challenge in India, similar to Skoda's, has been overcoming the perception that European brands are expensive to maintain. Extended service intervals at 15,000 km, a comprehensive 4-year warranty package, and growing service transparency have helped address this concern with buyers willing to look past the brand's premium positioning.

Volkswagen cars are priced from ₹11.10 Lakh (Taigun base) to approximately ₹49.99 Lakh (Tiguan top trim). The brand appeals to buyers who want German engineering heritage and badge equity at a fraction of BMW or Mercedes pricing, with the assurance of local manufacturing since 2021.
$VW$,
'[{"name":"Taigun","price":"₹11.10 – ₹19.73 Lakh"},{"name":"Virtus","price":"₹11.56 – ₹20.42 Lakh"},{"name":"Tiguan","price":"₹47.99 – ₹49.99 Lakh"},{"name":"Taigun GT Line","price":"₹16.68 – ₹19.73 Lakh"},{"name":"Virtus GT Plus","price":"₹19.40 – ₹20.42 Lakh"}]'::jsonb
),

('bmw-cars', 'BMW', 'cars', 'Everything About BMW Cars in India 2026',
$BMW$
BMW India has been the benchmark for aspirational German luxury since the brand entered India in 2006. The Bavarian Motor Works — famous for its "Joy of Driving" philosophy — has consistently brought its global range to India, with locally assembled models at the Chennai plant ensuring customs duty advantages that translate to more competitive pricing than fully imported competitors.

The BMW lineup in India spans every luxury segment. The 3 Series sedan remains the brand's entry point into rear-wheel-drive, sport-focused luxury, competing with the Mercedes C-Class and Audi A4. The 5 Series long-wheelbase executive sedan caters to chauffeur-driven buyers and business executives who want German precision without the ultra-premium price of the 7 Series. The X1 compact luxury SUV has been particularly successful in India, offering the BMW badge and driving dynamics in the most accessible package available from the brand.

At the heart of the range sits the X5 — the quintessential BMW SUV, offering turbocharged six-cylinder power, air suspension, and a technology suite that includes BMW Live Cockpit Professional. Above this, the 7 Series and the M Sport portfolio cater to buyers for whom driving is a deeply personal expression.

BMW's M Sport package has been brilliantly localised for India — virtually every car in the lineup can be specified with M-badged body kits, sport steering, and enhanced suspension, giving the appearance and character of a motorsport-bred car at a modest premium over the standard variant.

BMW India cars range from approximately ₹45.90 Lakh (X1 base) to over ₹2 Crore for flagship M variants. The brand is the choice for buyers who want their luxury vehicle to be driver-focused, badge-prestigious, and engineered with the attention to dynamics and material quality that justifies a premium over mainstream alternatives.
$BMW$,
'[{"name":"X1","price":"₹45.90 – ₹52.90 Lakh"},{"name":"3 Series","price":"₹46.90 – ₹58.50 Lakh"},{"name":"5 Series","price":"₹72.90 – ₹82.90 Lakh"},{"name":"X5","price":"₹93.90 – ₹1.05 Crore"},{"name":"7 Series","price":"₹1.72 – ₹2.25 Crore"}]'::jsonb
),

('mercedes-benz-cars', 'Mercedes-Benz', 'cars', 'Everything About Mercedes-Benz Cars in India 2026',
$MERC$
Mercedes-Benz India has been the number-one luxury car brand in the country for over a decade and is the definitive choice of India's business elite and high-net-worth individuals. Entering India in 1994 as the first German luxury brand in the country, Mercedes has built dominant market share through aspirational badge value, a wide product range, and a local assembly strategy that bypasses import duties on volume models.

The C-Class, assembled at Mercedes' Pune plant, anchors the brand's entry into luxury. It offers a 1.5-litre turbocharged petrol with 48V mild-hybrid assistance, an 11.9-inch portrait MBUX touchscreen, and a rear cabin that punches well above its price at approximately ₹57 Lakh. The E-Class is India's most popular executive sedan in the ₹78-92 Lakh range and the default choice for chauffeur-driven executives. The GLA compact luxury SUV drives volumes in urban markets, while the GLC mid-size SUV offers commanding presence with the three-pointed star. The S-Class, locally assembled in India since 2021, remains the world's benchmark luxury sedan and is now more accessible than its import-era pricing suggested.

Mercedes' AMG performance range, Maybach ultra-luxury derivatives, and EQ electric lineup ensure buyers can engage with the brand across every point of the luxury spectrum. The EQS 580 and EQB electric SUV bring Mercedes luxury DNA to battery-electric mobility.

Mercedes-Benz India cars range from approximately ₹51.50 Lakh (GLA) to over ₹3 Crore for Maybach variants. The brand is the choice when absolute prestige matters most — when the destination communicates as much as the journey.
$MERC$,
'[{"name":"C-Class","price":"₹57.00 – ₹64.50 Lakh"},{"name":"E-Class","price":"₹78.50 – ₹92.50 Lakh"},{"name":"GLA","price":"₹51.50 – ₹56.50 Lakh"},{"name":"GLC","price":"₹72.00 – ₹89.50 Lakh"},{"name":"S-Class","price":"₹2.23 – ₹2.98 Crore"}]'::jsonb
),

-- ── BIKES ─────────────────────────────────────────────────────────────────

('hero-bikes', 'Hero MotoCorp', 'bikes', 'Everything About Hero MotoCorp Bikes in India 2026',
$HERO$
Hero MotoCorp is the world's largest two-wheeler manufacturer by volume, a distinction it has held since 2014. Formed in 2011 after Hero Group acquired Honda's 26% stake in the Hero Honda joint venture, the company built on four decades of joint-venture manufacturing to assert its independence. Today Hero sells over 50 lakh motorcycles and scooters annually in India alone and exports to over 40 countries.

The brand's volume foundation is the Splendor and HF Deluxe — two motorcycles that between them account for several million units sold every year. These commuter bikes, priced between ₹68,000 and ₹90,000, are the default choice for India's rural and semi-urban markets where 80-90 km/l fuel efficiency and minimal maintenance costs are the primary purchase criteria. The Glamour adds a step up in styling and features, while the Passion continues to serve value-oriented daily commuters.

Hero has invested heavily in expanding its premium portfolio. The Xtreme 160R, with a 16 PS motor and upside-down front forks, competes credibly in the sporty commuter segment against the TVS Apache and Bajaj Pulsar. The Xpulse 200 is a genuine adventure motorcycle with rally-inspired ergonomics and a fuel-injected 200cc engine. The Mavrick 440, co-developed with Harley-Davidson, marks Hero's entry into the middleweight cruiser category.

Hero's service network — over 8,000 touchpoints across India — is unrivalled in two-wheeler retail. Rural service penetration, spare parts availability, and low labour costs make Hero the most accessible brand to maintain in the country.

Hero MotoCorp bikes range from ₹65,000 (HF Deluxe base) to over ₹2.49 Lakh (Mavrick 440). The brand is the default choice for commuter-first buyers who want maximum reliability, nationwide service coverage, and the lowest total cost of ownership available in the two-wheeler market.
$HERO$,
'[{"name":"Splendor Plus","price":"₹76,939 – ₹81,120"},{"name":"Xtreme 160R","price":"₹1.17 – ₹1.21 Lakh"},{"name":"Xpulse 200","price":"₹1.45 – ₹1.55 Lakh"},{"name":"HF Deluxe","price":"₹68,540 – ₹71,890"},{"name":"Glamour","price":"₹82,210 – ₹90,030"}]'::jsonb
),

('bajaj-bikes', 'Bajaj Auto', 'bikes', 'Everything About Bajaj Auto Bikes in India 2026',
$BAJAJ$
Bajaj Auto is India's second-largest two-wheeler manufacturer and its most successful export story. The Pune-based company, founded in 1945 as a manufacturer of imported Vespa scooters, transformed itself over six decades into a global motorcycle exporter — selling Bajaj-branded bikes in over 70 countries and co-developing products with KTM, Husqvarna, and Triumph through strategic international partnerships.

The Pulsar brand, launched in 2001, defines Bajaj's domestic identity. The Pulsar — with its distinctively masculine positioning — created an entire category of performance-oriented youth motorcycles in India. Today, the Pulsar family spans from the 125cc N125 to the 400cc Dominar, covering every sport motorcycle price point from ₹80,000 to ₹2.34 Lakh. The Pulsar N160 and NS200 are consistent bestsellers in the premium commuter space.

Bajaj's Dominar 400 is India's most capable domestically manufactured long-distance tourer, with its liquid-cooled 373cc engine, upside-down forks, and full LED lighting suite competing against significantly pricier imports. The Avenger cruiser range targets buyers who want the lifestyle of a cruiser without the complexity of a large engine. At the entry level, the CT100 and Platina continue to serve price-sensitive commuters in rural markets.

The KTM relationship is Bajaj's most strategically important partnership. Bajaj owns approximately 48.8% of KTM and manufactures most KTM products under 500cc in India, giving enthusiasts access to Austrian race-bred engineering at competitive prices.

Bajaj bikes range from ₹57,800 (CT100) to ₹2.34 Lakh (Dominar 400). The brand is the right choice for riders who want sport motorcycle performance from a manufacturer with genuine R&D depth and global engineering credibility.
$BAJAJ$,
'[{"name":"Pulsar N160","price":"₹1.33 – ₹1.37 Lakh"},{"name":"Pulsar NS200","price":"₹1.55 – ₹1.71 Lakh"},{"name":"Dominar 400","price":"₹2.25 – ₹2.34 Lakh"},{"name":"Avenger Street 160","price":"₹1.17 – ₹1.19 Lakh"},{"name":"CT100","price":"₹57,800 – ₹64,000"}]'::jsonb
),

('tvs-bikes', 'TVS Motor Company', 'bikes', 'Everything About TVS Bikes in India 2026',
$TVS_BIKES$
TVS Motor Company is India's third-largest two-wheeler manufacturer and arguably the most technology-driven of the domestic players. The Chennai-based company, part of the TVS Group founded in 1911, consistently punches above its weight with products that deliver premium engineering at accessible prices. TVS's partnership with BMW Motorrad for products above 300cc has further elevated the brand's engineering credibility in the enthusiast community.

The Apache series is the centrepiece of TVS's premium motorcycle portfolio. The Apache RTR 160 4V and RTR 200 4V are benchmarks for Indian-made performance bikes in their respective displacement classes — featuring oil-cooled engines, clip-on handlebars, and predictive regenerative braking systems that filter down from TVS's motorsport programme. The Apache RR 310, co-developed with BMW as the basis for the G 310 R, delivers genuine sport bike engineering at ₹2.73 Lakh.

In the commuter segment, the Raider 125 has become a strong seller since its launch, combining sporty design with everyday practicality and fuel efficiency. The Ronin 225 brings cafe racer-inspired styling to the 200cc-plus segment, targeting younger urban riders who want a lifestyle motorcycle with modern performance credentials. The Star City Plus continues to serve daily commuters with a proven, dependable 110cc engine.

TVS's race pedigree is genuine — the brand campaigns in national and international racing championships, and learnings from the track inform the calibration of road bikes. The SmartXonnect connectivity system, offering Bluetooth integration and navigation assistance, is among the most sophisticated in the segment.

TVS bikes range from ₹73,900 (Star City Plus) to ₹2.73 Lakh (Apache RR 310). The brand is ideal for riders who want a motorcycle that feels more engineered than its price suggests, with a clear bias toward performance hardware and modern technology features.
$TVS_BIKES$,
'[{"name":"Apache RTR 160 4V","price":"₹1.19 – ₹1.27 Lakh"},{"name":"Apache RTR 200 4V","price":"₹1.43 – ₹1.52 Lakh"},{"name":"Raider 125","price":"₹90,500 – ₹96,300"},{"name":"Ronin","price":"₹1.49 – ₹1.64 Lakh"},{"name":"Apache RR 310","price":"₹2.73 – ₹2.73 Lakh"}]'::jsonb
),

('royal-enfield-bikes', 'Royal Enfield', 'bikes', 'Everything About Royal Enfield Bikes in India 2026',
$ROYA$
Royal Enfield is India's most iconic motorcycle brand and the world's oldest surviving motorcycle manufacturer in continuous production. Founded in England in 1893 and manufacturing in India since 1955, Royal Enfield occupies a unique position in the global motorcycle landscape — a brand that has grown from a niche enthusiast following to a genuine mass-premium phenomenon by simply refusing to change what its buyers love most: character, craftsmanship, and the unhurried rhythm of a thumping single-cylinder engine.

The Classic 350 is the defining Royal Enfield product — a motorcycle that retains the visual silhouette and acoustic character of the original Bullet while incorporating modern fuel injection, dual-channel ABS, and improved reliability. It remains the bestselling premium motorcycle in India by a substantial margin. The Meteor 350 brought cruiser ergonomics and a more relaxed riding position to the same proven platform. The Hunter 350 added a stripped-down café racer silhouette for urban riders who want the Enfield experience in a lighter, more agile package.

Royal Enfield's adventure ambitions have grown dramatically. The Himalayan 450 — powered by a new 452cc liquid-cooled engine developed entirely in-house — is one of the most capable and thoughtfully engineered adventure motorcycles available under ₹3.05 Lakh anywhere in the world. The Bullet 350 retains the legacy for purists who want the simplest, most authentic Enfield experience.

The brand's global growth has been remarkable. Royal Enfield now manufactures in India and sells across 60-plus countries, with particularly strong footholds in Southeast Asia, Europe, and North America. The Tri chassis platform shared by Classic, Meteor, and Hunter has dramatically improved ride quality and handling over previous generations.

Royal Enfield bikes range from ₹1.50 Lakh (Hunter 350 base) to ₹3.04 Lakh (Himalayan 450 top trim). The brand is the natural choice for riders who want an emotional connection with their motorcycle — one that is as much about identity and community as it is about specifications.
$ROYA$,
'[{"name":"Classic 350","price":"₹1.93 – ₹2.32 Lakh"},{"name":"Bullet 350","price":"₹1.74 – ₹1.97 Lakh"},{"name":"Meteor 350","price":"₹2.09 – ₹2.35 Lakh"},{"name":"Himalayan 450","price":"₹2.69 – ₹3.04 Lakh"},{"name":"Hunter 350","price":"₹1.50 – ₹1.74 Lakh"}]'::jsonb
),

('honda-bikes', 'Honda 2Wheelers India', 'bikes', 'Everything About Honda Bikes in India 2026',
$HONDA_BIKES$
Honda Motorcycle & Scooter India (HMSI) is India's second-largest two-wheeler manufacturer and the country's leader in the 100-125cc commuter motorcycle segment. Part of Honda Motor Co. Ltd. — the world's largest motorcycle manufacturer by volume — HMSI has operated independently in India since 2001, following the separation from the Hero Honda joint venture that dominated Indian two-wheelers for two decades.

Honda's commuter motorcycle range is anchored by the CB Shine — India's bestselling 125cc motorcycle and a nameplate that has delivered over 10 million units since its 2006 launch. The SP 125, with modern fuel injection and better efficiency, brings CB Shine-class reliability into the contemporary era. The Unicorn 160 targets aspiring commuters who want a step up in displacement and highway capability without moving into the premium segment.

At the premium end, Honda's offerings become genuinely exciting. The CB200X is a crossover-styled bike with adventure ergonomics at a commuter-adjacent price point. The CB300R is a premium urban streetfighter with neo-sports styling, competing against the KTM 250 Duke and Royal Enfield Hunter 350. Honda's CBR sport series — including the CBR650R — serves the enthusiast touring segment for serious riders.

Honda's manufacturing quality is a consistent differentiator. The brand's paint depth, switchgear feel, and engine refinement consistently test higher than domestic Indian brands in comparative evaluations. HMSI's service network spans over 6,500 touchpoints nationally.

Honda bikes in India range from approximately ₹64,500 (CD 110 Dream) to ₹2.79 Lakh (CB300R). The brand is the right choice for riders who value Japanese build quality, proven engine reliability, and a manufacturer that backs its products with decades of global motorcycle engineering expertise.
$HONDA_BIKES$,
'[{"name":"CB Shine","price":"₹79,900 – ₹85,000"},{"name":"SP 125","price":"₹84,500 – ₹88,700"},{"name":"Unicorn","price":"₹1.01 – ₹1.07 Lakh"},{"name":"CB200X","price":"₹1.54 – ₹1.59 Lakh"},{"name":"CB300R","price":"₹2.79 – ₹2.79 Lakh"}]'::jsonb
),

('yamaha-bikes', 'Yamaha Motor India', 'bikes', 'Everything About Yamaha Bikes in India 2026',
$YAMAHA$
Yamaha Motor India has carved out one of the most distinctive identities in the Indian two-wheeler market — a brand that consistently prioritises performance and sporty design over pure commuter value credentials. Part of Yamaha Motor Co., Japan's second-largest motorcycle manufacturer, YMPI has operated in India since 1985 and has been particularly influential in shaping the aspirations of Indian motorcycle enthusiasts across every generation.

The FZ series defines Yamaha India's street motorcycle identity. The FZ-S V3, with its muscular neo-classic styling, full LED lighting, and 149cc fuel-injected engine, continues to attract style-conscious urban commuters who want a motorcycle that stands out in traffic. The FZ-X adds adventure elements with a raised handlebar and crossover aesthetics for riders who want the FZ character with a more upright riding position.

Yamaha's performance flagship in India is the R15 V4 — a true sport motorcycle with a 155cc variable-valve-actuation engine, traction control, an optional quick-shifter, and styling directly inspired by the YZF-R1 MotoGP machine. At ₹1.87-2.14 Lakh, the R15 V4 represents arguably the most complete motorcycle engineering package available under ₹2.50 Lakh in India. The MT-15 V2 brings naked-bike performance with the same 155cc VVA engine in a more accessible streetfighter package.

Yamaha's build quality — particularly paint depth and chrome plating quality — is consistently rated among the best in the segment. Long-term reliability records for the FZ and R15 series show minimal mechanical issues over extended ownership cycles.

Yamaha bikes range from ₹93,700 (FZ-Fi V3) to ₹4.57 Lakh (YZF-R3). The brand is the natural choice for riders who want sport-biased engineering and spirited riding character from a manufacturer with genuine global motorsport DNA.
$YAMAHA$,
'[{"name":"FZ-S V3","price":"₹1.14 – ₹1.22 Lakh"},{"name":"R15 V4","price":"₹1.87 – ₹2.14 Lakh"},{"name":"MT-15 V2","price":"₹1.63 – ₹1.73 Lakh"},{"name":"FZ-X","price":"₹1.23 – ₹1.30 Lakh"},{"name":"R3","price":"₹4.57 – ₹4.57 Lakh"}]'::jsonb
),

-- ── SCOOTERS ──────────────────────────────────────────────────────────────

('honda-scooters', 'Honda Scooters India', 'scooters', 'Everything About Honda Scooters in India 2026',
$HONDA_SC$
When it comes to scooters in India, Honda's Activa is not just a product — it is a category. The Honda Activa has been India's bestselling two-wheeler for over 17 consecutive years, selling more units than almost any other vehicle in any category. Its dominance reflects the fundamental proposition that HMSI perfected: a reliable, easy-to-ride, fuel-efficient family scooter that requires minimal maintenance and depreciates slowly.

The Activa 6G uses a 109.51cc engine with programmed fuel injection delivering approximately 60 km/l under standard riding conditions. The Activa 125, introduced for buyers who want more power for city-to-city commuting, adds a stronger 125cc engine, LED headlights, idle start-stop technology, and a quieter CVT gearbox. Both comply with BS6 Phase 2 emission norms.

Beyond the Activa, Honda's scooter range covers distinct lifestyle segments. The Dio 125 targets younger, style-oriented buyers with a sportier stance and vibrant colour choices. The Grazia 125 adds more urban-professional features — a USB charger, external fuel filler cap, and larger under-seat storage — for working buyers in metropolitan areas. The Aviator 125, with its larger 12-inch wheels, provides more stable highway riding for buyers who commute between cities regularly.

Honda's manufacturing consistency means virtually every unit off the line meets the same quality threshold. The brand's spare parts ecosystem is the most economical and widely available for any scooter in India. Honda service centres are present in every town with a population above 20,000.

Honda scooters range from approximately ₹74,800 (Dio 125 base) to ₹97,900 (Aviator 125 top trim). For first-time buyers, families seeking a daily urban runner, or anyone who simply wants a scooter that starts every morning and demands the least possible maintenance, Honda remains India's definitive choice.
$HONDA_SC$,
'[{"name":"Activa 6G","price":"₹79,500 – ₹83,400"},{"name":"Activa 125","price":"₹88,800 – ₹97,400"},{"name":"Dio 125","price":"₹74,800 – ₹82,200"},{"name":"Grazia 125","price":"₹92,500 – ₹1.01 Lakh"},{"name":"Aviator 125","price":"₹93,700 – ₹97,900"}]'::jsonb
),

('tvs-scooters', 'TVS Scooters India', 'scooters', 'Everything About TVS Scooters in India 2026',
$TVS_SC$
TVS Motor Company's scooter lineup represents one of the best-balanced portfolios in the Indian two-wheeler market — a range that credibly spans from the entry-level Scooty Pep+ to the performance-oriented Ntorq 125 to the electric iQube, covering virtually every urban commuter use case. TVS is India's third-largest scooter manufacturer, competing with Honda Activa at the volume end while carving out distinct niches with feature-led and electric products.

The Jupiter is TVS's volume driver in the scooter segment. Positioned as a more comfortable and feature-rich alternative to the Honda Activa, the Jupiter has found a loyal following among older buyers and women riders who prioritise ergonomics and ease of use. The Jupiter 125 adds a more powerful engine and additional features for buyers who need highway capability alongside city riding ease.

The Ntorq 125 is TVS's most successful premium scooter and the brand's answer to sporty urban mobility. With 9.4 PS from its 124.8cc engine, SmartXonnect Bluetooth connectivity, a fully digital instrument cluster, and a sporty full-fairing design, the Ntorq 125 has become the default choice for young urban scooter riders who want maximum features under ₹1 Lakh.

The iQube Electric is TVS's most significant product in the electric era. Available in multiple battery configurations, the iQube delivers 75-100 km of real-world range and has received strong reviews for its refined riding dynamics and build quality. SmartXonnect features — remote diagnostics, geo-fencing, ride statistics, navigation assistance — are class-leading for an Indian-manufactured EV scooter.

TVS scooters range from ₹60,700 (Scooty Pep+ base) to ₹1.47 Lakh (iQube Electric top trim). The brand is the right choice for buyers who want something more characterful and feature-rich than a standard Honda, without paying the premium of an imported product.
$TVS_SC$,
'[{"name":"Jupiter 125","price":"₹87,300 – ₹1.01 Lakh"},{"name":"Ntorq 125","price":"₹88,700 – ₹1.04 Lakh"},{"name":"Jupiter","price":"₹85,600 – ₹1.02 Lakh"},{"name":"iQube Electric","price":"₹1.12 – ₹1.47 Lakh"},{"name":"Scooty Pep+","price":"₹60,700 – ₹67,400"}]'::jsonb
),

('ola-electric-scooters', 'Ola Electric', 'scooters', 'Everything About Ola Electric Scooters in India 2026',
$OLA$
Ola Electric has been the most disruptive force in Indian two-wheeler history. Founded in 2017 and launching its first product — the S1 Pro — in 2021, Ola Electric became India's bestselling electric two-wheeler brand within its first full year of sales, capturing peak market share above 50% of the electric scooter segment. The company's Futurefactory in Tamil Nadu, among the world's largest two-wheeler manufacturing facilities, can produce over one million units annually at full capacity.

The Ola S1 Pro is the brand's flagship — a 90 km/h capable electric scooter with a 4.0 kWh battery delivering 170-plus km of real-world range on a single charge. The MoveOS software platform, updated regularly over the air, continuously adds new features including HyperMode, reverse mode, cruise control, and voice command integration. The S1 Air targets buyers who want core EV benefits at a more accessible price, while the S1 X and S1 X+ represent the most affordable entry points into the Ola ecosystem.

Ola Electric's charging infrastructure has expanded to over 4,000 Hypercharger points across India. The home charger that ships with every scooter delivers a full charge in 6-7 hours. For urban commuters who charge at home overnight, range anxiety rarely manifests as a practical concern.

Ola's ownership experience has been the brand's most discussed challenge. Initial quality concerns and after-sales service gaps drew significant attention. The company has since invested heavily in expanding its service network and improving parts availability, resulting in measurable improvements in customer satisfaction scores.

Ola Electric scooters range from ₹79,999 (S1 X base) to ₹1.59 Lakh (S1 Pro top trim). The brand is the choice for early adopters who want maximum technology, over-the-air software evolution, and the lowest per-kilometre running cost in a two-wheeler — understanding that EV ownership requires patience with a product category still maturing in India.
$OLA$,
'[{"name":"S1 Pro","price":"₹1.29 – ₹1.59 Lakh"},{"name":"S1 Air","price":"₹89,999 – ₹1.09 Lakh"},{"name":"S1 X+","price":"₹94,999 – ₹1.04 Lakh"},{"name":"S1 X (3kWh)","price":"₹84,999"},{"name":"S1 X (2kWh)","price":"₹79,999"}]'::jsonb
),

('ather-scooters', 'Ather Energy', 'scooters', 'Everything About Ather Scooters in India 2026',
$ATHER$
Ather Energy is India's most respected electric two-wheeler brand among enthusiasts and urban commuters who prioritise riding quality, software maturity, and engineering integrity. Founded in 2013 by two IIT Madras graduates — Tarun Mehta and Swapnil Jain — Ather spent years in deep R&D before launching the 450 in Bengaluru in 2018. The brand has since expanded to over 100 cities and maintained its reputation as the best-engineered electric scooter made in India.

The Ather 450X is the brand's flagship and the benchmark by which other Indian electric scooters are judged. Its 2.9 kWh lithium-ion battery delivers a certified 146 km IDC range, and the proprietary AtherGrid fast-charging network — covering over 1,400 locations across India — provides real-world infrastructure that most competing brands cannot match. The 450X's 7-inch touchscreen dashboard with integrated Google Maps navigation, voice commands, and OTA updates remains the most polished instrument cluster in the Indian EV two-wheeler space.

The 450S offers the same core Ather experience at a lower price by simplifying the variant stack. The Rizta, launched in 2024, is Ather's family-oriented scooter — offering a more upright riding position and larger under-seat storage while retaining the brand's signature engineering quality and connected features. The limited-edition 450 Apex delivers tuned suspension and enhanced performance mapping for buyers who want the most dynamic ride possible.

Ather's AtherGrid charging is genuinely class-leading. Fast chargers deliver approximately 1.5 kWh per hour, providing a meaningful charge top-up in a 15-minute stop. The brand also offers home charger installation as part of the purchase package.

Ather scooters range from approximately ₹1.10 Lakh (Rizta base) to ₹2.15 Lakh (450 Apex). The brand is the natural choice for sophisticated urban commuters who want the best electric riding experience available in India, backed by the most mature software platform and the most extensive dedicated charging network.
$ATHER$,
'[{"name":"450X","price":"₹1.56 – ₹1.78 Lakh"},{"name":"450S","price":"₹1.25 – ₹1.35 Lakh"},{"name":"Rizta","price":"₹1.10 – ₹1.37 Lakh"},{"name":"450 Apex","price":"₹2.15 – ₹2.15 Lakh"},{"name":"Rizta Z","price":"₹1.37 – ₹1.60 Lakh"}]'::jsonb
)

ON CONFLICT (brand_slug) DO UPDATE SET
  brand_name   = EXCLUDED.brand_name,
  vehicle_type = EXCLUDED.vehicle_type,
  seo_heading  = EXCLUDED.seo_heading,
  seo_text     = EXCLUDED.seo_text,
  top_models   = EXCLUDED.top_models;
