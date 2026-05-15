package expo.modules.smsreader

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import com.facebook.react.HeadlessJsTaskService

class SmsBroadcastReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

    val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
    if (messages.isNullOrEmpty()) return

    val address = messages.firstOrNull()?.displayOriginatingAddress ?: ""
    val body = messages.joinToString(separator = "") { sms ->
      sms.displayMessageBody ?: sms.messageBody ?: ""
    }

    if (!isMpesaMessage(address, body)) return

    val serviceIntent = Intent(context, SmsHeadlessTaskService::class.java).apply {
      putExtra("address", address)
      putExtra("body", body)
      putExtra("date", messages.minOfOrNull { it.timestampMillis } ?: System.currentTimeMillis())
    }

    context.startService(serviceIntent)
    HeadlessJsTaskService.acquireWakeLockNow(context)
  }

  private fun isMpesaMessage(address: String, body: String): Boolean {
    val normalizedAddress = address.trim().uppercase()
    if (normalizedAddress == "MPESA" || normalizedAddress == "M-PESA") {
      return true
    }

    val normalizedBody = body.uppercase()
    return normalizedBody.contains("CONFIRMED") &&
      (normalizedBody.contains("MPESA") || normalizedBody.contains("M-PESA"))
  }
}
