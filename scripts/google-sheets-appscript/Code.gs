function doPost(e) {
  var result = { success: false, error: "" };
  try {
    var body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    var sh = getSheet();
    if (sh.getLastRow() === 0) {
      sh.appendRow([
        "orderId", "date", "email", "fullName", "phone", "secondaryPhone",
        "address", "city", "zone", "area", "items", "subtotal", "shipping", "total", "status", "pathaoConsignmentId"
      ]);
    }
    sh.appendRow([
      body.orderId || "",
      body.date || "",
      body.email || "",
      body.fullName || "",
      body.phone || "",
      body.secondaryPhone || "",
      body.address || "",
      body.city || "",
      body.zone || "",
      body.area || "",
      body.items || "",
      body.subtotal != null ? body.subtotal : "",
      body.shipping != null ? body.shipping : "",
      body.total != null ? body.total : "",
      body.status || "New",
      body.pathaoConsignmentId || ""
    ]);
    result.success = true;
  } catch (err) {
    result.error = err.message || String(err);
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  var id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  var ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Orders");
  if (!sh) sh = ss.insertSheet("Orders");
  return sh;
}
