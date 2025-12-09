function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZTS_QM_FQI/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}