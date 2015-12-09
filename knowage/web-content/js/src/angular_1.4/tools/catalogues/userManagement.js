var app = angular.module("UsersManagementModule",["ngMaterial","angular_list","angular_table","sbiModule","angular_2_col"]);
app.controller("UsersManagementController",["sbiModule_translate","sbiModule_restServices", "$scope","$mdDialog","$mdToast","$timeout",UsersManagementFunction]);
function UsersManagementFunction(sbiModule_translate, sbiModule_restServices, $scope, $mdDialog, $mdToast,$timeout){
	
	//VARIABLES
	
	$scope.showme = false; // flag for showing right side 
	$scope.dirtyForm = false; // flag to check for modification
	$scope.translate = sbiModule_translate;
	$scope.SelectedConstraint = {}; // main item
	$scope.PredefinedItem = {}; // predefined item
	$scope.PredefinedList = []; // array that hold predefined list
	$scope.label = "";
	$scope.ItemList = []; // array that hold custom list
	$scope.listType = []; // array that hold dropdown list from domain
	$scope.showActionOK = function(msg) {
		  var toast = $mdToast.simple() 
		  .content(msg)
		  .action('OK')
		  .highlightAction(false)
		  .hideDelay(3000)
		  .position('top')

		  $mdToast.show(toast).then(function(response) {

		   if ( response == 'ok' ) {


		   }
		  });
		 };
		 
		 $scope.ccSpeedMenu= [
		                         {
		                            label:sbiModule_translate.load("sbi.generic.delete"),
		                            icon:'fa fa-trash-o fa-lg',
		                            color:'#153E7E',
		                            action:function(item,event){
		                                
		                            	$scope.deleteConstraint(item);
		                            }
		                         }
		                        ];
		 
		 
		 $scope.confirm = $mdDialog
		    .confirm()
		    .title(sbiModule_translate.load("sbi.catalogues.generic.modify"))
		    .content(
		            sbiModule_translate
		            .load("sbi.catalogues.generic.modify.msg"))
		            .ariaLabel('toast').ok(
		                    sbiModule_translate.load("sbi.general.continue")).cancel(
		                            sbiModule_translate.load("sbi.general.cancel"));
 
		 
		 
		
	 
	//FUNCTIONS	
		 
	angular.element(document).ready(function () { // on page load function
				
		    });
	
	$scope.setDirty=function(){ 
		  $scope.dirtyForm=true;
	}
	
	$scope.clearRight=function(index){
		 if($scope.dirtyForm){
			   $mdDialog.show($scope.confirm).then(function(){
				$scope.dirtyForm=false;   
				$scope.showme = false;
				$scope.showpred = false;
			           
			   },function(){
			    
				   $scope.showme = false;
				   $scope.showpred = false;
			   });
			   
			  }else{
			 
				  $scope.showme = false;
				  $scope.showpred = false;
			  }
		
		
		
	}
	
	$scope.loadConstraints=function(item){  // this function is called when item from custom table is clicked
		
		 if($scope.dirtyForm){
			   $mdDialog.show($scope.confirm).then(function(){
				$scope.dirtyForm=false;   
				$scope.SelectedConstraint=angular.copy(item);
				$scope.showme=true;
				$scope.showpred = false;
			    $scope.label = "";
			           
			   },function(){
			    
				$scope.showme = true;
				$scope.showpred = false;
			   });
			   
			  }else{
			 
			  $scope.SelectedConstraint=angular.copy(item);
			  $scope.showme=true;
			  $scope.showpred = false;
			  }
	} 	                
	
	$scope.cancel = function() { // on cancel button
		$scope.SelectedConstraint={};
		$scope.showme = false;
		$scope.dirtyForm=false;
		$scope.showpred = false;
		

	}
	
	
	$scope.loadPredefined=function(item){  // this function is called when item from predefined table is clicked
		$scope.showme = false;
		$scope.PredefinedItem=item;
		$scope.showpred=true;
	} 	                
	
	$scope.createUser=function(){ // this function is called when clicking on plus button
		 if($scope.dirtyForm){
			   $mdDialog.show($scope.confirm).then(function(){
				$scope.dirtyForm=false;   
				$scope.SelectedConstraint={};
				$scope.showme=true;
			    $scope.label = "";
			           
			   },function(){
			    
				$scope.showme = true;
			   });
			   
			  }else{
			 
			$scope.SelectedConstraint={};
			  $scope.showme=true;
			  }
	}
	
	$scope.saveConstraints= function(){  // this function is called when clicking on save button
		
		if($scope.SelectedConstraint.hasOwnProperty("checkId")){ // if item already exists do update PUT
			
			sbiModule_restServices
		    .put("2.0/customChecks",$scope.SelectedConstraint.checkId,$scope.SelectedConstraint).success(
					function(data, status, headers, config) {
						console.log(data);
						if (data.hasOwnProperty("errors")) {
							console.log(sbiModule_translate.load("sbi.glossary.load.error"));
						} else {
							$scope.ItemList=[];
							$timeout(function(){								
								$scope.getCustom();
							}, 1000);
							$scope.showActionOK(sbiModule_translate.load("sbi.catalogues.toast.updated"));
							$scope.SelectedConstraint={};
							$scope.showme=false;
							$scope.dirtyForm=false;	
						}
					}).error(function(data, status, headers, config) {
						console.log(sbiModule_translate.load("sbi.glossary.load.error"));

					})	
			
		}else{ // create new item in database POST
			console.log($scope.SelectedConstraint);
			sbiModule_restServices
		    .post("2.0/customChecks","",angular.toJson($scope.SelectedConstraint)).success(
					function(data, status, headers, config) {
						console.log(data);
						if (data.hasOwnProperty("errors")) {
							console.log(sbiModule_translate.load("sbi.glossary.load.error"));
						} else {
							$scope.ItemList=[];
							$timeout(function(){								
								$scope.getCustom();
							}, 1000);
							$scope.showActionOK(sbiModule_translate.load("sbi.catalogues.toast.created"));
							$scope.SelectedConstraint={};
							$scope.showme=false;
							$scope.dirtyForm=false;
						}
					}).error(function(data, status, headers, config) {
						console.log(sbiModule_translate.load("sbi.glossary.load.error"));

					})	
			
			
		}
		
	}

	$scope.FieldsCheck = function(l){ // function that checks if field is necessary and assigns few values to main item on click
		
		$scope.label = l.VALUE_DS;
		$scope.SelectedConstraint.valueTypeId=l.VALUE_ID;
	 $scope.SelectedConstraint.valueTypeCd=l.VALUE_CD;
		if(l.VALUE_NM == "Range"){
			$scope.additionalField= true;
		}else{
			$scope.additionalField= false;
		}
	}
	$scope.getPredefined = function(){ // service that gets predefined list GET
		sbiModule_restServices.get("2.0", "predefinedChecks").success(
				function(data, status, headers, config) {
					console.log(data);
					if (data.hasOwnProperty("errors")) {
						console.log(sbiModule_translate.load("sbi.glossary.load.error"));
					} else {
						$scope.PredefinedList = data;
					}
				}).error(function(data, status, headers, config) {
					console.log(sbiModule_translate.load("sbi.glossary.load.error"));

				})	
	}
	
	
	$scope.getCustom = function(){ // service that gets user created list GET
		sbiModule_restServices.get("2.0", "customChecks").success(
				function(data, status, headers, config) {
					console.log(data);
					if (data.hasOwnProperty("errors")) {
						console.log(sbiModule_translate.load("sbi.glossary.load.error"));
					} else {
						$scope.ItemList = data;
					}
				}).error(function(data, status, headers, config) {
					console.log(sbiModule_translate.load("sbi.glossary.load.error"));

				})	
	}
			
	
	$scope.getDomainType = function(){ // service that gets domain types for dropdown GET
		sbiModule_restServices.get("domains", "listValueDescriptionByType","DOMAIN_TYPE=CHECK").success(
				function(data, status, headers, config) {
					if (data.hasOwnProperty("errors")) {
						console.log(sbiModule_translate.load("sbi.glossary.load.error"));
					} else {
						console.log(data);
						$scope.listType = data;
					}
				}).error(function(data, status, headers, config) {
					console.log(sbiModule_translate.load("sbi.glossary.load.error"));

				})	
	}
	
	$scope.deleteConstraint = function(item){ // this function is called when clicking on delete button
		sbiModule_restServices.delete("2.0/customChecks",item.checkId).success(
				function(data, status, headers, config) {
					console.log(data);
					if (data.hasOwnProperty("errors")) {
						console.log(sbiModule_translate.load("sbi.glossary.load.error"));
					} else {
						$scope.ItemList=[];
						$timeout(function(){								
							$scope.getCustom();
						}, 1000);
						$scope.showActionOK(sbiModule_translate.load("sbi.catalogues.toast.deleted"));
						$scope.SelectedConstraint={};
						$scope.showme=false;
						$scope.dirtyForm=false;
					}
				}).error(function(data, status, headers, config) {
					console.log(sbiModule_translate.load("sbi.glossary.load.error"));

				})	
	}
};
