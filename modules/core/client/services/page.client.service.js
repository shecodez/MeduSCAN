'use strict';

angular.module('core').factory('Page', [ '$rootScope',
	function($rootScope) {
		// Page service logic
        var page =
        {
            current: '',
            user:''
        };

        var pageList = [
            {pageNo: 0, prev: 5, href:'about', page: 'About Us', next: 1},
            {pageNo: 1, prev: 0, href:'teachers', page: 'Teachers', next: 2},
            {pageNo: 2, prev: 1, href:'students', page: 'Students', next: 3},
            {pageNo: 3, prev: 2, href:'getting-started', page: 'Getting Started', next: 4},
            {pageNo: 4, prev: 3, href:'tutorials', page: 'Tutorials', next: 5},
            {pageNo: 5, prev: 4, href:'contact', page: 'Contact Us', next: 0}
        ];

        var teachersPageList = [
            {pageNo: 0, prev: 5, href:'teachers/dashboard', page: 'Dashboard', next: 1},
            {pageNo: 1, prev: 0, href:'classes', page: 'Classes', next: 2},
            {pageNo: 2, prev: 1, href:'patients', page: 'Patients', next: 3},
            {pageNo: 3, prev: 2, href:'medications', page: 'Medications', next: 4},
            {pageNo: 4, prev: 3, href:'patient-lookup', page: 'Patient Lookup', next: 5}
        ];

        var studentsPageList = [
            {pageNo: 0, prev: 1, href:'students/dashboard', page: 'Dashboard', next: 1},
            {pageNo: 1, prev: 0, href:'patient-lookup', page: 'Patient Lookup', next: 0}
        ];

		// Public API
		return {
			getCurrent_page: function() {
				return page.current;
			},
            setCurrent_page: function(currentPage, pageUser) {
                page.current = currentPage;
                page.user = pageUser;
                $rootScope.$broadcast('page:changed', currentPage);
            },

            getNext_page: function() {

                var i, nextPg;
                if(page.user === 'TEACHER') {
                    for (i = 0; i < teachersPageList.length; i++) {
                        if (teachersPageList[i].page === page.current) {
                            nextPg = teachersPageList[i].next;
                            return teachersPageList[nextPg];
                        }
                    }
                }
                else if(page.user === 'STUDENT') {
                    for (i = 0; i < studentsPageList.length; i++) {
                        if (studentsPageList[i].page === page.current) {
                            nextPg = studentsPageList[i].next;
                            return studentsPageList[nextPg];
                        }
                    }
                }
                else{ //(page.user === 'CORE')
                    for (i = 0; i < pageList.length; i++) {
                        if (pageList[i].page === page.current) {
                            nextPg = pageList[i].next;
                            return pageList[nextPg];
                        }
                    }
                }

            },
            hasNext_page: function() {
                // if page is not emar or patient medications has next = true
                return(!(page.current === 'EMAR' || page.current === 'Patient Medications' || page.current === 'Settings' || page.current === 'Blog'));
            },

            getPrev_page: function() {
                var i, prevPg;
                if(page.user === 'TEACHER'){
                    for (i = 0; i < teachersPageList.length; i++) {
                        if (teachersPageList[i].page === page.current) {
                            prevPg = teachersPageList[i].prev;
                            return teachersPageList[prevPg];
                        }
                    }
                }
                else if(page.user === 'STUDENT'){
                    for (i = 0; i < studentsPageList.length; i++) {
                        if (studentsPageList[i].page === page.current) {
                            prevPg = studentsPageList[i].prev;
                            return studentsPageList[prevPg];
                        }
                    }
                }
                else { //(page.user === 'CORE')
                    for (i = 0; i < pageList.length; i++) {
                        if (pageList[i].page === page.current) {
                            prevPg = pageList[i].prev;
                            return pageList[prevPg];
                        }
                    }
                }
            },
            hasPrev_page: function() {
                // if page is not emar or patient medications has prev = true
                return(!(page.current === 'EMAR' || page.current === 'Patient Medications' || page.current === 'Settings' || page.current === 'Blog'));
            },

            getPageList: function() {

                if(page.user === 'TEACHER') {
                    return teachersPageList;
                }
                if(page.user === 'STUDENT') {
                    return studentsPageList;
                }
                //else
                return pageList;
            }
		};
	}
]);
