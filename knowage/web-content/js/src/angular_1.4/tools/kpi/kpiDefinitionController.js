var app = angular.module('kpiDefinitionManager', [ 'ngMaterial', 'angular_table' ,'sbiModule', 'angular-list-detail','ui.codemirror']);
app.config(['$mdThemingProvider', function($mdThemingProvider) {
	$mdThemingProvider.theme('knowage')
	$mdThemingProvider.setDefaultTheme('knowage');
}]);
app.controller('kpiDefinitionMasterController', ['$scope','sbiModule_translate', 'sbiModule_restServices','$mdDialog','$q','$mdToast',kpiDefinitionMasterControllerFunction ]);

function kpiDefinitionMasterControllerFunction($scope,sbiModule_translate,sbiModule_restServices,$mdDialog,$q,$mdToast){
	$scope.translate=sbiModule_translate;
	//variables formula
	$scope.checkFormula = false;
	$scope.kpi = {"name":"","definition":"",'id':undefined};
	$scope.activeSave = "";
	$scope.AttributeCategoryList=[];
	$scope.showGUI=false;
	$scope.formulaModified={"value":false};
	$scope.kpiList=[];
	$scope.kpiListOriginal=[];

	//variables cardinality
	$scope.cardinality={};
	$scope.cardinality.measureList=[];
	$scope.cardinality.checkedAttribute={"attributeUnion":{},"attributeIntersection":{}};
	//methods formula

	sbiModule_restServices.promiseGet("2.0/domains","listByCode/KPI_KPI_CATEGORY")
	.then(function(response){ 
		angular.copy(response.data,$scope.AttributeCategoryList);
		console.log("Cisono",$scope.AttributeCategoryList);
	},function(response){
		console.log("errore")
	});

	$scope.parseFormula = function(){
		$scope.$broadcast ('parseEvent');

		if($scope.showGUI){
			$scope.showSaveGUI().then(function(response){{}
			if($scope.activeSave=="add"){
				//int his moment i set manually threshold
				$scope.kpi.threshold= 1;
				$scope.saveKPI();
			}else{
				$scope.saveKPI();
			}

			});

		}


	}
	$scope.flagActivateBrother= function(event){
		$scope.$broadcast (event);
	}



	$scope.cancelMeasureFunction=function(){
		if(!angular.equals($scope.originalRule,$scope.currentRule)){
			var confirm = $mdDialog.confirm()
			.title('Modifica in corso?')
			.content('sei sicuro di voler annullare l\'operazione?.')
			.ariaLabel('cancel metadata') 
			.ok('OK')
			.cancel('CANCEL');
			$mdDialog.show(confirm).then(function() {
				$angularListDetail.goToList();
			}, function() {
				return;
			});
		}else{
			$angularListDetail.goToList();
		} 
	};
	$scope.cancel = function(){
		if($scope.formulaModified.value){
			var confirm = $mdDialog.confirm()
			.title('Modifica in corso?')
			.content('sei sicuro di voler annullare l\'operazione?.')
			.ariaLabel('cancel metadata') 
			.ok('OK')
			.cancel('CANCEL');
			$mdDialog.show(confirm).then(function() {
				$scope.formulaModified.value=false;
				$scope.$broadcast ('cancelEvent');
			}, function() {
				return;
			});
		}else{
			$scope.formulaModified.value=false;
			$scope.$broadcast ('cancelEvent');
		}




	}
	$scope.showSaveGUI= function(){
		var deferred = $q.defer();
		$mdDialog.show({
			controller: DialogControllerKPI,
			templateUrl: 'templatesaveKPI.html',
			clickOutsideToClose:true,
			preserveScope:true,
			locals: {items: deferred,AttributeCategoryList: $scope.AttributeCategoryList,kpi:$scope.kpi }
		})
		.then(function(answer) {
			$scope.status = 'You said the information was "' + answer + '".';
			return deferred.resolve($scope.selectedFunctionalities);
		}, function() {
			$scope.status = 'You cancelled the dialog.';
		});
		return deferred.promise;
	}


	$scope.showAction = function(text) {
		var toast = $mdToast.simple()
		.content(text)
		.action('OK')
		.highlightAction(false)
		.hideDelay(3000)
		.position('top')

		$mdToast.show(toast).then(function(response) {

			if ( response == 'ok' ) {


			}
		});
	}

	$scope.saveKPI = function(){
		$scope.kpi.definition = JSON.stringify($scope.kpi.definition);
		$scope.kpi.cardinality=JSON.stringify($scope.cardinality);
		//after i'm setting this with a method getthreshold()
		$scope.kpi.threshold=1;
		sbiModule_restServices.post("1.0/kpi", 'saveKpi',$scope.kpi).success(
				function(data, status, headers, config) {
					if (data.hasOwnProperty("errors")) {
						console.log("layer non Ottenuti");
						$scope.showAction(data);
					} else {
						$scope.$broadcast ('savedEvent');
						$scope.formulaModified.value=false;
					}

				}).error(function(data, status, headers, config) {
					console.log("layer non Ottenuti " + status);
					$scope.showAction(data);
				})


	}
	$scope.measureMenuOption= [{
		label : sbiModule_translate.load('sbi.generic.delete'),
		icon:'fa fa-trash' ,	 
		action : function(item,event) {
			$scope.deleteMeasure(item,event);
		}

	}];

	$scope.deleteMeasure=function(item,event){
		var confirm = $mdDialog.confirm()
		.title($scope.translate.load("sbi.kpi.measure.delete.title"))
		.content($scope.translate.load("sbi.kpi.measure.delete.content"))
		.ariaLabel('delete measure') 
		.ok($scope.translate.load("sbi.general.yes"))
		.cancel($scope.translate.load("sbi.general.No"));
		$mdDialog.show(confirm).then(function() {


			sbiModule_restServices.promiseDelete("1.0/kpi",item.id+"/deleteKpi").then(
					function(response){
						$scope.$broadcast("deleteKpiEvent");
					},
					function(response){
						$scope.errorHandler(response.data,""); 
					});




		}, function() {
			console.log("annulla")
		});
	}


	//methods cardinality

	$scope.setCardinality = function(){
		$scope.$broadcast ('parseEvent');
		$scope.cardinality.measureList=[];
		var definition = $scope.kpi.definition;

		sbiModule_restServices.post("1.0/kpi", 'buildCardinalityMatrix',$scope.kpi.definition.measures).success(
				function(data, status, headers, config) {
					if (data.hasOwnProperty("errors")) {
						console.log("layer non Ottenuti");
						$scope.showAction(data);
					} else {
						angular.copy(data,$scope.cardinality.measureList);
						$scope.cardinality.checkedAttribute={"attributeUnion":{},"attributeIntersection":{}};
						$scope.$broadcast ('activateCardinalityEvent');
						//$scope.cardinality.measureList=data;
					}

				}).error(function(data, status, headers, config) {
					console.log("layer non Ottenuti " + status);
					$scope.showAction(data);
				})

				/*	$scope.cardinality.measureList=[
		                	{	"ruleName": "regola1",
		                		"measureName": "numScuole1",
		                		"attributs": {"Regione":false,"Provincia":false,"Comune":false,"Tipologia":false
		                		}
		                	},
		                		{	"ruleName": "regola2",
		                		"measureName": "numAbitanti",
		                		"attributs": {"Regione":false,"Provincia":false,"Comune":false,"FasciaEta":false,"CatLavoratore":false}
		                	},
		                		{	"ruleName": "regola3",
		                		"measureName": "pilProCapite",
		                		"attributs": {"Regione":false,"FasciaEta":false,"CatLavoratore":false}
		                	},
		                		{	"ruleName": "regola4",
		                			"measureName": "densPopolazione",
		                			"attributs": {"AreaGeografice":false}
		                	}
		                ];
				 */


	}


	$scope.indexInList=function(item, list) {

		for (var i = 0; i < list.length; i++) {
			var object = list[i];
			if(object.measureName==item){
				return i;
			}
		}

		return -1;
	};

};
function DialogControllerKPI($scope,$mdDialog,items,AttributeCategoryList,kpi){

	$scope.AttributeCategoryList=AttributeCategoryList;
	$scope.kpi=kpi;
	$scope.close = function(){
		$mdDialog.cancel();

	}
	$scope.apply = function(){
		$mdDialog.cancel();
		items.resolve($scope.kpi);
		//in this moment i set this variable manually


	}

	$scope.querySearchCategory=function(query){
		var results = query ? $scope.AttributeCategoryList.filter( createFilterFor(query) ) : [];
		results.push({valueCd:angular.uppercase(query)})
		return results;
	}
	function createFilterFor(query) {
		var lowercaseQuery = angular.lowercase(query);
		return function filterFn(state) {
			return (angular.lowercase(state.valueCd).indexOf(lowercaseQuery) === 0);
		};
	}



}
