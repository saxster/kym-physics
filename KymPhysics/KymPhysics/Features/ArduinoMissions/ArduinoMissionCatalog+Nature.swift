import Foundation

/// Remaining Spy missions, Nature Watch missions, and Capstone for the Arduino course.
extension ArduinoMissionCatalog {
    static let beamGuardMission = ArduinoMission(
        missionID: .beamGuard,
        track: .spyGadget,
        number: "Mission 03",
        title: "The Invisible Beam Guard",
        hook: "Museums guard treasures with beams of light. Stretch a torch beam across your den entrance: break the beam, trigger the alarm — just like the films, minus the lasers.",
        conceptTitle: "Analog means 'how much', not just yes or no",
        concept: "An LDR is a resistor whose resistance changes with light: bright light, low resistance; darkness, high resistance. Pair it with a fixed 10kΩ resistor and you get a voltage divider — a seesaw that splits 5 volts between two resistors. The middle voltage slides up and down with the light, and analogRead reports it as a number from 0 to 1023. Your code picks a threshold: above it, beam present; below it, beam broken. Measuring instead of guessing is what makes this science.",
        symbol: "scope",
        visualKind: "beam",
        visualAlt: "Diagram: a torch shining a beam across a doorway onto a light sensor wired to an Arduino; a foot breaking the beam casts a shadow on the sensor.",
        minutes: "40 min",
        level: "Medium",
        needsAdultSetup: false,
        parts: [
            "Arduino Uno",
            "LDR (photoresistor) + 10kΩ resistor",
            "A small torch (or bright LED + battery pack)",
            "Buzzer + red LED with 220Ω resistor",
            "Breadboard + long wires or alligator clips"
        ],
        wiring: [
            ArduinoPinConnection(pin: "5V", wireTone: .power, connectsTo: "LDR leg 1", purpose: "Top half of the voltage-divider seesaw"),
            ArduinoPinConnection(pin: "A0", wireTone: .analog, connectsTo: "LDR leg 2 + 10kΩ resistor", purpose: "Reads middle voltage as 0–1023"),
            ArduinoPinConnection(pin: "GND", wireTone: .ground, connectsTo: "Other leg of 10kΩ resistor", purpose: "Bottom half of voltage divider"),
            ArduinoPinConnection(pin: "D8", wireTone: .pwm, connectsTo: "Piezo buzzer (+) & indicator LED", purpose: "Sounds 900 Hz alarm when beam breaks")
        ],
        specs: [
            ArduinoSpec(label: "ADC range", value: "0–1023 (10-bit)"),
            ArduinoSpec(label: "Divider pair", value: "LDR + 10kΩ"),
            ArduinoSpec(label: "Default trip", value: "< 500 ADC"),
            ArduinoSpec(label: "Graph tool", value: "Serial Plotter")
        ],
        params: [
            ArduinoParam(
                id: "lightLevel",
                label: "Simulated light on LDR (A0)",
                partFragment: "LDR",
                codeTarget: "int light = analogRead(ldrPin);   // 0 (dark) .. 1023 (bright)",
                defaultValue: 800,
                kind: .range(
                    min: 100,
                    max: 950,
                    step: 50,
                    unit: "ADC",
                    codeTemplate: "int light = analogRead(ldrPin);   // bench A0 ≈ %d (0..1023)"
                )
            ),
            ArduinoParam(
                id: "threshold",
                label: "Tripwire threshold",
                partFragment: "torch",
                codeTarget: "int threshold = 500;        // YOUR measured halfway number",
                defaultValue: 500,
                kind: .range(
                    min: 250,
                    max: 750,
                    step: 50,
                    unit: "ADC",
                    codeTemplate: "int threshold = %d;        // YOUR measured halfway number"
                )
            )
        ],
        steps: [
            "Build the divider: 5V → LDR → pin A0 → 10kΩ resistor → GND. Pin A0 reads the middle of the seesaw.",
            "First, upload only a measuring sketch: print analogRead(A0) and write down the numbers with the beam on the sensor, then with your hand blocking it.",
            "Choose a threshold halfway between your two numbers. Put that number in the code below.",
            "Aim the torch, arm the guard, and step through the beam. Adjust the threshold until it ignores room light but never misses a footstep."
        ],
        code: """
        const int ldrPin = A0;
        const int buzzerPin = 8;
        int threshold = 500;        // YOUR measured halfway number

        void setup() {
          pinMode(buzzerPin, OUTPUT);
          Serial.begin(9600);
        }
        void loop() {
          int light = analogRead(ldrPin);   // 0 (dark) .. 1023 (bright)
          Serial.println(light);            // watch it in Serial Plotter!
          if (light < threshold) {
            tone(buzzerPin, 900, 200);
            Serial.println("BEAM BROKEN");
            delay(500);
          }
          delay(50);
        }
        """,
        codeWalkthrough: [
            "analogRead(ldrPin) measures the midpoint voltage of your LDR + 10kΩ divider on pin A0 (0 to 1023).",
            "Serial.println(light) streams each reading so Tools → Serial Plotter graphs the beam in real time.",
            "if (light < threshold) compares the live reading against your halfway threshold (500).",
            "tone(buzzerPin, 900, 200) sounds a 900 Hz beep and prints BEAM BROKEN when a shadow crosses."
        ],
        notice: [
            "Open Tools → Serial Plotter and watch the light level as a living graph. Data you can see beats numbers you must imagine.",
            "Sunlight through a window moves your baseline during the day. Real security systems recalibrate for exactly this reason.",
            "We use a torch, not a laser pointer: lasers can damage eyes. A focused torch beam teaches the same physics safely."
        ],
        challenge: "Two-beam counter: add a second LDR a step further in. Beam 1 then beam 2 means 'entering'; the reverse means 'leaving'. Can your code keep a running count of who is inside the den?",
        safety: "Torch beams only — never a laser. Keep wires taped down so the guard that catches intruders does not trip them.",
        links: [
            ArduinoLink(title: "Meet the Uno board, pin by pin", detail: "Arduino Docs · find the analog pins A0–A5", urlString: "https://docs.arduino.cc/hardware/uno-rev3/", isVideo: false),
            ArduinoLink(title: "Prototype the divider virtually", detail: "Tinkercad Circuits · slide the light and watch A0 change", urlString: "https://www.tinkercad.com/circuits", isVideo: false)
        ]
    )

