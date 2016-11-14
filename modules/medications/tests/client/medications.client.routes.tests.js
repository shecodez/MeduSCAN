(function () {
  'use strict';

  describe('Medications Route Tests', function () {
    // Initialize global variables
    var $scope,
      MedicationsService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _MedicationsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      MedicationsService = _MedicationsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('medications');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/medications');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          MedicationsController,
          mockMedication;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('medications.view');
          $templateCache.put('modules/medications/client/views/view-medication.client.view.html', '');

          // create mock Medication
          mockMedication = new MedicationsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Medication Name'
          });

          //Initialize Controller
          MedicationsController = $controller('MedicationsController as vm', {
            $scope: $scope,
            medicationResolve: mockMedication
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:medicationId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.medicationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            medicationId: 1
          })).toEqual('/medications/1');
        }));

        it('should attach an Medication to the controller scope', function () {
          expect($scope.vm.medication._id).toBe(mockMedication._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/medications/client/views/view-medication.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          MedicationsController,
          mockMedication;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('medications.create');
          $templateCache.put('modules/medications/client/views/form-medication.client.view.html', '');

          // create mock Medication
          mockMedication = new MedicationsService();

          //Initialize Controller
          MedicationsController = $controller('MedicationsController as vm', {
            $scope: $scope,
            medicationResolve: mockMedication
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.medicationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/medications/create');
        }));

        it('should attach an Medication to the controller scope', function () {
          expect($scope.vm.medication._id).toBe(mockMedication._id);
          expect($scope.vm.medication._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/medications/client/views/form-medication.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          MedicationsController,
          mockMedication;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('medications.edit');
          $templateCache.put('modules/medications/client/views/form-medication.client.view.html', '');

          // create mock Medication
          mockMedication = new MedicationsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Medication Name'
          });

          //Initialize Controller
          MedicationsController = $controller('MedicationsController as vm', {
            $scope: $scope,
            medicationResolve: mockMedication
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:medicationId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.medicationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            medicationId: 1
          })).toEqual('/medications/1/edit');
        }));

        it('should attach an Medication to the controller scope', function () {
          expect($scope.vm.medication._id).toBe(mockMedication._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/medications/client/views/form-medication.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
