# VVX Rotor and Efficiency

## Identified VVX

Rotating heat exchanger:

```text
Heatex WA0540V-200-020-200-0-220
```

## Identified VVX motor

Motor/gearbox identified from nameplate:

```text
Manufacturer: Japan Servo Co., Ltd.
Series: H MKII
Gearbox: 8H12.5FBN-2
Gear ratio: 12.5:1
No: 3417
Motor: IHT8PF25N-1
Type: geared induction motor
Power: 25 W
Voltage: 220 V AC
Current: 0.28 A
Frequency: 50 Hz
Duty: continuous
Motor speed before gearbox: 70–1400 rpm
Run capacitor: 12 µF
```

Wiring observation:

```text
2 supply conductors + protective earth to chassis.
```

This suggests fixed single-phase AC supply and that the capacitor is likely separate in the aggregate/control wiring.

## Control implication

Current VVX control is on/off. It is not treated as analog variable-speed control in the digital runtime.

Pulsing VVX is possible conceptually but has a control side effect: heat may compensate during off-cycles. A future pulsing strategy would need to inhibit or coordinate heat during VVX-off cycles.

## Efficiency calculation

Digital efficiency calculation uses four temperatures:

```text
t_outdoor       = outdoor air before VVX
t_house         = extract air from house before VVX
t_post_vvx      = supply air after VVX before battery
t_to_outdoor    = exhaust air after VVX toward outdoor
```

Supply-side and extract-side efficiency are averaged and clipped to a practical range. The calculation is used as an operational indicator, not laboratory certification.

## Run status

Canonical run semantics:

```text
vvx.run = 1 iff switch = 1 and rpm > 4
```

## Recent observation

With four people in the house, existing VVX/fan setup appeared well optimized in observed tests. Filter changes and flow changes should still be evaluated using comparable before/after conditions.