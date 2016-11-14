(function () {
  'use strict';

  angular
    .module('patients')
    .factory('rtCalcService', rtCalcService);

  rtCalcService.$inject = [/* Example: '$state', '$window' */];

  function rtCalcService(/* Example: $state, $window */) {
    // rtCalcService service logic
    var calcService = {};

    calcService.calcAge = function (dateString) {
      // var birthday = +new Date(dateString);
      // return ~~((Date.now() - birthday) / (31557600000)); ~Kristoffer Dorph - SO

      var today = new Date();
      var birthDate = new Date(dateString);
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };// Mohit Yadav - SO

    /* ft = cm/30.48 */
    calcService.calcFt = function (value) {
      // var value = parseFloat(cm);
      var _ft = parseInt(value / 30.48, 10);
      var _in = ((value / 30.48) % 1).toFixed(1).toString().split('.')[1];

      return parseInt(value / 30.48, 10) + '\' ' + ((value / 30.48) % 1).toFixed(1).toString().split('.')[1] + '\'\'';
    };

    /* lb = kg*2.2046 */
    calcService.calcLb = function (value) {
      // var value = parseFloat(kg);
      var _lbs = parseInt(value * 2.2046, 10);

      return parseInt(value * 2.2046, 10);
    };

    /* bmi = kg/m^2 */
    calcService.calcBMI = function (kg, cm) {
      var m = (cm / 100);

      return (kg / (m * m)).toFixed(1);
    };

    calcService.textBMI = function (bmi) {
      var bmiText = '';

      if (bmi < 18.5)
        bmiText = 'Underweight';
      if (bmi > 18.5 && bmi < 24.9)
        bmiText = 'Normal Weight';
      if (bmi > 25.0 && bmi < 29.9)
        bmiText = 'Overweight';
      if (bmi > 30.0)
        bmiText = 'Obese';

      return bmiText;
    };

    calcService.calcAmt = function (str, dose, amt) {
      var newAmt = ((dose / str) * amt);
      if (newAmt % 1 === 0) {// is whole number
        return newAmt;
      }
      return newAmt.toFixed(2);
    };

    // Public API
    return calcService;
  }
})();
