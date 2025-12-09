sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function (Controller, JSONModel, Dialog, Button, MessageToast, Sorter, Filter, Export) {
	"use strict";
	jQuery.sap.require("Create.FQI_Create/connection");
	return Controller.extend("Create.FQI_Create.controller.Main", {
		onInit: function () {
			//a global variable to store the keyword this
			window.myThis = this;
			window.myView = this.getView();

			//Declaring the global variables
			window.gv_login_empno = "";
			window.gv_login_empname = "";
			window.bsp_name = "";
			window.device_name = "";
			window.app_hits = "";

			window.gv_plant = "";
			window.gv_model_name = "";
			window.gv_frame_no = "";
			window.gv_barcode_no = "";
			window.gv_engine_no = "";
			window.gv_plant_op = "";
			window.gv_production_date = "";
			window.gv_posting_date = "";
			window.gv_shift = "";
			window.gv_shift_name = "";
			window.gv_production_line = "";
			window.gv_frame_no_length = "";
			window.gv_barcode_no_length = "";
			window.gv_msg = "";
			window.gv_Dateformat = "";
			window.gv_reason = "";
			window.gv_oTable = "";
			window.gv_revision_no = "";

			if (window.location.hostname == "localhost") {
				window.url = new sUrl("local");
			} else {
				window.url = new sUrl("idm");
			}

			if (window.AlertDialog == undefined) {
				//a global dialog for showing alert
				window.AlertDialog = new Dialog({
					title: "Alert",
					state: "Warning",
					type: "Message",
					content: new sap.m.Text("Alert_Dialog_Text", {
						text: ""

					}),
					beginButton: new sap.m.Button({
						text: "OK",
						press: function () {
							AlertDialog.close();

						}
					})
				});
			}

			if (window.ErrorDialog == undefined) {

				//a global dialog for showing error
				window.ErrorDialog = new Dialog({
					title: "Error",
					state: "Error",
					type: "Message",
					content: new sap.m.Text("Error_Dialog_Text", {
						text: ""
					}),
					beginButton: new sap.m.Button({
						text: "OK",
						press: function () {
							ErrorDialog.close();

						}
					})
				});
			}

			if (window.SuccesDialog == undefined) {
				//a global dialog for showing Success
				window.SuccesDialog = new Dialog({
					title: "Success",
					state: "Success",
					type: "Message",
					content: new sap.m.Text("Succes_Dialog_Text", {
						text: ""
					}),
					beginButton: new sap.m.Button({
						text: "OK",
						press: function () {
							SuccesDialog.close();

						}
					})
				});
			}

			//Declare a global busy dialog
			if (window.busyDialog == undefined) {
				window.busyDialog = new sap.m.BusyDialog("busyDialog_Text", {
					text: ""
				});
			}
			sap.ui.getCore().byId("busyDialog_Text").setText("...please wait while data is loading");
			busyDialog.open();

			//Declaration of fragments
			window.Upload_History_Details = sap.ui.xmlfragment("Create.FQI_Create.view.Upload_History_Details", sap.ui.controller(
				"Create.FQI_Create.controller.Main"));

			//Logic to identify the device name
			var device = sap.ui.Device.system;
			if (device.tablet === true) {
				device_name = "T";
			} else if (device.desktop === true) {
				device_name = "D";
			} else if (device.phone === true) {
				device_name = "M";
			}

			//Logic to identify the BSP app. name
			var link = window.location.href;
			var substring = "sap/";
			var check = link.indexOf(substring);
			if (check === -1) {
				/*Substring is not found*/
				bsp_name = "ZBSP_FQI_CREATE";
			} else {
				var split1 = link.split("sap/");
				var split2 = split1[2].split("/");
				bsp_name = split2[0].toUpperCase();
			}

			//odata URI to update the no. of hits
			var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS1_APP_NO_OF_HITS/"));
			var path = "/UPDATE_APP_HITSCollection(Mode='UPDATE_APP_HITS',App_Name='" + bsp_name +
				"',App_Desc='Functional Quality Index System',Device_Type='" + device_name + "')";
			oDataModel.read(path, null, null, false, function (oData, oResponse) {

					var interval = setInterval(function () {
						busyDialog.close();
						/*var jsonModel = new sap.ui.model.json.JSONModel(oData.results);
						var emp_name = oData.Emp_name;
						gv_login_empno = oData.Emp_No;
						gv_login_empname = oData.Emp_name;
						emp_name = "Welcome ".concat(emp_name);
						window.myView.byId("lbl_user").setText(emp_name);*/
						clearInterval(interval);
					}, 100);
				},
				function (oData, oResponse) {
					busyDialog.close();
					ErrorDialog.open();
					var data = JSON.parse(error.response.body);
					var Error = data.error.message.value;
					sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
				});

			//odata URI to get the total no. of hits
			var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS1_APP_NO_OF_HITS/"));
			var path = "/GET_APP_HITSCollection(Mode='GET_APP_HITS',App_Name='" + bsp_name +
				"')";
			oDataModel.read(path, null, null, false, function (oData, oResponse) {

					var interval = setInterval(function () {
						busyDialog.close();
						var jsonModel = new sap.ui.model.json.JSONModel(oData.results);
						app_hits = oData.Total_No_Of_Hits;
						var no_of_hits = "App Hits - ".concat(app_hits);
						window.myView.byId("NoOfHits").setText(no_of_hits);
						clearInterval(interval);
					}, 100);
				},
				function (oData, oResponse) {
					busyDialog.close();
					ErrorDialog.open();
					var data = JSON.parse(error.response.body);
					var Error = data.error.message.value;
					sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
				});

			//odata URI to get the image of the login person
			var imageDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZSRV_PROCUREMENT_DETAILS"));

			imageDataModel.read("HR_PhotoCollection('')/$value", null, null, true, function (oData, oResponse) {
					var data = oResponse.requestUri;

					myView.byId("loginImageId").setSrc(data);
				},
				function () {
					ErrorDialog.open();
					sap.ui.getCore().byId("Error_Dialog_Text").setText("Error");
				});

			//odata URI to get the user name of the login person
			var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS_MM_PREMIUM_FREIGHT/"));
			var path = "/LOGIN_USER_NAMECollection(Mode='username')";
			oDataModel.read(path, null, null, false, function (oData, oResponse) {

					var interval = setInterval(function () {
						busyDialog.close();
						var jsonModel = new sap.ui.model.json.JSONModel(oData.results);
						var emp_name = oData.Emp_name;
						gv_login_empno = oData.Emp_No;
						gv_login_empname = oData.Emp_name;
						emp_name = "Welcome ".concat(emp_name);
						window.myView.byId("lbl_user").setText(emp_name);
						clearInterval(interval);
					}, 100);
				},
				function (oData, oResponse) {
					busyDialog.close();
					ErrorDialog.open();
					var data = JSON.parse(error.response.body);
					var Error = data.error.message.value;
					sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
				});

			gv_Dateformat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd-MM-YYYY"
			});

			//odata URI to get the plants dropdown values
			var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS_QM_FQI/"));
			var path = "/PLANTS_DROPDOWNCollection?$filter=Mode eq 'PLANTS_DROPDOWN'";
			oDataModel.read(path, null, null, false, function (oData, oResponse) {

					var interval = setInterval(function () {
						busyDialog.close();
						var jsonModel = new sap.ui.model.json.JSONModel(oData.results);
						window.myView.byId("plants").setModel(jsonModel);
						window.myView.byId("plants").bindElement("/");
						var temp_plant = jsonModel.oData[0].Plant;
						gv_plant = temp_plant;
						clearInterval(interval);
					}, 100);
				},
				function (oData, oResponse) {
					busyDialog.close();
					ErrorDialog.open();
					var data = JSON.parse(error.response.body);
					var Error = data.error.message.value;
					sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
				});

		},

		//To expand the Header details panel
		onExpandedHome: function (evt) {
			var isOpen = this.getView().getModel("panelsModel").getData().open;
			this.getView().getModel("panelsModel").setData({
				"open": !isOpen
			});
		},

		//Function to convert the date format in the report table
		formatDate: function (v) {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd-MM-YYYY"
			});
			return oDateFormat.format(new Date(v));
		},

		//For keeping the focus on Barcode no. cell              
		/*onAfterRendering: function (oEvent) {
			this.getView().byId("BarcodeNo").focus();
		},*/

		//Logic to get the model names for the user selected plant
		onSelectPlant: function (oEvent) {
			busyDialog.open();
			sap.ui.getCore().byId("busyDialog_Text").setText("...please wait while data is loading");
			var plant = oEvent.mParameters.selectedItem.mProperties.key;
			gv_plant = plant;
			setTimeout(function () {
				//Clearing Model names before filling the dropdown list
				var jsonModel = new sap.ui.model.json.JSONModel([]);
				window.myView.byId("model_name").setModel(jsonModel);
				//Calling oData URI to get the model names
				var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS_QM_FQI/"));
				var path = "/MODEL_DROPDOWNCollection?$filter=Mode eq 'MODEL_DROPDOWN' and Plant eq '" + plant + "'";
				oDataModel.read(path, null, null, false, function (oData, oResponse) {

						var interval = setInterval(function () {
							busyDialog.close();
							var jsonModel = new sap.ui.model.json.JSONModel(oData.results);
							window.myView.byId("model_name").setModel(jsonModel);
							window.myView.byId("model_name").bindElement("/");
							clearInterval(interval);
						}, 100);
					},
					function (oData, oResponse) {
						busyDialog.close();
						ErrorDialog.open();
						var data = JSON.parse(error.response.body);
						var Error = data.error.message.value;
						sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
					});
			}, 100);
		},
		//Logic to get the FQI master history if already available in the database		
		onSelectModelName: function (oEvent) {
			busyDialog.open();
			sap.ui.getCore().byId("busyDialog_Text").setText("...please wait while data is loading");
			var model_name = oEvent.mParameters.selectedItem.mProperties.key;
			gv_model_name = model_name;
			setTimeout(function () {
				//Clearing table before filling 
				var jsonModel = new sap.ui.model.json.JSONModel([]);
				window.myView.byId("T_History").setModel(jsonModel);
				//Calling oData URI to get the model names
				var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS_QM_FQI/"));
				var path = "/MASTER_UPLOADCollection?$filter=Mode eq 'MASTER_UPLOAD' and Plant eq '" + gv_plant + "' and Model_Name eq '" +
					gv_model_name + "'";
				oDataModel.read(path, null, null, false, function (oData, oResponse) {

						var interval = setInterval(function () {
							busyDialog.close();
							var HistoryData = oData.results;
							var i;
							var HistoryDataArray = [];
							for (i = 0; i < HistoryData.length; i++) {
								var oNewObject = {};
								//Appending data to the object to push to the array for filtering the output table
								oNewObject.SNo = HistoryData[i].SNo; //Serial no.
								oNewObject.Model_Name = gv_model_name; //Model name
								oNewObject.Uploaded_By = HistoryData[i].Uploaded_By; //Uploaded By  
								oNewObject.Entry_Date = HistoryData[i].Entry_Date; //Entry Date  
								oNewObject.Revision_No = HistoryData[i].Revision_No; //Revision No  
								oNewObject.Reason = HistoryData[i].Reason; //Reason  
								HistoryDataArray.push(oNewObject);
							}
							var oModel = new sap.ui.model.json.JSONModel(HistoryDataArray);
							//To set the iSizeLimit of the oModel, By default the iSizeLimit will be 100 if we don't set it
							oModel.setSizeLimit(oModel.oData.length);
							//Binding the data to the Cost Center table
							window.myView.byId("T_History").setModel(oModel);
							/*window.myView.byId("model_name").bindElement("/");*/
							//Enabling the visbility of the table
							/*window.myView.byId("T_History").setVisible(true);*/
							//Calling OData URI to fetch the latest revision upload master details if available
							var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS_QM_FQI/"));
							var path = "/UPLOAD_MASTER_TBLCollection?$filter=Mode eq 'UPLOAD_MASTER_TBL' and Plant eq '" + gv_plant +
								"' and Model_Name eq '" + gv_model_name + "'"; // and Barcode eq '" + gv_barcode_no + "'";
							oDataModel.read(path, null, null, false, function (oData, oResponse) {
									var interval = setInterval(function () {
										busyDialog.close();
										var UploadData = oData.results;
										var i;
										var UploadDataArray = [];
										for (i = 0; i < UploadData.length; i++) {
											var oNewObject = {};
											//Appending data to the object to push to the array for filtering the output table
											oNewObject.Check_Point = UploadData[i].Check_Point; //Check Point
											oNewObject.Check_Method = UploadData[i].Check_Method; //Check Method
											oNewObject.Complaint_Type = UploadData[i].Complaint_Type; //Complaint Type
											oNewObject.Type = UploadData[i].Type; //Type  
											oNewObject.Lsl = UploadData[i].Lsl; //Lsl  
											oNewObject.Usl = UploadData[i].Usl; //Usl 
											oNewObject.Uom = UploadData[i].Uom; //Uom  
											UploadDataArray.push(oNewObject);
										}
										var oModel = new sap.ui.model.json.JSONModel(UploadDataArray);
										//To set the iSizeLimit of the oModel, By default the iSizeLimit will be 100 if we don't set it
										oModel.setSizeLimit(oModel.oData.length);
										//Binding the data to the Cost Center table
										window.myView.byId("T_Upload").setModel(oModel);
										/*window.myView.byId("model_name").bindElement("/");*/
										//Enabling the visbility of the table
										/*window.myView.byId("T_History").setVisible(true);*/
										clearInterval(interval);
									}, 100);
									//Enabling the visibility of the upload master table
									window.myView.byId("T_Upload").setVisible(true);
								},
								function (oData, oResponse) {
									busyDialog.close();
									ErrorDialog.open();
									var data = JSON.parse(error.response.body);
									var Error = data.error.message.value;
									sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
								});
							clearInterval(interval);
						}, 100);
					},
					function (oData, oResponse) {
						busyDialog.close();
						ErrorDialog.open();
						var data = JSON.parse(error.response.body);
						var Error = data.error.message.value;
						sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
					});
			}, 100);
		},

		//Logic for fetching the revisionwise upload check sheet details on click of the items in the upload history table
		HistoryTablePress: function (oEvent) {
			busyDialog.open();
			sap.ui.getCore().byId("busyDialog_Text").setText("...please wait while data is loading");
			//Reading the selected revision no.
			gv_revision_no = parseInt(oEvent.getParameter('listItem').getBindingContext().getObject().Revision_No);
			//Clearing table before filling 
			var jsonModel = new sap.ui.model.json.JSONModel([]);
			/*window.myView.byId("Table").setModel(jsonModel);*/
			sap.ui.getCore().byId("Table").setModel(jsonModel);
			//Calling oData URI to get the revisionwise upload master checksheet
			var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS_QM_FQI/"));
			var path = "/REVISION_HISTORYCollection?$filter=Mode eq 'REVISION_HISTORY' and Plant eq '" + gv_plant + "' and Model_Name eq '" +
				gv_model_name + "' and Revision_No eq " + gv_revision_no + "";
			oDataModel.read(path, null, null, false, function (oData, oResponse) {

					var interval = setInterval(function () {
						busyDialog.close();
						var RevHistoryData = oData.results;
						var i;
						var RevHistoryDataArray = [];
						for (i = 0; i < RevHistoryData.length; i++) {
							var oNewObject = {};
							//Appending data to the object to push to the array for filtering the output table
							oNewObject.Check_Point = RevHistoryData[i].Check_Point; //Check Point
							oNewObject.Check_Method = RevHistoryData[i].Check_Method; //Check Method
							oNewObject.Complaint_Type = RevHistoryData[i].Complaint_Type; //Complaint Type 
							oNewObject.Type = RevHistoryData[i].Type; //Type  
							oNewObject.Lsl = RevHistoryData[i].Lsl; //Lsl  
							oNewObject.Usl = RevHistoryData[i].Usl; //Usl  
							oNewObject.Uom = RevHistoryData[i].Uom; //Uom  
							RevHistoryDataArray.push(oNewObject);
						}
						var oModel = new sap.ui.model.json.JSONModel(RevHistoryDataArray);
						//To set the iSizeLimit of the oModel, By default the iSizeLimit will be 100 if we don't set it
						oModel.setSizeLimit(oModel.oData.length);
						//Binding the data to the Cost Center table
						/*window.myView.byId("Table").setModel(oModel);*/
						sap.ui.getCore().byId("Table").setModel(oModel);
						/*window.myView.byId("model_name").bindElement("/");*/
						//Enabling the visbility of the table
						/*window.myView.byId("T_History").setVisible(true);*/
						//Open the fragment
						Upload_History_Details.open();
						clearInterval(interval);
					}, 100);
				},
				function (oData, oResponse) {
					busyDialog.close();
					ErrorDialog.open();
					var data = JSON.parse(error.response.body);
					var Error = data.error.message.value;
					sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
				});
			busyDialog.close();
		},

		//Logic to close the Upload History Details fragment
		HistoryClose: function (oEvent) {
			Upload_History_Details.close();
		},

		//Logic for uploading the master details by Upload person		
		pressUploadBtn: function (oEvent) {
			//Enabling the visbility of the Header details simple form
			window.myView.byId("SimpleFormHdr").setVisible(true);
			//To bring the focus on to Barcode no. input cell
			window.myView.byId("BarcodeNo").focus();
			//Enabling the visibility of the header details panel
			/*window.myView.byId("Hdr_Dtls").setVisible(true);*/

			/*var isOpen = this.getView().getModel("panelsModel").getData().open;
			this.getView().getModel("panelsModel").setData({
				"open": !isOpen
			});*/
		},

		//Logic after the barcode no. is inputted via scanning or entering
		AfterBarcodeNoScanned: function (oEvent) {
			//Reading the input barcode no.
			gv_barcode_no = this.getView().byId("BarcodeNo").getValue();
			gv_barcode_no_length = gv_barcode_no.length;
			if (gv_barcode_no_length === 13) {
				//Clearing the i/p variables
				gv_frame_no = "";
				gv_engine_no = "";
				gv_plant_op = "";
				gv_production_date = "";
				gv_posting_date = "";
				gv_shift = "";
				gv_shift_name = "";
				gv_production_line = "";

				this.getView().byId("FrameNo").setValue(gv_frame_no);
				this.getView().byId("EngineNo").setText(gv_engine_no);
				this.getView().byId("Plant").setText(gv_plant_op);
				this.getView().byId("Prod_Date").setText(gv_production_date);
				this.getView().byId("Post_Date").setText(gv_posting_date);
				this.getView().byId("Shift").setText(gv_shift);
				this.getView().byId("Shift_name").setText(gv_shift_name);
				this.getView().byId("Prod_Line").setText(gv_production_line);

				//Calling oData URI to do barcode no. validation
				var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS_QM_FQI/"));
				var path = "/VALIDATE_BARCODECollection(Mode='VALIDATE_BARCODE',Barcode='" + gv_barcode_no + "')";
				oDataModel.read(path, null, null, false, function (oData, oResponse) {
						gv_msg = oData.Message;
						if (gv_msg !== "") {
							/*ErrorDialog.open();
							sap.ui.getCore().byId("Error_Dialog_Text").setText(gv_msg);*/
							sap.m.MessageToast.show(gv_msg);
						} else if (gv_msg == "") {
							//Calling OData URI to fetch the remaining details from ZPP08 table
							var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS_QM_FQI/"));
							var path = "/UPLOAD_MASTER_HDRCollection(Mode='UPLOAD_MASTER_HDR',Barcode_No='" + gv_barcode_no +
								"',Frame_No='')";
							oDataModel.read(path, null, null, false, function (oData, oResponse) {
									window.myView.byId("FrameNo").setValue(oData.Frame_No);
									window.myView.byId("EngineNo").setText(oData.Engine_No);
									window.myView.byId("Plant").setText(oData.Plant);
									var prod_date = gv_Dateformat.format(new Date(oData.Production_Date));
									window.myView.byId("Prod_Date").setText(prod_date);
									var post_date = gv_Dateformat.format(new Date(oData.Posting_Date));
									window.myView.byId("Post_Date").setText(post_date);
									window.myView.byId("Shift").setText(oData.Shift);
									window.myView.byId("Shift_name").setText(oData.Shift_Name);
									window.myView.byId("Prod_Line").setText(oData.Production_Line);
									//Calling OData URI to fetch the latest revision upload master details if available
									var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS_QM_FQI/"));
									var path = "/UPLOAD_MASTER_TBLCollection?$filter=Mode eq 'UPLOAD_MASTER_TBL' and Plant eq '" + gv_plant +
										"' and Model_Name eq '" + gv_model_name + "' and Barcode eq '" + gv_barcode_no + "'";
									oDataModel.read(path, null, null, false, function (oData, oResponse) {
											var interval = setInterval(function () {
												busyDialog.close();
												var UploadData = oData.results;
												var i;
												var UploadDataArray = [];
												for (i = 0; i < UploadData.length; i++) {
													var oNewObject = {};
													//Appending data to the object to push to the array for filtering the output table
													oNewObject.Check_Point = UploadData[i].Check_Point; //Check Point
													oNewObject.Check_Method = UploadData[i].Check_Method; //Check Method
													oNewObject.Complaint_Type = UploadData[i].Complaint_Type; //Complaint Type
													oNewObject.Type = UploadData[i].Type; //Type  
													oNewObject.Lsl = UploadData[i].Lsl; //Lsl  
													oNewObject.Usl = UploadData[i].Usl; //Usl 
													oNewObject.Uom = UploadData[i].Uom; //Uom  
													UploadDataArray.push(oNewObject);
												}
												var oModel = new sap.ui.model.json.JSONModel(UploadDataArray);
												//To set the iSizeLimit of the oModel, By default the iSizeLimit will be 100 if we don't set it
												oModel.setSizeLimit(oModel.oData.length);
												//Binding the data to the Cost Center table
												window.myView.byId("T_Upload").setModel(oModel);
												/*window.myView.byId("model_name").bindElement("/");*/
												//Enabling the visbility of the table
												/*window.myView.byId("T_History").setVisible(true);*/
												clearInterval(interval);
											}, 100);
											//Enabling the visibility of the upload master table
											window.myView.byId("T_Upload").setVisible(true);
										},
										function (oData, oResponse) {
											busyDialog.close();
											ErrorDialog.open();
											var data = JSON.parse(error.response.body);
											var Error = data.error.message.value;
											sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
										});
									/*var interval = setInterval(function () {
										busyDialog.close();
										var jsonModel = new sap.ui.model.json.JSONModel(oData.results);
										app_hits = oData.Total_No_Of_Hits;
										var no_of_hits = "App Hits - ".concat(app_hits);
										window.myView.byId("NoOfHits").setText(no_of_hits);
										clearInterval(interval);
									}, 100);*/
								},
								function (oData, oResponse) {
									busyDialog.close();
									ErrorDialog.open();
									var data = JSON.parse(error.response.body);
									var Error = data.error.message.value;
									sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
								});
						}
					},
					function (oData, oResponse) {
						busyDialog.close();
						ErrorDialog.open();
						var data = JSON.parse(error.response.body);
						var Error = data.error.message.value;
						sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
					});
			}
		},

		//Logic after the frame no. is inputted via scanning or entering
		AfterFrameNoScanned: function (oEvent) {
			//Reading the input frame no.
			gv_frame_no = this.getView().byId("FrameNo").getValue();
			gv_frame_no_length = gv_frame_no.length;
			if (gv_frame_no_length === 17) {
				//Clearing the i/p variables
				gv_barcode_no = "";
				gv_engine_no = "";
				gv_plant_op = "";
				gv_production_date = "";
				gv_posting_date = "";
				gv_shift = "";
				gv_shift_name = "";
				gv_production_line = "";

				this.getView().byId("BarcodeNo").setValue(gv_barcode_no);
				this.getView().byId("EngineNo").setText(gv_engine_no);
				this.getView().byId("Plant").setText(gv_plant_op);
				this.getView().byId("Prod_Date").setText(gv_production_date);
				this.getView().byId("Post_Date").setText(gv_posting_date);
				this.getView().byId("Shift").setText(gv_shift);
				this.getView().byId("Shift_name").setText(gv_shift_name);
				this.getView().byId("Prod_Line").setText(gv_production_line);

				//Calling oData URI to do frame no. validation
				var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS_QM_FQI/"));
				var path = "/VALIDATE_FRAME_NOCollection(Mode='VALIDATE_FRAME_NO',Frame_No='" + gv_frame_no + "')";
				oDataModel.read(path, null, null, false, function (oData, oResponse) {
						gv_msg = oData.Message;
						if (gv_msg !== "") {
							/*ErrorDialog.open();
							sap.ui.getCore().byId("Error_Dialog_Text").setText(gv_msg);*/
							sap.m.MessageToast.show(gv_msg);
						} else if (gv_msg == "") {
							//Calling OData URI to fetch the remaining details from ZPP08 table
							var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS_QM_FQI/"));
							var path = "/UPLOAD_MASTER_HDRCollection(Mode='UPLOAD_MASTER_HDR',Barcode_No='',Frame_No='" + gv_frame_no + "')";
							oDataModel.read(path, null, null, false, function (oData, oResponse) {
									window.myView.byId("BarcodeNo").setValue(oData.Barcode_No);
									window.myView.byId("EngineNo").setText(oData.Engine_No);
									window.myView.byId("Plant").setText(oData.Plant);
									var prod_date = gv_Dateformat.format(new Date(oData.Production_Date));
									window.myView.byId("Prod_Date").setText(prod_date);
									var post_date = gv_Dateformat.format(new Date(oData.Posting_Date));
									window.myView.byId("Post_Date").setText(post_date);
									window.myView.byId("Shift").setText(oData.Shift);
									window.myView.byId("Shift_name").setText(oData.Shift_Name);
									window.myView.byId("Prod_Line").setText(oData.Production_Line);
									//Calling OData URI to fetch the latest revision upload master details if available
									var oDataModel = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS_QM_FQI/"));
									var path = "/UPLOAD_MASTER_TBLCollection?$filter=Mode eq 'UPLOAD_MASTER_TBL' and Plant eq '" + gv_plant +
										"' and Model_Name eq '" + gv_model_name + "' and Barcode eq '" + gv_barcode_no + "'";
									oDataModel.read(path, null, null, false, function (oData, oResponse) {
											var interval = setInterval(function () {
												busyDialog.close();
												var UploadData = oData.results;
												var i;
												var UploadDataArray = [];
												for (i = 0; i < UploadData.length; i++) {
													var oNewObject = {};
													//Appending data to the object to push to the array for filtering the output table
													oNewObject.Check_Point = UploadData[i].Check_Point; //Check Point
													oNewObject.Check_Method = UploadData[i].Check_Method; //Check Method
													oNewObject.Complaint_Type = UploadData[i].Complaint_Type; //Complaint Type
													oNewObject.Type = UploadData[i].Type; //Type  
													oNewObject.Lsl = UploadData[i].Lsl; //Lsl  
													oNewObject.Usl = UploadData[i].Usl; //Usl 
													oNewObject.Uom = UploadData[i].Uom; //Uom  
													UploadDataArray.push(oNewObject);
												}
												var oModel = new sap.ui.model.json.JSONModel(UploadDataArray);
												//To set the iSizeLimit of the oModel, By default the iSizeLimit will be 100 if we don't set it
												oModel.setSizeLimit(oModel.oData.length);
												//Binding the data to the Cost Center table
												window.myView.byId("T_Upload").setModel(oModel);
												/*window.myView.byId("model_name").bindElement("/");*/
												//Enabling the visbility of the table
												/*window.myView.byId("T_History").setVisible(true);*/
												clearInterval(interval);
											}, 100);
											//Enabling the visibility of the upload master table
											window.myView.byId("T_Upload").setVisible(true);
										},
										function (oData, oResponse) {
											busyDialog.close();
											ErrorDialog.open();
											var data = JSON.parse(error.response.body);
											var Error = data.error.message.value;
											sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
										});
									/*var interval = setInterval(function () {
										busyDialog.close();
										var jsonModel = new sap.ui.model.json.JSONModel(oData.results);
										app_hits = oData.Total_No_Of_Hits;
										var no_of_hits = "App Hits - ".concat(app_hits);
										window.myView.byId("NoOfHits").setText(no_of_hits);
										clearInterval(interval);
									}, 100);*/
								},
								function (oData, oResponse) {
									busyDialog.close();
									ErrorDialog.open();
									var data = JSON.parse(error.response.body);
									var Error = data.error.message.value;
									sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
								});
						}
					},
					function (oData, oResponse) {
						busyDialog.close();
						ErrorDialog.open();
						var data = JSON.parse(error.response.body);
						var Error = data.error.message.value;
						sap.ui.getCore().byId("Error_Dialog_Text").setText(Error);
					});
			}
		},

		//Logic to delete the selected row froom the upload details table
		deleteRow: function (oEvent) {
			var oTable = window.myView.byId("T_Upload");
			oTable.removeItem(oEvent.getParameter("listItem"));
		},

		//Logic to append the row in the upload details table
		addRow: function (oEvent) {
			var oItem = new sap.m.ColumnListItem({
				cells: [new sap.m.Input(), new sap.m.Input(), new sap.m.Input(), new sap.m.Input(), new sap.m.Input(), new sap.m.Input(), new sap
					.m.Input()
				]
			});

			gv_oTable = window.myView.byId("T_Upload");
			gv_oTable.addItem(oItem);
			//Enabling the visibility of the save button
			window.myView.byId("saveButton").setVisible(true);
			//Enabling the visibility of the Reason text area
			window.myView.byId("Reason_Form").setVisible(true);
			/*oTable.bindItems(oTable);*/
			/*var items = window.myView.byId("T_Upload").getModel().getData();
			var table = new sap.ui.table.Table("T_Upload");
			var row = new sap.ui.table.Row({ });
			table.addRow(row);*/
		},

		//Logic to save the new revision of upload master details
		pressSaveBut: function (oEvent) {
			/*sap.ui.getCore().byId("busyDialog_Text").setText("...please wait while data is saving");
			busyDialog.open();*/
			/*var items = window.myView.byId("T_Upload").getModel().getData();*/
			/*var items = gv_oTable.getItems();*/
			gv_reason = window.myView.byId("Reason").getValue();
			var Confirm_dialog = new sap.m.Dialog({
				title: "Confirmation",
				type: "Message",
				state: "Warning",
				content: new sap.m.Text({
					text: "Do you want to continue?"
				}),

				beginButton: new sap.m.Button({
					text: "Yes",
					type: "Accept",
					press: function () {
						Confirm_dialog.close();
						sap.ui.getCore().byId("busyDialog_Text").setText("...please wait while data is saving");
						busyDialog.open();

						/*var operation_desc = window.myView.byId("lbl_opns_no_desc").getValue();
						var model = window.myView.byId("lbl_model").getValue();*/

						setTimeout(function () {
							/*var items = contexts.map(function(oEvent){
								    	      return oEvent.getObject();
											 });*/
							var i;
							//Incl for reading table Usha
							var ItemDetailsArray = [];
							var items = [];
							var table_items = gv_oTable.getItems();
							for (i = 0; i < table_items.length; i++) {
								var cells = gv_oTable.getItems()[i].getCells();
								var obj = {
									"Check_Point": cells[0].getValue(),
									"Check_Method": cells[1].getValue(),
									"Complaint_Type": cells[2].getValue(),
									"Type": cells[3].getValue(),
									"Lsl": cells[4].getValue(),
									"Usl": cells[5].getValue(),
									"Uom": cells[6].getValue()
								};
								items.push(obj);
							}
							//end of Incl	
							/*var spec = /.[0-9]/;*/
							/*var spec = "[0-9]+";*/
							var spec = "[A-Z]+";
							var lv_lsl_numeric_only;
							var lv_usl_numeric_only;
							for (i = 0; i < items.length; i++) {
								var lv_type = items[i].Type;
								var lv_lsl = items[i].Lsl;
								var lv_usl = items[i].Usl;
								lv_type = lv_type.toUpperCase();
								lv_lsl = lv_lsl.toUpperCase();
								lv_usl = lv_usl.toUpperCase();
								if (lv_lsl.match(spec)) {
									lv_lsl_numeric_only = "false";
								} else {
									lv_lsl_numeric_only = "true";
								}
								if (lv_usl.match(spec)) {
									lv_usl_numeric_only = "false";
								} else {
									lv_usl_numeric_only = "true";
								}
								/*var oNewObject = {};
								oNewObject = items[i];*/
								/*if (lv_type === 'OBJECT') {
									lv_lsl = parseInt(lv_lsl);
									lv_usl = parseInt(lv_usl);
									if (lv_lsl.match(spec)) {
										lv_lsl_numeric_only = "true";
									} else {
										lv_lsl_numeric_only = "false";
									}
									if (lv_usl.match(spec)) {
										lv_usl_numeric_only = "true";
									} else {
										lv_usl_numeric_only = "false";
									}
								} else {
									lv_lsl_numeric_only = "false";
									lv_usl_numeric_only = "false";
								}*/
								items[i].Complaint_Type = items[i].Complaint_Type.toUpperCase();
								if (items[i].Check_Point == "") {
									busyDialog.close();
									ItemDetailsArray = [];
									gv_oTable.getItems()[i].getCells()[0].setValueState("Error");
									gv_oTable.getItems()[i].getCells()[1].setValueState("None");
									gv_oTable.getItems()[i].getCells()[2].setValueState("None");
									gv_oTable.getItems()[i].getCells()[3].setValueState("None");
									gv_oTable.getItems()[i].getCells()[4].setValueState("None");
									gv_oTable.getItems()[i].getCells()[5].setValueState("None");
									gv_oTable.getItems()[i].getCells()[6].setValueState("None");
									ErrorDialog.open();
									sap.ui.getCore().byId("Error_Dialog_Text").setText("Check Point is mandatory!!!");
									return;
								} else if (items[i].Check_Method == "") {
									busyDialog.close();
									ItemDetailsArray = [];
									gv_oTable.getItems()[i].getCells()[0].setValueState("None");
									gv_oTable.getItems()[i].getCells()[1].setValueState("Error");
									gv_oTable.getItems()[i].getCells()[2].setValueState("None");
									gv_oTable.getItems()[i].getCells()[3].setValueState("None");
									gv_oTable.getItems()[i].getCells()[4].setValueState("None");
									gv_oTable.getItems()[i].getCells()[5].setValueState("None");
									gv_oTable.getItems()[i].getCells()[6].setValueState("None");
									ErrorDialog.open();
									sap.ui.getCore().byId("Error_Dialog_Text").setText("Check Method is mandatory!!!");
									return;
								} else if (items[i].Complaint_Type == "") {
									busyDialog.close();
									ItemDetailsArray = [];
									gv_oTable.getItems()[i].getCells()[0].setValueState("None");
									gv_oTable.getItems()[i].getCells()[1].setValueState("None");
									gv_oTable.getItems()[i].getCells()[2].setValueState("Error");
									gv_oTable.getItems()[i].getCells()[3].setValueState("None");
									gv_oTable.getItems()[i].getCells()[4].setValueState("None");
									gv_oTable.getItems()[i].getCells()[5].setValueState("None");
									gv_oTable.getItems()[i].getCells()[6].setValueState("None");
									ErrorDialog.open();
									sap.ui.getCore().byId("Error_Dialog_Text").setText("Complaint Type is mandatory!!!");
									return;
								} else if ((items[i].Complaint_Type !== "ENGINE") && (items[i].Complaint_Type !== "BRAKE") && (items[i].Complaint_Type !==
										"TRANSMISSION") && (items[i].Complaint_Type !== "FIT & FINISH") && (items[i].Complaint_Type !== "RIDE & HANDLING") &&
									(items[i].Complaint_Type !== "LIGHTS & ELECTRICALS") && (items[i].Complaint_Type !== "GAUGE & CONTROL")) {
									busyDialog.close();
									ItemDetailsArray = [];
									gv_oTable.getItems()[i].getCells()[0].setValueState("None");
									gv_oTable.getItems()[i].getCells()[1].setValueState("None");
									gv_oTable.getItems()[i].getCells()[2].setValueState("Error");
									gv_oTable.getItems()[i].getCells()[3].setValueState("None");
									gv_oTable.getItems()[i].getCells()[4].setValueState("None");
									gv_oTable.getItems()[i].getCells()[5].setValueState("None");
									gv_oTable.getItems()[i].getCells()[6].setValueState("None");
									ErrorDialog.open();
									sap.ui.getCore().byId("Error_Dialog_Text").setText(
										"Complaint Type is either Engine / Brake / Transmission / Fit & Finish / Ride & Handling / Lights & Electricals / Gauge & Control !!!"
									);
									return;
								} else if (items[i].Type == "") {
									busyDialog.close();
									ItemDetailsArray = [];
									gv_oTable.getItems()[i].getCells()[0].setValueState("None");
									gv_oTable.getItems()[i].getCells()[1].setValueState("None");
									gv_oTable.getItems()[i].getCells()[2].setValueState("None");
									gv_oTable.getItems()[i].getCells()[3].setValueState("Error");
									gv_oTable.getItems()[i].getCells()[4].setValueState("None");
									gv_oTable.getItems()[i].getCells()[5].setValueState("None");
									gv_oTable.getItems()[i].getCells()[6].setValueState("None");
									ErrorDialog.open();
									sap.ui.getCore().byId("Error_Dialog_Text").setText("Type is mandatory!!!");
									return;
								} else if ((lv_type != "OBJECT") && (lv_type != "SUBJECT")) {
									busyDialog.close();
									ItemDetailsArray = [];
									gv_oTable.getItems()[i].getCells()[0].setValueState("None");
									gv_oTable.getItems()[i].getCells()[1].setValueState("None");
									gv_oTable.getItems()[i].getCells()[2].setValueState("None");
									gv_oTable.getItems()[i].getCells()[3].setValueState("Error");
									gv_oTable.getItems()[i].getCells()[4].setValueState("None");
									gv_oTable.getItems()[i].getCells()[5].setValueState("None");
									gv_oTable.getItems()[i].getCells()[6].setValueState("None");
									ErrorDialog.open();
									sap.ui.getCore().byId("Error_Dialog_Text").setText("Please enter Type as either Object / Subject!!!");
									return;
								} else if (items[i].Lsl == "") {
									busyDialog.close();
									ItemDetailsArray = [];
									gv_oTable.getItems()[i].getCells()[0].setValueState("None");
									gv_oTable.getItems()[i].getCells()[1].setValueState("None");
									gv_oTable.getItems()[i].getCells()[2].setValueState("None");
									gv_oTable.getItems()[i].getCells()[3].setValueState("None");
									gv_oTable.getItems()[i].getCells()[4].setValueState("Error");
									gv_oTable.getItems()[i].getCells()[5].setValueState("None");
									gv_oTable.getItems()[i].getCells()[6].setValueState("None");
									ErrorDialog.open();
									sap.ui.getCore().byId("Error_Dialog_Text").setText("Lower Specification Limit is mandatory!!!");
									return;
								} else if (items[i].Usl == "") {
									busyDialog.close();
									ItemDetailsArray = [];
									gv_oTable.getItems()[i].getCells()[0].setValueState("None");
									gv_oTable.getItems()[i].getCells()[1].setValueState("None");
									gv_oTable.getItems()[i].getCells()[2].setValueState("None");
									gv_oTable.getItems()[i].getCells()[3].setValueState("None");
									gv_oTable.getItems()[i].getCells()[4].setValueState("None");
									gv_oTable.getItems()[i].getCells()[5].setValueState("Error");
									gv_oTable.getItems()[i].getCells()[6].setValueState("None");
									ErrorDialog.open();
									sap.ui.getCore().byId("Error_Dialog_Text").setText("Upper Specification Limit is mandatory!!!");
									return;
								} else if ((items[i].Uom == "") && (lv_type == "OBJECT")) {
									busyDialog.close();
									ItemDetailsArray = [];
									gv_oTable.getItems()[i].getCells()[0].setValueState("None");
									gv_oTable.getItems()[i].getCells()[1].setValueState("None");
									gv_oTable.getItems()[i].getCells()[2].setValueState("None");
									gv_oTable.getItems()[i].getCells()[3].setValueState("None");
									gv_oTable.getItems()[i].getCells()[4].setValueState("None");
									gv_oTable.getItems()[i].getCells()[5].setValueState("None");
									gv_oTable.getItems()[i].getCells()[6].setValueState("Error");
									ErrorDialog.open();
									sap.ui.getCore().byId("Error_Dialog_Text").setText("Unit of Measurement is mandatory!!!");
									return;
								} else if ((lv_type == "OBJECT") && (lv_lsl_numeric_only == "false")) {
									busyDialog.close();
									ItemDetailsArray = [];
									gv_oTable.getItems()[i].getCells()[0].setValueState("None");
									gv_oTable.getItems()[i].getCells()[1].setValueState("None");
									gv_oTable.getItems()[i].getCells()[2].setValueState("None");
									gv_oTable.getItems()[i].getCells()[3].setValueState("None");
									gv_oTable.getItems()[i].getCells()[4].setValueState("Error");
									gv_oTable.getItems()[i].getCells()[5].setValueState("None");
									gv_oTable.getItems()[i].getCells()[6].setValueState("None");
									ErrorDialog.open();
									sap.ui.getCore().byId("Error_Dialog_Text").setText("LSL must be a numerical decimal value!!!");
									return;
								} else if ((lv_type == "OBJECT") && (lv_usl_numeric_only == "false")) {
									busyDialog.close();
									ItemDetailsArray = [];
									gv_oTable.getItems()[i].getCells()[0].setValueState("None");
									gv_oTable.getItems()[i].getCells()[1].setValueState("None");
									gv_oTable.getItems()[i].getCells()[2].setValueState("None");
									gv_oTable.getItems()[i].getCells()[3].setValueState("None");
									gv_oTable.getItems()[i].getCells()[4].setValueState("None");
									gv_oTable.getItems()[i].getCells()[5].setValueState("Error");
									gv_oTable.getItems()[i].getCells()[6].setValueState("None");
									ErrorDialog.open();
									sap.ui.getCore().byId("Error_Dialog_Text").setText("USL must be a numerical decimal value!!!");
									return;
								} else {
									gv_oTable.getItems()[i].getCells()[0].setValueState("None");
									gv_oTable.getItems()[i].getCells()[1].setValueState("None");
									gv_oTable.getItems()[i].getCells()[2].setValueState("None");
									gv_oTable.getItems()[i].getCells()[3].setValueState("None");
									gv_oTable.getItems()[i].getCells()[4].setValueState("None");
									gv_oTable.getItems()[i].getCells()[5].setValueState("None");
									gv_oTable.getItems()[i].getCells()[6].setValueState("None");
									//pushing the details into array
									ItemDetailsArray.push({
										"Mode": "UPLOAD_MASTER_DTL",
										"Plant": gv_plant,
										"Model_Name": gv_model_name,
										//"Barcode": gv_barcode_no,
										"Check_Point": items[i].Check_Point,
										"Check_Method": items[i].Check_Method,
										"Complaint_Type": items[i].Complaint_Type,
										"Type": items[i].Type,
										"Lsl": items[i].Lsl,
										"Usl": items[i].Usl,
										"Uom": items[i].Uom,
										"Reason": gv_reason
									});
								}
							}

							if (ItemDetailsArray != "") {
								var createJson = {
									"Mode": "UPLOAD_MASTER_DTL",
									"Plant": gv_plant,
									"Model_Name": gv_model_name,
									"Nav_Upload_Master_Details": JSON.parse(JSON.stringify(ItemDetailsArray))
								};

								var oModelValueHepls = new sap.ui.model.odata.ODataModel(url.getServiceUrl("/ZTS_QM_FQI"), {
									json: true
								}, false, false, false);
								oModelValueHepls.setHeaders({
									"X-Requested-With": "XMLHttpRequest",
									"Content-Type": "application/json",
									"DataServiceVersion": "2.0",
									"Accept": "application/json",
									"Method": "POST"
								});

								oModelValueHepls.create("/UPDATE_HDRCollection", createJson, null, function (oData, oResponse) {
									/*var msg = oResponse.headers["sap-message"];*/
									/*var msg = oResponse.statusText;*/

									/*sap.m.MessageToast.show("Data has been saved successfully");*/
									busyDialog.close();
									SuccesDialog.open();
									sap.ui.getCore().byId("Succes_Dialog_Text").setText("Data has been saved successfully");
								}, function (error) {
									/*var msg = oResponse.statusText;*/
									/*sap.m.MessageBox.alert("Data was not saved");*/
									/*alert("Failure");*/
									busyDialog.close();
									AlertDialog.open();
									sap.ui.getCore().byId("Alert_Dialog_Text").setText("Data was not saved");
								});
							}
						}, 1000);
					}
				}),
				endButton: new sap.m.Button({
					text: "No",
					type: "Reject",
					press: function () {
						Confirm_dialog.close();
					}
				}),
				afterClose: function () {
					//	Delete_dialog.destroy();
				}
			});
			Confirm_dialog.open();
		}
	});
});