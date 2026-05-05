# FTX Digital – VP Winter Optimizer v1

Status: rough design baseline / working memory  
Scope: winter heat pump optimization for the unified home control system  
Applies: 1 November through 31 March

This document captures the current coarse design for controlling and optimizing the two heat pumps during winter operation. It is intended as the baseline for later Shelly implementation, not as measured truth.

---

## 1. Physical control principle

Each heat pump is controlled by one Shelly Plus Uni.

Each Shelly Plus Uni shorts two external heat-pump inputs. The two inputs form a 2-bit digital control code with four possible modes per heat pump.

### VP1 mode mapping

| Code | Mode |
|---|---|
| `00` | `30/32` |
| `10` | `20/52` |
| `01` | `off` |
| `11` | `36/52` |

### VP2 mode mapping

| Code | Mode |
|---|---|
| `00` | `28/52` |
| `10` | `32/52` |
| `01` | unused |
| `11` | `36/52` |

Notation example: `30/32` means 30°C flow temperature and 32°C domestic hot-water target.

Domestic hot-water chain:

```text
cold water -> VP1 internal DHW tank 170 L -> VP2 internal DHW tank 170 L -> external electric VVB 300 L
```

---

## 2. Optimization scope

The winter optimizer optimizes house heating only. At this stage it only considers flow-temperature system levels.

Winter season:

```text
1 November through 31 March
```

Allowed system levels:

| Level | VP1 / VP2 flow-temp combination |
|---|---|
| L0 | `0/28` |
| L1 | `0/32` |
| L2 | `30/28` |
| L3 | `30/32` |
| L4 | `36/36` |

The optimizer chooses between these five system levels. It must not freely combine arbitrary VP1/VP2 modes.

---

## 3. Sacred domestic-hot-water block

Every night has one fixed block:

```text
00:00–02:00 = L4 = 36/36
```

Reason: VP1 must get one daily block to recover / reset its domestic hot water.

Rules:

- The block is mandatory.
- It must not be optimized away.
- It is already at max level, so it is excluded from upgrade logic.
- It still contributes heat and cost to the period plan.

---

## 4. Time model

Block size:

```text
2 hours
```

Checkpoints:

```text
06:00
14:00
22:00
```

Optimization periods:

| Period | Type | Meaning |
|---|---|---|
| `22:00–06:00` | `night` | recharge period; statistically cheapest |
| `06:00–14:00` | `morning` | main drawdown period; statistically most expensive |
| `14:00–22:00` | `afternoon` | continued drawdown; somewhat less expensive than morning |

Each period computes a plan and executes that plan as-is. No intra-period adaptation is allowed. Any model error or deviation is handled by the next optimization period.

---

## 5. Weekly thermal-battery trajectory

The house is treated as a thermal battery.

Weekly principle:

- The house is warmest / most charged Monday at 06:00.
- Comfort / charge is allowed to decrease during the work week.
- Friday at 22:00 is the coldest / least charged checkpoint.
- The weekend is used to recharge the house.

Known checkpoint targets:

| Day | 06:00 | 14:00 | 22:00 |
|---|---:|---:|---:|
| Monday | 100% | 55% | 20% |
| Tuesday | 95% | 50% | 15% |
| Friday | — | — | 0% |
| Saturday | 75% | 45% | 15% |
| Sunday | 90% | 55% | 25% |
| Next Monday | 100% | — | — |

The missing intermediate weekday targets are intentionally left as configuration, not hardcoded logic, until the final weekly curve is completed.

Each optimization period optimizes toward the desired SOC at the next checkpoint. Comfort bounds may be crossed inside a period; the control target is the next checkpoint.

---

## 6. Comfort mode and SOC model

Comfort mode defines the allowed deviation from desired house temperature and therefore the usable size of the thermal battery.

| Comfort mode | Allowed deviation |
|---|---:|
| High | ±0.5°C |
| Medium | ±1.0°C |
| Low | ±2.0°C |

SOC maps linearly across the chosen comfort band.

```text
t_min = target_house_temp - comfort_band
t_max = target_house_temp + comfort_band

soc_pct = 100 * (t_house - t_min) / (t_max - t_min)
```

Example:

```text
Comfort mode: Low
Target house temp: 20°C

0% SOC   = 18°C
50% SOC  = 20°C
100% SOC = 22°C
```

---

## 7. House heat-demand model

Locked v1 formula, including expected savings from the new efficient ventilation:

```text
heat_need_kwh_day = 119.9 - 11.4 * outdoor_temp_c
heat_need_kwh_2h  = heat_need_kwh_day / 12
```

Implementation should clamp negative values to zero:

```javascript
function heatNeedKwhDay(outdoorTempC) {
  var v = 119.9 - 11.4 * outdoorTempC;
  return v > 0 ? v : 0;
}

function heatNeedKwh2h(outdoorTempC) {
  return heatNeedKwhDay(outdoorTempC) / 12.0;
}
```

Examples:

