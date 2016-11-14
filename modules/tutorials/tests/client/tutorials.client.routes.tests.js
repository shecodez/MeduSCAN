(function () {
  'use strict';

  describe('Tutorials Route Tests', function () {
    // Initialize global variables
    var $scope,
      TutorialsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _TutorialsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      TutorialsService = _TutorialsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('tutorials');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/tutorials');
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
          TutorialsController,
          mockTutorial;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('tutorials.view');
          $templateCache.put('modules/tutorials/client/views/view-tutorial.client.view.html', '');

          // create mock Tutorial
          mockTutorial = new TutorialsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Tutorial Name'
          });

          // Initialize Controller
          TutorialsController = $controller('TutorialsController as vm', {
            $scope: $scope,
            tutorialResolve: mockTutorial
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:tutorialId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.tutorialResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            tutorialId: 1
          })).toEqual('/tutorials/1');
        }));

        it('should attach an Tutorial to the controller scope', function () {
          expect($scope.vm.tutorial._id).toBe(mockTutorial._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/tutorials/client/views/view-tutorial.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          TutorialsController,
          mockTutorial;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('tutorials.create');
          $templateCache.put('modules/tutorials/client/views/form-tutorial.client.view.html', '');

          // create mock Tutorial
          mockTutorial = new TutorialsService();

          // Initialize Controller
          TutorialsController = $controller('TutorialsController as vm', {
            $scope: $scope,
            tutorialResolve: mockTutorial
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.tutorialResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/tutorials/create');
        }));

        it('should attach an Tutorial to the controller scope', function () {
          expect($scope.vm.tutorial._id).toBe(mockTutorial._id);
          expect($scope.vm.tutorial._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/tutorials/client/views/form-tutorial.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          TutorialsController,
          mockTutorial;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('tutorials.edit');
          $templateCache.put('modules/tutorials/client/views/form-tutorial.client.view.html', '');

          // create mock Tutorial
          mockTutorial = new TutorialsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Tutorial Name'
          });

          // Initialize Controller
          TutorialsController = $controller('TutorialsController as vm', {
            $scope: $scope,
            tutorialResolve: mockTutorial
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:tutorialId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.tutorialResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            tutorialId: 1
          })).toEqual('/tutorials/1/edit');
        }));

        it('should attach an Tutorial to the controller scope', function () {
          expect($scope.vm.tutorial._id).toBe(mockTutorial._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/tutorials/client/views/form-tutorial.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
