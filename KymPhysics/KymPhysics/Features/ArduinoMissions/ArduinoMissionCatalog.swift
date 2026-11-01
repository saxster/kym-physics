import Foundation

enum ArduinoMissionCatalog {
    /// One shared checklist for every mission: "nothing happens" is where
    /// beginners quit, so the rescue steps sit on every mission page.
    static let troubleshooting: [String] = [
        "Nothing lights at all? Unplug, then trace the loop with a finger: 5V → parts → GND. One loose wire stops everything.",
        "Upload fails? Check Tools → Board says Arduino Uno and Tools → Port names your board. Unplug anything on pins 0 and 1 while uploading.",
        "LED dead but code uploaded? LEDs are one-way: long leg towards the pin through the resistor, short leg to GND.",
        "Serial Monitor shows gibberish or nothing? Set its speed to 9600 baud to match Serial.begin(9600) in the code.",
        "Sensor numbers look mad? Print the raw reading, wiggle one wire at a time, and change ONE thing between tests — that is debugging, not guessing.",
        "Still stuck after 15 minutes? Rebuild the circuit from the first step on a fresh part of the breadboard. Professionals do this too."
    ]

    static let agentRules: [String] = [
        "Protect your own things. Alarms guard your diary box, your drawer, your den — never someone else's private space.",
        "Never record, photograph or listen to a person who has not agreed. A real agent asks first.",
        "Animals are not suspects. Watch birds without touching nests, eggs or chicks, and keep feeders clean.",
        "Low voltage only: USB or battery power for every mission here. Nothing in this course plugs into the wall."
    ]

    static let starterKit: [String] = [
        "Arduino Uno (or compatible) + USB cable",
        "Solderless breadboard + jumper wires",
        "LEDs, 220Ω and 10kΩ resistors, push-buttons",
        "PIR motion sensor (HC-SR501) + piezo buzzer",
        "Light sensor (LDR) + a small torch",
        "Ultrasonic distance sensor (HC-SR04) + micro servo (SG90)",
        "For nature missions: IR break-beam pair, DHT11 sensor, ESP32-CAM (with a grown-up)"
    ]

