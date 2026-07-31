package expo.modules.videokit

import android.net.Uri

internal fun resolveOutputPath(path: String): String {
  val trimmed = path.trim()
  return if (trimmed.startsWith("file://")) {
    Uri.parse(trimmed).path ?: trimmed.removePrefix("file://")
  } else {
    trimmed
  }
}
