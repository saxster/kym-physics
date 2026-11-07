import Foundation

// MARK: - LearnHarness Tool-Content & LaTeX Control-Character Recovery

enum MathDisplayRecovery {
    /// Port of LearnHarness's display-time math & tool-content sanitizer (`docs/tool-content-recovery.md`):
    /// Recovers JSON-swallowed control characters (`\t` + `ext` -> `\text`, `\t` + `heta` -> `\theta`,
    /// `\t` + `au` -> `\tau`, `\t` + `imes` -> `\times`, `\t` + `o` -> `\to`, `\n` + `u` -> `\nu`,
    /// `\n` + `abla` -> `\nabla`, `\r` + `ho` -> `\rho`, `\f` + `rac` -> `\frac`, `\b` + `eta` -> `\beta`)
    /// and collapses over-escaped double backslashes inside math spans while leaving fenced/inline code untouched.
    static func repairForDisplay(_ raw: String) -> String {
        guard !raw.isEmpty else { return raw }

        // Split by fenced or inline code backticks so code literals remain untouched
        var output = ""
        var index = raw.startIndex
        while index < raw.endIndex {
            if raw[index] == "`" {
                let tickStart = index
                var tickEnd = index
                while tickEnd < raw.endIndex && raw[tickEnd] == "`" {
                    tickEnd = raw.index(after: tickEnd)
                }
                let fence = String(raw[tickStart..<tickEnd])
                if let closeRange = raw.range(of: fence, range: tickEnd..<raw.endIndex) {
                    output.append(contentsOf: raw[tickStart..<closeRange.upperBound])
                    index = closeRange.upperBound
                    continue
                }
            }

            let nextTick = raw[index..<raw.endIndex].firstIndex(of: "`") ?? raw.endIndex
            let segment = String(raw[index..<nextTick])
            output.append(repairNonCodeSegment(segment))
            index = nextTick
        }
        return output
    }

    private static func repairNonCodeSegment(_ text: String) -> String {
        var s = text

        // 1. Recover control characters produced when JSON.parse swallows single-backslash TeX commands
        let controlRecoveries: [(target: String, replacement: String)] = [
            ("\u{0009}ext{", "\\text{"),
            ("\u{0009}extbf{", "\\textbf{"),
            ("\u{0009}extit{", "\\textit{"),
            ("\u{0009}heta", "\\theta"),
            ("\u{0009}au", "\\tau"),
            ("\u{0009}imes", "\\times"),
            ("\u{0009}riangle", "\\triangle"),
            ("\u{0009}o ", "\\to "),
            ("\u{000C}rac{", "\\frac{"),
            ("\u{0008}eta", "\\beta"),
            ("\u{0008}ar{", "\\bar{"),
            ("\u{000D}ho", "\\rho"),
            ("\u{000D}ightarrow", "\\rightarrow"),
            ("\u{000A}abla", "\\nabla"),
            ("\u{000A}eq", "\\neq")
        ]

        for item in controlRecoveries {
            s = s.replacingOccurrences(of: item.target, with: item.replacement)
        }

        // Recover \nu only when followed by a non-letter or math delimiter so normal newlines before "number" aren't touched
        s = s.replacingOccurrences(
            of: "\u{000A}u(?=[^a-zA-Z]|$)",
            with: "\\\\nu",
            options: .regularExpression
        )

        // 2. Collapse over-escaped double backslashes before known physics TeX commands
        let texCommands = [
            "frac", "text", "textbf", "sqrt", "Delta", "theta", "tau", "times",
            "rho", "nu", "nabla", "rightarrow", "Rightarrow", "cdot", "approx", "Omega", "mu", "lambda"
        ]
        for cmd in texCommands {
            s = s.replacingOccurrences(of: "\\\\\(cmd)", with: "\\\(cmd)")
        }

        return s
    }
}