    static let foundation = ArduinoMission(
        missionID: .firstLight,
        track: .foundation,
        number: "Training 01",
        title: "First Light: wake the Arduino",
        hook: "Every agent starts here. You will make a tiny computer blink on your command — the same trick hiding inside traffic lights, washing machines and space probes.",
        conceptTitle: "A circuit is a loop, and code is the switch",
        concept: "Electricity only flows around a complete loop: out of the power pin, through your parts, back to GND (ground). Break the loop anywhere and everything stops. Voltage is the push (Arduino pushes with 5 volts), current is how much flows, and a resistor is a narrow gate that keeps the flow safe for a delicate LED. Your code is a tireless finger on a switch: setup() runs once to get ready, loop() repeats forever.",
        symbol: "lightbulb",
        visualKind: "blink",
        visualAlt: "Diagram: an Arduino board connected in a loop to a resistor and a glowing LED, with arrows showing electricity flowing out and back to ground.",
        minutes: "20 min",
        level: "Start here",
        needsAdultSetup: false,
        parts: [
            "Arduino Uno + USB cable",
            "1 LED",
            "1 resistor, 220Ω (red-red-brown bands)",
            "Breadboard + 2 jumper wires"
        ],
        wiring: [
            ArduinoPinConnection(pin: "D13", wireTone: .signal, connectsTo: "220Ω resistor -> LED long leg (+)", purpose: "Pushes 5V HIGH when switched on"),
            ArduinoPinConnection(pin: "LED (-)", wireTone: .pwm, connectsTo: "Short leg -> GND rail", purpose: "One-way diode path to ground"),
            ArduinoPinConnection(pin: "GND", wireTone: .ground, connectsTo: "Breadboard negative (-) rail", purpose: "Closes the 0V return loop")
        ],
        specs: [
            ArduinoSpec(label: "Pin voltage", value: "5V HIGH / 0V LOW"),
            ArduinoSpec(label: "LED drop", value: "~2.0V (red)"),
            ArduinoSpec(label: "Resistor", value: "220Ω (red-red-brown)"),
            ArduinoSpec(label: "Safe current", value: "~14 mA")
        ],
        params: [
            ArduinoParam(
                id: "resistor",
                label: "Current-limiting resistor",
                partFragment: "resistor",
                codeTarget: "pinMode(13, OUTPUT);        // pin 13 will push power out",
                defaultValue: 220,
                kind: .choices([
                    ArduinoParamChoice(
                        label: "220Ω",
                        value: 220,
                        codeReplacement: "pinMode(13, OUTPUT);        // pin 13 -> 220Ω (~14 mA bright)",
                        summary: "Bright ~14 mA glow"
                    ),
                    ArduinoParamChoice(
                        label: "1kΩ",
                        value: 1_000,
                        codeReplacement: "pinMode(13, OUTPUT);        // pin 13 -> 1kΩ (~3 mA soft)",
                        summary: "Soft ~3 mA glow"
                    ),
                    ArduinoParamChoice(
                        label: "10kΩ",
                        value: 10_000,
                        codeReplacement: "pinMode(13, OUTPUT);        // pin 13 -> 10kΩ (~0.3 mA faint)",
                        summary: "Faint ~0.3 mA glow"
                    )
                ])
            ),
            ArduinoParam(
                id: "delayMs",
                label: "Blink pause (delay)",
                partFragment: "LED",
                codeTarget: "delay(1000);                // wait 1 second",
                defaultValue: 1_000,
                kind: .range(
                    min: 100,
                    max: 1_000,
                    step: 100,
                    unit: "ms",
                    codeTemplate: "delay(%d);                // wait %d ms"
                )
            )
        ],
        steps: [
            "Plug the LED into the breadboard. The long leg is the positive side — it only lights one way round.",
            "Connect Arduino pin 13 → 220Ω resistor → long LED leg. Then short LED leg → GND. That closes the loop.",
            "Open the Arduino app, paste the code below, choose your board and port, and press Upload.",
            "Watch it blink. Now change the two delay numbers and upload again — you just reprogrammed a machine."
        ],
        code: """
        void setup() {
          pinMode(13, OUTPUT);        // pin 13 will push power out
        }

        void loop() {
          digitalWrite(13, HIGH);     // switch ON (5 volts)
          delay(1000);                // wait 1 second
          digitalWrite(13, LOW);      // switch OFF
          delay(1000);
        }
        """,
        codeWalkthrough: [
            "pinMode(13, OUTPUT) configures digital pin 13 so the ATmega328P can push 5V out to your breadboard.",
            "digitalWrite(13, HIGH) connects pin 13 to 5V, sending ~14 mA through the 220Ω resistor and LED.",
            "delay(1000) pauses the microcontroller for 1,000 milliseconds (1 second) while the LED stays lit.",
            "digitalWrite(13, LOW) drops pin 13 back to 0V so the LED turns off for the second pause."
        ],
        notice: [
            "No resistor means too much current — the LED can burn out. The resistor is not decoration.",
            "Swap the LED legs and nothing lights. LEDs are one-way streets for electricity.",
            "delay(100) blinks ten times a second. Your eyes start to see it as 'always on, but dimmer' — that illusion runs every phone screen."
        ],
        challenge: "Blink SOS in Morse: three short flashes, three long, three short. You only need delay() and patience.",
        safety: "USB power only. If anything feels hot or smells odd, unplug first and check your loop — heat means a short circuit.",
        links: [
            ArduinoLink(title: "Blink — the official first example", detail: "Arduino Docs · read and build", urlString: "https://docs.arduino.cc/built-in-examples/basics/Blink/", isVideo: false),
            ArduinoLink(title: "Practise in a virtual lab first", detail: "Tinkercad Circuits · free simulator, nothing can burn out", urlString: "https://www.tinkercad.com/circuits", isVideo: false),
            ArduinoLink(title: "Meet the Uno board, pin by pin", detail: "Arduino Docs · hardware tour", urlString: "https://docs.arduino.cc/hardware/uno-rev3/", isVideo: false)
        ]
    )

