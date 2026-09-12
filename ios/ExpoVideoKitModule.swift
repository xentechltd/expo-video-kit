import ExpoModulesCore
import VideoKit

struct ConversionConfigRecord: Record {
  @Field var targetWidth: Int = 1080
  @Field var targetHeight: Int = 1920
  @Field var targetFps: Int = 15
  @Field var videoMimeType: String = "video/avc"
  @Field var portraitEncodingEnabled: Bool = true

  func toNative() -> ConversionConfig {
    ConversionConfig(
      targetWidth: targetWidth,
      targetHeight: targetHeight,
      targetFps: targetFps,
      videoMimeType: videoMimeType,
      portraitEncodingEnabled: portraitEncodingEnabled
    )
  }
}

struct UploadConfigRecord: Record {
  @Field var contentType: String = "video/mp4"
  @Field var method: String = "PUT"

  func toNative() -> UploadConfig {
    UploadConfig(contentType: contentType, method: method)
  }
}

private func resolveURL(from uri: String) throws -> URL {
  let trimmed = uri.trimmingCharacters(in: .whitespacesAndNewlines)
  if trimmed.hasPrefix("file://") {
    guard let url = URL(string: trimmed) else {
      throw Exception(
        name: "InvalidInputUri",
        description: "Invalid input URI: \(uri)"
      )
    }
    return url
  }

  if trimmed.hasPrefix("http://") || trimmed.hasPrefix("https://") {
    guard let url = URL(string: trimmed) else {
      throw Exception(
        name: "InvalidInputUri",
        description: "Invalid input URI: \(uri)"
      )
    }
    return url
  }

  return URL(fileURLWithPath: trimmed)
}

private func resolveOutputPath(_ path: String) -> String {
  let trimmed = path.trimmingCharacters(in: .whitespacesAndNewlines)
  if trimmed.hasPrefix("file://"), let url = URL(string: trimmed) {
    return url.path
  }
  return trimmed
}

private func describeError(_ error: Error) -> String {
  let localized = error.localizedDescription.trimmingCharacters(in: .whitespacesAndNewlines)
  if !localized.isEmpty {
    return localized
  }
  return String(describing: error)
}

private final class ProgressReporter {
  private let emit: (Double) -> Void
  private var lastReported: Double = -1

  init(emit: @escaping (Double) -> Void) {
    self.emit = emit
  }

  func updateNativeProgress(_ progress: Float) {
    report(Double(progress))
  }

  func finish() {
    report(1)
  }

  private func report(_ progress: Double) {
    let clamped = min(max(progress, 0), 1)
    guard clamped > lastReported + 0.005 || clamped >= 1 else {
      return
    }

    lastReported = clamped
    if Thread.isMainThread {
      emit(clamped)
    } else {
      DispatchQueue.main.async {
        self.emit(clamped)
      }
    }
  }
}

public class ExpoVideoKitModule: Module {
  private let videoKit = VideoKit()

  public func definition() -> ModuleDefinition {
    Name("ExpoVideoKit")

    Events("onProgress")

    AsyncFunction("convert") {
      (inputUri: String, outputPath: String, config: ConversionConfigRecord) async throws in
      let inputURL = try resolveURL(from: inputUri)
      let resolvedOutputPath = resolveOutputPath(outputPath)
      let progressReporter = ProgressReporter { progress in
        self.sendEvent("onProgress", ["progress": progress])
      }

      let result = await self.videoKit.convert(
        inputURL: inputURL,
        outputPath: resolvedOutputPath,
        config: config.toNative(),
        onProgress: { progress in
          progressReporter.updateNativeProgress(progress)
        }
      )

      if case .failure(let error) = result {
        throw Exception(
          name: "ConvertFailed",
          description: describeError(error)
        )
      }

      progressReporter.finish()
    }

    AsyncFunction("upload") {
      (filePath: String, url: String, config: UploadConfigRecord) async throws in
      let resolvedFilePath = resolveOutputPath(filePath)
      let progressReporter = ProgressReporter { progress in
        self.sendEvent("onProgress", ["progress": progress])
      }

      let result = await self.videoKit.upload(
        filePath: resolvedFilePath,
        url: url,
        config: config.toNative(),
        onProgress: { progress in
          progressReporter.updateNativeProgress(progress)
        }
      )

      if case .failure(let error) = result {
        throw Exception(
          name: "UploadFailed",
          description: describeError(error)
        )
      }

      progressReporter.finish()
    }

    AsyncFunction("convertAndUpload") {
      (
        inputUri: String,
        uploadUrl: String,
        outputPath: String?,
        conversionConfig: ConversionConfigRecord,
        uploadConfig: UploadConfigRecord
      ) async throws in
      let inputURL = try resolveURL(from: inputUri)
      let resolvedOutputPath = outputPath.map(resolveOutputPath(_:))
      let progressReporter = ProgressReporter { progress in
        self.sendEvent("onProgress", ["progress": progress])
      }

      let result = await self.videoKit.convertAndUpload(
        inputURL: inputURL,
        uploadURL: uploadUrl,
        outputPath: resolvedOutputPath,
        conversionConfig: conversionConfig.toNative(),
        uploadConfig: uploadConfig.toNative(),
        onProgress: { progress in
          progressReporter.updateNativeProgress(progress)
        }
      )

      if case .failure(let error) = result {
        throw Exception(
          name: "ConvertAndUploadFailed",
          description: describeError(error)
        )
      }

      progressReporter.finish()
    }
  }
}
