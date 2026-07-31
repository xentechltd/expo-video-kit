package expo.modules.videokit

import dev.videokit.ConversionConfig
import dev.videokit.UploadConfig
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class ConversionConfigRecord : Record {
  @Field
  val targetWidth: Int = 1080

  @Field
  val targetHeight: Int = 1920

  @Field
  val targetFps: Int = 15

  @Field
  val videoMimeType: String = "video/avc"

  @Field
  val portraitEncodingEnabled: Boolean = true

  fun toNative(): ConversionConfig {
    return ConversionConfig(
      targetWidth = targetWidth,
      targetHeight = targetHeight,
      targetFps = targetFps,
      videoMimeType = videoMimeType,
      portraitEncodingEnabled = portraitEncodingEnabled,
    )
  }
}

class UploadConfigRecord : Record {
  @Field
  val contentType: String = "video/mp4"

  @Field
  val method: String = "PUT"

  fun toNative(): UploadConfig {
    return UploadConfig(
      contentType = contentType,
      method = method,
    )
  }
}
