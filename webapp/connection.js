function sUrl(urlType) {
	this.type= "idm";
	this.LocalUrl = "proxy/http/10.121.3.177:8000/sap/opu/odata/sap";
	this.IdmUrl = "/sap/opu/odata/sap";
	this.host = this.IdmUrl;
	if(urlType== "local"){
		this.host = this.LocalUrl;
	}
	this.getServiceUrl= function(sPath){
		return this.host + sPath;
	}
	}