(function () {
  'use strict';

  describe('Institutions Route Tests', function () {
    // Initialize global variables
    var $scope,
      InstitutionsService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _InstitutionsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      InstitutionsService = _InstitutionsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('institutions');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/institutions');
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
          InstitutionsController,
          mockInstitution;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('institutions.view');
          $templateCache.put('modules/institutions/client/views/view-institution.client.view.html', '');

          // create mock Institution
          mockInstitution = new InstitutionsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Institution Name'
          });

          //Initialize Controller
          InstitutionsController = $controller('InstitutionsController as vm', {
            $scope: $scope,
            institutionResolve: mockInstitution
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:institutionId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.institutionResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            institutionId: 1
          })).toEqual('/institutions/1');
        }));

        it('should attach an Institution to the controller scope', function () {
          expect($scope.vm.institution._id).toBe(mockInstitution._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/institutions/client/views/view-institution.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          InstitutionsController,
          mockInstitution;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('institutions.create');
          $templateCache.put('modules/institutions/client/views/form-institution.client.view.html', '');

          // create mock Institution
          mockInstitution = new InstitutionsService();

          //Initialize Controller
          InstitutionsController = $controller('InstitutionsController as vm', {
            $scope: $scope,
            institutionResolve: mockInstitution
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.institutionResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/institutions/create');
        }));

        it('should attach an Institution to the controller scope', function () {
          expect($scope.vm.institution._id).toBe(mockInstitution._id);
          expect($scope.vm.institution._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/institutions/client/views/form-institution.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          InstitutionsController,
          mockInstitution;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('institutions.edit');
          $templateCache.put('modules/institutions/client/views/form-institution.client.view.html', '');

          // create mock Institution
          mockInstitution = new InstitutionsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Institution Name'
          });

          //Initialize Controller
          InstitutionsController = $controller('InstitutionsController as vm', {
            $scope: $scope,
            institutionResolve: mockInstitution
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:institutionId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.institutionResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            institutionId: 1
          })).toEqual('/institutions/1/edit');
        }));

        it('should attach an Institution to the controller scope', function () {
          expect($scope.vm.institution._id).toBe(mockInstitution._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/institutions/client/views/form-institution.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