    static let sonarSweepMission = ArduinoMission(
        missionID: .sonarSweep,
        track: .spyGadget,
        number: "Mission 04",
        title: "Sonar Sweep: see with sound",
        hook: "Bats hunt in total darkness by shouting and listening. Your gadget does the same: it sweeps a sound 'flashlight' across the room and maps whatever is out there.",
        conceptTitle: "Distance = echo time × speed of sound",
        concept: "The HC-SR04 has two 'eyes': one shouts a click too high for human ears (40,000 vibrations a second), the other listens for the echo. Sound travels about 0.034 centimetres every microsecond, so echo time tells you distance: multiply, then halve it, because the sound went there AND back. Mount the sensor on a servo motor, sweep it like a lighthouse, and print angle + distance — a sonar map from a single multiplication.",
        symbol: "dot.radiowaves.left.and.right",
        visualKind: "sonar",
        visualAlt: "Diagram: an ultrasonic sensor on a rotating servo sending out sound arcs that bounce off a toy dinosaur and return, with distances printed angle by angle.",
        minutes: "45 min",
        level: "Medium",
        needsAdultSetup: false,
        parts: [
            "Arduino Uno",
            "Ultrasonic sensor (HC-SR04)",
            "Micro servo (SG90) + sticky tack or tape",
            "Breadboard + wires"
        ],
        wiring: [
            ArduinoPinConnection(pin: "5V / GND", wireTone: .power, connectsTo: "HC-SR04 & SG90 power leads", purpose: "Powers ultrasonic eyes and servo motor"),
            ArduinoPinConnection(pin: "D9", wireTone: .signal, connectsTo: "HC-SR04 TRIG pin", purpose: "Fires 10-microsecond 40 kHz click"),
            ArduinoPinConnection(pin: "D10", wireTone: .analog, connectsTo: "HC-SR04 ECHO pin", purpose: "Timed by pulseIn() with 25,000 us limit"),
            ArduinoPinConnection(pin: "D6", wireTone: .pwm, connectsTo: "SG90 servo orange signal wire", purpose: "Sweeps sensor between 15° and 165°")
        ],
        specs: [
            ArduinoSpec(label: "Ultrasound", value: "40 kHz burst"),
            ArduinoSpec(label: "Sound speed", value: "0.034 cm / us"),
            ArduinoSpec(label: "Echo timeout", value: "25,000 us (~4 m)"),
            ArduinoSpec(label: "Sweep arc", value: "15° to 165°")
        ],
        params: [
            ArduinoParam(
                id: "distanceCM",
                label: "Target distance",
                partFragment: "Ultrasonic",
                codeTarget: "return us * 0.034 / 2;           // there and back again",
                defaultValue: 25,
                kind: .range(
                    min: 5,
                    max: 90,
                    step: 5,
                    unit: "cm",
                    codeTemplate: "return us * 0.034 / 2;           // bench target at %d cm"
                )
            ),
            ArduinoParam(
                id: "targetKind",
                label: "Obstacle surface material",
                partFragment: "servo",
                codeTarget: "if (us == 0) return 400;       // no echo heard: call it \"far away\"",
                defaultValue: 0,
                kind: .choices([
                    ArduinoParamChoice(
                        label: "Hard book",
                        value: 0,
                        codeReplacement: "if (us == 0) return 400;       // no echo heard: call it \"far away\"",
                        summary: "Flat reflection (±0 cm)"
                    ),
                    ArduinoParamChoice(
                        label: "Cardboard box",
                        value: 1,
                        codeReplacement: "if (us == 0) return 400;       // cardboard box: ±1 cm scatter",
                        summary: "Clean reflection (±1 cm)"
                    ),
                    ArduinoParamChoice(
                        label: "Round ball",
                        value: 2,
                        codeReplacement: "if (us == 0) return 400;       // curved ball: ±6 cm scatter",
                        summary: "Curved scatter (±6 cm jitter)"
                    ),
                    ArduinoParamChoice(
                        label: "Soft cushion",
                        value: 3,
                        codeReplacement: "if (us == 0) return 400;       // soft cushion swallows sound -> 400 cm",
                        summary: "Swallows sound -> 0 us timeout -> 400 cm"
                    )
                ])
            )
        ],
        steps: [
            "Wire the sensor: VCC → 5V, GND → GND, TRIG → pin 9, ECHO → pin 10. Servo: brown → GND, red → 5V, orange → pin 6.",
            "First test without the servo: hold the sensor, move a book towards it, and check the printed centimetres against a ruler.",
            "Stick the sensor on the servo horn, upload the sweep code, and open the Serial Plotter.",
            "Place objects around the gadget in the dark. Read the peaks and valleys to guess the room's shape — then turn the light on and score yourself."
        ],
        code: """
        #include <Servo.h>
        Servo sweep;
        const int trigPin = 9;
        const int echoPin = 10;

        long measureCM() {
          digitalWrite(trigPin, LOW);
          delayMicroseconds(2);
          digitalWrite(trigPin, HIGH);
          delayMicroseconds(10);          // shout!
          digitalWrite(trigPin, LOW);
          long us = pulseIn(echoPin, HIGH, 25000);  // listen, but give up after ~4 m
          if (us == 0) return 400;       // no echo heard: call it "far away"
          return us * 0.034 / 2;           // there and back again
        }
        void setup() {
          pinMode(trigPin, OUTPUT);
          pinMode(echoPin, INPUT);
          sweep.attach(6);
          Serial.begin(9600);
        }
        void scan(int from, int to, int step) {
          for (int angle = from; angle != to + step; angle += step) {
            sweep.write(angle);
            delay(30);
            Serial.print(angle);
            Serial.print(",");
            Serial.println(measureCM());
          }
        }
        void loop() {
          scan(15, 165, 1);      // sweep left to right...
          scan(165, 15, -1);     // ...and glide back, no servo snap
        }
        """,
        codeWalkthrough: [
            "digitalWrite(trigPin, HIGH) for 10 microseconds shouts an 8-cycle 40 kHz click into the room.",
            "pulseIn(echoPin, HIGH, 25000) times the echo in microseconds and gives up after 25,000 us (~4 m) so a missed echo never stalls the sweep.",
            "us * 0.034 / 2 converts round-trip microseconds into one-way centimetres.",
            "scan(15, 165, 1) steps the servo horn degree by degree and prints angle,distance for Serial Plotter."
        ],
        notice: [
            "Soft things (cushions, jumpers) swallow sound and nearly vanish from sonar. Submarines are coated in rubber for the same trick.",
            "pulseIn with no timeout waits a whole second when no echo comes back — per degree! The 25000 limit says 'give up after about 4 metres' and keeps the sweep smooth. Timeouts turn freezes into answers.",
            "Hard walls at an angle bounce the sound away from the sensor, like a torch in a tilted mirror — stealth aircraft use angled panels for the same reason."
        ],
        challenge: "Sentry mode: make the servo stop sweeping and point straight at anything that comes closer than 40 cm, until it leaves.",
        safety: "Keep fingers clear of the moving servo horn, and do not force it by hand — the tiny plastic gears strip easily.",
        links: [
            ArduinoLink(title: "Ping — ultrasonic distance basics", detail: "Arduino Docs · the echo maths in isolation", urlString: "https://docs.arduino.cc/built-in-examples/sensors/Ping/", isVideo: false),
            ArduinoLink(title: "Meet the Uno board, pin by pin", detail: "Arduino Docs · PWM pins for the servo", urlString: "https://docs.arduino.cc/hardware/uno-rev3/", isVideo: false)
        ]
    )

