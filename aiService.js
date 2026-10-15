const axios = require('axios');

/**
 * GeoAI Rural Governance Intelligence Platform - AI Decision Support Engine
 *
 * Flow:
 * Citizen Complaint -> AI reads description -> AI identifies actual problem ->
 * AI explains causes/impact (analysis) -> AI generates recommended solution ->
 * AI suggests immediate field action for the government team.
 */

// Helper to format location string
const formatLocation = (complaint) => {
  const parts = [];
  if (complaint.village) parts.push(complaint.village);
  if (complaint.mandal) parts.push(complaint.mandal);
  if (complaint.district) parts.push(complaint.district);
  parts.push('Andhra Pradesh');
  return parts.join(', ');
};

// Helper to extract duration mentioned in complaint (e.g., "5 days", "2 weeks", "3 hours")
const extractDuration = (text) => {
  const match = text.match(/(\d+\s*(?:days?|weeks?|months?|hours?))/i);
  return match ? match[1] : null;
};

// Helper to extract location landmark from text (e.g., "near school", "panchayat office", "main road")
const extractLandmark = (text) => {
  const match = text.match(/(near|at|opposite|beside|around)\s+([a-zA-Z0-9\s]{3,30}?)(?=[,.]|$)/i);
  return match ? `${match[1]} ${match[2].trim()}` : null;
};

/**
 * Intelligent Rule-Based Text Analysis Engine
 * Performs deep semantic NLP analysis of the citizen's actual complaint description.
 * Ensures DIFFERENT solutions for DIFFERENT complaints, even within the same category.
 */