    static let spyMissions: [ArduinoMission] = [
        ArduinoMission(
            missionID: .morseLamp,
            track: .spyGadget,
            number: "Mission 01",
            title: "The Secret Signal Lamp",
            hook: "Flash coded messages across a dark room to a fellow agent. Ships, spies and lighthouse keepers all did exactly this — yours will decode itself on screen.",
            conceptTitle: "Inputs listen, outputs act",
            concept: "Pins have jobs. An OUTPUT pin pushes voltage out (your lamp). An INPUT pin listens: is the voltage HIGH (near 5V) or LOW (near 0V)? A button is just a bridge you open and close with your finger. Morse code turns time into letters — short press dot, long press dash — so your code measures how long the bridge stays closed. That is all 'digital' means: the world, sorted into ON and OFF.",
            symbol: "flashlight.on.fill",
            visualKind: "morse",
            visualAlt: "Diagram: a finger pressing a button wired to an Arduino, which flashes a lamp in dots and dashes across to a second agent.",
            minutes: "30 min",
            level: "Easy",
            needsAdultSetup: false,
            parts: [
                "Arduino Uno",
                "Push-button",
                "LED + 220Ω resistor",
                "Buzzer (optional, for sound)",
                "Breadboard + wires"
            ],
            wiring: [
                ArduinoPinConnection(pin: "D2", wireTone: .signal, connectsTo: "Push-button leg A (INPUT_PULLUP)", purpose: "Holds 5V HIGH at rest; drops to 0V LOW when pressed"),
                ArduinoPinConnection(pin: "D13", wireTone: .signal, connectsTo: "LED long leg (+) via 220Ω", purpose: "Flashes signal lamp while button is held"),
                ArduinoPinConnection(pin: "D9", wireTone: .pwm, connectsTo: "Optional piezo buzzer (+)", purpose: "Plays 880 Hz telegraph tone alongside lamp"),
                ArduinoPinConnection(pin: "GND", wireTone: .ground, connectsTo: "Button leg B & LED short leg (-)", purpose: "Common ground return")
            ],
            specs: [
                ArduinoSpec(label: "Input mode", value: "INPUT_PULLUP"),
                ArduinoSpec(label: "Dot cutoff", value: "< 250 ms"),
                ArduinoSpec(label: "Timer clock", value: "millis() ms"),
                ArduinoSpec(label: "Serial speed", value: "9600 baud")
            ],
            params: [
                ArduinoParam(
                    id: "holdMs",
                    label: "Dot / dash cutoff threshold",
                    partFragment: "Push-button",
                    codeTarget: "Serial.print(held < 250 ? \".\" : \"-\");",
                    defaultValue: 250,
                    kind: .range(
                        min: 100,
                        max: 500,
                        step: 50,
                        unit: "ms",
                        codeTemplate: "Serial.print(held < %d ? \".\" : \"-\");"
                    )
                ),
                ArduinoParam(
                    id: "pitchHz",
                    label: "Optional buzzer tone pitch",
                    partFragment: "Buzzer",
                    codeTarget: "const int lampPin = 13;",
                    defaultValue: 880,
                    kind: .choices([
                        ArduinoParamChoice(
                            label: "660 Hz",
                            value: 660,
                            codeReplacement: "const int lampPin = 13; // + optional 660 Hz buzzer",
                            summary: "Warm E5 telegraph tone"
                        ),
                        ArduinoParamChoice(
                            label: "880 Hz",
                            value: 880,
                            codeReplacement: "const int lampPin = 13;",
                            summary: "Classic A5 telegraph tone"
                        ),
                        ArduinoParamChoice(
                            label: "1200 Hz",
                            value: 1_200,
                            codeReplacement: "const int lampPin = 13; // + optional 1200 Hz buzzer",
                            summary: "Crisp high beacon tone"
                        )
                    ])
                )
            ],
            steps: [
                "Wire the button between pin 2 and GND. In code use INPUT_PULLUP — a built-in resistor holds the pin HIGH until the button pulls it LOW.",
                "Wire the LED on pin 13 as in First Light.",
                "Upload the code. Press and hold: the lamp lights while you hold, and the Serial Monitor prints dots and dashes.",
                "Signal your name. A = ·−, B = −···, S = ···, O = −−−. Leave a gap between letters."
            ],
            code: """
            const int buttonPin = 2;
            const int lampPin = 13;
            unsigned long pressedAt = 0;

            void setup() {
              pinMode(buttonPin, INPUT_PULLUP);
              pinMode(lampPin, OUTPUT);
              Serial.begin(9600);
            }
            void loop() {
              bool pressed = digitalRead(buttonPin) == LOW;
              digitalWrite(lampPin, pressed ? HIGH : LOW);
              if (pressed && pressedAt == 0) pressedAt = millis();
              if (!pressed && pressedAt != 0) {
                unsigned long held = millis() - pressedAt;
                Serial.print(held < 250 ? "." : "-");
                pressedAt = 0;
              }
            }
            """,
            codeWalkthrough: [
                "pinMode(buttonPin, INPUT_PULLUP) activates the internal pull-up resistor so pin 2 stays HIGH until pressed.",
                "bool pressed = digitalRead(buttonPin) == LOW detects when the button bridges pin 2 to ground.",
                "if (pressed && pressedAt == 0) pressedAt = millis() records the exact millisecond the press began.",
                "unsigned long held = millis() - pressedAt measures the hold time and prints '.' or '-' to Serial Monitor."
            ],
            notice: [
                "millis() is a stopwatch that starts when the Arduino wakes. Timers beat delay() because the board can keep listening.",
                "INPUT_PULLUP feels backwards — pressed means LOW. Real engineers grumble about this too, then write a comment.",
                "Your eye needs the gaps as much as the flashes. Codes live in the silences between signals."
            ],
            challenge: "Two-agent mode: one agent sends, the other writes down dots and dashes without seeing the sender's screen. Decode, then swap. How fast can you go before errors creep in?",
            safety: "Signal only to people who are playing along, and never flash lights at traffic, drivers or aircraft.",
            links: [
                ArduinoLink(title: "Blink — the official first example", detail: "Arduino Docs · the lamp half of this build", urlString: "https://docs.arduino.cc/built-in-examples/basics/Blink/", isVideo: false),
                ArduinoLink(title: "Try the button circuit virtually", detail: "Tinkercad Circuits · simulate before you wire", urlString: "https://www.tinkercad.com/circuits", isVideo: false)
            ]
        ),
        ArduinoMission(
            missionID: .diaryAlarm,
            track: .spyGadget,
            number: "Mission 02",
            title: "The Diary-Box Intruder Alarm",
            hook: "Someone keeps peeking in your treasure box. Build a silent guard that senses body heat moving nearby and sounds the alarm — no camera, no recording, just a warning.",
            conceptTitle: "Sensors turn the world into voltages",
            concept: "A PIR sensor watches infrared light — the invisible heat-glow every warm body gives off. When that pattern changes (a warm human moves), the sensor's OUT pin jumps to HIGH. Your Arduino does not 'see' anything; it just reads that one pin, thousands of times a second, and decides. Every gadget in this course works this way: sense something physical, turn it into a voltage, let code decide.",
            symbol: "eye",
            visualKind: "pir",
            visualAlt: "Diagram: a PIR motion sensor with a wide detection fan, guarding a closed treasure box, wired to an Arduino and a buzzer.",
            minutes: "30 min",
            level: "Easy",
            needsAdultSetup: false,
            parts: [
                "Arduino Uno",
                "PIR motion sensor (HC-SR501)",
                "Piezo buzzer",
                "Red LED + 220Ω resistor",
                "Breadboard + wires"
            ],
            wiring: [
                ArduinoPinConnection(pin: "5V / GND", wireTone: .power, connectsTo: "PIR sensor VCC & GND", purpose: "Powers infrared pyroelectric dome"),
                ArduinoPinConnection(pin: "D2", wireTone: .signal, connectsTo: "PIR sensor OUT pin", purpose: "Jumps HIGH when warm movement crosses zone"),
                ArduinoPinConnection(pin: "D8", wireTone: .pwm, connectsTo: "Piezo buzzer (+) leg", purpose: "Plays 300 ms warning chirp"),
                ArduinoPinConnection(pin: "D13", wireTone: .signal, connectsTo: "Red LED (+) via 220Ω", purpose: "Lights warning lamp on movement")
            ],
            specs: [
                ArduinoSpec(label: "Sensor type", value: "PIR (HC-SR501)"),
                ArduinoSpec(label: "Settle delay", value: "30,000 ms (30s)"),
                ArduinoSpec(label: "Buzzer pin", value: "Pin 8 (1200 Hz)"),
                ArduinoSpec(label: "Serial log", value: "9600 baud")
            ],
            params: [
                ArduinoParam(
                    id: "motionState",
                    label: "Simulated PIR sensor state",
                    partFragment: "PIR",
                    codeTarget: "if (digitalRead(pirPin) == HIGH) {",
                    defaultValue: 0,
                    kind: .choices([
                        ArduinoParamChoice(
                            label: "Box quiet (LOW)",
                            value: 0,
                            codeReplacement: "if (digitalRead(pirPin) == HIGH) {",
                            summary: "No heat change -> lamp off"
                        ),
                        ArduinoParamChoice(
                            label: "Warm hand moves (HIGH)",
                            value: 1,
                            codeReplacement: "if (digitalRead(pirPin) == HIGH) { // HIGH: warm motion detected",
                            summary: "PIR jumps HIGH -> lamp + chirp"
                        )
                    ])
                ),
                ArduinoParam(
                    id: "alarmHz",
                    label: "Warning chirp frequency",
                    partFragment: "buzzer",
                    codeTarget: "tone(buzzerPin, 1200, 300);   // chirp!",
                    defaultValue: 1_200,
                    kind: .choices([
                        ArduinoParamChoice(
                            label: "900 Hz",
                            value: 900,
                            codeReplacement: "tone(buzzerPin, 900, 300);    // low chirp",
                            summary: "Low warning tone"
                        ),
                        ArduinoParamChoice(
                            label: "1200 Hz",
                            value: 1_200,
                            codeReplacement: "tone(buzzerPin, 1200, 300);   // chirp!",
                            summary: "Standard 1200 Hz chirp"
                        ),
                        ArduinoParamChoice(
                            label: "1600 Hz",
                            value: 1_600,
                            codeReplacement: "tone(buzzerPin, 1600, 300);   // high chirp",
                            summary: "High alert chirp"
                        )
                    ])
                )
            ],
            steps: [
                "PIR wiring: VCC → 5V, GND → GND, OUT → pin 2. Buzzer + → pin 8, buzzer − → GND. LED on pin 13.",
                "Upload the code, then sit very still for 30 seconds — the PIR needs a calm moment to learn what 'nobody here' looks like.",
                "Wave a hand. Lamp on, buzzer chirps, and the Serial Monitor logs the time of the visit.",
                "Hide the gadget facing your box (not a doorway people use) and run the wire so it cannot trip anyone."
            ],
            code: """
            const int pirPin = 2;
            const int buzzerPin = 8;
            const int lampPin = 13;

            void setup() {
              pinMode(pirPin, INPUT);
              pinMode(buzzerPin, OUTPUT);
              pinMode(lampPin, OUTPUT);
              Serial.begin(9600);
              Serial.println("Guard waking up... keep still");
              delay(30000);               // let the PIR settle
              Serial.println("Guard on duty.");
            }
            void loop() {
              if (digitalRead(pirPin) == HIGH) {
                digitalWrite(lampPin, HIGH);
                tone(buzzerPin, 1200, 300);   // chirp!
                Serial.print("Movement near the box at ");
                Serial.print(millis() / 1000);
                Serial.println(" seconds");
                delay(1000);
              } else {
                digitalWrite(lampPin, LOW);
              }
            }
            """,
            codeWalkthrough: [
                "delay(30000) in setup() waits 30 seconds while the PIR sensor learns the room's background infrared warmth.",
                "if (digitalRead(pirPin) == HIGH) checks pin 2 for the 3.3V signal when a warm hand moves across the dome.",
                "tone(buzzerPin, 1200, 300) flips pin 8 at 1,200 Hz for 300 milliseconds to sound a crisp warning chirp.",
                "Serial.print(millis() / 1000) logs the exact second the visit happened to your computer."
            ],
            notice: [
                "The PIR sees changes in heat, not movement itself — a radiator switching on can fool it. Good agents test for false alarms.",
                "Two tiny orange dials on the sensor tune sensitivity and how long it stays HIGH. Hardware has settings too.",
                "tone() makes sound by flipping a pin thousands of times a second. Pitch is just flipping speed."
            ],
            challenge: "Silent mode: replace the buzzer with an LED hidden where only you can see it. Count 'visits' in a variable and print the total. When is your box most at risk — and is the cat the culprit?",
            safety: "Guard your own box in your own space, and tell your family it exists. The mission is a warning light, never a trap or a recording of people.",
            links: [
                ArduinoLink(title: "Watch: PIR Sensor Arduino Alarm", detail: "Make: Weekend Projects · YouTube build-along, no soldering", urlString: "https://www.youtube.com/watch?v=eVyrnPC2wPo", isVideo: true),
                ArduinoLink(title: "Watch: a motion alarm in action", detail: "YouTube · short beginner build", urlString: "https://www.youtube.com/watch?v=UrypakqaIhY", isVideo: true)
            ]
        ),
        beamGuardMission,
        sonarSweepMission,
        truthMeterMission
    ]

