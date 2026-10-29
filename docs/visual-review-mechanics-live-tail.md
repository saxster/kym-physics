# Independent final live desktop review: mechanics tail

Reviewer: `visual_waves_audit`, independent of mechanics implementation. Date: 2026-10-29.

I personally opened all 14 fresh paired LIVE desktop boards under `source/build/visual-audit-20261029/desktop-live-review/`. Each board contains the default and meaningful changed state captured from the published textbook in Edge at 1440×1000. The underlying images are `after/<ID>-1440-{default,changed}.jpg`. These observations concern the published release `6dc2858637e4d80f1419c498c9f873c7ca2ec1dc`; they do not treat earlier candidate screenshots as final evidence.

| ID | Concrete observation of final live screenshots | Judgment |
|---|---|---|
| m-torsion | Switching attracting masses reverses the dial and signed equilibrium from +27.48 to −27.48 arcseconds; the disturbed trace decays toward the dashed equilibrium. The 800× dial enlargement is explicit. Desktop axis labels are ordered and readable. | Desktop pass. The separately identified phone tick-order fix still needs its own updated evidence. |
| m-perturbation | Wrong 180° prediction gives different solid/dashed residuals and RMS error 1.92e−3; the 60° prediction overlays the residuals and gives zero error. The title and account identify synthetic inference rather than historical observations. | Pass. |
| m-mission | At the burn, paired tangent velocity arrows share a scale. The changed state reaches the later apogee at 29.05 h and 145707 km after a 0.200 km/s impulse; the drawing shows the craft at that far side. Before/after velocities and delayed-coast explanation are readable. | Pass. |
| m-pressure | Solid-face mode preserves 98 N and names the 0.010 m² contact area. Six-face water mode shows inward face forces, top/bottom pressures 39.20/44.10 kPa and 1225 N net upward force; irrelevant controls disable. | Pass. |
| m-suction | Water barometer has a visible supported column and pressure/weight arrows. Equal-pressure hemispheres show both outside inward and inside outward arrows, with net force zero explicitly printed. Labels distinguish pressure support from vacuum pulling. | Pass. |
| m-hydrostatic | Narrow tube and wide reservoir have equal bottom-pressure bars at both states: 19.60 kPa initially and 89.20 kPa with deeper water plus added pressure. Dam arrows grow with depth; total force changes from 98 to 1392 kN. | Pass. |
| m-hull | The sealed hull floats at half depth with equal 98 N weight/buoyancy bars. Egg mode disables hull volume, identifies the two liquid densities and shows 75% of volume in the denser liquid at egg density 1150 kg/m³. The volume-versus-height distinction is readable. | Pass. |
| m-energy | The visible boundary expands from ball only to ball/Earth/surroundings. The default gravitational bar is grey outside the boundary; the final account includes kinetic, pair potential and three internal/absorbed accounts summing to 0.980 J. | Pass. |
| m-impact | Fixed physical axes show doubled stopping time and quadrupled stopping distance. Changed rectangles extend to 0.200/0.400 s and 0.500/2.000 m at 0.5 N; impulse/work areas and their units remain readable. | Pass. |
| m-work | Stairs show upward applied force perpendicular to horizontal displacement while total endpoint work is 58.80 J. Rolling state shows uphill static friction and downhill components; translational 42.00 J plus rotational 16.80 J equals the lost gravitational energy. | Pass. |
| m-power | Fixed examples compare 0.500 kWh geyser with 0.240 kWh lamp on a common bar scale. Household mode disables fixed power, uses an explicitly different 2 kWh plot and sums four schedules to 1.370 kWh. | Pass. |
| m-station | Boiler, turbine, stationary coil and lamp are identifiable. The 100 W Sankey divides visibly into 40 W electrical and 60 W rejected. Wheel mode removes the replenishing source and shows 606.53 J remaining plus 393.47 J delivered to the lamp. | Pass. |
| m-stevin | Removing the symmetric lower chain leaves the same two slope sections and equal downhill components. The 4 kg versus 2 kg masses are distinct while both parallel forces remain 9.80 N; weight/normal-component labels have clear leaders. | Pass. |
| m-engine | Named hot/cold reservoirs change to equal 400 K. Work bar disappears, rejected energy becomes the full 1000 J and Play hides; the default 300 J + 700 J account is conserved. Piston motion is disclosed as schematic. | Pass. |

No additional blocker was found in these 28 live desktop screenshots. This does not close the separately known phone torsion-axis issue or scale-preset clipping issue; those require targeted final-release recapture. No source edits were made during this review. The independent waves review remains complete: all 34 waves/thermal/optics lessons passed both tested widths.