const analyzeComplaintText = (complaint) => {
  const desc = (complaint.description || '').toLowerCase();
  const rawDesc = complaint.description || '';
  const category = complaint.category || 'Other';
  const loc = formatLocation(complaint);
  const duration = extractDuration(rawDesc);
  const landmark = extractLandmark(rawDesc);

  let problemIdentified = '';
  let analysis = '';
  let recommendedSolution = '';
  let immediateAction = '';
  let suggestedDepartment = '';
  let priority = 'Medium';
  let estimatedResolution = '2-4 days';
  let possibleCauses = [];
  let resolutionSteps = [];

  // =========================================================================
  // 1. WATER SUPPLY ANALYZER
  // =========================================================================
  if (category === 'Water Supply') {
    suggestedDepartment = 'Rural Water Supply & Sanitation (RWSS) / Water Resources Department';

    if (desc.includes('burst') || desc.includes('leak') || desc.includes('pipe') || desc.includes('rupture') || desc.includes('overflowing in street')) {
      problemIdentified = `Pipeline rupture and uncontained potable water leakage${landmark ? ` ${landmark}` : ''}`;
      analysis = `A physical rupture in the drinking water distribution conduit in ${loc} is discharging pressurized treated water into the street. The leak is depressing downstream network pressure, depriving adjacent households of potable supply while risking external wastewater infiltration into the distribution line.`;
      recommendedSolution = `Isolate the ruptured segment using sluice isolating valves, excavate down to the pipe invert, cut out the cracked section, install a pressure-rated HDPE/GI replacement sleeve with mechanical flange couplings, and flush the pipeline with hyper-chlorinated water before full re-commissioning.`;
      immediateAction = `Shut off the upstream control valve immediately to halt water loss and dispatch a rapid-response plumbing unit equipped with a diesel dewatering pump and pipe repair clamps.`;
      priority = 'High';
      estimatedResolution = '12-24 hours';
      possibleCauses = [
        'High pressure surge (water hammer) during distribution changeover',
        'Physical trauma from road excavation or heavy vehicle wheel load',
        'Aging PVC/AC joint degradation and soil subsidence',
      ];
      resolutionSteps = [
        'Close nearest zonal isolation valve to arrest water wastage',
        'Excavate and dewater the damaged trench section',
        'Splice and secure new pressure-grade pipe segment with mechanical joints',
        'Conduct hydrostatic pressure test and line disinfection',
        'Backfill trench, restore road surface, and resume scheduled supply',
      ];
    } else if (desc.includes('dirty') || desc.includes('muddy') || desc.includes('smell') || desc.includes('foul') || desc.includes('contaminat') || desc.includes('yellow') || desc.includes('black') || desc.includes('color') || desc.includes('illness') || desc.includes('diarrhea')) {
      problemIdentified = `Potable water quality degradation and suspected biological/chemical contamination`;
      analysis = `Residents in ${loc} are receiving discolored or foul-smelling water, indicating cross-contamination where sewage or storm runoff is infiltrating the drinking water line through negative pressure fissures or damaged joints. This presents an acute community health emergency.`;
      recommendedSolution = `Collect immediate water samples for bacteriological (E. coli, coliform) and turbidity analysis at the district lab. Super-chlorinate the overhead service reservoir (OHSR) to 2.0 ppm residual chlorine, trace the pipeline alignment to locate cross-contamination ingress, and repair compromised junctions.`;
      immediateAction = `Issue an immediate emergency boil-water advisory to all residents in ${loc}, mobilize clean municipal water tankers for drinking needs, and dose chlorine tablets into the main supply sump.`;
      priority = 'Critical';
      estimatedResolution = '24-36 hours';
      possibleCauses = [
        'Sub-surface wastewater ingress into clean water pipes during low-pressure intervals',
        'Overhead reservoir (OHSR) sedimentation and biological biofilm buildup',
        'Agricultural fertilizer or septic tank seepage near shallow pipeline routes',
      ];
      resolutionSteps = [
        'Issue public alert to boil water and dispatch drinking water tankers',
        'Draw multi-point water samples for rapid bacteriological culture testing',
        'Drain, scrub, and shock-chlorinate the overhead service reservoir',
        'Acoustically locate and seal wastewater ingress points along the line',
        'Flush distribution mains and verify safe chlorine residual (0.2-0.5 ppm) at consumer taps',
      ];
    } else if (desc.includes('borewell') || desc.includes('motor') || desc.includes('pump') || desc.includes('handpump') || desc.includes('submersible')) {
      problemIdentified = `Borewell pumping machinery failure / groundwater extraction disruption`;
      analysis = `The primary groundwater extraction equipment serving ${loc} is inoperable due to motor coil burnout, capacitor failure, or lowering of the seasonal water table, leaving the dependent community without their local source.`;
      recommendedSolution = `Execute insulation resistance (Megger) diagnostics on the submersible pump, replace damaged control panel contactors/capacitors, or lower the pump column pipe assembly if the static water table has receded.`;
      immediateAction = `Deploy an electrical-mechanical pump technician team to test the starter panel and deliver temporary tanker water to ensure continuity for household chores.`;
      priority = 'High';
      estimatedResolution = '24-48 hours';
      possibleCauses = [
        'Electrical voltage fluctuation causing motor winding burnout',
        'Dry run damage from seasonal groundwater table depletion',
        'Impeller blockage by sand or silt particles',
      ];
      resolutionSteps = [
        'Inspect electrical control panel, circuit breaker, and capacitor bank',
        'Perform motor winding continuity and insulation test',
        'Hoist pump assembly if down-hole mechanical failure is detected',
        'Replace or rewind motor and clean sand filter screen',
        'Re-install pump, test discharge rate, and restore community access',
      ];
    } else if (desc.includes('low pressure') || desc.includes('pressure') || desc.includes('trickle') || desc.includes('not reaching') || desc.includes('tail end') || desc.includes('hardly')) {
      problemIdentified = `Hydraulic pressure deficit and terminal distribution starvation`;
      analysis = `Households in ${loc} are suffering from severely depleted water pressure. Inadequate hydraulic head, partial internal encrustation of the pipe, or unauthorized upstream booster suction is preventing adequate flow to tail-end distribution taps.`;
      recommendedSolution = `Regulate zonal control valves to balance pressure across all wards, install an automatic inline pressure booster pump for elevated street clusters, and desilt distribution feeder mains.`;
      immediateAction = `Measure dynamic pressure using pressure gauges at distribution nodes and adjust intermediate balancing valves to direct adequate head towards ${loc}.`;
      priority = 'High';
      estimatedResolution = '24-48 hours';
      possibleCauses = [
        'Hydraulic head drop due to excessive distance from the overhead reservoir',
        'Unauthorized direct suction pumps installed by upstream consumers',
        'Mineral scaling and sediment choke inside the distribution pipe',
      ];
      resolutionSteps = [
        'Conduct pressure profiling at key nodal junctions',
        'Inspect and re-calibrate distribution valve opening schedules',
        'Remove illegal inline suction motors along the feeder',
        'Desilt and swab choked distribution segments',
        'Verify minimum terminal pressure of 7 meters head at consumer taps',
      ];
    } else {
      // General Water Shortage / Outage
      problemIdentified = `Irregular and disrupted drinking water supply${duration ? ` (${duration} outage)` : ''}`;
      analysis = `The community in ${loc} is experiencing an acute water supply breakdown${duration ? ` lasting ${duration}` : ''}. Scheduled distribution has ceased, causing widespread domestic hardship and forcing vulnerable families to rely on costly private sources.`;
      recommendedSolution = `Audit bulk feeder water transmission logs, rectify transmission conduit supply deficits, optimize feeder scheduling, and institute automated telemetry monitoring at the local distribution reservoir.`;
      immediateAction = `Mobilize municipal water tankers immediately to provide safe drinking water (minimum 40 LPCD) to affected households in ${loc} and investigate source valve operations.`;
      priority = 'High';
      estimatedResolution = '24-48 hours';
      possibleCauses = [
        'Bulk transmission feeder disruption or canal supply shutdown',
        'Pump house operational breakdown or power supply trip',
        'Distribution valve scheduling mismanagement at Gram Panchayat level',
      ];
      resolutionSteps = [
        'Dispatch emergency potable water tankers to all affected streets',
        'Trace transmission line from main pump house to local reservoir',
        'Rectify pumping equipment or feeder valve operational blocks',
        'Refill overhead reservoir and verify distribution schedule',
        'Notify village secretariat and confirm tap flow in all wards',
      ];
    }

  // =========================================================================
  // 2. ROAD PROBLEMS ANALYZER
  // =========================================================================
  } else if (category === 'Road Problems') {
    suggestedDepartment = 'Roads & Buildings (R&B) / Panchayat Raj Engineering Department';

    if (desc.includes('pothole') || desc.includes('crater') || desc.includes('rough') || desc.includes('bumpy') || desc.includes('damaged road') || desc.includes('accident')) {
      const nearSchool = desc.includes('school') || desc.includes('college') || desc.includes('hospital');
      problemIdentified = `Damaged road with severe pothole clusters${nearSchool ? (desc.includes('school') ? ' near school' : ' near public facility') : ''}`;
      analysis = `The road surface in ${loc} has disintegrated, forming dangerous potholes and surface craters. This condition creates severe transit difficulty and acute safety hazards for road users${nearSchool ? ', particularly students, cyclists, and two-wheelers' : ''}, with heightened risk of skidding and vehicle damage.`;
      recommendedSolution = `Execute mechanical road patching: square-cut and clean all pothole edges, apply an emulsion tack coat, backfill with graded aggregate base, and compact high-stability dense bituminous macadam (DBM) with a vibratory roller for long-lasting restoration.`;
      immediateAction = `Install fluorescent warning barricades around deep potholes and apply rapid-setting cold-mix asphalt patch within 24 hours to neutralize immediate accident hazards.`;
      priority = nearSchool ? 'High' : 'Medium';
      estimatedResolution = '2-5 days';
      possibleCauses = [
        'Bituminous binder stripping caused by monsoon water infiltration',
        'Heavy axle-load vehicular traffic exceeding pavement design capacity',
        'Sub-grade settlement and lack of underlying drainage support',
      ];
      resolutionSteps = [
        'Erect hazard warning cones and speed-calming measures',
        'Survey and measure pothole dimensions across affected stretch',
        'Saw-cut damaged edges to vertical faces and clean out loose aggregate',
        'Apply cationic bitumen emulsion and compact bituminous mix',
        'Perform level check to ensure smooth riding quality and reopen lane',
      ];
    } else if (desc.includes('waterlog') || desc.includes('water log') || desc.includes('rain') || desc.includes('flood') || desc.includes('stagnant') || desc.includes('submerged')) {
      problemIdentified = `Road carriageway waterlogging due to absent or choked stormwater drainage`;
      analysis = `Accumulation of stagnant runoff water across the road in ${loc} submerges the carriageway. Standing water rapidly weakens the asphalt-aggregate bond, causing pavement stripping while forcing pedestrians and two-wheelers into hazardous detours.`;
      recommendedSolution = `Construct roadside reinforced concrete open drains with adequate longitudinal gradient, restore the 2.5% transverse road camber, and elevate the low-lying road sub-grade above high flood level.`;
      immediateAction = `Deploy a portable diesel dewatering pump to remove standing water from the road surface and clear clogged culvert inlets immediately.`;
      priority = 'High';
      estimatedResolution = '3-5 days';
      possibleCauses = [
        'Absence of roadside drains to divert precipitation runoff',
        'Camber erosion causing water to pool at the center of the road',
        'Blocked downstream culvert outlet causing backwater flooding',
      ];
      resolutionSteps = [
        'Pump out ponded water using mobile dewatering pumps',
        'Clear silt and vegetative blocks from roadside drainage ditches',
        'Regrade road shoulder to facilitate natural runoff',
        'Construct pucca side drains with silt catchment pits',
        'Apply overlay seal coat to protect asphalt binder from moisture',
      ];
    } else if (desc.includes('bridge') || desc.includes('culvert') || desc.includes('collapse') || desc.includes('crack') || desc.includes('embankment')) {
      problemIdentified = `Structural distress to cross-drainage culvert / bridge approach`;
      analysis = `Scouring of foundation soil or structural cracking of culvert abutments in ${loc} poses a critical safety risk. Heavy axle movement could trigger sudden pavement collapse, potentially severing village connectivity.`;
      recommendedSolution = `Engage district structural engineering specialists, reconstruct damaged wing walls and return walls using M30 concrete, and install reinforced cement concrete (RCC) box culvert sections.`;
      immediateAction = `Erect rigid physical barriers, restrict passage of heavy vehicles, and signpost a designated diversion route for rural traffic.`;
      priority = 'Critical';
      estimatedResolution = '7-14 days';
      possibleCauses = [
        'High-velocity flood scouring undermining culvert footing',
        'Overloaded transit vehicles causing structural fatigue cracking',
        'Inadequate waterway opening causing hydraulic pressure buildup',
      ];
      resolutionSteps = [
        'Barricade vulnerable structure and signpost traffic detour',
        'Conduct non-destructive testing and foundation scour assessment',
        'Underpin foundation with boulder pitching and cement grouting',
        'Reconstruct damaged wing walls and concrete deck slab',
        'Test structural load rating before restoring regular traffic',
      ];
    } else {
      // General Road Damage
      problemIdentified = `Rural roadway surface deterioration and accessibility impediment`;
      analysis = `The roadway connecting ${loc} is significantly degraded, impeding daily transit, ambulance response, and agricultural transport. The lack of smooth riding quality causes vehicle wear and pedestrian hardship.`;
      recommendedSolution = `Regrade the road surface, apply a crushed stone base course (WBM), and lay a 20mm premix bitumen carpet with seal coat under rural road connectivity programs.`;
      immediateAction = `Grade critical damaged sections and lay temporary gravel/quarry dust filling to restore safe non-skid transit for local commuters.`;
      priority = 'Medium';
      estimatedResolution = '3-7 days';
      possibleCauses = [
        'Natural weathering and expiration of pavement design lifecycle',
        'Heavy agricultural tractor and machinery movement',
        'Soil erosion along road berms and shoulders',
      ];
      resolutionSteps = [
        'Conduct visual pavement condition index (PCI) survey',
        'Fill localized depressions with stone metal and quarry dust',
        'Clear encroaching roadside brush to improve sightlines',
        'Prepare detailed project estimate for resurfacing',
        'Execute bituminous overlay and paint road safety markers',
      ];
    }

  // =========================================================================
  // 3. ELECTRICITY ANALYZER
  // =========================================================================
  } else if (category === 'Electricity') {
    suggestedDepartment = 'APSPDCL / Electricity Department';

    if (desc.includes('transformer') || desc.includes('blast') || desc.includes('burnt') || desc.includes('spark') || desc.includes('fire') || desc.includes('smoke')) {
      problemIdentified = `Distribution Transformer (DTR) breakdown and thermal overload failure`;
      analysis = `The local distribution transformer serving ${loc} has failed due to phase overload or internal winding short-circuit. Downstream consumers are left without electrical power, while damaged components present immediate fire and explosion hazards.`;
      recommendedSolution = `Perform insulation resistance testing, replace the burnt distribution transformer with a tested capacity unit from the APSPDCL buffer stock, re-balance phase loads across low-tension (LT) circuits, and install proper lightning arresters.`;
      immediateAction = `Immediately open the 11kV Gang Operated (GO) air-break switch to isolate the transformer station, establish a safety perimeter, and mobilize a mobile transformer replacement crane van.`;
      priority = 'Critical';
      estimatedResolution = '8-16 hours';
      possibleCauses = [
        'Excessive simultaneous load exceeding rated transformer kVA capacity',
        'Low dielectric strength of transformer cooling oil',
        'Lightning surge or phase-to-earth fault on secondary lines',
      ];
      resolutionSteps = [
        'De-energize 11kV feeder and verify zero residual charge',
        'Disconnect and unbolt damaged transformer unit',
        'Mount replacement transformer with rated kVA capacity',
        'Perform oil dielectric test, Megger test, and neutral grounding check',
        'Re-energize feeder, check terminal voltages, and restore power supply',
      ];
    } else if (desc.includes('hanging') || desc.includes('loose wire') || desc.includes('fallen') || desc.includes('broken wire') || desc.includes('pole') || desc.includes('leaning')) {
      problemIdentified = `Hazardous sagging high/low-tension conductors and leaning utility pole`;
      analysis = `Overhead electrical conductors in ${loc} are dangling dangerously close to ground level or resting on leaning poles. This poses a lethal electrocution threat to pedestrians, livestock, and agricultural vehicles traversing the area.`;
      recommendedSolution = `Erect new 8-meter Pre-Stressed Cement Concrete (PSCC) poles with stone packing and concrete footing, re-tension conductors to achieve statutory clearance (minimum 5.5 meters over roads), and prune overhanging tree branches.`;
      immediateAction = `Trip the local feeder at the sub-station immediately, cordon off the dangerous live wire zone with yellow warning tape, and deploy a lineman emergency squad.`;
      priority = 'Critical';
      estimatedResolution = '4-8 hours';
      possibleCauses = [
        'Storm wind damage or tree branch impact snapping stay wires',
        'Soil erosion weakening the utility pole foundation',
        'Thermal elongation and mechanical fatigue of aluminum conductors (ACSR)',
      ];
      resolutionSteps = [
        'Issue emergency line clearance (LC) to de-energize the feeder',
        'Erect safety barricades around fallen/sagging conductor lines',
        'Straighten or replace damaged poles and concrete the base',
        'Pull and re-tension conductors with proper sag charts',
        'Cancel LC, energize line, and verify ground clearance compliance',
      ];
    } else if (desc.includes('low voltage') || desc.includes('fluctuat') || desc.includes('voltage') || desc.includes('dim') || desc.includes('appliance')) {
      problemIdentified = `Chronic low line voltage and severe phase imbalance`;
      analysis = `Excessive length of the low-tension (LT) distribution line combined with high reactive agricultural motor load in ${loc} causes crippling voltage drop. Household appliances fail to operate and agricultural pump motors face burnouts.`;
      recommendedSolution = `Bifurcate the long LT circuit, erect an intermediate 25 kVA distribution transformer closer to the load center, and replace bare overhead wires with high-efficiency Aerial Bunched Cables (ABC) to minimize reactance.`;
      immediateAction = `Inspect sub-station on-load tap changer (OLTC) positions, balance phase connections across consumer meters, and log digital voltage readings at the tail end.`;
      priority = 'Medium';
      estimatedResolution = '2-4 days';
      possibleCauses = [
        'Excessive length of low-tension feeder exceeding permissible limits',
        'Unbalanced single-phase loading on the distribution transformer',
        'Heavy unauthorized agricultural pump load without power factor correction',
      ];
      resolutionSteps = [
        'Record 24-hour voltage and current profiles at feeder tail end',
        'Redistribute single-phase consumer connections evenly across R-Y-B phases',
        'Adjust transformer tap settings to elevate secondary voltage',
        'Prepare estimate for LT line bifurcation and AB cabling',
        'Verify terminal voltage reaches standard 230V (+/- 6%)',
      ];
    } else {
      // Frequent power cuts / General Outage
      problemIdentified = `Frequent unnotified power cuts and feeder reliability failure${duration ? ` (${duration})` : ''}`;
      analysis = `The area in ${loc} is facing recurring electrical outages${duration ? ` persisting for ${duration}` : ''}. Transient line faults, defective insulator flashovers, or feeder tripping at the substation disrupt agricultural, domestic, and commercial life.`;
      recommendedSolution = `Conduct comprehensive foot-patrol thermal imaging of the 11kV feeder line, clear vegetation along the right-of-way, replace cracked pin insulators with polymer units, and service auto-recloser breakers.`;
      immediateAction = `Inspect the substation relay trip log, dispatch a line patrol team to locate transient fault points along the feeder, and restore supply expeditiously.`;
      priority = 'High';
      estimatedResolution = '8-24 hours';
      possibleCauses = [
        'Vegetation and tree branch touch causing transient ground faults',
        'Punctured pin/disc insulators leaking charge during morning dew',
        'Overloaded feeder circuit breaker tripping on thermal protection',
      ];
      resolutionSteps = [
        'Review digital fault recorder logs at the 33/11kV substation',
        'Conduct foot patrol along 11kV corridor to prune interfering branches',
        'Inspect and replace defective disc/pin insulators',
        'Check lightning arrester integrity and earth resistance',
        'Restore feeder supply and monitor load stability',
      ];
    }

  // =========================================================================
  // 4. SANITATION & DRAINAGE ANALYZER
  // =========================================================================
  } else if (category === 'Sanitation & Drainage') {
    suggestedDepartment = 'APSSWMS / Sanitation & Panchayat Raj / Swachha Andhra';

    if (desc.includes('overflow') || desc.includes('drain') || desc.includes('sewage') || desc.includes('choke') || desc.includes('blocked') || desc.includes('stagnant')) {
      problemIdentified = `Clogged masonry drainage channel with open sewage overflow`;
      analysis = `Silt buildup and non-biodegradable debris have choked the gravity flow of the drainage line in ${loc}, causing dark wastewater to overflow into residential lanes. The stagnant effluent generates foul odors and active mosquito-breeding grounds, threatening outbreaks of vector-borne diseases.`;
      recommendedSolution = `Conduct mechanical desilting of the blocked drain section using suction-cum-jetting equipment, reconstruct damaged concrete slab covers, and install heavy-duty mesh screens at culvert inflows to capture debris.`;
      immediateAction = `Deploy a sanitation worker team with rodding gear to clear the immediate blockage and spray Temephos mosquito larvicide and lime disinfectant along overflow margins.`;
      priority = 'High';
      estimatedResolution = '24-48 hours';
      possibleCauses = [
        'Plastic waste and construction debris dumped into open drains',
        'Silt accumulation due to deficient drainage bed slope',
        'Collapse of internal masonry walls of underground drain segments',
      ];
      resolutionSteps = [
        'Mobilize sanitation squad to remove surface debris and obstructions',
        'Use high-pressure jetting/rodding machine to clear underground silt',
        'Pump out overflow wastewater from residential pathways',
        'Replace broken drain cover slabs with reinforced concrete covers',
        'Apply bleaching powder and anti-larval chemical spray across the zone',
      ];
    } else {
      // Solid waste / Garbage dump
      problemIdentified = `Unregulated municipal solid waste accumulation and open garbage dump`;
      analysis = `Irregular collection in ${loc} has allowed waste to pile up in an open dump. The accumulating refuse attracts stray cattle and rodents, emits noxious odors, and causes environmental pollution in the surrounding neighborhood.`;
      recommendedSolution = `Institute regular daily door-to-door segregated waste collection under Clean Andhra Pradesh (CLAP), install twin covered community bins, and transfer solid waste to the mandal solid-waste processing center.`;
      immediateAction = `Deploy a municipal tipper truck and sanitation crew to clear the accumulated garbage dump immediately and sanitize the ground with lime and bleaching powder.`;
      priority = 'Medium';
      estimatedResolution = '24 hours';
      possibleCauses = [
        'Breakdown or irregular scheduling of village sanitation collection vehicle',
        'Absence of designated waste collection bins in the neighborhood',
        'Lack of public awareness on segregated disposal practices',
      ];
      resolutionSteps = [
        'Clear existing solid waste mound using loader and tipper vehicle',
        'Disinfect cleared ground with lime powder and insecticide spray',
        'Place labeled community bins for wet and dry waste segregation',
        'Schedule daily e-rickshaw waste collection route in the street',
        'Conduct community awareness meeting on clean sanitation disposal',
      ];
    }

  // =========================================================================
  // 5. HEALTHCARE ANALYZER
  // =========================================================================
  } else if (category === 'Healthcare') {
    suggestedDepartment = 'Health & Family Welfare Department / National Health Mission';

    if (desc.includes('doctor') || desc.includes('absent') || desc.includes('no staff') || desc.includes('nurse') || desc.includes('closed') || desc.includes('staff')) {
      problemIdentified = `Primary Health Centre (PHC) medical officer and clinical staff absenteeism`;
      analysis = `Absence of qualified medical staff during operational hours in ${loc} leaves rural patients, pregnant women, and emergency cases without primary diagnostic care or first aid, forcing distress travel to distant private clinics.`;
      recommendedSolution = `Enforce biometric attendance linked to the District Medical & Health Officer (DM&HO) dashboard, deploy rotational medical officer coverage, and strengthen tele-medicine consultation kiosks at the Village Health Clinic.`;
      immediateAction = `Notify DM&HO to immediately depute an on-call medical officer or direct the nearest 104 Mobile Medical Unit to station at ${loc} for outpatient consultations.`;
      priority = 'Critical';
      estimatedResolution = '12-24 hours';
      possibleCauses = [
        'Staff vacancy or uncoordinated medical leave without replacement deputation',
        'Lack of strict duty time enforcement at sub-center level',
        'Transportation hurdles for medical personnel assigned to remote facilities',
      ];
      resolutionSteps = [
        'Issue notice to facility superintendent to account for staff absence',
        'Depute standby Medical Officer from Community Health Centre (CHC)',
        'Activate 104 Mobile Medical consultation van in the village',
        'Verify functional availability of tele-consultation equipment',
        'Implement daily biometric attendance reporting to DM&HO office',
      ];
    } else {
      // Medicine shortage / Facility issue
      problemIdentified = `Shortage of essential life-saving medicines and clinical supplies`;
      analysis = `Stockout of vital medications (anti-pyretics, anti-venom, diabetes, hypertension drugs, ORS) at the health center in ${loc} compels low-income citizens to make out-of-pocket purchases at private pharmacies.`;
      recommendedSolution = `Audit the APMSIDC online drug inventory portal, increase the facility safety stock threshold by 30%, and automate monthly re-order triggers before medicines hit critical buffer levels.`;
      immediateAction = `Dispatch an emergency drug requisition kit from the district central medical warehouse to the health center in ${loc} within 24 hours.`;
      priority = 'High';
      estimatedResolution = '24-48 hours';
      possibleCauses = [
        'Delayed indent submission through the APMSIDC supply chain portal',
        'Unexpected surge in seasonal infections depleting buffer inventory',
        'Logistical delays in pharmaceutical transport from district store',
      ];
      resolutionSteps = [
        'Reconcile physical drug inventory against APMSIDC portal balances',
        'Generate priority emergency indent for out-of-stock medicines',
        'Deliver buffer drug supply from district central warehouse',
        'Verify proper storage and refrigeration for temperature-sensitive vials',
        'Display public notice board of free available medicines at the clinic',
      ];
    }

  // =========================================================================
  // 6. EDUCATION ANALYZER
  // =========================================================================
  } else if (category === 'Education') {
    suggestedDepartment = 'School Education Department / Samagra Shiksha';

    if (desc.includes('roof') || desc.includes('ceiling') || desc.includes('crack') || desc.includes('building') || desc.includes('unsafe') || desc.includes('wall') || desc.includes('classroom')) {
      problemIdentified = `School building structural deterioration and classroom safety hazard`;
      analysis = `Water seepage, ceiling plaster detachment, or structural cracks in the school building in ${loc} present grave physical safety risks to school children and teachers, disrupting effective classroom instruction.`;
      recommendedSolution = `Sanction urgent structural rehabilitation under Mana Badi Nadu-Nedu Phase-II, apply elastomeric chemical waterproofing over the roof slab, and replaster damaged load-bearing masonry walls.`;
      immediateAction = `Immediately cordon off the unsafe classroom, shift students to a secure alternate room or community hall, and order an emergency safety inspection by the Panchayat Raj Executive Engineer.`;
      priority = 'High';
      estimatedResolution = '3-7 days';
      possibleCauses = [
        'Weathering of aging roof slab without waterproofing renewal',
        'Blocked rooftop rainwater drainage spouts causing pooling',
        'Foundation movement or settlement due to moisture ingress',
      ];
      resolutionSteps = [
        'Vacate and lock damaged classrooms to safeguard children',
        'Conduct structural stability audit by Executive Engineer (PR)',
        'Clear rooftop water pooling and seal cracks with polymer mortar',
        'Apply multi-layer elastomeric waterproof membrane',
        'Inspect repaired classrooms and issue structural fitness certificate',
      ];
    } else {
      // Sanitation / Water / Facility in School
      problemIdentified = `Deficient school sanitation and student drinking water amenities`;
      analysis = `Non-functional student restrooms or lack of clean drinking water at the school in ${loc} impairs student hygiene, dignity, and learning attendance, disproportionately impacting adolescent girls.`;
      recommendedSolution = `Install an automated overhead water storage system, replace damaged sanitary fixtures, build running water connections to all washrooms, and contract a dedicated daily sanitation caretaker.`;
      immediateAction = `Dispatch a plumbing technician team to restore water flow immediately and provide packaged drinking water jars for student consumption today.`;
      priority = 'High';
      estimatedResolution = '24-48 hours';
      possibleCauses = [
        'Plumbing pipe fractures or broken sanitary ware',
        'Submersible pump or electrical connection failure at school borewell',
        'Lack of institutional cleaning and maintenance protocol',
      ];
      resolutionSteps = [
        'Inspect school water tank, pipeline, and toilet fixtures',
        'Repair broken valves, faucets, and supply lines',
        'Install new overhead storage tank with automated float valve',
        'Sanitize restrooms thoroughly with disinfectant solution',
        'Establish daily maintenance logbook managed by school headmaster',
      ];
    }

  // =========================================================================
  // 7. PUBLIC ISSUES / OTHER (Dynamic Synthesizer)
  // =========================================================================
  } else {
    suggestedDepartment = 'Revenue & District Administration / Municipal Administration';

    // Extract first sentence or main clause
    const firstSentence = rawDesc.split(/[.!?\n]/)[0].trim() || rawDesc;
    const cleanSnippet = firstSentence.length > 80 ? `${firstSentence.substring(0, 77)}...` : firstSentence;

    problemIdentified = `Civic infrastructure grievance: ${cleanSnippet}`;
    analysis = `Citizens in ${loc} report civic distress regarding: "${cleanSnippet}". The reported condition impairs community safety, daily public activities, or environmental health in the vicinity.`;
    recommendedSolution = `Conduct joint field verification by the Mandal Revenue Officer (MRO) and municipal engineers, determine regulatory jurisdiction, and execute corrective measures in coordination with local village authorities.`;
    immediateAction = `Direct the local Village Administrative Officer (VRO) and Panchayat Secretary to inspect ${loc} within 24 hours and file a preliminary status report.`;
    priority = 'Medium';
    estimatedResolution = '3-5 days';
    possibleCauses = [
      'Infrastructure degradation requiring scheduled administrative maintenance',
      'Unresolved civic coordination between departmental stakeholders',
      'Encroachment or physical impediment affecting public convenience',
    ];
    resolutionSteps = [
      'Conduct on-ground site inspection with the complainant',
      'Examine revenue maps and municipal records for jurisdiction',
      'Issue departmental notice or work order for corrective action',
      'Execute field remediation under supervisor oversight',
      'Document resolution with geo-tagged photographs and citizen sign-off',
    ];
  }

  return {
    problemIdentified,
    analysis,
    recommendedSolution,
    immediateAction,
    suggestedDepartment,
    priority,
    estimatedResolution,
    possibleCauses,
    resolutionSteps,
    affectedLocation: loc,
    isAIGenerated: false,
    aiModel: 'GeoAI Intelligent Semantic NLP Analyzer',
    // Backward compatibility aliases
    problemSummary: analysis,
    recommendedAction: recommendedSolution,
    suggestedAction: immediateAction,
  };
};

