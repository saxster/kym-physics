// Pure energy accounts for the jar renderer. Progress orders illustrative stages;
// it is not elapsed time, a force simulation, or the Sun's photon travel time.
// Grounding: ch07 §§7.1, 7.3–7.6 (mgh, work, friction, ~40% coal efficiency),
// ch08 §8.1 (heating versus work), ch15 §15.3 (fusion; L = 3.828e26 J/s).
const progress = u => {
  if (!Number.isFinite(u)) throw new TypeError('Energy progress must be finite');
  return Math.max(0, Math.min(3, u));
};
const store = (id, val, sub) => ({ id, val, sub, kind: 'store' });
// An output account accumulates energy delivered elsewhere; it is not a store
// inside the original machine. The renderer reuses its existing colour/hatch.
const output = (id, val, title, sub) => ({ id, val, title, sub, kind: 'output' });
const tube = (from, to, fromId, toId, way, rate, style = way, label) =>
  ({ from, to, fromId, toId, way, rate, style, label });

export const SCENARIOS = [
  {
    name: 'Bouncing ball (0.98 J)', totalJ: 0.98,
    sliderLabel: 'Stage of drop & bounce',
    stages: ['Released (1.00 m)', 'Halfway down (0.50 m)', 'Impact squash (floor)', 'Top of 1st bounce (0.64 m)'],
    eval(u) {
      u = progress(u);
      if (u <= 1) {
        const grav = 0.98 * (1 - u), kinetic = 0.98 - grav;
        return {
          jars: [store('grav', grav, 'ball + Earth'), store('kinetic', kinetic, 'motion ½mv²'),
            store('elastic', 0, 'squash ½kx²'), store('thermal', 0, 'rubber, floor & air')],
          tubes: [tube(0, 1, 'grav', 'kinetic', 'mechanical', Math.sin(u * Math.PI) + 0.25)],
          eq: `E_p + E_k = ${grav.toFixed(2)} + ${kinetic.toFixed(2)} = 0.98 J`,
          caption: 'Gravity pulls the 100 g ball down. The ball–Earth gravitational store decreases as the kinetic store increases. The account follows the initial 0.98 J, including energy reaching the surroundings.',
        };
      }
      if (u <= 2) {
        const f = u - 1, elastic = 0.78 * f, thermal = 0.20 * f;
        const kinetic = Math.max(0, 0.98 - elastic - thermal);
        return {
          jars: [store('grav', 0, 'ball + Earth'), store('kinetic', kinetic, 'motion ½mv²'),
            store('elastic', elastic, 'squash ½kx²'), store('thermal', thermal, 'rubber, floor & air')],
          tubes: [tube(1, 2, 'kinetic', 'elastic', 'mechanical', 0.8),
            tube(1, 3, 'kinetic', 'thermal', 'conversion', 0.45, 'heating', 'Internal friction')],
          eq: `Impact: E_k (${kinetic.toFixed(2)} J) + E_el (${elastic.toFixed(2)} J) + E_th (${thermal.toFixed(2)} J) ≈ 0.98 J (values rounded)`,
          caption: 'The rubber squashes, storing elastic energy. Internal friction converts some motion into internal energy. Sound carries some energy into the floor and air; the thermal account counts it after absorption. This conversion is not heating caused by a temperature difference.',
        };
      }
      const f = u - 2, grav = 0.63 * f, elastic = 0.78 * (1 - f);
      const thermal = 0.20 + 0.15 * f;
      return {
        jars: [store('grav', grav, 'ball + Earth'), store('kinetic', 0, 'motion ½mv²'),
          store('elastic', elastic, 'squash ½kx²'), store('thermal', thermal, 'rubber, floor & air')],
        tubes: [tube(2, 0, 'elastic', 'grav', 'mechanical', 0.7 * (1 - f * 0.6)),
          tube(2, 3, 'elastic', 'thermal', 'waves', 0.35, 'radiation', 'Waves (sound)')],
        eq: `Rebound account: E_p (${grav.toFixed(2)} J) + E_el (${elastic.toFixed(2)} J) + E_th (${thermal.toFixed(2)} J) ≈ 0.98 J (values rounded)`,
        caption: 'At the 0.64 m peak, about 0.63 J is gravitational energy and 0.35 J has warmed the rubber, floor and air. Internal friction and absorbed sound contribute to this warming. The slider shows account stages, not the ball’s detailed motion or sound travel time.',
      };
    },
  },
  {
    name: 'Climbing 4 floors (18.8 kJ)', totalJ: 18800,
    eval(u) {
      const f = progress(u) / 3;
      const chemical = 18800 * (1 - f), grav = 4704 * f;
      const thermal = (18800 - 4704) * f;
      return {
        jars: [store('chemical', chemical, 'food in muscles'), store('grav', grav, 'body + Earth'),
          store('thermal', thermal, 'body & surroundings')],
        tubes: [tube(0, 1, 'chemical', 'grav', 'mechanical', f > 0.02 ? 0.65 : 0),
          tube(0, 2, 'chemical', 'thermal', 'conversion', f > 0.02 ? 0.9 : 0, 'heating', 'Internal conversion')],
        eq: `Chemical remaining (${(chemical / 1000).toFixed(2)} kJ) + mgh (${(grav / 1000).toFixed(2)} kJ) + thermal gain (${(thermal / 1000).toFixed(2)} kJ) ≈ 18.8 kJ (values rounded)`,
        caption: 'For a 40 kg climber rising 12 m, mgh = 4,704 J. This example assumes 18,800 J from food: roughly 25% raises the body, and the rest warms the body and surroundings. The chemical-to-internal change is a conversion within the body, not heating from a hotter object.',
      };
    },
  },
  {
    name: 'Coal station (100 J)', totalJ: 100,
    eval(u) {
      const f = progress(u) / 3;
      const chemical = 100 * (1 - f);
      const kinetic = f === 0 || f === 1 ? 0 : 15 * Math.sin(f * Math.PI);
      // The intermediate turbine buffer is part of the 100 J, not extra energy.
      // Its 15 J peak is chosen for illustration, not a measured plant value.
      const completed = 100 * f - kinetic;
      const electrical = 0.4 * completed;
      const thermal = 0.6 * completed;
      return {
        jars: [store('chemical', chemical, 'coal remaining'), store('kinetic', kinetic, 'turbine buffer'),
          output('electro', electrical, 'Delivered', 'via electric current'), store('thermal', thermal, 'water & surroundings')],
        tubes: [tube(0, 1, 'chemical', 'kinetic', 'mechanical', f > 0.02 ? 0.7 : 0, 'heating', 'Via steam & work'),
          tube(1, 2, 'kinetic', 'electro', 'electrical', f > 0.02 ? 0.65 : 0),
          tube(0, 3, 'chemical', 'thermal', 'conversion', f > 0.02 ? 0.95 : 0, 'heating', 'Burning → warming')],
        eq: `Coal (${chemical.toFixed(1)} J) + turbine (${kinetic.toFixed(1)} J) + delivered (${electrical.toFixed(1)} J) + thermal gain (${thermal.toFixed(1)} J) ≈ 100 J (values rounded)`,
        caption: 'The 100 J account includes coal still unused, energy temporarily in the turbine, electrical energy already delivered, and warming of water and surroundings. At the end, 40 J has been delivered and 60 J has warmed the surroundings: about 40% useful output. The intermediate split is illustrative; delivered energy is not an electrostatic store in the station.',
      };
    },
  },
  {
    name: 'The Sun (1 s: 3.83 × 10²⁶ J)', totalJ: 3.83e26,
    eval(u) {
      const f = progress(u) / 3, total = this.totalJ;
      const nuclear = total * (1 - f);
      const emitted = total * f * f;
      const internal = total * f * (1 - f);
      return {
        jars: [store('nuclear', nuclear, 'mass-energy remaining'), store('thermal', internal, 'internal buffer'),
          output('grav', emitted, 'Sunlight', 'emitted to space')],
        tubes: [tube(0, 1, 'nuclear', 'thermal', 'conversion', 1, 'heating', 'Fusion conversion'),
          tube(1, 2, 'thermal', 'grav', 'waves', 1, 'radiation', 'Waves (light)')],
        eq: `In units of 10²⁶ J: nuclear remaining (${(nuclear / 1e26).toFixed(2)}) + internal (${(internal / 1e26).toFixed(2)}) + emitted (${(emitted / 1e26).toFixed(2)}) ≈ 3.83 (values rounded)`,
        caption: 'The Sun emits about 3.83 × 10²⁶ J of light in one second. This account follows that amount from nuclear mass-energy through an illustrative internal buffer to emitted sunlight. Fusion is an internal conversion, not heating. Sunlight is an outgoing wave transfer, not gravitational energy. These stages do not show how long energy takes to escape the Sun.',
      };
    },
  },
];
