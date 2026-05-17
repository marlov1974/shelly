# Gen2 Needs-Based House Control Architecture

## Purpose

This document defines the Gen2 target architecture for whole-house needs-based control.

Gen2 is separate from the currently running Gen1 FTX runtime. Gen1 remains the active FTX runtime until the planned Gen2 transition at the end of May.

## Scope

Gen2 coordinates multiple house subsystems:

```text
- FTX ventilation
- VP1 / VP2 heat pumps
- floor heating loops
- floor cooling automation
- domestic hot-water buffer / VVB
- VVC
- brine loop and cooling/heating shunts
- spot-price / cost optimization
```

Gen2 should not be treated as current runtime behavior until implemented and activated explicitly.

## Operational durability requirement

Gen2 must be designed to run for several years without manual intervention.

This is a primary architectural requirement, not a convenience feature.

Design implications:

```text
- deterministic control loops
- bounded runtime work per cycle
- simple ownership of KVS keys and actuator authority
- clear local responsibility for physical telemetry
- central aggregation without JSON merge races
- avoid hidden runtime magic and broad defensive normalizers
- prefer observable wrong behavior over silently masking bugs
- avoid unnecessary heap pressure and deep object trees
- avoid frequent external polling when local push/reporting can be used
- avoid short-cycling slow equipment
- explicit separation of planning, slow actuation and fast control
```

Long-term unattended operation means Gen2 should tolerate normal device restarts, temporary missing telemetry and network interruptions through clear ownership and stale-state handling.

Important distinction:

```text
Bug masking:
  broad generic correction that hides incorrect internal logic.
  Avoid this.

Fallback:
  explicit degraded mode for missing external signal, failed service,
  stale telemetry or unavailable device.
  Use this extensively in final Gen2.
```

In final Gen2, as much as practical should have defined fallback behavior. Fallback should be domain-specific, simple, visible in state, and conservative.

Examples:

```text
FTX Uni missing or stale:
  FTX becomes simpler and more cautious.
  It avoids aggressive heat/cool/dehumidification decisions that depend on the missing sensor.

Open-Meteo unavailable:
  VP, floor cooling and FTX use conservative weather assumptions or last valid forecast
  within a defined validity window.

Spot prices unavailable:
  the planner uses a statistical/default price model instead of live spot optimization.

Heat-pump or water temperature telemetry missing:
  Anti Cold and slow heating coordination avoid aggressive assumptions about available heat.

Cooling/brine telemetry missing:
  floor cooling and Anti Hot/Anti Damp avoid aggressive cooling decisions that could
  create comfort or condensation risk.
```

Critical hardware failures may force affected systems off. Ordinary inability to satisfy a comfort need should be handled inside the relevant need/policy, not by global emergency logic.

Fallbacks should not become complex hidden secondary controllers. They should reduce ambition, reduce dependency on missing signals, and keep the house in a conservative operating mode until full telemetry returns.

## Autonomous hardware default mode

Every device that directly controls hardware should have an autonomous default mode after reboot.

If the device restarts and no active supervisor/controller command arrives, it should move to a stable, conservative default that can run for years without damaging equipment or creating a bad house state.

This default is not a hidden correction of bad control logic. It is the device's local unattended-power-up behavior.

Default hardware state:

```text
FTX supply fan:
  25 %

FTX extract fan:
  31 %

FTX VVX:
  ON

FTX dampers:
  ON

FTX heat:
  OFF

FTX cool:
  OFF

VP1:
  00

VP2:
  00

Floor cooling / general floor three-way valve, Shelly Pro 2:
  heat mode
  sw0 = 1
  sw1 = 0

Floor cooling dimmer / shunt-brine control:
  OFF / 0 %

VVC:
  ON

VVB:
  ON
```

Interpretation:

