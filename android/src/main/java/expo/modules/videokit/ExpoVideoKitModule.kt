package expo.modules.videokit

import android.net.Uri
import android.os.Handler
import android.os.Looper
import androidx.core.os.bundleOf
import androidx.media3.common.util.UnstableApi
import dev.videokit.VideoKit
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import kotlin.math.max
import kotlin.math.min

@UnstableApi
class ExpoVideoKitModule : Module() {
  private val videoKit = VideoKit()
  private val mainHandler = Handler(Looper.getMainLooper())

  override fun definition() = ModuleDefinition {
    Name("ExpoVideoKit")

    Events("onProgress")

    AsyncFunction("convert") Coroutine { inputUri: String, outputPath: String, config: ConversionConfigRecord ->
      val context = appContext.reactContext
        ?: throw CodedException("React context is unavailable")

      val resolvedOutputPath = resolveOutputPath(outputPath)
      val inputFileSize = resolveFileSize(context, inputUri)
      val progressReporter = ProgressReporter { progress ->
        sendEvent("onProgress", bundleOf("progress" to progress.toDouble()))
      }

      progressReporter.startPollingOutputFile(resolvedOutputPath, inputFileSize, mainHandler)

      val result = videoKit.convert(
        context = context,
        inputUri = Uri.parse(inputUri),
        outputPath = resolvedOutputPath,
        config = config.toNative(),
        onProgress = { progress ->
          progressReporter.updateNativeProgress(progress)
        },
      )

      result.getOrElse { throw CodedException(it.message ?: "Video conversion failed", it) }
      progressReporter.finish()
    }

    AsyncFunction("upload") Coroutine { filePath: String, url: String, config: UploadConfigRecord ->
      val resolvedFilePath = resolveOutputPath(filePath)
      val progressReporter = ProgressReporter { progress ->
        sendEvent("onProgress", bundleOf("progress" to progress.toDouble()))
      }

      val result = videoKit.upload(
        filePath = resolvedFilePath,
        url = url,
        config = config.toNative(),
        onProgress = { progress ->
          progressReporter.updateNativeProgress(progress)
        },
      )

      result.getOrElse { throw CodedException(it.message ?: "Video upload failed", it) }
      progressReporter.finish()
    }

    AsyncFunction("convertAndUpload") Coroutine {
      inputUri: String,
      uploadUrl: String,
      outputPath: String?,
      conversionConfig: ConversionConfigRecord,
      uploadConfig: UploadConfigRecord,
    ->
      val context = appContext.reactContext
        ?: throw CodedException("React context is unavailable")

      val resolvedOutputPath = outputPath?.let(::resolveOutputPath)
      val inputFileSize = resolveFileSize(context, inputUri)
      val progressReporter = ProgressReporter { progress ->
        sendEvent("onProgress", bundleOf("progress" to progress.toDouble()))
      }

      if (resolvedOutputPath != null) {
        progressReporter.startPollingOutputFile(resolvedOutputPath, inputFileSize, mainHandler)
      }

      val result = videoKit.convertAndUpload(
        context = context,
        inputUri = Uri.parse(inputUri),
        uploadUrl = uploadUrl,
        outputPath = resolvedOutputPath,
        conversionConfig = conversionConfig.toNative(),
        uploadConfig = uploadConfig.toNative(),
        onProgress = { progress ->
          progressReporter.updateNativeProgress(progress)
        },
      )

      result.getOrElse {
        throw CodedException(it.message ?: "Video convert and upload failed", it)
      }
      progressReporter.finish()
    }
  }
}

private class ProgressReporter(
  private val emit: (Float) -> Unit,
) {
  private var lastReported = -1f
  private var nativeProgress = 0f
  private var pollRunnable: Runnable? = null
  private var pollHandler: Handler? = null

  fun startPollingOutputFile(outputPath: String, inputFileSize: Long?, handler: Handler) {
    if (inputFileSize == null || inputFileSize <= 0L) {
      return
    }

    pollHandler = handler
    val runnable = object : Runnable {
      override fun run() {
        val outputSize = File(outputPath).length()
        if (outputSize > 0L) {
          val estimated = min(0.95f, outputSize.toFloat() / inputFileSize.toFloat() * 1.1f)
          report(max(nativeProgress, estimated))
        }
        pollHandler?.postDelayed(this, 250)
      }
    }

    pollRunnable = runnable
    handler.postDelayed(runnable, 250)
  }

  fun updateNativeProgress(progress: Float) {
    nativeProgress = progress
    report(progress)
  }

  fun finish() {
    pollRunnable?.let { runnable ->
      pollHandler?.removeCallbacks(runnable)
    }
    pollRunnable = null
    pollHandler = null
    report(1f)
  }

  private fun report(progress: Float) {
    val clamped = min(max(progress, 0f), 1f)
    if (clamped <= lastReported + 0.005f && clamped < 1f) {
      return
    }

    lastReported = clamped
    emit(clamped)
  }
}

private fun resolveFileSize(context: android.content.Context, inputUri: String): Long? {
  return try {
    context.contentResolver.openAssetFileDescriptor(Uri.parse(inputUri), "r")?.use { descriptor ->
      descriptor.length.takeIf { it > 0L }
    }
  } catch (_: Exception) {
    null
  }
}
