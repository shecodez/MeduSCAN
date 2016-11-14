(function () {
  'use strict';

  describe('Keys Route Tests', function () {
    // Initialize global variables
    var $scope,
      KeysService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _KeysService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      KeysService = _KeysService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('keys');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/keys');
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
          KeysController,
          mockKey;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('keys.view');
          $templateCache.put('modules/keys/client/views/view-key.client.view.html', '');

          // create mock Key
          mockKey = new KeysService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Key Name'
          });

          //Initialize Controller
          KeysController = $controller('KeysController as vm', {
            $scope: $scope,
            keyResolve: mockKey
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:keyId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.keyResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            keyId: 1
          })).toEqual('/keys/1');
        }));

        it('should attach an Key to the controller scope', function () {
          expect($scope.vm.key._id).toBe(mockKey._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/keys/client/views/view-key.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          KeysController,
          mockKey;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('keys.create');
          $templateCache.put('modules/keys/client/views/form-key.client.view.html', '');

          // create mock Key
          mockKey = new KeysService();

          //Initialize Controller
          KeysController = $controller('KeysController as vm', {
            $scope: $scope,
            keyResolve: mockKey
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.keyResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/keys/create');
        }));

        it('should attach an Key to the controller scope', function () {
          expect($scope.vm.key._id).toBe(mockKey._id);
          expect($scope.vm.key._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/keys/client/views/form-key.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          KeysController,
          mockKey;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('keys.edit');
          $templateCache.put('modules/keys/client/views/form-key.client.view.html', '');

          // create mock Key
          mockKey = new KeysService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Key Name'
          });

          //Initialize Controller
          KeysController = $controller('KeysController as vm', {
            $scope: $scope,
            keyResolve: mockKey
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:keyId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.keyResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            keyId: 1
          })).toEqual('/keys/1/edit');
        }));

        it('should attach an Key to the controller scope', function () {
          expect($scope.vm.key._id).toBe(mockKey._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/keys/client/views/form-key.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
