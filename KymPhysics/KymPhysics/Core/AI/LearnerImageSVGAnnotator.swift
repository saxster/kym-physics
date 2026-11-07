import Foundation

// MARK: - LearnHarness Learner-Image SVG Callout Annotator & Self-Check

struct LearnerImageCalloutAnnotation: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let label: String
    let anchorX: Double
    let anchorY: Double
    let badgeX: Double
    let badgeY: Double
    let isCorrect: Bool
    let coachingNote: String
}

struct SVGAnnotationValidationResult: Equatable, Sendable {
    let isValid: Bool
    let naturalWidth: Double
    let naturalHeight: Double
    let issues: [String]
}

enum LearnerImageSVGAnnotator {
    static let placeholderHref = "learnharness://learner-image"

    /// Generates a self-contained SVG overlay in the learner image's natural coordinate space (`0 0 W H`)
    /// with `<image href="learnharness://learner-image" width="W" height="H"/>` as the first child
    /// and high-contrast callout pins + leader lines on top.
    static func buildAnnotatedSVG(
        naturalWidth: Double,
        naturalHeight: Double,
        annotations: [LearnerImageCalloutAnnotation]
    ) -> String {
        let w = max(1, Int(naturalWidth.rounded()))
        let h = max(1, Int(naturalHeight.rounded()))

        var lines: [String] = [
            "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 \(w) \(h)\" width=\"\(w)\" height=\"\(h)\">",
            "  <image href=\"\(placeholderHref)\" x=\"0\" y=\"0\" width=\"\(w)\" height=\"\(h)\" preserveAspectRatio=\"none\"/>"
        ]

        for ann in annotations {
            let stroke = ann.isCorrect ? "#2D7D5E" : "#C44536"
            let ax = String(format: "%.1f", ann.anchorX)
            let ay = String(format: "%.1f", ann.anchorY)
            let bx = String(format: "%.1f", ann.badgeX)
            let by = String(format: "%.1f", ann.badgeY)
            let escapedLabel = escapeXML(ann.label)

            lines.append("  <g data-callout-id=\"\(escapeXML(ann.id))\">")
            lines.append("    <line x1=\"\(bx)\" y1=\"\(by)\" x2=\"\(ax)\" y2=\"\(ay)\" stroke=\"\(stroke)\" stroke-width=\"2.5\" stroke-dasharray=\"4 2\"/>")
            lines.append("    <circle cx=\"\(ax)\" cy=\"\(ay)\" r=\"6\" fill=\"\(stroke)\" stroke=\"#FFFFFF\" stroke-width=\"2\"/>")
            lines.append("    <rect x=\"\( String(format: "%.1f", max(4, ann.badgeX - 4)) )\" y=\"\( String(format: "%.1f", max(4, ann.badgeY - 16)) )\" width=\"\(max(64, escapedLabel.count * 7 + 16))\" height=\"24\" rx=\"6\" fill=\"#FFFFFF\" fill-opacity=\"0.92\" stroke=\"\(stroke)\" stroke-width=\"1.8\"/>")
            lines.append("    <text x=\"\( String(format: "%.1f", max(10, ann.badgeX + 4)) )\" y=\"\(by)\" fill=\"#1B2420\" font-family=\"system-ui, sans-serif\" font-size=\"12\" font-weight=\"700\">\(escapedLabel)</text>")
            lines.append("  </g>")
        }

        lines.append("</svg>")
        return lines.joined(separator: "\n")
    }

    /// Generates an annotated SVG directly from a `DiagramRecallPlate` and Kym's revealed callout IDs.
    static func buildPlateVerificationOverlay(
        plate: DiagramRecallPlate,
        revealedCalloutIds: Set<String>,
        canvasWidth: Double = 640
    ) -> (svg: String, annotations: [LearnerImageCalloutAnnotation], validation: SVGAnnotationValidationResult) {
        let width = max(240, canvasWidth)
        let height = max(180, (width / max(0.5, plate.aspectRatio)).rounded())

        let annotations: [LearnerImageCalloutAnnotation] = plate.callouts.map { pin in
            let ax = min(width - 12, max(12, pin.x * width))
            let ay = min(height - 12, max(12, pin.y * height))
            let bx = min(width - 140, max(12, ax + (pin.x < 0.5 ? -36 : 24)))
            let by = min(height - 16, max(22, ay + (pin.y < 0.5 ? -18 : 22)))
            let isCorrect = revealedCalloutIds.contains(pin.id)
            return LearnerImageCalloutAnnotation(
                id: pin.id,
                label: pin.label,
                anchorX: ax,
                anchorY: ay,
                badgeX: bx,
                badgeY: by,
                isCorrect: isCorrect,
                coachingNote: pin.hint
            )
        }

        let svg = buildAnnotatedSVG(
            naturalWidth: width,
            naturalHeight: height,
            annotations: annotations
        )
        let validation = validatePlacement(
            svg: svg,
            expectedWidth: width,
            expectedHeight: height,
            annotations: annotations
        )
        return (svg, annotations, validation)
    }

    /// Port of LearnHarness's `visual_maker` verify-by-looking geometry & structural contract:
    /// Ensures a single `<svg>` root with matching `viewBox="0 0 W H"`, a single `<image href="learnharness://learner-image">`
    /// child at natural dimensions, zero `<script>` tags, and all callout anchor/badge coordinates inside the canvas bounds.
    static func validatePlacement(
        svg: String,
        expectedWidth: Double,
        expectedHeight: Double,
        annotations: [LearnerImageCalloutAnnotation]
    ) -> SVGAnnotationValidationResult {
        var issues: [String] = []
        let w = max(1, Int(expectedWidth.rounded()))
        let h = max(1, Int(expectedHeight.rounded()))

        if !svg.contains("viewBox=\"0 0 \(w) \(h)\"") {
            issues.append("SVG viewBox does not match natural image dimensions (0 0 \(w) \(h)).")
        }
        let imageOccurrences = svg.components(separatedBy: "href=\"\(placeholderHref)\"").count - 1
        if imageOccurrences != 1 {
            issues.append("SVG must contain exactly 1 <image href=\"\(placeholderHref)\"> background layer (found \(imageOccurrences)).")
        }
        if svg.lowercased().contains("<script") {
            issues.append("SVG must not contain <script> elements.")
        }

        for ann in annotations {
            if ann.anchorX < 0 || ann.anchorX > expectedWidth || ann.anchorY < 0 || ann.anchorY > expectedHeight {
                issues.append("Callout '\(ann.id)' anchor (\(ann.anchorX), \(ann.anchorY)) is outside image bounds (\(w)x\(h)).")
            }
            if ann.badgeX < 0 || ann.badgeX > expectedWidth || ann.badgeY < 0 || ann.badgeY > expectedHeight {
                issues.append("Callout '\(ann.id)' badge (\(ann.badgeX), \(ann.badgeY)) is outside image bounds (\(w)x\(h)).")
            }
        }

        return SVGAnnotationValidationResult(
            isValid: issues.isEmpty,
            naturalWidth: expectedWidth,
            naturalHeight: expectedHeight,
            issues: issues
        )
    }

    private static func escapeXML(_ s: String) -> String {
        s.replacingOccurrences(of: "&", with: "&amp;")
         .replacingOccurrences(of: "<", with: "&lt;")
         .replacingOccurrences(of: ">", with: "&gt;")
         .replacingOccurrences(of: "\"", with: "&quot;")
    }
}
