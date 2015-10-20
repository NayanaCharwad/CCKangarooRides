myApp.controller('KangarooRidesController', ['$scope', '$http', '$location','growl','ApplicationFactory','RegistrationFactory',
    function ($scope, $http, $location,growl,ApplicationFactory,RegistrationFactory) {

    this.tab = 1;

    this.selectTab = function(setTab)
    {
        this.tab = setTab;
    }

    this.isSelected = function(checkTab)
    {
        return this.tab === checkTab;
    }

    $scope.model = {};
    $scope.RegistrationFactory = RegistrationFactory;
    $scope.activetab = 1;
    $scope.newRegistration = {};
    $scope.newRegistration.Date = new Date();

    $scope.mydp = {opened: false, opened1: false};
    $scope.eventSources = [];
    $scope.lineIsReady = false;
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.format = 'yyyy-MM-dd';

    $scope.pageChangeHandler = function(num) {
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.mydp.opened = true;
    };

    $scope.saveRegistrationObject = function () {

        $scope.newRegistration.Date.setHours(12);
        var duplicate = false;

        for (var i in RegistrationFactory.recordData) {
            if (RegistrationFactory.recordData[i].FirstName == $scope.newRegistration.FirstName
                && RegistrationFactory.recordData[i].LastName == $scope.newRegistration.LastName
                && RegistrationFactory.recordData[i].Email == $scope.newRegistration.Email)
            {
                duplicate = true;
                growl.error("<strong>Duplicate Registration!<strong>");
                break;
            }
        }

        var count = 0;
        for (var i in RegistrationFactory.recordData) {

            var recordDate = new Date(RegistrationFactory.recordData[i].Date);

            if (recordDate.getMonth() == $scope.newRegistration.Date.getMonth()
                && recordDate.getFullYear() == $scope.newRegistration.Date.getFullYear()
                && recordDate.getDay() == $scope.newRegistration.Date.getDay()
                && RegistrationFactory.recordData[i].Time == $scope.newRegistration.Time)
            {
                count++;
            }
        }

        if(count >= 3)
        {
            growl.error("<strong>Maximum rides already booked for this date and time! Please choose different date or time!<strong>");
        }

        else if(!duplicate) {
            RegistrationFactory.save($scope.newRegistration).then(function () {
                growl.success("<strong>Saved</strong>");
                $scope.newRegistration = {};
                $location.path("#reviewBookings");
            }, function () {
                growl.error("<strong>Error During Save<strong>");
            });
        }
    };

    $scope.getRegistrationObject = function () {

        ApplicationFactory.setWait(true);

        RegistrationFactory.initializeRecords().then(function () {
                    ApplicationFactory.setWait(false);
        }, function () {
            ApplicationFactory.setWait(true);
        });
    };

    $scope.deleteRegistrationObject = function (record) {

        RegistrationFactory.deleteRecord(record).then(function () {
            growl.success("<strong>Deleted</strong>");
        }, function () {
            growl.error("<strong>Error During Delete<strong>");
        });

    };

    $scope.editRegistrationObject = function (RegistrationRecord) {

        RegistrationFactory.edit(RegistrationRecord).then(function () {
            growl.success("<strong>Changes Saved</strong>");
            $location.path("#reviewBookings");
        }, function () {
            growl.error("<strong>Error During Save<strong>");
        });
        ;
    };

    $scope.selectEditedObject = function (Id) {
        RegistrationFactory.get(Id);
    };

    $scope.getEditedObject = function () {
        $scope.editData = RegistrationFactory.getEditedObject();
    };

    $scope.wait = function () {
        return ApplicationFactory.getWait();
    };

    $scope.formData = {};
    $scope.newRegistration.date = "";
    $scope.opened = false;
}]);

myApp.factory('ApplicationFactory', ['$http', '$q', function ($http, $q) {
    var application = {};
    var wait = false;
    var save = false;

    application.setWait = function (value) {
        wait = value;
    };

    application.getWait = function () {
        return wait;
    };

    return application;
}]);

myApp.factory('RegistrationFactory', ['$http', '$filter', '$q', function ($http, $filter, $q) {

    return {
        recordData: [],
        editData: {},
        opened: false,

        //method to initialize records at start before actual processing data
        initializeRecords: function () {
            var $this = this;

            var deferred = $q.defer();
            $http.get('api/Registrations').success(function (data) {
                $this.recordData = data;
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data)
            });
            return deferred.promise;
        },

        //save method create a new Registration records if not already exists
        //else update the existing Registration record
        save: function (record) {

            var $this = this;

            var deferred = $q.defer();

            $http.post('api/Registrations', record).success(function (savedRecord) {
                $this.recordData.push(savedRecord);
                deferred.resolve(true);
            }).error(function () {
                deferred.$$reject(false);
            });
            return deferred.promise;
        },


        //save method create a new Registration records if not already exists
        //else update the existing Registration record
        edit: function (record) {
            var $this = this;
            var deferred = $q.defer();
            //for existing record, find this Registration record using id
            //and update it.
            for (var i in $this.recordData) {
                if ($this.recordData[i].Id == record.Id) {
                    $http.put('api/Registrations', record).success(function (result) {
                        $this.recordData[i] = record;
                        deferred.resolve(true);
                    }).error(function () {
                        deferred.$$reject(false);
                    });

                    break;
                }
            }
            return deferred.promise;
        },

        //search Registration record list for given id
        //and returns the Registration record object if found
        get: function (id) {
            var $this = this;
            $this.editData = {};
            $this.editData = angular.copy(_.find($this.recordData, function(RegistrationRecord){ return RegistrationRecord.Id == id; }));
        },

        //iterate through Registration records list and delete
        //record if found
        deleteRecord: function (record) {
            var $this = this;
            var deferred = $q.defer();

            record.DeleteFlag = true;

            $http.put('api/Registrations', record).success(function (result) {
                $this.recordData = _.without($this.recordData, record);
                deferred.resolve(true);
            }).error(function () {
                deferred.$$reject(false);
            });
            return deferred.promise;
        },

        //returns the Registration record list
        getEditedObject: function () {
            var $this = this;
            return $this.editData;
        },
    };
}]);
