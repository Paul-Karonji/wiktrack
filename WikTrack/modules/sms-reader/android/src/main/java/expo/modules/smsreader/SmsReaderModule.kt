package expo.modules.smsreader

import android.net.Uri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SmsReaderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SmsReader")

    AsyncFunction("readSms") { filter: Map<String, Any> ->
      val context = appContext.reactContext ?: return@AsyncFunction emptyList<Map<String, Any>>()
      
      val address = filter["address"] as? String ?: "MPESA"
      // Convert minDate to Long, it could be passed as Int or Long or Double from JS
      val minDate = (filter["minDate"] as? Number)?.toLong() ?: 0L

      fun queryMessages(selection: String, selectionArgs: Array<String>, fallbackFilter: Boolean = false): List<Map<String, Any>> {
        val cursor = context.contentResolver.query(
          Uri.parse("content://sms/inbox"),
          arrayOf("_id", "address", "body", "date"),
          selection,
          selectionArgs,
          "date DESC"
        )

        val messages = mutableListOf<Map<String, Any>>()

        cursor?.use {
          val idIdx = it.getColumnIndex("_id")
          val addressIdx = it.getColumnIndex("address")
          val bodyIdx = it.getColumnIndex("body")
          val dateIdx = it.getColumnIndex("date")

          while (it.moveToNext()) {
            val smsAddress = it.getString(addressIdx) ?: ""
            val body = it.getString(bodyIdx) ?: ""
            val addressUpper = smsAddress.uppercase()
            val bodyUpper = body.uppercase()

            if (
              fallbackFilter &&
              !addressUpper.contains("MPESA") &&
              !addressUpper.contains("M-PESA") &&
              !(bodyUpper.contains("CONFIRMED") && (bodyUpper.contains("MPESA") || bodyUpper.contains("M-PESA")))
            ) {
              continue
            }

            messages.add(mapOf(
              "_id" to it.getInt(idIdx),
              "address" to smsAddress,
              "body" to body,
              "date" to it.getLong(dateIdx)
            ))
          }
        }

        return messages
      }

      val strictMessages = queryMessages(
        "(address = ? OR address = ? OR address LIKE ?) AND date >= ?",
        arrayOf(address, "M-PESA", "%$address%", minDate.toString())
      )

      if (strictMessages.isNotEmpty()) {
        return@AsyncFunction strictMessages
      }

      return@AsyncFunction queryMessages(
        "date >= ?",
        arrayOf(minDate.toString()),
        fallbackFilter = true
      )
    }
  }
}