```text
- Ventilation continues at a low safe baseline.
- Heat recovery is enabled.
- Dampers are energized/open for normal air path.
- Active FTX heating/cooling is disabled.
- Heat pumps use their safe low/default physical command.
- General floors return to heating-side connection, not cooling.
- Floor-cooling analog output is off.
- Domestic hot-water and circulation remain available.
```

Gen2 active control may override this default when valid commands are present. If active control disappears, local hardware controllers should eventually fall back to this default rather than remaining indefinitely in an aggressive or ambiguous state.

## Shared FTX hardware truth

The physical FTX aggregate is shared between Gen1 and Gen2.

Gen2 changes the control architecture, not the physical FTX hardware.

Physical facts about the ventilation unit belong under:

```text
memory/ftx-fysiskt/
```

That documentation is canonical for both generations when discussing:

```text
- supply and extract fans
- airflow and pressure calibration
- VVX rotor and efficiency
- heat battery behavior
- cooling battery and condensate handling
- sensor placement
- measured baseline behavior
```

Gen2 may add new sensors or actuators, but until such changes are physically installed and documented, Gen2 must use the same FTX hardware model as Gen1.

## Existing Gen2 POC runtime

There is already a Gen2 proof-of-concept runtime track in the repository:

```text
rt/devices/80f3dac8bfec.json
```

This device currently runs dampers / heat-pump / spot-price / optimizer experiments:

```text
boot      -> rt/recipes/dampers/boot.json
master    -> rt/recipes/dampers/master.json
spot      -> rt/recipes/dampers/spotprice.json
weather   -> rt/recipes/dampers/w.json
op/prep   -> rt/recipes/dampers/prep.json
optimize  -> rt/recipes/dampers/optimize.json
```

Relevant POC runtime folders include:

```text
rt/scripts/dampers/
rt/spotprice-dampers/
rt/weather-dampers/
rt/prep-dampers/
rt/optimize-dampers/
```

This code may inform Gen2 implementation, but it is still POC/lab code. It must not be treated as the final Gen2 architecture, and it is not part of the Gen1 FTX runtime device.

## Runtime cadence and control planes

Gen2 should be split across three runtime/control planes. The split is based on how often a subsystem should be controlled and what kind of decision it makes.

```text
1. Fast control plane
   Controls things that may need frequent adjustment.

   Examples:
     FTX
     floor cooling
     shunts/pumps where quick comfort or condensation safety matters

   Typical cadence:
     seconds to minutes

   Responsibility:
     fast comfort, air quality, dewpoint, supply air, pressure direction,
     and condensation guard behavior.
```

```text
2. Slow actuator plane
   Controls things that should change rarely.

   Examples:
     VP1 / VP2
     VVB
     VVC

   Typical cadence:
     15 minutes, 30 minutes, or current scheduler block decision

   Responsibility:
     apply already-decided operating level/mode without short-cycling
     or constantly re-planning slow equipment.
```

```text
3. Clock / planner plane
   Runs on time, schedule, or when external planning inputs update.

   Examples:
     weather fetch
     spot-price fetch
     heat-pump optimizer
     daily planning
     2h block planning

   Responsibility:
     produce plans, forecasts, price classifications and block decisions.
```

Layering rules:

```text
- The planner plane makes daily/block decisions.
- The slow actuator plane applies slow decisions.
- The fast control plane handles rapid comfort and safety behavior.
- The fast plane must not choose cheapest VP blocks.
- The slow actuator plane must not recompute the whole daily plan.
- The planner plane must not directly drive fast FTX/floor-cooling actuator loops.
```

This matches the heat-pump scheduling model: the optimizer selects 2h blocks and logical levels, while quarter-hour/runtime execution only applies the current block decision.

## Core design principle

Gen2 is needs-based.

Each need produces its own signals. Signals remain separated per need until the final resolver decides the operating point.

```text
Need layer:
  Purge
  Anti Stale
  Moisture Safety
  Anti Damp
  Dryness Policy
  Anti Hot
  Anti Cold
  Spotprisoptimering / Cost Optimizer

Resolver layer:
  reads all need signals
  applies priority and constraints
  emits final subsystem intents
```