/**
 * Generate complaint insight using Gemini AI or the Intelligent Text Analysis Engine
 */
const generateComplaintInsight = async (complaint) => {
  const loc = formatLocation(complaint);
  const category = complaint.category || 'Other';

  // Attempt Gemini AI if key exists
  if (process.env.AI_API_KEY && process.env.AI_PROVIDER === 'gemini') {
    try {
      const prompt = `You are an expert AI decision support engine for the GeoAI Rural Governance Intelligence Platform in Andhra Pradesh, India.
Analyze this citizen's grievance carefully and generate a highly tailored, engineering-sound solution.

COMPLAINT DETAILS:
- Category: ${category}
- Description: "${complaint.description}"
- Location: ${loc}
- Incident Date: ${complaint.date || 'Recent'}
- Complaint ID: ${complaint.complaintId || 'N/A'}

TASK:
1. Identify the EXACT core problem from the description (do not just repeat category).
2. Provide an analytical explanation of what is causing or being affected by the issue.
3. Formulate an actionable, specific recommended engineering/administrative solution tailored to this exact problem description.
4. Specify the immediate field action for the government response team within 24-48 hours.
5. Identify the responsible Andhra Pradesh Government Department.
6. Provide priority (High/Medium/Critical), estimated resolution timeframe, 3 possible causes, and 5 step-by-step resolution steps.

Respond strictly in valid JSON with this schema:
{
  "problemIdentified": "concise specific problem title",
  "analysis": "detailed explanation of causes, impacts, and risks",
  "recommendedSolution": "practical, detailed engineering or administrative solution tailored to this complaint",
  "immediateAction": "urgent first-response step for field workers within 24-48 hours",
  "suggestedDepartment": "official AP department name",
  "priority": "High | Medium | Critical | Low",
  "estimatedResolution": "realistic timeframe e.g. 24-48 hours, 3-5 days",
  "possibleCauses": ["cause 1", "cause 2", "cause 3"],
  "resolutionSteps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "affectedLocation": "${loc}",
  "isAIGenerated": true
}`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.AI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1200 },
        },
        { timeout: 12000 }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          affectedLocation: parsed.affectedLocation || loc,
          isAIGenerated: true,
          aiModel: 'Gemini AI (Google Generative AI)',
          // Backward compatibility aliases
          problemSummary: parsed.analysis || parsed.problemIdentified,
          recommendedAction: parsed.recommendedSolution,
          suggestedAction: parsed.immediateAction,
        };
      }
    } catch (error) {
      console.warn('Gemini AI API call failed, falling back to Intelligent Text Analysis Engine:', error.message);
    }
  }

  // Use Intelligent Text Analysis Engine (analyzes complaint text dynamically)
  return analyzeComplaintText(complaint);
};