| Outdoor temp | Heat need/day | Heat need/2h |
|---:|---:|---:|
| +10°C | 5.9 kWh | 0.5 kWh |
| +5°C | 62.9 kWh | 5.2 kWh |
| 0°C | 119.9 kWh | 10.0 kWh |
| -5°C | 176.9 kWh | 14.7 kWh |
| -10°C | 233.9 kWh | 19.5 kWh |

---

## 8. Winter system-level library v1

All values apply to the whole system: VP1 + VP2. Values are per 2h block and vary by period type.

### 8.1 Night / Recover / 22–06

| Level | Mode | El in kW | COP | Heat out kW | Heat on 2h kWh |
|---|---|---:|---:|---:|---:|
| L0 | `0/28` | 0.8 | 5.5 | 4.4 | 8.8 |
| L1 | `0/32` | 1.1 | 5.2 | 5.7 | 11.4 |
| L2 | `30/28` | 1.8 | 5.2 | 9.4 | 18.8 |
| L3 | `30/32` | 2.4 | 5.0 | 12.0 | 24.0 |
| L4 | `36/36` | 7.5 | 3.6 | 27.0 | 54.0 |

### 8.2 Morning / Sustain / 06–14

| Level | Mode | El in kW | COP | Heat out kW | Heat on 2h kWh |
|---|---|---:|---:|---:|---:|
| L0 | `0/28` | 0.5 | 5.8 | 2.9 | 5.8 |
| L1 | `0/32` | 0.7 | 5.5 | 3.9 | 7.8 |
| L2 | `30/28` | 1.2 | 5.3 | 6.4 | 12.8 |
| L3 | `30/32` | 1.7 | 5.0 | 8.5 | 17.0 |
| L4 | `36/36` | 5.2 | 3.8 | 20.0 | 40.0 |

### 8.3 Afternoon / Normal / 14–22

| Level | Mode | El in kW | COP | Heat out kW | Heat on 2h kWh |
|---|---|---:|---:|---:|---:|
| L0 | `0/28` | 0.65 | 5.6 | 3.6 | 7.2 |
| L1 | `0/32` | 0.9 | 5.3 | 4.8 | 9.6 |
| L2 | `30/28` | 1.5 | 5.2 | 7.8 | 15.6 |
| L3 | `30/32` | 2.0 | 5.0 | 10.0 | 20.0 |
| L4 | `36/36` | 6.5 | 3.7 | 24.0 | 48.0 |

---

## 9. Shelly implementation model: three steps

The optimizer is split into three scripts / steps to fit the Shelly runtime constraints.

### Step 1 – Fetch spot prices

Responsibilities:

- Fetch spot prices for relevant future 2h blocks.
- Store raw price data in KVS.
- Optionally store price rank / percentile / cheapest-to-most-expensive block order.

KVS output:

- price per block
- block order sorted by price

### Step 2 – Prepare optimization

Responsibilities:

- Read weather data from KVS.
- Read current status from KVS.
- Determine current period type: `night`, `morning`, or `afternoon`.
- Read current house temperature / SOC.
- Read next checkpoint target.
- Compute required heat for the period.
- Select correct period library.
- Create base plan.
- Compute base heat and base cost.
- Create allowed upgrade list.
- Sort upgrades by `delta_cost_per_kwh`.

KVS output:

- `required_heat_kwh`
- `base_plan`
- `base_heat_kwh`
- `base_cost`
- sorted upgrade list

### Step 3 – Optimize run plan

Responsibilities:

- Read prepared base plan and sorted upgrade list from KVS.
- Apply greedy upgrades until delivered heat is greater than or equal to required heat.
- Store final run plan in KVS.

KVS output:

- final run plan

---

## 10. Optimization rule

The optimizer is monotonic upward only.

Rules:

- Start from a low / base block plan.
- Upgrade blocks from smaller to larger levels as needed.
- Allowed transitions are upward only: `L0 -> L1 -> L2 -> L3 -> L4`.
- Never downgrade a block.
- Prefer overdelivery to underdelivery.
- Stop as soon as delivered heat is greater than or equal to required heat.

Example:

```text
Required heat: 60 kWh
Current plan: 56 kWh

Upgrade one block from L1 to L2.
New delivered heat: 64 kWh

Result:
- accept 64 kWh
- stop optimization
- do not search for a cheaper underdelivery plan
```

The sacred 00:00–02:00 block is already L4 and therefore remains unchanged.

---

## 11. Execution rule

Once a period plan has been created, it is executed exactly as planned.

Rules:

- No adaptive changes inside the period.
- No live replanning inside the period.
- If the model is wrong, the next period starts from the actual measured state and corrects the error.

This keeps v1 robust and simple enough for Shelly execution.

---

## 12. Known open points

- Complete the missing weekday checkpoint targets between Tuesday and Friday.
- Define exact KVS key names.
- Define exact JSON representation of block plans and upgrade lists.
- Define mapping from system level to actual VP1/VP2 2-bit output codes.
- Define safety overrides outside the optimizer, especially for sensor faults, extreme temperatures, DHW protection, and relay/input status errors.
- Calibrate the winter library against measured data once available.
