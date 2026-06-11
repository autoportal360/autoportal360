/**
 * seed-specs.mjs
 * Insert specs for the popular variant of every model in the DB.
 * Run: node scripts/seed-specs.mjs
 *
 * Spec fields: engine_cc, power_bhp, torque_nm, mileage_arai, fuel_tank_l,
 *   seating, boot_space_l, ground_clearance_mm, length_mm, width_mm, height_mm,
 *   wheelbase_mm, kerb_weight_kg, tyre_size, ncap_rating
 * EVs  → engine_cc=0, mileage_arai=0, fuel_tank_l=0
 * Bikes → boot_space_l=null
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = 'https://qmhnfdyjisxjhhrdfvqp.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtaG5mZHlqaXN4amhocmRmdnFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDgxNDI2NiwiZXhwIjoyMDk2MzkwMjY2fQ.Z81S2Tfv2db_5aOzuC4muR7RXbwfR4oVIrR60dSpgG4'

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ── Hardcoded spec data keyed by model slug ──────────────────────────────────
// engine_cc | power_bhp | torque_nm | mileage_arai | fuel_tank_l
// seating | boot_space_l | ground_clearance_mm
// length_mm | width_mm | height_mm | wheelbase_mm | kerb_weight_kg
// tyre_size | ncap_rating

const SPECS = {

  // ════════════════════ BIKES ════════════════════════════════════════════════

  'classic-350': {
    engine_cc: 349, power_bhp: 20.2, torque_nm: 27, mileage_arai: 36, fuel_tank_l: 13,
    seating: 2, boot_space_l: null, ground_clearance_mm: 170,
    length_mm: 2193, width_mm: 840, height_mm: 1090, wheelbase_mm: 1330, kerb_weight_kg: 195,
    tyre_size: '100/90-19F 120/80-18R', ncap_rating: null,
  },
  'bullet-350': {
    engine_cc: 349, power_bhp: 20.4, torque_nm: 27, mileage_arai: 35, fuel_tank_l: 13,
    seating: 2, boot_space_l: null, ground_clearance_mm: 170,
    length_mm: 2193, width_mm: 840, height_mm: 1090, wheelbase_mm: 1330, kerb_weight_kg: 193,
    tyre_size: '100/90-19F 120/80-18R', ncap_rating: null,
  },
  'hunter-350': {
    engine_cc: 349, power_bhp: 20.2, torque_nm: 27, mileage_arai: 36, fuel_tank_l: 13,
    seating: 2, boot_space_l: null, ground_clearance_mm: 150,
    length_mm: 2055, width_mm: 800, height_mm: 1052, wheelbase_mm: 1370, kerb_weight_kg: 181,
    tyre_size: '100/80-17F 120/80-17R', ncap_rating: null,
  },
  'meteor-350': {
    engine_cc: 349, power_bhp: 20.2, torque_nm: 27, mileage_arai: 36, fuel_tank_l: 15,
    seating: 2, boot_space_l: null, ground_clearance_mm: 170,
    length_mm: 2275, width_mm: 820, height_mm: 1093, wheelbase_mm: 1450, kerb_weight_kg: 191,
    tyre_size: '100/90-19F 140/70-17R', ncap_rating: null,
  },
  'himalayan': {
    engine_cc: 411, power_bhp: 24.3, torque_nm: 32, mileage_arai: 30, fuel_tank_l: 15,
    seating: 2, boot_space_l: null, ground_clearance_mm: 220,
    length_mm: 2190, width_mm: 855, height_mm: 1370, wheelbase_mm: 1465, kerb_weight_kg: 195,
    tyre_size: '90/90-21F 120/90-17R', ncap_rating: null,
  },
  'pulsar-ns200': {
    engine_cc: 200, power_bhp: 24.5, torque_nm: 18.74, mileage_arai: 30, fuel_tank_l: 12,
    seating: 2, boot_space_l: null, ground_clearance_mm: 165,
    length_mm: 2010, width_mm: 808, height_mm: 1091, wheelbase_mm: 1363, kerb_weight_kg: 158,
    tyre_size: '110/70-17F 150/60-17R', ncap_rating: null,
  },
  'pulsar-150': {
    engine_cc: 150, power_bhp: 13.81, torque_nm: 13.25, mileage_arai: 50, fuel_tank_l: 15,
    seating: 2, boot_space_l: null, ground_clearance_mm: 165,
    length_mm: 2010, width_mm: 735, height_mm: 1065, wheelbase_mm: 1320, kerb_weight_kg: 149,
    tyre_size: '80/100-17F 100/90-17R', ncap_rating: null,
  },
  'pulsar-n250': {
    engine_cc: 249, power_bhp: 24.13, torque_nm: 21.5, mileage_arai: 35, fuel_tank_l: 14,
    seating: 2, boot_space_l: null, ground_clearance_mm: 165,
    length_mm: 2052, width_mm: 808, height_mm: 1065, wheelbase_mm: 1363, kerb_weight_kg: 162,
    tyre_size: '110/70-17F 140/60-17R', ncap_rating: null,
  },
  'dominar-400': {
    engine_cc: 373, power_bhp: 40, torque_nm: 35, mileage_arai: 28, fuel_tank_l: 13,
    seating: 2, boot_space_l: null, ground_clearance_mm: 163,
    length_mm: 2156, width_mm: 828, height_mm: 1114, wheelbase_mm: 1453, kerb_weight_kg: 187,
    tyre_size: '110/70 R17F 150/60 R17R', ncap_rating: null,
  },
  'splendor-plus': {
    engine_cc: 97, power_bhp: 7.9, torque_nm: 8.05, mileage_arai: 60, fuel_tank_l: 9.8,
    seating: 2, boot_space_l: null, ground_clearance_mm: 165,
    length_mm: 1988, width_mm: 726, height_mm: 1073, wheelbase_mm: 1265, kerb_weight_kg: 112,
    tyre_size: '80/100-18', ncap_rating: null,
  },
  'hf-deluxe': {
    engine_cc: 97, power_bhp: 7.91, torque_nm: 8.05, mileage_arai: 65, fuel_tank_l: 9.7,
    seating: 2, boot_space_l: null, ground_clearance_mm: 150,
    length_mm: 1982, width_mm: 720, height_mm: 1074, wheelbase_mm: 1265, kerb_weight_kg: 112,
    tyre_size: '80/100-18', ncap_rating: null,
  },
  'xtreme-160r': {
    engine_cc: 163, power_bhp: 15.2, torque_nm: 14, mileage_arai: 45, fuel_tank_l: 12,
    seating: 2, boot_space_l: null, ground_clearance_mm: 167,
    length_mm: 2025, width_mm: 780, height_mm: 1075, wheelbase_mm: 1345, kerb_weight_kg: 140,
    tyre_size: '100/80-17F 130/70-17R', ncap_rating: null,
  },
  'glamour': {
    engine_cc: 125, power_bhp: 10.97, torque_nm: 10.6, mileage_arai: 55, fuel_tank_l: 13,
    seating: 2, boot_space_l: null, ground_clearance_mm: 157,
    length_mm: 1989, width_mm: 726, height_mm: 1103, wheelbase_mm: 1265, kerb_weight_kg: 121,
    tyre_size: '80/100-18', ncap_rating: null,
  },
  'cb-shine': {
    engine_cc: 124, power_bhp: 10.73, torque_nm: 11, mileage_arai: 60, fuel_tank_l: 10.5,
    seating: 2, boot_space_l: null, ground_clearance_mm: 156,
    length_mm: 2053, width_mm: 728, height_mm: 1087, wheelbase_mm: 1276, kerb_weight_kg: 115,
    tyre_size: '80/100-18', ncap_rating: null,
  },
  'hornet-2-0': {
    engine_cc: 184, power_bhp: 17.26, torque_nm: 16.1, mileage_arai: 40, fuel_tank_l: 12,
    seating: 2, boot_space_l: null, ground_clearance_mm: 167,
    length_mm: 2007, width_mm: 797, height_mm: 1070, wheelbase_mm: 1349, kerb_weight_kg: 139,
    tyre_size: '110/70-17F 140/60-17R', ncap_rating: null,
  },
  'duke-390': {
    engine_cc: 399, power_bhp: 45, torque_nm: 39, mileage_arai: 24, fuel_tank_l: 13.4,
    seating: 2, boot_space_l: null, ground_clearance_mm: 148,
    length_mm: 1969, width_mm: 859, height_mm: 1083, wheelbase_mm: 1357, kerb_weight_kg: 167,
    tyre_size: '110/70 R17F 150/60 R17R', ncap_rating: null,
  },
  'duke-200': {
    engine_cc: 200, power_bhp: 26, torque_nm: 19.5, mileage_arai: 35, fuel_tank_l: 13.4,
    seating: 2, boot_space_l: null, ground_clearance_mm: 155,
    length_mm: 1990, width_mm: 800, height_mm: 1080, wheelbase_mm: 1354, kerb_weight_kg: 160,
    tyre_size: '110/70 R17F 150/60 R17R', ncap_rating: null,
  },
  'mt-15': {
    engine_cc: 155, power_bhp: 18.4, torque_nm: 14.1, mileage_arai: 45, fuel_tank_l: 10,
    seating: 2, boot_space_l: null, ground_clearance_mm: 170,
    length_mm: 1935, width_mm: 800, height_mm: 1055, wheelbase_mm: 1335, kerb_weight_kg: 138,
    tyre_size: '100/80-17F 140/70-17R', ncap_rating: null,
  },
  'mt-15-v2': {
    engine_cc: 155, power_bhp: 18.4, torque_nm: 14.1, mileage_arai: 45, fuel_tank_l: 10,
    seating: 2, boot_space_l: null, ground_clearance_mm: 170,
    length_mm: 1935, width_mm: 800, height_mm: 1055, wheelbase_mm: 1335, kerb_weight_kg: 138,
    tyre_size: '100/80-17F 140/70-17R', ncap_rating: null,
  },
  'avenger-220': {
    engine_cc: 220, power_bhp: 19.03, torque_nm: 17.55, mileage_arai: 40, fuel_tank_l: 13,
    seating: 2, boot_space_l: null, ground_clearance_mm: 166,
    length_mm: 2140, width_mm: 820, height_mm: 1092, wheelbase_mm: 1415, kerb_weight_kg: 155,
    tyre_size: '90/90-17F 130/90-15R', ncap_rating: null,
  },
  'cb300r': {
    engine_cc: 293, power_bhp: 30.74, torque_nm: 27.4, mileage_arai: 32, fuel_tank_l: 12,
    seating: 2, boot_space_l: null, ground_clearance_mm: 144,
    length_mm: 2012, width_mm: 753, height_mm: 1069, wheelbase_mm: 1308, kerb_weight_kg: 147,
    tyre_size: '110/70 R17F 150/60 R17R', ncap_rating: null,
  },
  'rc-390': {
    engine_cc: 399, power_bhp: 45, torque_nm: 39, mileage_arai: 24, fuel_tank_l: 13.7,
    seating: 2, boot_space_l: null, ground_clearance_mm: 160,
    length_mm: 1976, width_mm: 686, height_mm: 1036, wheelbase_mm: 1340, kerb_weight_kg: 163,
    tyre_size: '110/70 R17F 150/60 R17R', ncap_rating: null,
  },
  'fz-s-v3': {
    engine_cc: 149, power_bhp: 12.4, torque_nm: 13.3, mileage_arai: 45, fuel_tank_l: 13,
    seating: 2, boot_space_l: null, ground_clearance_mm: 160,
    length_mm: 1990, width_mm: 770, height_mm: 1080, wheelbase_mm: 1330, kerb_weight_kg: 135,
    tyre_size: '100/80-17F 140/70-17R', ncap_rating: null,
  },
  'r15-v4': {
    engine_cc: 155, power_bhp: 18.4, torque_nm: 14.2, mileage_arai: 45, fuel_tank_l: 11,
    seating: 2, boot_space_l: null, ground_clearance_mm: 170,
    length_mm: 1990, width_mm: 690, height_mm: 1135, wheelbase_mm: 1325, kerb_weight_kg: 142,
    tyre_size: '100/80-17F 140/70-17R', ncap_rating: null,
  },
  'apache-rtr-160-4v': {
    engine_cc: 160, power_bhp: 17.63, torque_nm: 14.73, mileage_arai: 45, fuel_tank_l: 12,
    seating: 2, boot_space_l: null, ground_clearance_mm: 180,
    length_mm: 2080, width_mm: 790, height_mm: 1070, wheelbase_mm: 1366, kerb_weight_kg: 153,
    tyre_size: '100/80-17F 130/70-17R', ncap_rating: null,
  },

  // ════════════════════ SCOOTERS ═════════════════════════════════════════════

  'activa-6g': {
    engine_cc: 110, power_bhp: 7.79, torque_nm: 9, mileage_arai: 60, fuel_tank_l: 5.3,
    seating: 2, boot_space_l: 18, ground_clearance_mm: 171,
    length_mm: 1836, width_mm: 709, height_mm: 1157, wheelbase_mm: 1257, kerb_weight_kg: 108,
    tyre_size: '90/100-10', ncap_rating: null,
  },
  'activa-125': {
    engine_cc: 124, power_bhp: 8.29, torque_nm: 10.3, mileage_arai: 60, fuel_tank_l: 5.9,
    seating: 2, boot_space_l: 18, ground_clearance_mm: 171,
    length_mm: 1848, width_mm: 714, height_mm: 1167, wheelbase_mm: 1260, kerb_weight_kg: 112,
    tyre_size: '90/100-10', ncap_rating: null,
  },
  'ntorq-125': {
    engine_cc: 125, power_bhp: 9.38, torque_nm: 10.5, mileage_arai: 47, fuel_tank_l: 5.8,
    seating: 2, boot_space_l: 22, ground_clearance_mm: 170,
    length_mm: 1856, width_mm: 695, height_mm: 1138, wheelbase_mm: 1282, kerb_weight_kg: 119,
    tyre_size: '90/90-12', ncap_rating: null,
  },
  'jupiter-125': {
    engine_cc: 125, power_bhp: 8.15, torque_nm: 10.5, mileage_arai: 50, fuel_tank_l: 5.7,
    seating: 2, boot_space_l: 21, ground_clearance_mm: 155,
    length_mm: 1846, width_mm: 710, height_mm: 1155, wheelbase_mm: 1280, kerb_weight_kg: 109,
    tyre_size: '90/90-12', ncap_rating: null,
  },
  'jupiter': {
    engine_cc: 110, power_bhp: 7.85, torque_nm: 8.8, mileage_arai: 62, fuel_tank_l: 5,
    seating: 2, boot_space_l: 30, ground_clearance_mm: 165,
    length_mm: 1798, width_mm: 694, height_mm: 1100, wheelbase_mm: 1275, kerb_weight_kg: 107,
    tyre_size: '90/90-10', ncap_rating: null,
  },
  'dio': {
    engine_cc: 110, power_bhp: 7.79, torque_nm: 9, mileage_arai: 60, fuel_tank_l: 5.3,
    seating: 2, boot_space_l: 18, ground_clearance_mm: 157,
    length_mm: 1777, width_mm: 714, height_mm: 1114, wheelbase_mm: 1239, kerb_weight_kg: 107,
    tyre_size: '90/100-10', ncap_rating: null,
  },
  'iqube': {
    engine_cc: 0, power_bhp: 4.4, torque_nm: 18, mileage_arai: 0, fuel_tank_l: 0,
    seating: 2, boot_space_l: 30, ground_clearance_mm: 160,
    length_mm: 1836, width_mm: 695, height_mm: 1140, wheelbase_mm: 1283, kerb_weight_kg: 118,
    tyre_size: '90/90-12', ncap_rating: null,
  },
  'iqube-electric': {
    engine_cc: 0, power_bhp: 4.4, torque_nm: 18, mileage_arai: 0, fuel_tank_l: 0,
    seating: 2, boot_space_l: 30, ground_clearance_mm: 160,
    length_mm: 1836, width_mm: 695, height_mm: 1140, wheelbase_mm: 1283, kerb_weight_kg: 118,
    tyre_size: '90/90-12', ncap_rating: null,
  },
  's1-air': {
    engine_cc: 0, power_bhp: 6, torque_nm: 25, mileage_arai: 0, fuel_tank_l: 0,
    seating: 2, boot_space_l: 34, ground_clearance_mm: 165,
    length_mm: 1848, width_mm: 712, height_mm: 1170, wheelbase_mm: 1300, kerb_weight_kg: 109,
    tyre_size: '90/90-12', ncap_rating: null,
  },
  '450-apex': {
    engine_cc: 0, power_bhp: 10.8, torque_nm: 26, mileage_arai: 0, fuel_tank_l: 0,
    seating: 2, boot_space_l: 22, ground_clearance_mm: 165,
    length_mm: 1805, width_mm: 650, height_mm: 1143, wheelbase_mm: 1269, kerb_weight_kg: 107,
    tyre_size: '90/90-12', ncap_rating: null,
  },
  '450x': {
    engine_cc: 0, power_bhp: 8.1, torque_nm: 26, mileage_arai: 0, fuel_tank_l: 0,
    seating: 2, boot_space_l: 22, ground_clearance_mm: 165,
    length_mm: 1805, width_mm: 650, height_mm: 1143, wheelbase_mm: 1269, kerb_weight_kg: 107,
    tyre_size: '90/90-12', ncap_rating: null,
  },
  's1-pro': {
    engine_cc: 0, power_bhp: 11.4, torque_nm: 58, mileage_arai: 0, fuel_tank_l: 0,
    seating: 2, boot_space_l: 36, ground_clearance_mm: 165,
    length_mm: 1859, width_mm: 712, height_mm: 1170, wheelbase_mm: 1300, kerb_weight_kg: 125,
    tyre_size: '100/80-12', ncap_rating: null,
  },
  'fascino-125': {
    engine_cc: 125, power_bhp: 8.04, torque_nm: 10.3, mileage_arai: 52, fuel_tank_l: 5.2,
    seating: 2, boot_space_l: 22, ground_clearance_mm: 155,
    length_mm: 1820, width_mm: 690, height_mm: 1100, wheelbase_mm: 1260, kerb_weight_kg: 101,
    tyre_size: '90/90-10', ncap_rating: null,
  },
  'rayzr-125': {
    engine_cc: 125, power_bhp: 8.25, torque_nm: 10.3, mileage_arai: 50, fuel_tank_l: 5.1,
    seating: 2, boot_space_l: 21, ground_clearance_mm: 160,
    length_mm: 1816, width_mm: 680, height_mm: 1088, wheelbase_mm: 1258, kerb_weight_kg: 102,
    tyre_size: '90/90-10', ncap_rating: null,
  },
  'access-125': {
    engine_cc: 124, power_bhp: 8.7, torque_nm: 10, mileage_arai: 48, fuel_tank_l: 5.6,
    seating: 2, boot_space_l: 21.8, ground_clearance_mm: 160,
    length_mm: 1820, width_mm: 706, height_mm: 1150, wheelbase_mm: 1255, kerb_weight_kg: 101,
    tyre_size: '90/100-10', ncap_rating: null,
  },
  'destini-125': {
    engine_cc: 125, power_bhp: 8.7, torque_nm: 10.4, mileage_arai: 56, fuel_tank_l: 5.5,
    seating: 2, boot_space_l: 20, ground_clearance_mm: 160,
    length_mm: 1862, width_mm: 708, height_mm: 1154, wheelbase_mm: 1262, kerb_weight_kg: 112,
    tyre_size: '90/90-12', ncap_rating: null,
  },
  'iqube': {
    engine_cc: 0, power_bhp: 4.4, torque_nm: 18, mileage_arai: 0, fuel_tank_l: 0,
    seating: 2, boot_space_l: 30, ground_clearance_mm: 160,
    length_mm: 1836, width_mm: 695, height_mm: 1140, wheelbase_mm: 1283, kerb_weight_kg: 118,
    tyre_size: '90/90-12', ncap_rating: null,
  },
  'chetak': {
    engine_cc: 0, power_bhp: 4, torque_nm: 16, mileage_arai: 0, fuel_tank_l: 0,
    seating: 2, boot_space_l: 28, ground_clearance_mm: 165,
    length_mm: 1791, width_mm: 660, height_mm: 1154, wheelbase_mm: 1280, kerb_weight_kg: 108,
    tyre_size: '90/90-10', ncap_rating: null,
  },

  // ════════════════════ CARS ═════════════════════════════════════════════════

  'swift': {
    engine_cc: 1197, power_bhp: 88.5, torque_nm: 113, mileage_arai: 22, fuel_tank_l: 37,
    seating: 5, boot_space_l: 268, ground_clearance_mm: 163,
    length_mm: 3845, width_mm: 1735, height_mm: 1530, wheelbase_mm: 2450, kerb_weight_kg: 913,
    tyre_size: '175/65 R15', ncap_rating: '3 stars',
  },
  'baleno': {
    engine_cc: 1197, power_bhp: 88.5, torque_nm: 113, mileage_arai: 22.35, fuel_tank_l: 37,
    seating: 5, boot_space_l: 339, ground_clearance_mm: 161,
    length_mm: 3990, width_mm: 1745, height_mm: 1500, wheelbase_mm: 2520, kerb_weight_kg: 910,
    tyre_size: '185/65 R15', ncap_rating: '2 stars',
  },
  'dzire': {
    engine_cc: 1197, power_bhp: 88.5, torque_nm: 113, mileage_arai: 24.12, fuel_tank_l: 37,
    seating: 5, boot_space_l: 378, ground_clearance_mm: 163,
    length_mm: 3995, width_mm: 1735, height_mm: 1515, wheelbase_mm: 2450, kerb_weight_kg: 845,
    tyre_size: '175/65 R15', ncap_rating: '2 stars',
  },
  'wagon-r': {
    engine_cc: 1197, power_bhp: 88.5, torque_nm: 113, mileage_arai: 22, fuel_tank_l: 32,
    seating: 5, boot_space_l: 341, ground_clearance_mm: 180,
    length_mm: 3655, width_mm: 1620, height_mm: 1675, wheelbase_mm: 2435, kerb_weight_kg: 850,
    tyre_size: '175/60 R15', ncap_rating: null,
  },
  'wagonr': {
    engine_cc: 1197, power_bhp: 88.5, torque_nm: 113, mileage_arai: 22, fuel_tank_l: 32,
    seating: 5, boot_space_l: 341, ground_clearance_mm: 180,
    length_mm: 3655, width_mm: 1620, height_mm: 1675, wheelbase_mm: 2435, kerb_weight_kg: 850,
    tyre_size: '175/60 R15', ncap_rating: null,
  },
  'brezza': {
    engine_cc: 1462, power_bhp: 103, torque_nm: 137, mileage_arai: 17.38, fuel_tank_l: 48,
    seating: 5, boot_space_l: 328, ground_clearance_mm: 198,
    length_mm: 3990, width_mm: 1790, height_mm: 1640, wheelbase_mm: 2500, kerb_weight_kg: 1175,
    tyre_size: '215/60 R16', ncap_rating: null,
  },
  'ertiga': {
    engine_cc: 1462, power_bhp: 103, torque_nm: 137, mileage_arai: 20.3, fuel_tank_l: 45,
    seating: 7, boot_space_l: 135, ground_clearance_mm: 185,
    length_mm: 4395, width_mm: 1735, height_mm: 1690, wheelbase_mm: 2740, kerb_weight_kg: 1230,
    tyre_size: '195/65 R15', ncap_rating: null,
  },
  'grand-vitara': {
    engine_cc: 1490, power_bhp: 91.2, torque_nm: 122, mileage_arai: 27.97, fuel_tank_l: 45,
    seating: 5, boot_space_l: 373, ground_clearance_mm: 200,
    length_mm: 4345, width_mm: 1795, height_mm: 1645, wheelbase_mm: 2600, kerb_weight_kg: 1410,
    tyre_size: '215/60 R17', ncap_rating: null,
  },
  'fronx': {
    engine_cc: 1197, power_bhp: 88.5, torque_nm: 113, mileage_arai: 21.79, fuel_tank_l: 37,
    seating: 5, boot_space_l: 308, ground_clearance_mm: 180,
    length_mm: 3995, width_mm: 1765, height_mm: 1550, wheelbase_mm: 2520, kerb_weight_kg: 960,
    tyre_size: '195/60 R16', ncap_rating: null,
  },
  'jimny': {
    engine_cc: 1462, power_bhp: 103, torque_nm: 134.2, mileage_arai: 16.39, fuel_tank_l: 40,
    seating: 4, boot_space_l: 85, ground_clearance_mm: 210,
    length_mm: 3985, width_mm: 1645, height_mm: 1720, wheelbase_mm: 2550, kerb_weight_kg: 1190,
    tyre_size: '195/80 R15', ncap_rating: '5 stars',
  },
  'creta': {
    engine_cc: 1497, power_bhp: 158, torque_nm: 253, mileage_arai: 14, fuel_tank_l: 50,
    seating: 5, boot_space_l: 433, ground_clearance_mm: 200,
    length_mm: 4300, width_mm: 1790, height_mm: 1635, wheelbase_mm: 2610, kerb_weight_kg: 1490,
    tyre_size: '215/60 R17', ncap_rating: '5 stars',
  },
  'alcazar': {
    engine_cc: 1497, power_bhp: 158, torque_nm: 253, mileage_arai: 14.2, fuel_tank_l: 50,
    seating: 6, boot_space_l: 180, ground_clearance_mm: 200,
    length_mm: 4500, width_mm: 1800, height_mm: 1675, wheelbase_mm: 2760, kerb_weight_kg: 1790,
    tyre_size: '215/60 R17', ncap_rating: null,
  },
  'glanza': {
    engine_cc: 1197, power_bhp: 88.5, torque_nm: 113, mileage_arai: 22.35, fuel_tank_l: 37,
    seating: 5, boot_space_l: 318, ground_clearance_mm: 161,
    length_mm: 3990, width_mm: 1745, height_mm: 1500, wheelbase_mm: 2520, kerb_weight_kg: 910,
    tyre_size: '185/65 R15', ncap_rating: null,
  },
  'venue': {
    engine_cc: 1197, power_bhp: 120, torque_nm: 172, mileage_arai: 18.15, fuel_tank_l: 45,
    seating: 5, boot_space_l: 350, ground_clearance_mm: 195,
    length_mm: 4253, width_mm: 1770, height_mm: 1590, wheelbase_mm: 2500, kerb_weight_kg: 1250,
    tyre_size: '205/60 R16', ncap_rating: null,
  },
  'i20': {
    engine_cc: 1197, power_bhp: 99, torque_nm: 172, mileage_arai: 20.35, fuel_tank_l: 40,
    seating: 5, boot_space_l: 311, ground_clearance_mm: 161,
    length_mm: 4040, width_mm: 1775, height_mm: 1505, wheelbase_mm: 2580, kerb_weight_kg: 1190,
    tyre_size: '195/60 R16', ncap_rating: '5 stars',
  },
  'verna': {
    engine_cc: 1497, power_bhp: 158, torque_nm: 253, mileage_arai: 18, fuel_tank_l: 45,
    seating: 5, boot_space_l: 528, ground_clearance_mm: 160,
    length_mm: 4535, width_mm: 1765, height_mm: 1475, wheelbase_mm: 2670, kerb_weight_kg: 1325,
    tyre_size: '205/55 R16', ncap_rating: '6 stars',
  },
  'grand-i10-nios': {
    engine_cc: 1197, power_bhp: 82, torque_nm: 114, mileage_arai: 20.7, fuel_tank_l: 35,
    seating: 5, boot_space_l: 260, ground_clearance_mm: 161,
    length_mm: 3805, width_mm: 1680, height_mm: 1520, wheelbase_mm: 2450, kerb_weight_kg: 1090,
    tyre_size: '165/70 R14', ncap_rating: null,
  },
  'i10-nios': {
    engine_cc: 1197, power_bhp: 82, torque_nm: 114, mileage_arai: 20.7, fuel_tank_l: 35,
    seating: 5, boot_space_l: 260, ground_clearance_mm: 161,
    length_mm: 3805, width_mm: 1680, height_mm: 1520, wheelbase_mm: 2450, kerb_weight_kg: 1090,
    tyre_size: '165/70 R14', ncap_rating: null,
  },
  'nexon': {
    engine_cc: 1198, power_bhp: 118.36, torque_nm: 170, mileage_arai: 17.44, fuel_tank_l: 44,
    seating: 5, boot_space_l: 350, ground_clearance_mm: 209,
    length_mm: 3994, width_mm: 1811, height_mm: 1606, wheelbase_mm: 2498, kerb_weight_kg: 1350,
    tyre_size: '215/60 R16', ncap_rating: '5 stars',
  },
  'punch': {
    engine_cc: 1199, power_bhp: 85.84, torque_nm: 113, mileage_arai: 18.97, fuel_tank_l: 40,
    seating: 5, boot_space_l: 366, ground_clearance_mm: 187,
    length_mm: 3827, width_mm: 1742, height_mm: 1615, wheelbase_mm: 2445, kerb_weight_kg: 1175,
    tyre_size: '195/65 R15', ncap_rating: '5 stars',
  },
  'harrier': {
    engine_cc: 1956, power_bhp: 167.67, torque_nm: 350, mileage_arai: 14.6, fuel_tank_l: 50,
    seating: 5, boot_space_l: 425, ground_clearance_mm: 205,
    length_mm: 4598, width_mm: 1894, height_mm: 1706, wheelbase_mm: 2741, kerb_weight_kg: 1705,
    tyre_size: '235/60 R18', ncap_rating: '5 stars',
  },
  'safari': {
    engine_cc: 1956, power_bhp: 167.67, torque_nm: 350, mileage_arai: 14.08, fuel_tank_l: 50,
    seating: 7, boot_space_l: 73, ground_clearance_mm: 205,
    length_mm: 4661, width_mm: 1894, height_mm: 1786, wheelbase_mm: 2741, kerb_weight_kg: 1780,
    tyre_size: '235/60 R18', ncap_rating: '5 stars',
  },
  'altroz': {
    engine_cc: 1199, power_bhp: 108.53, torque_nm: 140, mileage_arai: 18.13, fuel_tank_l: 37,
    seating: 5, boot_space_l: 345, ground_clearance_mm: 165,
    length_mm: 3988, width_mm: 1755, height_mm: 1505, wheelbase_mm: 2501, kerb_weight_kg: 1245,
    tyre_size: '195/55 R16', ncap_rating: '5 stars',
  },
  'tiago': {
    engine_cc: 1199, power_bhp: 85.84, torque_nm: 113, mileage_arai: 19.8, fuel_tank_l: 35,
    seating: 5, boot_space_l: 242, ground_clearance_mm: 165,
    length_mm: 3765, width_mm: 1677, height_mm: 1531, wheelbase_mm: 2400, kerb_weight_kg: 1085,
    tyre_size: '175/65 R14', ncap_rating: null,
  },
  'tigor': {
    engine_cc: 1199, power_bhp: 85.84, torque_nm: 113, mileage_arai: 20.3, fuel_tank_l: 35,
    seating: 5, boot_space_l: 419, ground_clearance_mm: 165,
    length_mm: 3993, width_mm: 1677, height_mm: 1532, wheelbase_mm: 2450, kerb_weight_kg: 1175,
    tyre_size: '175/65 R15', ncap_rating: null,
  },
  'curvv-ev': {
    engine_cc: 0, power_bhp: 167, torque_nm: 215, mileage_arai: 0, fuel_tank_l: 0,
    seating: 5, boot_space_l: 500, ground_clearance_mm: 190,
    length_mm: 4310, width_mm: 1875, height_mm: 1637, wheelbase_mm: 2560, kerb_weight_kg: 1895,
    tyre_size: '215/60 R17', ncap_rating: '5 stars',
  },
  'city': {
    engine_cc: 1498, power_bhp: 119.51, torque_nm: 145, mileage_arai: 17.8, fuel_tank_l: 40,
    seating: 5, boot_space_l: 506, ground_clearance_mm: 165,
    length_mm: 4549, width_mm: 1748, height_mm: 1489, wheelbase_mm: 2600, kerb_weight_kg: 1208,
    tyre_size: '185/55 R16', ncap_rating: null,
  },
  'elevate': {
    engine_cc: 1498, power_bhp: 127.64, torque_nm: 204, mileage_arai: 15.32, fuel_tank_l: 40,
    seating: 5, boot_space_l: 458, ground_clearance_mm: 220,
    length_mm: 4312, width_mm: 1790, height_mm: 1650, wheelbase_mm: 2650, kerb_weight_kg: 1297,
    tyre_size: '215/60 R16', ncap_rating: null,
  },
  'amaze': {
    engine_cc: 1198, power_bhp: 88.69, torque_nm: 110, mileage_arai: 18.6, fuel_tank_l: 35,
    seating: 5, boot_space_l: 420, ground_clearance_mm: 170,
    length_mm: 3995, width_mm: 1695, height_mm: 1500, wheelbase_mm: 2470, kerb_weight_kg: 1025,
    tyre_size: '175/65 R15', ncap_rating: '2 stars',
  },
  'seltos': {
    engine_cc: 1497, power_bhp: 138, torque_nm: 242, mileage_arai: 18.3, fuel_tank_l: 50,
    seating: 5, boot_space_l: 433, ground_clearance_mm: 200,
    length_mm: 4315, width_mm: 1800, height_mm: 1645, wheelbase_mm: 2610, kerb_weight_kg: 1500,
    tyre_size: '215/60 R17', ncap_rating: null,
  },
  'sonet': {
    engine_cc: 1197, power_bhp: 120, torque_nm: 172, mileage_arai: 18.2, fuel_tank_l: 45,
    seating: 5, boot_space_l: 392, ground_clearance_mm: 205,
    length_mm: 3995, width_mm: 1790, height_mm: 1642, wheelbase_mm: 2500, kerb_weight_kg: 1375,
    tyre_size: '215/60 R16', ncap_rating: null,
  },
  'carens': {
    engine_cc: 1497, power_bhp: 138, torque_nm: 242, mileage_arai: 16.34, fuel_tank_l: 45,
    seating: 7, boot_space_l: 114, ground_clearance_mm: 200,
    length_mm: 4540, width_mm: 1800, height_mm: 1700, wheelbase_mm: 2780, kerb_weight_kg: 1665,
    tyre_size: '215/60 R17', ncap_rating: null,
  },
  'scorpio-n': {
    engine_cc: 2184, power_bhp: 172.1, torque_nm: 370, mileage_arai: 15.2, fuel_tank_l: 60,
    seating: 7, boot_space_l: null, ground_clearance_mm: 200,
    length_mm: 4662, width_mm: 1917, height_mm: 1857, wheelbase_mm: 2750, kerb_weight_kg: 2004,
    tyre_size: '255/60 R18', ncap_rating: null,
  },
  'bolero': {
    engine_cc: 1493, power_bhp: 75, torque_nm: 210, mileage_arai: 16, fuel_tank_l: 60,
    seating: 7, boot_space_l: null, ground_clearance_mm: 180,
    length_mm: 3995, width_mm: 1745, height_mm: 1880, wheelbase_mm: 2680, kerb_weight_kg: 1760,
    tyre_size: '215/75 R15', ncap_rating: null,
  },
  'xuv300': {
    engine_cc: 1198, power_bhp: 109.91, torque_nm: 200, mileage_arai: 17.78, fuel_tank_l: 40,
    seating: 5, boot_space_l: 257, ground_clearance_mm: 180,
    length_mm: 3995, width_mm: 1821, height_mm: 1627, wheelbase_mm: 2600, kerb_weight_kg: 1254,
    tyre_size: '215/55 R17', ncap_rating: null,
  },
  'xuv700': {
    engine_cc: 2184, power_bhp: 185, torque_nm: 420, mileage_arai: 16.09, fuel_tank_l: 60,
    seating: 7, boot_space_l: null, ground_clearance_mm: 200,
    length_mm: 4695, width_mm: 1890, height_mm: 1755, wheelbase_mm: 2750, kerb_weight_kg: 1970,
    tyre_size: '235/60 R18', ncap_rating: '5 stars',
  },
  'xuv-3xo': {
    engine_cc: 1197, power_bhp: 129.83, torque_nm: 230, mileage_arai: 20.1, fuel_tank_l: 42,
    seating: 5, boot_space_l: 364, ground_clearance_mm: 200,
    length_mm: 3990, width_mm: 1821, height_mm: 1647, wheelbase_mm: 2600, kerb_weight_kg: 1430,
    tyre_size: '215/60 R17', ncap_rating: '5 stars',
  },
  'thar': {
    engine_cc: 2184, power_bhp: 130, torque_nm: 300, mileage_arai: 15.2, fuel_tank_l: 57,
    seating: 4, boot_space_l: null, ground_clearance_mm: 226,
    length_mm: 3985, width_mm: 1820, height_mm: 1844, wheelbase_mm: 2450, kerb_weight_kg: 1765,
    tyre_size: '255/65 R16', ncap_rating: null,
  },
  'fortuner': {
    engine_cc: 2755, power_bhp: 201, torque_nm: 500, mileage_arai: 14.24, fuel_tank_l: 80,
    seating: 7, boot_space_l: null, ground_clearance_mm: 221,
    length_mm: 4795, width_mm: 1855, height_mm: 1835, wheelbase_mm: 2745, kerb_weight_kg: 2400,
    tyre_size: '265/60 R18', ncap_rating: null,
  },
  'hyryder': {
    engine_cc: 1490, power_bhp: 91.5, torque_nm: 122, mileage_arai: 27.97, fuel_tank_l: 45,
    seating: 5, boot_space_l: 373, ground_clearance_mm: 195,
    length_mm: 4365, width_mm: 1795, height_mm: 1635, wheelbase_mm: 2600, kerb_weight_kg: 1530,
    tyre_size: '215/60 R17', ncap_rating: null,
  },
  'urban-cruiser-hyryder': {
    engine_cc: 1490, power_bhp: 91.5, torque_nm: 122, mileage_arai: 27.97, fuel_tank_l: 45,
    seating: 5, boot_space_l: 373, ground_clearance_mm: 195,
    length_mm: 4365, width_mm: 1795, height_mm: 1635, wheelbase_mm: 2600, kerb_weight_kg: 1530,
    tyre_size: '215/60 R17', ncap_rating: null,
  },
  'innova-crysta': {
    engine_cc: 2393, power_bhp: 148.55, torque_nm: 343, mileage_arai: 15.1, fuel_tank_l: 55,
    seating: 7, boot_space_l: null, ground_clearance_mm: 190,
    length_mm: 4735, width_mm: 1830, height_mm: 1795, wheelbase_mm: 2750, kerb_weight_kg: 2015,
    tyre_size: '205/65 R16', ncap_rating: null,
  },
  'innova-hycross': {
    engine_cc: 1987, power_bhp: 186, torque_nm: 206, mileage_arai: 21.1, fuel_tank_l: 52,
    seating: 7, boot_space_l: null, ground_clearance_mm: 185,
    length_mm: 4755, width_mm: 1850, height_mm: 1790, wheelbase_mm: 2850, kerb_weight_kg: 1920,
    tyre_size: '225/55 R18', ncap_rating: null,
  },
  'ev6': {
    engine_cc: 0, power_bhp: 167.48, torque_nm: 350, mileage_arai: 0, fuel_tank_l: 0,
    seating: 5, boot_space_l: 520, ground_clearance_mm: 160,
    length_mm: 4680, width_mm: 1880, height_mm: 1550, wheelbase_mm: 2900, kerb_weight_kg: 2080,
    tyre_size: '235/45 R20', ncap_rating: '5 stars',
  },
  'windsor-ev': {
    engine_cc: 0, power_bhp: 134, torque_nm: 200, mileage_arai: 0, fuel_tank_l: 0,
    seating: 5, boot_space_l: 604, ground_clearance_mm: 189,
    length_mm: 4295, width_mm: 1850, height_mm: 1677, wheelbase_mm: 2700, kerb_weight_kg: 1830,
    tyre_size: '215/55 R17', ncap_rating: null,
  },
  'hector': {
    engine_cc: 1451, power_bhp: 143, torque_nm: 250, mileage_arai: 14.93, fuel_tank_l: 60,
    seating: 5, boot_space_l: 587, ground_clearance_mm: 200,
    length_mm: 4720, width_mm: 1835, height_mm: 1760, wheelbase_mm: 2750, kerb_weight_kg: 1648,
    tyre_size: '235/60 R18', ncap_rating: null,
  },
  'astor': {
    engine_cc: 1349, power_bhp: 138, torque_nm: 220, mileage_arai: 15.64, fuel_tank_l: 48,
    seating: 5, boot_space_l: 348, ground_clearance_mm: 178,
    length_mm: 4323, width_mm: 1809, height_mm: 1648, wheelbase_mm: 2585, kerb_weight_kg: 1440,
    tyre_size: '215/60 R17', ncap_rating: null,
  },
  'zs-ev': {
    engine_cc: 0, power_bhp: 176, torque_nm: 280, mileage_arai: 0, fuel_tank_l: 0,
    seating: 5, boot_space_l: 359, ground_clearance_mm: 177,
    length_mm: 4323, width_mm: 1809, height_mm: 1650, wheelbase_mm: 2585, kerb_weight_kg: 1620,
    tyre_size: '215/55 R17', ncap_rating: null,
  },
  'gloster': {
    engine_cc: 1996, power_bhp: 218, torque_nm: 480, mileage_arai: 14.24, fuel_tank_l: 70,
    seating: 7, boot_space_l: null, ground_clearance_mm: 220,
    length_mm: 4985, width_mm: 1926, height_mm: 1867, wheelbase_mm: 2950, kerb_weight_kg: 2350,
    tyre_size: '265/50 R20', ncap_rating: null,
  },
  'slavia': {
    engine_cc: 1498, power_bhp: 148, torque_nm: 250, mileage_arai: 18.12, fuel_tank_l: 50,
    seating: 5, boot_space_l: 521, ground_clearance_mm: 179,
    length_mm: 4541, width_mm: 1752, height_mm: 1507, wheelbase_mm: 2651, kerb_weight_kg: 1312,
    tyre_size: '205/55 R16', ncap_rating: null,
  },
  'kushaq': {
    engine_cc: 1498, power_bhp: 148, torque_nm: 250, mileage_arai: 15.24, fuel_tank_l: 50,
    seating: 5, boot_space_l: 385, ground_clearance_mm: 188,
    length_mm: 4225, width_mm: 1760, height_mm: 1612, wheelbase_mm: 2651, kerb_weight_kg: 1250,
    tyre_size: '215/55 R17', ncap_rating: null,
  },
  'virtus': {
    engine_cc: 1498, power_bhp: 148, torque_nm: 250, mileage_arai: 18.73, fuel_tank_l: 50,
    seating: 5, boot_space_l: 521, ground_clearance_mm: 179,
    length_mm: 4561, width_mm: 1752, height_mm: 1507, wheelbase_mm: 2651, kerb_weight_kg: 1280,
    tyre_size: '205/55 R16', ncap_rating: null,
  },
  'taigun': {
    engine_cc: 1498, power_bhp: 148, torque_nm: 250, mileage_arai: 15.3, fuel_tank_l: 50,
    seating: 5, boot_space_l: 385, ground_clearance_mm: 188,
    length_mm: 4221, width_mm: 1760, height_mm: 1612, wheelbase_mm: 2651, kerb_weight_kg: 1227,
    tyre_size: '215/55 R17', ncap_rating: null,
  },
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching all models from DB…')

  const { data: models, error: mErr } = await sb
    .from('models')
    .select('id, name, slug')
    .order('type')
    .order('name')

  if (mErr) { console.error('Failed to fetch models:', mErr.message); process.exit(1) }
  console.log(`Found ${models.length} models.\n`)

  let inserted = 0, skipped = 0, noData = 0, errored = 0

  for (const model of models) {
    const specData = SPECS[model.slug]
    if (!specData) {
      console.log(`⚠  ${model.name} (${model.slug}) — no spec data in map`)
      noData++
      continue
    }

    // Find popular variant
    const { data: variants, error: vErr } = await sb
      .from('variants')
      .select('id, name, is_popular')
      .eq('model_id', model.id)
      .order('sort_order')

    if (vErr || !variants?.length) {
      console.log(`✗  ${model.name} — no variants found`)
      errored++
      continue
    }

    const popular = variants.find(v => v.is_popular) ?? variants[0]

    // Check if specs already exist
    const { data: existing } = await sb
      .from('specs')
      .select('id')
      .eq('variant_id', popular.id)
      .maybeSingle()

    if (existing) {
      console.log(`⏭  ${model.name} → "${popular.name}" — specs already exist`)
      skipped++
      continue
    }

    // Insert specs
    const { error: iErr } = await sb.from('specs').insert({
      variant_id:          popular.id,
      engine_cc:           specData.engine_cc           ?? null,
      power_bhp:           specData.power_bhp           ?? null,
      torque_nm:           specData.torque_nm           ?? null,
      mileage_arai:        specData.mileage_arai        ?? null,
      fuel_tank_l:         specData.fuel_tank_l         ?? null,
      seating:             specData.seating             ?? null,
      boot_space_l:        specData.boot_space_l        ?? null,
      ground_clearance_mm: specData.ground_clearance_mm ?? null,
      length_mm:           specData.length_mm           ?? null,
      width_mm:            specData.width_mm            ?? null,
      height_mm:           specData.height_mm           ?? null,
      wheelbase_mm:        specData.wheelbase_mm        ?? null,
      kerb_weight_kg:      specData.kerb_weight_kg      ?? null,
      tyre_size:           specData.tyre_size           ?? null,
      ncap_rating:         specData.ncap_rating         ?? null,
    })

    if (iErr) {
      console.log(`✗  ${model.name} → "${popular.name}" — ${iErr.message}`)
      errored++
    } else {
      console.log(`✓  ${model.name} → "${popular.name}"`)
      inserted++
    }
  }

  console.log(`\n──────────────────────────────────────`)
  console.log(`Inserted : ${inserted}`)
  console.log(`Skipped  : ${skipped}  (already had specs)`)
  console.log(`No data  : ${noData}   (slug not in SPECS map)`)
  console.log(`Errors   : ${errored}`)
  console.log(`──────────────────────────────────────`)
}

main()