    static let truthMeterMission = ArduinoMission(
        missionID: .truthMeter,
        track: .spyGadget,
        number: "Mission 05",
        title: "The Truth Meter (and why spies doubt it)",
        hook: "Interrogate a volunteer suspect (a sibling works well). Nervous fingers sweat a tiny bit more, skin conducts electricity better — and your graph jumps. Then learn why real detectives do not trust this machine.",
        conceptTitle: "Your skin is a variable resistor",
        concept: "Two foil pads on two fingers make you part of the circuit: your skin is one half of a voltage divider, a 10kΩ resistor is the other half. Calm, dry skin resists a lot; slightly sweaty skin resists less, so the voltage at A0 shifts and the graph moves. This is called galvanic skin response. Here is the twist a good detective must know: excitement, a deep breath, or wriggling moves the graph just as much as fibbing. The meter measures arousal, not honesty — measuring one thing and claiming another is the oldest trick in bad science.",
        symbol: "waveform.path.ecg",
        visualKind: "truth",
        visualAlt: "Diagram: two foil finger pads wired through an Arduino to a wavy graph line that jumps when a tricky question is asked.",
        minutes: "40 min",
        level: "Medium",
        needsAdultSetup: false,
        parts: [
            "Arduino Uno",
            "Aluminium foil + tape or Velcro straps",
            "10kΩ resistor",
            "3 LEDs (green, yellow, red) + 220Ω resistors",
            "Breadboard + wires",
            "One willing volunteer suspect"
        ],
        wiring: [
            ArduinoPinConnection(pin: "5V", wireTone: .power, connectsTo: "Foil finger pad 1", purpose: "Feeds safe 5V microcurrent to first finger"),
            ArduinoPinConnection(pin: "A0", wireTone: .analog, connectsTo: "Foil pad 2 + 10kΩ resistor to GND", purpose: "Measures skin-divider voltage (0–1023)"),
            ArduinoPinConnection(pin: "D11 / D12 / D13", wireTone: .signal, connectsTo: "Green (11), Yellow (12), Red (13) LEDs", purpose: "Shows calm vs. spike change from baseline"),
            ArduinoPinConnection(pin: "GND", wireTone: .ground, connectsTo: "10kΩ resistor & LED short legs", purpose: "Completes return loop")
        ],
        specs: [
            ArduinoSpec(label: "Signal type", value: "Galvanic skin (GSR)"),
            ArduinoSpec(label: "Get-ready pause", value: "3,000 ms + 50 samples"),
            ArduinoSpec(label: "Green / Red", value: "< 15 / >= 40 ADC"),
            ArduinoSpec(label: "Power rule", value: "USB / battery 5V")
        ],
        params: [
            ArduinoParam(
                id: "skinReading",
                label: "Fingertip A0 reading",
                partFragment: "Aluminium foil",
                codeTarget: "int value = analogRead(skinPin);",
                defaultValue: 545,
                kind: .range(
                    min: 500,
                    max: 620,
                    step: 10,
                    unit: "ADC",
                    codeTemplate: "int value = analogRead(skinPin); // bench A0 = %d"
                )
            ),
            ArduinoParam(
                id: "deltaThreshold",
                label: "Red LED spike threshold",
                partFragment: "3 LEDs",
                codeTarget: "digitalWrite(13, change >= 40);",
                defaultValue: 40,
                kind: .choices([
                    ArduinoParamChoice(
                        label: "Change >= 25",
                        value: 25,
                        codeReplacement: "digitalWrite(13, change >= 25);",
                        summary: "Sensitive red spike threshold"
                    ),
                    ArduinoParamChoice(
                        label: "Change >= 40",
                        value: 40,
                        codeReplacement: "digitalWrite(13, change >= 40);",
                        summary: "Default red spike threshold"
                    ),
                    ArduinoParamChoice(
                        label: "Change >= 65",
                        value: 65,
                        codeReplacement: "digitalWrite(13, change >= 65);",
                        summary: "Strict red spike threshold"
                    )
                ])
            )
        ],
        steps: [
            "Make two foil finger pads. Wire: 5V → pad 1, pad 2 → pin A0, and pin A0 → 10kΩ → GND. The volunteer wears one pad on each of two fingers of the same hand.",
            "Upload the code and open the Serial Plotter. Volunteer: pads ON, hand resting still, stay calm — then press the little RESET button on the Arduino. The code counts you in, then measures your calm baseline. Now ask easy questions ('Is your name…?') and check the green lamp mostly stays on.",
            "Now ask the suspect to lie about a number between 1 and 5 while you guess. Watch for jumps — and note how often the meter cries wolf.",
            "Tally hits and false alarms like a scientist. Would you convict anyone with this machine?"
        ],
        code: """
        const int skinPin = A0;
        int baseline = 0;

        void setup() {
          Serial.begin(9600);
          pinMode(11, OUTPUT);   // green: calm
          pinMode(12, OUTPUT);   // yellow: hmm
          pinMode(13, OUTPUT);   // red: spike!
          Serial.println("Fingers on the pads, hand still...");
          Serial.println("Calibrating your calm in 3 seconds.");
          delay(3000);             // time to actually get ready
          long total = 0;
          for (int i = 0; i < 50; i++) {   // learn "calm"
            total += analogRead(skinPin);
            delay(20);
          }
          baseline = total / 50;
        }
        void loop() {
          int value = analogRead(skinPin);
          int change = abs(value - baseline);
          Serial.println(value);           // Serial Plotter graph
          digitalWrite(11, change < 15);
          digitalWrite(12, change >= 15 && change < 40);
          digitalWrite(13, change >= 40);
          delay(50);
        }
        """,
        codeWalkthrough: [
            "delay(3000) gives the volunteer 3 full seconds with fingers resting on the foil pads before calibration starts.",
            "for (int i = 0; i < 50; i++) averages 50 calm readings into baseline.",
            "int change = abs(value - baseline) measures how far skin conductivity moved from calm in either direction.",
            "digitalWrite(11..13, ...) lights green (< 15), yellow (15–39), or red (>= 40) while Serial Plotter draws value."
        ],
        notice: [
            "Averaging 50 readings for the baseline is calibration — every serious instrument in science does some version of it.",
            "Courts in most countries reject polygraph evidence. Your false-alarm tally shows exactly why.",
            "Only a battery/USB 5V circuit, and the current through skin here is far too small to feel — but volunteers can stop any time, and nobody is ever forced onto the meter."
        ],
        challenge: "Design a fair test: 10 questions, half with instructed lies, a friend scoring the graph without knowing which. What percentage does the meter really get right? Report it honestly — that honesty is the actual detective skill.",
        safety: "Volunteers only, always free to stop, and never use the meter to accuse anyone of anything real. It is a lesson about evidence, not a lie detector.",
        links: [
            ArduinoLink(title: "Prototype a voltage divider virtually", detail: "Tinkercad Circuits · swap resistor values and watch A0", urlString: "https://www.tinkercad.com/circuits", isVideo: false),
            ArduinoLink(title: "Meet the Uno board, pin by pin", detail: "Arduino Docs · analog inputs explained", urlString: "https://docs.arduino.cc/hardware/uno-rev3/", isVideo: false)
        ]
    )

