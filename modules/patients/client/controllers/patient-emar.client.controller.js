(function () {
    'use strict';

    angular
        .module('patients')
        .controller('PatientEmarController', PatientEmarController);

    PatientEmarController.$inject = ['$scope', 'Authentication', 'patientResolve', 'rtCalcService', 'DataFactory', 'dialogService', 'toastService'];

    function PatientEmarController($scope, Authentication, patient, rtCalcService, DataFactory, dialogService, toastService) {
        var vm = this;
        vm.authentication = Authentication;
        vm.patient = patient;
        vm.patientMedications = [];

        // RT Calculations
        vm.calcAge = function (dateStr) {
            if(vm.exist(dateStr)){
                return rtCalcService.calcAge(dateStr);
            } else {
                return 0;
            }
        };

        vm.calcFt = function (value) {
            if(vm.exist(value)) {
                return rtCalcService.calcFt(value);
            } else {
                return "0' 0\"";
            }
        };
        vm.calcLb = function (value) {
            if(vm.exist(value)) {
                return rtCalcService.calcLb(value);
            } else {
                return 0;
            }
        };

        vm.calcBMI = function (kg, cm) {
            vm.bmi = rtCalcService.calcBMI(kg, cm);
            return   rtCalcService.calcBMI(kg, cm);
        };
        vm.textBMI = function (bmi) {
            return rtCalcService.textBMI(bmi);
        };

        vm.calcAmt = function (str, dose, amt) {
            if(vm.exist(str) && vm.exist(dose) && vm.exist(amt)) {
                return rtCalcService.calcAmt(str, dose, amt);
            } else {
                return amt;
            }
        };

        // Check Value Exist
        vm.exist = function (value) {
            return !(value === null || value === '' || value === undefined);
        };

        function init() {
            DataFactory.getData('patients', vm.patient._id).then(
                function(res) {
                    vm.patientMedications = res.medications;
                },
                function(err) { vm.error = err; }
            );
        }

        // Verify 5 Rights of Patient
        vm.verify5Rights = function (isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'vm.form.meduScanForm');
                return false;
            }
            var id = vm.scan;

            // Right Patient?
            var patient = vm.patient;

            // Right Medication?
            var index = vm.rightMedication(vm.patientMedications, id);
            if(index < 0) {// Medication was not found.
                // Alert medication NOT found
                alert.msg = 'Medication : "' + id + '" NOT found for patient : "'+patient.firstName+' '+patient.lastName+'".';
                dialogService.simpleAlert(alert);
            }
            else {// Medication was found.
                var medication = vm.patientMedications[index];
                //console.log(medication);

                // If all checks go -> Give the medication
                if(!medication.triggerScenario && !medication.given && !patient.pregnant && vm.rightTime(medication.time, patient.scenarioTime) === 'onTime' && vm.rightDose(medication._id.strength, medication.dose) === 'correct') {
                    vm.giveMedication(index);
                }
                else {
                    if(patient.pregnant) {
                        vm.resultOfPregnancyCategory(medication, index);
                    }
                    else {
                        vm.resultOfTriggerScenarioAlert(medication, index);
                    }
                }
            }
        };

        vm.giveMedication = function (index) {
            vm.patientMedications[index].given = true;
            vm.patientMedications[index].givenTime = new Date();

            toastService.simpleToast(vm.patientMedications[index]._id.name +' administered @: '+vm.patientMedications[index].givenTime+'.');
        };

        vm.rightMedication = function (patientMedications, id){
            var index = -1;

            for(var i = 0; i < patientMedications.length; i++) {
                if(patientMedications[i]._id._id === id){
                    return i;
                }
            }
            return index;
        };

        vm.rightTime = function(giveTime, scenarioTime) {
            //2 hour window
            var time ='';
            var gt = new Date(giveTime); var st = new Date(scenarioTime);
            //console.log(gt.getHours());
            //console.log((st.getHours() -2) +' - '+(st.getHours() +2));
            if (gt.getHours() > (st.getHours() +2)) {
                time ='late';
            }
            if (gt.getHours() < (st.getHours() -2)) {
                time = 'early';
            }
            else if(gt.getHours() >= (st.getHours() -2) && gt.getHours() <= (st.getHours() +2)) {
                time = 'onTime';
            }
            return time;
        };

        vm.rightDose = function(str, dose) {
            var doseReq ='';
            //console.log('str: '+ str+ ' dose: '+dose);
            if(dose > str) {
                doseReq = 'needMore';
            }
            if (dose < str) {
                doseReq = 'needLess';
            }
            else if(dose === str) {
                doseReq = 'correct';
            }
            return doseReq;
        };

        vm.resultOfPregnancyCategory = function(medication, index) {
            var alert = {};
            alert.title = 'Alert - Pregnancy Category';
            alert.question = 'Would you like to give anyway?';
            alert.medication = medication;

            var pc = medication._id.pregnancyCategory;
            if(pc === 'Category C' || pc === 'Category D' || pc === 'Category X' || pc === 'Category N'){
                alert.msg = 'Warning patient is pregnant, and this medication is labeled with Pregnancy '+pc+'. ';
                dialogService.alert(alert).then(
                    function(give) {
                        if (give) {
                            //medication.triggerScenario = false;
                            vm.resultOfTriggerScenarioAlert(medication, index);
                        }
                    },
                    function(){}
                );
            }
            else { vm.resultOfTriggerScenarioAlert(medication, index); }
        };

        vm.resultOfTriggerScenarioAlert = function (medication, index){
            var alert = {};
            alert.title = 'Alert';
            alert.question = 'Would you like to give anyway?';
            alert.medication = medication;

            if (medication.triggerScenario) {
                // Alert scenarioAlertMsg
                alert.msg = medication.scenarioAlertMsg;
                dialogService.alert(alert).then(
                    function(give) {
                        if (give) {
                            //medication.triggerScenario = false;
                            vm.resultOfAlreadyGivenAlert(medication, index);
                        }
                    },
                    function(){}
                );
            }
            else { vm.resultOfAlreadyGivenAlert(medication, index); }
        };

        vm.resultOfAlreadyGivenAlert = function (medication, index) {
            var alert = {};
            alert.title = 'Alert - Already Given';
            alert.question = 'Would you like to give anyway?';
            alert.medication = medication;

            if (medication.given) {
                // Alert given if 'yes, give anyway' is selected --> continue
                alert.msg = 'Warning this medication already been given to ' + patient.firstName + ' ' + patient.lastName +
                    '@ : ' + medication.time;
                dialogService.alert(alert).then(
                    function (give) {
                        if (give) {
                            vm.resultOfWrongTimeAlert(medication, index);
                        }
                    },
                    function () {}
                );
            }
            else { vm.resultOfWrongTimeAlert(medication, index); }
        };

        vm.resultOfWrongTimeAlert = function (medication, index) {
            var alert = {};
            alert.title = 'Alert - Medication Early/Late';
            alert.question = 'Would you like to give anyway?';
            alert.medication = medication;

            var time = vm.rightTime(medication.time, patient.scenarioTime);
            if (time === 'early') {
                alert.msg = 'This medication is early.';
            }
            if (time === 'late') {
                alert.msg = 'This medication is late.';
            }
            if (time !== 'onTime') {
                // Alert time if 'yes, give anyway' is selected --> continue
                dialogService.alert(alert).then(
                    function (give) {
                        if (give) {
                            vm.resultOfWrongDoseAlert(medication, index);
                        }
                    },
                    function () {}
                );
            }
            else { vm.resultOfWrongDoseAlert(medication, index); }
        };

        vm.resultOfWrongDoseAlert = function (medication, index) {
            var alert = {};
            //alert.title = 'Alert';
            //alert.question = 'Would you like to give anyway?';
            alert.medication = medication;

            var dose = vm.rightDose(medication._id.strength, medication.dose);
            var amt = vm.calcAmt(medication._id.strength, medication.dose, medication._id.amount);
            if (dose === 'needMore') {
                var xMore = medication.dose - medication._id.strength;
                alert.msg = 'The strength of this medication is ' + medication._id.strength + ' ' + medication._id.unit +
                    '. The dose required for this medication is: ' + medication.dose + ' ' + medication._id.unit +
                    '. You must ADD ' + xMore + ' ' + medication._id.unit + ' to administer the correct dosage.';
            }
            if (dose === 'needLess') {
                var xLess = medication._id.strength - medication.dose;
                alert.msg = 'The strength of this medication is ' + medication._id.strength + ' ' + medication._id.unit +
                    '. The dose required for this medication is: ' + medication.dose + ' ' + medication._id.unit +
                    '. You must REMOVE ' + xLess + ' ' + medication._id.unit + ' to administer the correct dosage.';
            }
            if (dose !== 'correct') {
                alert.title = 'Alert - Amount Adjustment Required';
                alert.instructions = 'Please administer a total of ' + amt + ' ' + medication._id.form + '. ';
                // Alert dosage if 'yes, give anyway' is selected -->  continue
                dialogService.alert(alert).then(
                    function (give) {
                        if (give) {
                            vm.giveMedication(index);
                        }
                    },
                    function () {}
                );
            }
            else { // All checks go -> Give the medication
                vm.giveMedication(index);
            }
        };

        init();
    }
})();