    static let visitorCounterMission = ArduinoMission(
        missionID: .visitorCounter,
        track: .natureWatch,
        number: "Mission 07",
        title: "Feeder Visitor Counter",
        hook: "How many times do birds land on your feeder in a day — ten, or two hundred? Stretch an invisible beam across the perch so every landing ticks the counter up by one.",
        conceptTitle: "State change: count the edge, not the stay",
        concept: "If a robin sits in the beam for three seconds and your loop runs a thousand times a second, a naive program counts 3,000 robins. Instead, your code remembers what the beam was doing last time round (wasBroken) and only adds one at the exact moment it changes from clear to broken. Engineers call that moment an edge — the difference between 'is broken' and 'just broke'.",
        symbol: "number",
        visualKind: "counter",
        visualAlt: "Diagram: an invisible infrared beam across a feeder perch; a landing bird breaks the beam once and the counter ticks from 11 to 12.",
        minutes: "40 min",
        level: "Medium",
        needsAdultSetup: false,
        parts: [
            "Arduino Uno",
            "IR break-beam sensor pair (3mm or 5mm)",
            "Optional: the LDR + torch from Mission 03 instead",
            "Breadboard + wires",
            "Notebook for hourly tallies"
        ],
        wiring: [
            ArduinoPinConnection(pin: "5V / GND", wireTone: .power, connectsTo: "IR emitter & receiver red/black leads", purpose: "Powers invisible break-beam pair across perch"),
            ArduinoPinConnection(pin: "D3", wireTone: .signal, connectsTo: "IR receiver signal wire (INPUT_PULLUP)", purpose: "Drops LOW when a landing bird breaks the beam"),
            ArduinoPinConnection(pin: "USB", wireTone: .secondary, connectsTo: "Serial Monitor (9600 baud)", purpose: "Prints visit number and timestamp in seconds")
        ],
        specs: [
            ArduinoSpec(label: "Counting rule", value: "Falling-edge detect"),
            ArduinoSpec(label: "Signal pin", value: "Pin 3 (INPUT_PULLUP)"),
            ArduinoSpec(label: "Edge formula", value: "broken && !wasBroken"),
            ArduinoSpec(label: "Clock unit", value: "millis() / 1000 s")
        ],
        params: [
            ArduinoParam(
                id: "beamState",
                label: "Perch break-beam state",
                partFragment: "IR break-beam",
                codeTarget: "bool broken = digitalRead(beamPin) == LOW;",
                defaultValue: 1,
                kind: .choices([
                    ArduinoParamChoice(
                        label: "Perch clear (HIGH)",
                        value: 0,
                        codeReplacement: "bool broken = digitalRead(beamPin) == LOW; // clear",
                        summary: "Beam unbroken -> waiting for next bird"
                    ),
                    ArduinoParamChoice(
                        label: "Robin lands (LOW)",
                        value: 1,
                        codeReplacement: "bool broken = digitalRead(beamPin) == LOW;",
                        summary: "Falling edge -> visits++ once"
                    )
                ])
            ),
            ArduinoParam(
                id: "debounceSec",
                label: "Bouncy-landing settle rule",
                partFragment: "Notebook",
                codeTarget: "Serial.println(millis() / 1000);",
                defaultValue: 0,
                kind: .choices([
                    ArduinoParamChoice(
                        label: "Instant (0s)",
                        value: 0,
                        codeReplacement: "Serial.println(millis() / 1000);",
                        summary: "Counts every clean break immediately"
                    ),
                    ArduinoParamChoice(
                        label: "Debounce (2s)",
                        value: 2,
                        codeReplacement: "Serial.println(millis() / 1000); delay(2000);",
                        summary: "Ignores wing-flutter bounces for 2 seconds"
                    )
                ])
            )
        ],
        steps: [
            "Wire the receiver: red → 5V, black → GND, white/yellow signal → pin 3. Power the emitter from 5V and GND. (With the LDR version, reuse Mission 03's divider on A0.)",
            "Upload the code and break the beam with a finger: the count rises once per break, not hundreds of times.",
            "Line the pair up across the feeder entrance so a landing bird must cross it. Shade the receiver from bright sun.",
            "Every hour you can, copy the count into your notebook and reset. A week of hours becomes a bar chart of bird rush-hours."
        ],
        code: """
        const int beamPin = 3;
        int visits = 0;
        bool wasBroken = false;

        void setup() {
          pinMode(beamPin, INPUT_PULLUP);
          Serial.begin(9600);
        }
        void loop() {
          bool broken = digitalRead(beamPin) == LOW;
          if (broken && !wasBroken) {     // the EDGE: just broke
            visits++;
            Serial.print("Visit number ");
            Serial.print(visits);
            Serial.print(" at second ");
            Serial.println(millis() / 1000);
          }
          wasBroken = broken;             // remember for next loop
        }
        """,
        codeWalkthrough: [
            "pinMode(beamPin, INPUT_PULLUP) holds pin 3 HIGH while the IR beam shines clearly across the perch.",
            "bool broken = digitalRead(beamPin) == LOW spots when a bird blocks the receiver.",
            "if (broken && !wasBroken) triggers only on the falling edge so a 3-second stay counts as 1 visit.",
            "wasBroken = broken remembers the state for the next pass through loop()."
        ],
        notice: [
            "'Just changed' is more useful than 'currently is' for almost every sensor. Buttons, beams, alarms — edges everywhere.",
            "One bouncy landing can break the beam three times in a second. Add a rule: ignore new breaks for 2 seconds after a count. Scientists call this debouncing their data.",
            "Counts are anonymous: 40 visits could be 40 birds or one very hungry regular. Pair this with Mission 06 photos to find out."
        ],
        challenge: "Print a mini bar chart in the Serial Monitor every 10 visits using '#' characters. Then test a prediction: 'mornings are busiest' — collect three days of counts and say whether the evidence agrees.",
        safety: "Mount beams where birds already come and go; never block a nest entrance or make birds squeeze past wires. If visitors stay away, move the gadget — the birds' comfort outranks your data.",
        links: [
            ArduinoLink(title: "Prototype counting logic virtually", detail: "Tinkercad Circuits · use a button as a pretend beam", urlString: "https://www.tinkercad.com/circuits", isVideo: false),
            ArduinoLink(title: "Camera-trap partner build", detail: "Random Nerd Tutorials · pair counts with photos", urlString: "https://randomnerdtutorials.com/esp32-cam-pir-motion-detector-photo-capture/", isVideo: false)
        ]
    )