    static let natureMissions: [ArduinoMission] = [
        ArduinoMission(
            missionID: .feederCam,
            track: .natureWatch,
            number: "Mission 06",
            title: "Bird Feeder Camera Trap",
            hook: "Who visits the feeder while you are at school? A camera the size of a stamp, woken by motion, quietly snaps every guest — robins, sparrows, and one very smug squirrel.",
            conceptTitle: "Sleep, wake, snap: how camera traps save power",
            concept: "A normal Arduino cannot take photos, so this mission uses its camera-wearing cousin, the ESP32-CAM — same Arduino app, same style of code, plus a camera and a memory-card slot. The trick is power: a camera running all day drains batteries in hours. So the board sleeps in a near-off state while the PIR sensor (your old diary-box guard) keeps watch. Motion wakes the board, it takes a photo, saves it to the card, and goes back to sleep. Wildlife scientists run exactly this pattern for months in rainforests.",
            symbol: "camera",
            visualKind: "birdcam",
            visualAlt: "Diagram: a bird feeder with a visiting bird, a small camera board in a weatherproof box, and a motion sensor waking the camera to take a photo saved to a memory card.",
            minutes: "A weekend build",
            level: "With a grown-up",
            needsAdultSetup: true,
            parts: [
                "ESP32-CAM board + USB programmer board",
                "PIR motion sensor (HC-SR501)",
                "microSD card",
                "USB battery pack or long USB cable from indoors",
                "A weatherproof box with a clear window (food tub works)",
                "Bird feeder + seed"
            ],
            wiring: [
                ArduinoPinConnection(pin: "5V / GND", wireTone: .power, connectsTo: "Strong 5V supply & PIR VCC/GND", purpose: "Prevents ESP32-CAM brownout resets during capture"),
                ArduinoPinConnection(pin: "GPIO 13", wireTone: .signal, connectsTo: "PIR motion sensor OUT pin", purpose: "RTC ext0 wake trigger (HIGH wakes board)"),
                ArduinoPinConnection(pin: "SD_MMC", wireTone: .secondary, connectsTo: "Built-in microSD card slot", purpose: "Stores visitor photos locally without Wi-Fi")
            ],
            specs: [
                ArduinoSpec(label: "Wake pin", value: "GPIO 13 (PIR_PIN)"),
                ArduinoSpec(label: "Deep sleep", value: "~100x less power"),
                ArduinoSpec(label: "Supply rule", value: "Strong 5V (no brownout)"),
                ArduinoSpec(label: "Storage", value: "microSD card")
            ],
            params: [
                ArduinoParam(
                    id: "pirTrigger",
                    label: "Feeder PIR motion state",
                    partFragment: "PIR",
                    codeTarget: "#define PIR_PIN 13",
                    defaultValue: 1,
                    kind: .choices([
                        ArduinoParamChoice(
                            label: "Feeder quiet (Sleep)",
                            value: 0,
                            codeReplacement: "#define PIR_PIN 13 // PIR LOW: sleeping",
                            summary: "Board stays in deep sleep"
                        ),
                        ArduinoParamChoice(
                            label: "Robin lands (Wake)",
                            value: 1,
                            codeReplacement: "#define PIR_PIN 13",
                            summary: "GPIO 13 HIGH wakes board -> snaps photo"
                        )
                    ])
                ),
                ArduinoParam(
                    id: "sleepMode",
                    label: "Power strategy comparison",
                    partFragment: "ESP32-CAM",
                    codeTarget: "esp_deep_sleep_start();           // zzz... saves battery",
                    defaultValue: 10,
                    kind: .choices([
                        ArduinoParamChoice(
                            label: "Deep sleep (~10 mA)",
                            value: 10,
                            codeReplacement: "esp_deep_sleep_start();           // zzz... saves battery",
                            summary: "Sleeps between birds (~100x power savings)"
                        ),
                        ArduinoParamChoice(
                            label: "Always-on (~180 mA)",
                            value: 180,
                            codeReplacement: "esp_deep_sleep_start();           // 180 mA if awake vs ~10 mA asleep",
                            summary: "Drains USB battery pack in hours"
                        )
                    ])
                )
            ],
            steps: [
                "With a grown-up: install the ESP32 boards in the Arduino app (instructions in the guide below) and run the CameraWebServer example to see your first picture.",
                "Wire PIR OUT to GPIO 13 on the ESP32-CAM. Upload the motion-photo sketch from the guide below, with the sleep lines from our code.",
                "Test indoors: wave, wait, then check the memory card on a computer. Photograph the family cat looking unimpressed. This is calibration.",
                "Mount the box about a metre from the feeder, lens shaded from rain and direct sun. Check the card every few days, refill the seed, and start a visitor log: who, when, how often?"
            ],
            code: """
            // ESP32-CAM: the pattern (full sketch in the guide below)
            // 1. Wake when the PIR pin goes HIGH
            // 2. Take one photo, save it to the microSD card
            // 3. Go straight back to deep sleep

            #define PIR_PIN 13

            void setup() {
              // ... camera + memory card setup from the guide ...
              takePhotoAndSave();               // snap the visitor!
              esp_sleep_enable_ext0_wakeup(
                (gpio_num_t)PIR_PIN, 1);        // wake on motion
              esp_deep_sleep_start();           // zzz... saves battery
            }
            void loop() { }   // never reached: sleeping agents only
            """,
            codeWalkthrough: [
                "#define PIR_PIN 13 selects GPIO 13, an RTC pin that stays awake while the main processor sleeps.",
                "takePhotoAndSave() captures one JPEG frame and writes it to the microSD card on each motion wake.",
                "esp_sleep_enable_ext0_wakeup((gpio_num_t)PIR_PIN, 1) arms the RTC wake circuit for a HIGH signal.",
                "esp_deep_sleep_start() powers down the camera so the battery lasts for days; loop() is never reached."
            ],
            notice: [
                "The CameraWebServer starter example streams over your home Wi-Fi so you can test the picture. Home Wi-Fi only: never share that stream link outside your household, and the finished trap needs no Wi-Fi at all.",
                "ESP32-CAM boards are fussy about power and reset randomly on weak USB supplies ('brownouts'). Use a strong 5 V supply — the video below has a whole chapter on fixing exactly this.",
                "Deep sleep drops power use by about a hundred times. Battery life is an engineering decision, not luck.",
                "Most empty photos will be wind-blown branches. Professionals delete 90% of camera-trap photos too — data cleaning is real work.",
                "Aim along the feeder, not at neighbours' gardens. The camera is for birds, and the visitor log is the science."
            ],
            challenge: "Run the trap for a week and graph visits by hour. Do birds have rush hours? Does rain change anything? Write one claim and the evidence for it, detective-style.",
            safety: "A grown-up helps with setup and mounting (no ladders, no roofs). USB battery power only outdoors, everything sealed from rain, and never disturb a nest — watch feeders, not nests with eggs or chicks.",
            links: [
                ArduinoLink(title: "Build guide: ESP32-CAM motion photo trap", detail: "Random Nerd Tutorials · full wiring and code, saves to microSD", urlString: "https://randomnerdtutorials.com/esp32-cam-pir-motion-detector-photo-capture/", isVideo: false),
                ArduinoLink(title: "Watch: ESP32-CAM complete guide", detail: "DroneBot Workshop · YouTube deep-dive with timestamps", urlString: "https://www.youtube.com/watch?v=visj0KE5VtY", isVideo: true)
            ]
        ),
        visitorCounterMission,
        dawnLoggerMission
    ]