Needs must not mutate each other's outputs.

## Signal classes

Needs and policies may produce three kinds of signal:

```text
HARD:
  A boundary or requirement that constrains the valid operating region.
  HARD must not be violated by ordinary WISH or BIAS signals.

WISH:
  A preferred operating point inside the valid region.

BIAS:
  A modifier that changes the intensity of slow/non-critical WISH signals.
  BIAS does not directly demand an actuator state and does not override HARD.
```

Examples:

```text
HARD:
  Purge sets high minimum supply.
  Moisture Safety sets pressure direction.
  Anti Cold caps FTX supply if heating water is too cold.

WISH:
  Anti Stale wants more supply as air becomes stale.
  Anti Hot wants cooler brine or more cooling assistance.
  Anti Cold wants warmer water or VVX on.

BIAS:
  Cost Optimizer dampens slow ventilation during expensive periods.
  Dryness Policy dampens ventilation wishes when outdoor air is very dry.
  Dryness Policy blocks or penalizes condensing cooling wishes when the house is already dry.
```

Resolver order:

```text
1. Collect raw HARD, WISH and BIAS signals per need/policy.
2. Apply HARD signals to form valid operating intervals and required modes.
3. Apply BIAS only to eligible slow/non-critical WISH signals.
4. Select final WISH targets according to priority and current mode.
5. Clamp final WISH targets inside HARD constraints.
6. Emit final subsystem intents.
```

Cost Optimizer and Dryness Policy are primarily BIAS/policy producers. They may also produce HARD constraints when there is real safety or building-risk justification, but ordinary cost or comfort optimization should not override HARD safety.

Gen2 should avoid hiding bugs with broad defensive normalizers. Incorrect behavior should remain observable and be corrected at the source.

## Priority model

Top-level priority is not a single static PPM > RH > TEMP rule. Gen2 uses classes of urgency:

```text
1. Critical Safety
2. Purge / acute air-quality event
3. Moisture Safety / building condensation and pressure-direction safety
4. Cost Optimizer modulation of slow needs
5. Anti Stale normal / slow air quality
6. Anti Damp and Dryness Policy / slow moisture behavior
7. Anti Hot and Anti Cold / thermal assistance and comfort
```

Cost Optimizer modifies slow/non-critical WISH intensity. It must not suppress Critical Safety, Purge, or hard Moisture Safety requirements.

## Need: Critical Safety

Critical Safety is not comfort logic.

If required hardware does not provide expected run/feedback signals, Gen2 may force the affected system or FTX into OFF.

Examples:

```text
- fan commanded on but no physical run/flow/pressure feedback
- damper required open but no valid run/open feedback
- critical sensor unavailable for safe operation
```

This is different from a need being unable to achieve its comfort goal. Comfort incapacity should be handled inside the relevant need.

## Need: Purge

Purge is the acute air-quality need.

Purpose:

```text
Rapidly remove acute pollution: smoke, burnt food, VOC spike, heavy contamination.
```

Input:

```text
ppm_eq_house
```

`ppm_eq_house` is the existing 0-10 V air-quality signal scaled to ppm equivalent, where the sensor represents `max(CO2, VOC-equivalent)` and 10 V corresponds to 2000 ppm-equivalent.

Typical trigger:

```text
ppm_eq_house > 1000
```

Purge is high priority and should not be damped by spot-price optimization.

## Need: Anti Stale

Anti Stale is the slow/base air-quality need.

Purpose:

```text
Keep normal air quality acceptable over time.
```

This is not urgent in the same way as Purge. If `ppm_eq_house` is roughly 550-750, air is becoming stale, but the correction can be delayed or damped if energy/thermal/moisture strategy requires it.

Anti Stale can be damped by cost/energy modes.

## Need: Moisture Safety

Moisture Safety handles building-fabric risk and pressure direction.

Principle:

```text
Winter / heating risk:
  avoid pushing warm humid indoor air into cold constructions.
  default to weak negative pressure.

Summer / floor-cooling risk:
  avoid pulling warm humid outdoor air into cold floor/construction zones.
  allow weak positive pressure when needed.
```

Moisture Safety may produce HARD pressure-direction constraints.

## Need: Anti Damp

Anti Damp handles high house moisture / raw indoor climate.

Purpose:

```text
Reduce house dewpoint over hours/days and avoid the house becoming damp in the first place.
```

FTX does not recirculate indoor air through the coils. FTX treats incoming outdoor air, and house drying happens indirectly by replacing house air with drier treated supply air.

Anti Damp may use cooling/dehumidification when brine/cooling is available. Cooling can be effectively free or beneficial for heat-pump operation, so Anti Damp does not avoid cooling for energy reasons. The limiting questions are:

```text
- can the cooling coil actually condense incoming outdoor air?
- can supply air be reheated enough for comfort if needed?
- is the house already too dry?
```

## Need: Dryness Policy

Dryness Policy is a long-term fuktbevarande policy rather than an urgent need.

Purpose:

```text
Avoid making the house drier than desired.
```

Examples:

```text
- ventilate less when outdoor air is much drier than house air
- avoid unnecessary condensing cooling when the house is dry
- prefer floor cooling when outdoor air is dry and house is already dry
- ventilate slightly more when outdoor air can safely add moisture
- avoid immediately removing useful humidity from short indoor moisture events when air quality allows waiting
```

Dryness Policy mostly modifies or constrains other non-urgent wishes.

## Need: Anti Hot

Anti Hot is the cooling comfort need.

FTX is not the primary cooling engine. Floor cooling can provide much larger capacity.

FTX's primary roles during cooling are:

```text
- keep house air dry enough that floor cooling can run harder and safely
- provide treated cool supply air if it does not conflict with moisture policy
- choose VVX and pressure strategy that help the whole house
```

Anti Hot should mostly produce WISH signals. Moisture Safety and Dryness Policy may constrain it.

## Need: Anti Cold

Anti Cold is the heating comfort need.

Heating is primarily handled by heat pumps and floor heating. FTX should coordinate with VP schedules and avoid counterproductive ventilation.

FTX roles:

```text
- avoid cold supply air
- use VVX when heating is needed
- add supply-air heating when hot water / heating water is available
- reduce ventilation ambition when VP is deliberately saving energy
```

If water/heat capacity is too low, Anti Cold may constrain FTX supply rather than trying to heat the house with high airflow.

## Need: Cost Optimizer / Spotprisoptimering

Cost Optimizer is an overlaid policy that modulates slow/non-critical needs.

It coordinates with:

```text
- heat-pump 2h block scheduling
- floor heating and floor cooling
- domestic hot-water preparation
- VVC
- FTX slow ventilation and moisture strategies
```

Cost Optimizer should not suppress:

```text
- Critical Safety
- Purge
- hard Moisture Safety
```

It may damp or boost:

```text
- Anti Stale normal WISH
- Anti Damp slow WISH
- Dryness Policy choices
- Anti Hot assistance
- Anti Cold assistance
```

Cost Optimizer should normally express its effect as BIAS rather than HARD. It changes ambition level and timing; it does not make unsafe states safe.

## Heat pump operating context

Heat-pump logical levels are documented in:

```text
memory/house-control/02-heat-pump-operating-schedules.md
```

Gen2 must coordinate with the heat-pump scheduler instead of having FTX independently chase whole-house temperature.

Heat pumps are planned in 2-hour blocks. Quarter-hour runtime should apply the current block decision, not choose cheapest blocks itself.

## Gen1 boundary

Do not treat this document as current Gen1 FTX runtime behavior.

Gen1 remains documented separately in:

```text
memory/ftx-digitalt/13-gen1-runtime-maintenance.md
```

Gen2 concepts should be implemented only after an explicit migration decision.