    static let dawnLoggerMission = ArduinoMission(
        missionID: .dawnLogger,
        track: .natureWatch,
        number: "Mission 08",
        title: "Dawn Chorus Detective",
        hook: "Birds sing loudest at dawn — but dawn of what? Light level? Warmth? Log light and temperature all night and let the graph testify about what really wakes the garden.",
        conceptTitle: "Logging: measurements with timestamps become evidence",
        concept: "One reading is a fact; a thousand readings, each with a time, are evidence. Your logger reads an LDR (Mission 03) and a DHT11 temperature-humidity sensor every minute and prints time, light, temperature as comma-separated lines. That humble format (CSV) is how a huge share of the world's science moves around: paste it into a spreadsheet, draw the graph, and patterns leap out — streetlights, sunrise, the cold dip just before dawn.",
        symbol: "sunrise",
        visualKind: "logger",
        visualAlt: "Diagram: a garden at dawn with a small logger box, and a graph showing light rising steeply at sunrise while temperature dips, then climbs.",
        minutes: "45 min + overnight",
        level: "Medium",
        needsAdultSetup: false,
        parts: [
            "Arduino Uno",
            "LDR + 10kΩ resistor (Mission 03 divider)",
            "DHT11 temperature-humidity sensor module",
            "Long USB cable to a computer that can stay on overnight",
            "A box to keep dew off (sensor side vented)",
            "Spreadsheet app for the morning graph"
        ],
        wiring: [
            ArduinoPinConnection(pin: "5V / GND", wireTone: .power, connectsTo: "LDR divider & DHT11 + / - pins", purpose: "Powers both light and weather sensors"),
            ArduinoPinConnection(pin: "A0", wireTone: .analog, connectsTo: "LDR + 10kΩ midpoint", purpose: "Measures sky brightness (0–1023)"),
            ArduinoPinConnection(pin: "D4", wireTone: .signal, connectsTo: "DHT11 OUT data pin", purpose: "Reads digital temperature (°C) and humidity (%)")
        ],
        specs: [
            ArduinoSpec(label: "Light channel", value: "Pin A0 (0–1023)"),
            ArduinoSpec(label: "Weather sensor", value: "DHT11 on Pin 4"),
            ArduinoSpec(label: "Output format", value: "CSV (min,light,C,%)"),
            ArduinoSpec(label: "Cadence", value: "1 line / 60,000 ms")
        ],
        params: [
            ArduinoParam(
                id: "dawnMinute",
                label: "Simulated minutes around sunrise",
                partFragment: "LDR",
                codeTarget: "int light = analogRead(ldrPin);",
                defaultValue: 30,
                kind: .range(
                    min: 0,
                    max: 60,
                    step: 10,
                    unit: "min",
                    codeTemplate: "int light = analogRead(ldrPin); // minute +%d sample"
                )
            ),
            ArduinoParam(
                id: "sampleInterval",
                label: "Logging interval",
                partFragment: "DHT11",
                codeTarget: "delay(60000);                     // one line a minute",
                defaultValue: 60_000,
                kind: .choices([
                    ArduinoParamChoice(
                        label: "10s test",
                        value: 10_000,
                        codeReplacement: "delay(10000);                     // fast 10s bench test",
                        summary: "Quick indoor bench test"
                    ),
                    ArduinoParamChoice(
                        label: "60s overnight",
                        value: 60_000,
                        codeReplacement: "delay(60000);                     // one line a minute",
                        summary: "Standard 1-minute overnight CSV log"
                    )
                ])
            )
        ],
        steps: [
            "Build the Mission 03 light divider on A0. Wire the DHT11 module: + → 5V, − → GND, OUT → pin 4. Install the 'DHT sensor library' via the Arduino Library Manager.",
            "Upload the logger. Watch a few lines print: minutes since start, light 0–1023, temperature. Breathe on the DHT11 — humidity and temperature should react.",
            "Before bed, set the logger on a windowsill or sheltered spot just outside, in its dew-proof box, still plugged into the computer by the long USB cable. Keep the Serial Monitor open and the computer stays awake all night (a grown-up can check its sleep settings) — Serial lines only exist while a computer is listening, so a battery pack alone would print to nobody. Write down the real time you started it.",
            "In the morning, copy the Serial Monitor output into a spreadsheet, chart light and temperature against time, and mark when you first heard birdsong. What lines up? (Want true outdoor freedom later? A microSD card module lets the logger save lines itself — that is your upgrade path, in the challenge.)"
        ],
        code: """
        #include <DHT.h>
        DHT dht(4, DHT11);
        const int ldrPin = A0;

        void setup() {
          Serial.begin(9600);
          dht.begin();
          Serial.println("minute,light,tempC,humidity");
        }
        void loop() {
          int light = analogRead(ldrPin);
          float temp = dht.readTemperature();
          float hum = dht.readHumidity();
          Serial.print(millis() / 60000);   // minutes since start
          Serial.print(",");
          Serial.print(light);
          Serial.print(",");
          Serial.print(temp);
          Serial.print(",");
          Serial.println(hum);
          delay(60000);                     // one line a minute
        }
        """,
        codeWalkthrough: [
            "DHT dht(4, DHT11) sets up the digital temperature and humidity sensor on pin 4.",
            "Serial.println(\"minute,light,tempC,humidity\") prints the CSV header row once in setup().",
            "analogRead(ldrPin) and dht.readTemperature() sample sky brightness and air temperature together.",
            "delay(60000) spaces measurements by one minute all night for clean spreadsheet graphing."
        ],
        notice: [
            "The header line (minute,light,tempC…) is what turns numbers into data another program can understand. Labels are kindness to future-you.",
            "Temperature usually keeps falling until just after sunrise — the coldest moment is early light, not midnight. Check your graph.",
            "Correlation is not cause: light and birdsong rise together, but temperature, light and hunger all change at once. Honest graphs, careful claims."
        ],
        challenge: "Log three nights: clear, cloudy, rainy. Does dawn 'arrive' later under cloud? Define dawn as light > 200 and compare your three times. One sentence of claim, one graph of evidence. Upgrade, with a grown-up: add a microSD card module so the logger saves each line to a card and can live anywhere on a battery pack.",
        safety: "Battery pack outdoors, box sealed against dew and rain, cables where nobody trips. Bring everything in during storms.",
        links: [
            ArduinoLink(title: "Blink — refresh the basics", detail: "Arduino Docs · the loop your logger lives in", urlString: "https://docs.arduino.cc/built-in-examples/basics/Blink/", isVideo: false),
            ArduinoLink(title: "Prototype sensors virtually", detail: "Tinkercad Circuits · temperature sensor included", urlString: "https://www.tinkercad.com/circuits", isVideo: false)
        ]
    )
}
