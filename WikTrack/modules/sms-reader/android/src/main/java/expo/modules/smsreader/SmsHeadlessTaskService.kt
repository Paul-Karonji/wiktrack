package expo.modules.smsreader

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class SmsHeadlessTaskService : HeadlessJsTaskService() {
  override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
    val extras = intent?.extras ?: return null
    val data = Arguments.createMap().apply {
      putString("address", extras.getString("address"))
      putString("body", extras.getString("body"))
      putDouble("date", extras.getLong("date").toDouble())
    }

    return HeadlessJsTaskConfig(
      "WikTrackSmsReceived",
      data,
      30000,
      true
    )
  }
}