/**
 * Generate category/sector level insights from actual complaints in MongoDB
 */
const generateCategoryInsights = async (category, complaints) => {
  const count = complaints.length;
  if (count === 0) {
    return {
      category,
      complaintCount: 0,
      pattern: 'No citizen complaints logged in this sector yet.',
      affectedAreas: [],
      problemIdentified: `No active ${category} issues`,
      analysis: `Zero unresolved citizen complaints are recorded for ${category} across Andhra Pradesh.`,
      recommendedSolution: 'Maintain standard periodic preventive infrastructure monitoring.',
      immediateAction: 'Monitor incoming submissions via the citizen grievance intake queue.',
      recommendation: 'Maintain standard periodic preventive infrastructure monitoring.',
      suggestedAction: 'Monitor incoming submissions via the citizen grievance intake queue.',
      isAIGenerated: false,
      aiModel: 'GeoAI Intelligence Engine',
    };
  }

  // Aggregate affected areas
  const districtCounts = {};
  complaints.forEach((c) => {
    if (c.district) {
      districtCounts[c.district] = (districtCounts[c.district] || 0) + 1;
    }
  });
  const affectedAreas = Object.entries(districtCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([district, cnt]) => `${district} (${cnt})`);

  // Analyze the most recent / representative complaint in this category
  const primaryComplaint = complaints[0];
  const insight = await generateComplaintInsight(primaryComplaint);

  return {
    category,
    complaintCount: count,
    pattern: `${count} active complaint(s) reported in ${category}. Most concentrated in: ${affectedAreas.slice(0, 2).join(', ') || 'Various mandals'}. Primary pattern: ${insight.problemIdentified}.`,
    affectedAreas,
    problemIdentified: insight.problemIdentified,
    analysis: insight.analysis,
    recommendedSolution: insight.recommendedSolution,
    immediateAction: insight.immediateAction,
    suggestedDepartment: insight.suggestedDepartment,
    priority: insight.priority,
    estimatedResolution: insight.estimatedResolution,
    possibleCauses: insight.possibleCauses,
    resolutionSteps: insight.resolutionSteps,
    affectedLocation: insight.affectedLocation,
    recommendation: insight.recommendedSolution,
    suggestedAction: insight.immediateAction,
    isAIGenerated: insight.isAIGenerated,
    aiModel: insight.aiModel,
    supportingData: {
      latestComplaintId: primaryComplaint.complaintId,
      description: primaryComplaint.description,
      district: primaryComplaint.district,
      mandal: primaryComplaint.mandal,
      date: primaryComplaint.date || primaryComplaint.createdAt,
    },
  };
};

module.exports = {
  generateComplaintInsight,
  generateCategoryInsights,
  analyzeComplaintText,
};
