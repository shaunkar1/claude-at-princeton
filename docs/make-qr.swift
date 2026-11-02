// Makes the tabling QR code as an SVG with macOS's built-in Core Image encoder, so nothing
// needs installing. Run it from the repo root after the site moves to a new address:
//
//   swift docs/make-qr.swift "https://claudeatprinceton.org/join/" assets/join-qr.svg
//
// Point it at the /join/ page, not the form itself, so changing forms never breaks printed codes.
import CoreImage
import Foundation

let args = CommandLine.arguments
guard args.count == 3, let message = args[1].data(using: .utf8) else {
    print("usage: swift docs/make-qr.swift <url> <output.svg>")
    exit(1)
}

let filter = CIFilter(name: "CIQRCodeGenerator")!
filter.setValue(message, forKey: "inputMessage")
filter.setValue("M", forKey: "inputCorrectionLevel")
guard let output = filter.outputImage,
      let image = CIContext().createCGImage(output, from: output.extent) else {
    print("could not generate the QR code")
    exit(1)
}

// Core Image draws one pixel per module. Read the pixels back (row 0 is the top).
let size = image.width
var pixels = [UInt8](repeating: 0, count: size * size * 4)
let context = CGContext(data: &pixels, width: size, height: size, bitsPerComponent: 8, bytesPerRow: size * 4,
                        space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
context.draw(image, in: CGRect(x: 0, y: 0, width: size, height: size))
let dark = { (x: Int, y: Int) in pixels[(y * size + x) * 4] < 128 }

// Trim Core Image's own margin, then add the standard four-module quiet zone.
let rows = (0..<size).filter { y in (0..<size).contains { dark($0, y) } }
let cols = (0..<size).filter { x in (0..<size).contains { dark(x, $0) } }
let (minX, maxX, minY, maxY) = (cols.first!, cols.last!, rows.first!, rows.last!)
let quiet = 4
let modules = maxX - minX + 1

var path = ""
for y in minY...maxY {
    var x = minX
    while x <= maxX {
        guard dark(x, y) else { x += 1; continue }
        var run = 1
        while x + run <= maxX && dark(x + run, y) { run += 1 }
        path += "M\(x - minX + quiet) \(y - minY + quiet)h\(run)v1h-\(run)z"
        x += run
    }
}

let total = modules + quiet * 2
let svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 \(total) \(total)\" shape-rendering=\"crispEdges\">"
    + "<rect width=\"\(total)\" height=\"\(total)\" fill=\"#FFFFFF\"/><path fill=\"#141413\" d=\"\(path)\"/></svg>\n"
try svg.write(toFile: args[2], atomically: true, encoding: .utf8)
print("wrote \(args[2]): \(modules)x\(modules) modules for \(args[1])")