    static let capstone = ArduinoMission(
        missionID: .fieldAgent,
        track: .capstone,
        number: "Final Mission",
        title: "Field Agent: one week, one question",
        hook: "Combine your gadgets into one field station and answer one real question about your garden: Who visits? When? Does weather matter? This is the mission where building turns into investigating.",
        conceptTitle: "Systems: sensors + power + data + a question",
        concept: "Every professional instrument is a system: a sensor, a power plan, a way to store data, and — most important — a question worth answering. Your field station pairs the visitor counter (how many) with the camera trap (who) and the dawn logger (conditions). Separately they are gadgets; together they cross-check each other, the way a detective compares a witness, a footprint and a timestamp. Plan for failure, too: what happens on day three when the battery dies? That is engineering.",
        symbol: "flag.checkered",
        visualKind: "capstone",
        visualAlt: "Diagram: a garden field station combining a camera trap, a visitor counter beam and a weather logger, all feeding one evidence board with photos, tallies and graphs.",
        minutes: "One week",
        level: "Capstone",
        needsAdultSetup: true,
        parts: [
            "Your camera trap (Mission 06)",
            "Your visitor counter (Mission 07)",
            "Your dawn logger (Mission 08)",
            "USB battery packs + spare memory card",
            "A field notebook (real paper — it never crashes)"
        ],
        wiring: [
            ArduinoPinConnection(pin: "D3 (Uno)", wireTone: .signal, connectsTo: "Visitor counter IR break-beam", purpose: "Tallies total perch crossings per hour"),
            ArduinoPinConnection(pin: "GPIO 13", wireTone: .pwm, connectsTo: "ESP32-CAM PIR wake trigger", purpose: "Photographs which species made the visit"),
            ArduinoPinConnection(pin: "A0 & D4", wireTone: .analog, connectsTo: "Dawn logger LDR & DHT11", purpose: "Logs light, °C, and humidity alongside visits")
        ],
        specs: [
            ArduinoSpec(label: "Station 1", value: "Counter (how many)"),
            ArduinoSpec(label: "Station 2", value: "Camera (who)"),
            ArduinoSpec(label: "Station 3", value: "Logger (weather)"),
            ArduinoSpec(label: "Duration", value: "7-day field study")
        ],
        params: [
            ArduinoParam(
                id: "counterVisits",
                label: "Daily beam counter tally",
                partFragment: "visitor counter",
                codeTarget: "//   COUNTER     -> how many visits, each day",
                defaultValue: 40,
                kind: .range(
                    min: 5,
                    max: 60,
                    step: 5,
                    unit: "visits",
                    codeTemplate: "//   COUNTER     -> %d beam crossings logged today"
                )
            ),
            ArduinoParam(
                id: "cameraConfirmed",
                label: "Distinct birds photographed",
                partFragment: "camera trap",
                codeTarget: "//   CAMERA      -> who the visitors were",
                defaultValue: 6,
                kind: .range(
                    min: 1,
                    max: 20,
                    step: 1,
                    unit: "birds",
                    codeTemplate: "//   CAMERA      -> %d distinct birds on microSD"
                )
            )
        ],
        steps: [
            "Pick ONE question you can actually answer with counts, photos and weather lines. Write it in the notebook with your prediction before you start.",
            "Deploy all three gadgets at one feeder. Photograph your setup so future-you knows exactly what 'the station' was.",
            "Every day: swap or charge batteries (and check the logger is still cabled and printing), note the counter total, glance at the weather log, write three lines in the notebook. Ritual beats memory.",
            "At week's end, build an evidence board: best photos, the count chart, the weather graph. Write your verdict — claim, evidence, and what would change your mind."
        ],
        code: """
        // No new code: your three missions run side by side.
        // Your job this week is the detective work around them:
        //
        //   QUESTION    -> write it + your prediction FIRST
        //   COUNTER     -> how many visits, each day
        //   CAMERA      -> who the visitors were
        //   LOGGER      -> light + temperature at those times
        //   NOTEBOOK    -> daily 3 lines: what changed, what broke
        //   VERDICT     -> claim + evidence + what would change it
        """,
        codeWalkthrough: [
            "QUESTION locks in your hypothesis before data collection so you cannot move the goalposts later.",
            "COUNTER (Mission 07) gives quantitative crossing timestamps on Pin 3.",
            "CAMERA (Mission 06) and LOGGER (Mission 08) cross-check species identity against dawn light and temperature.",
            "VERDICT states your claim, cites the evidence board, and names what observation would change your mind."
        ],
        notice: [
            "When the counter says 40 and the camera shows 6 birds, believe both — then explain the gap. Disagreement between instruments is where the learning lives.",
            "Something will break: a flat battery, a soaked box, a squirrel re-arranging your beam. Log it. Failure notes are data, not shame.",
            "A prediction written before the data arrives is what separates investigating from story-telling."
        ],
        challenge: "Present your evidence board to your family in three minutes: the question, the best photo, one chart, and your verdict. Answer one hard question from the audience without bluffing — 'I don't know yet' is a professional answer.",
        safety: "All previous rules apply, doubled: grown-up aware of the whole setup, batteries only outdoors, birds' comfort first, and take everything down kindly at the end, leaving the feeder clean and stocked.",
        links: [
            ArduinoLink(title: "Camera trap build to revisit", detail: "Random Nerd Tutorials · ESP32-CAM motion photos", urlString: "https://randomnerdtutorials.com/esp32-cam-pir-motion-detector-photo-capture/", isVideo: false),
            ArduinoLink(title: "Watch: ESP32-CAM complete guide", detail: "DroneBot Workshop · YouTube", urlString: "https://www.youtube.com/watch?v=visj0KE5VtY", isVideo: true)
        ]
    )

    static var allMissions: [ArduinoMission] {
        [foundation] + spyMissions + natureMissions + [capstone]
    }

    static func missions(for track: ArduinoTrack) -> [ArduinoMission] {
        allMissions.filter { $0.track == track }
    }
}
