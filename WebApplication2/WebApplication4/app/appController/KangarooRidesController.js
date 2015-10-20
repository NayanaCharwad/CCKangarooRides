/* Angular JS Controller to get input details from user and use REST API calls to initialize or update data on server */
myApp.controller('KangarooRidesController', ['$scope', '$http', '$location','growl','ApplicationFactory','RegistrationFactory',
    function ($scope, $http, $location,growl,ApplicationFactory,RegistrationFactory) {

    this.tab = 1;

    //Highlight selected tab for better user experience
    this.selectTab = function(setTab)
    {
        this.tab = setTab;
    }

    this.isSelected = function(checkTab)
    {
        return this.tab === checkTab;
    }

    // Data initialization
    $scope.model = {};
    $scope.RegistrationFactory = RegistrationFactory;
    $scope.activetab = 1;
    $scope.newRegistration = {};
    $scope.newRide = {};
    $scope.newRegistration.Date = new Date();
    $scope.mydp = {opened: false, opened1: false};
    $scope.eventSources = [];
    $scope.lineIsReady = false;
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.format = 'yyyy-MM-dd';

    $scope.pageChangeHandler = function(num) {
    };

    //options for calendar shown while selecting date
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    //calendar open event
    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.mydp.opened = true;
    };

    //function module to save registration object through REST API calls
    $scope.saveRegistrationObject = function () {

        $scope.newRegistration.Date.setHours(12);
        var duplicate = false;

        //Check for duplicate entry
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

        //Check if same date and time slot is booked for atleast three times before
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

        //if booked already display message to user asking to choose different time slot
        if(count >= 3)
        {
            growl.error("<strong>Maximum rides already booked for this date and time! Please choose different date or time!<strong>");
        }

        //if data passes validation update data on server
        else if(!duplicate) {
            RegistrationFactory.save($scope.newRegistration).then(function () {
                $scope.newRegistration = {};
                $location.path("#reviewBookings");
            }, function () {
                growl.error("<strong>Error During Save<strong>");
            });
        }
    };

    // Ge registration object information selected by user
    $scope.getRegistrationObject = function () {

        ApplicationFactory.setWait(true);

        RegistrationFactory.initializeRecords().then(function () {
                    ApplicationFactory.setWait(false);
        }, function () {
            ApplicationFactory.setWait(true);
        });
    };

    // Delete registration object
    $scope.deleteRegistrationObject = function (record) {

        RegistrationFactory.deleteRecord(record).then(function () {
            growl.success("<strong>Deleted</strong>");
        }, function () {
            growl.error("<strong>Error During Delete<strong>");
        });

    };

    // Edit registration object
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

    // Function used to display loading icon to user while data is being fetched from server
    $scope.wait = function () {
        return ApplicationFactory.getWait();
    };

    //Save ride object
    $scope.saveRideObject= function () {
        RegistrationFactory.saveRide($scope.newRide).then(function () {
            growl.success("<strong>Saved</strong>");
            $scope.newRide = {};
            $location.path("#reviewBookings");
        }, function () {
            growl.error("<strong>Error During Save<strong>");
        });
    };

    // Get ride object selected by user
    $scope.getRideObject = function () {

        ApplicationFactory.setWait(true);

        RegistrationFactory.initializeRideRecords().then(function () {
            ApplicationFactory.setWait(false);
        }, function () {
            ApplicationFactory.setWait(true);
        });
    };

    $scope.formData = {};
    $scope.newRegistration.date = "";
    $scope.opened = false;
}]);

//Application factory used to check if data is loaded from server or not
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

//Registration factory is used to store data loaded from server so as to avoid going to server everytime user requests
myApp.factory('RegistrationFactory', ['$http', '$filter', '$q','growl', function ($http, $filter, $q,growl) {

    return {
        recordData: [],
        editData: {},
        opened: false,
        rideData: [],

        //method to initialize registration records at start before actual processing data
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

        //method to initialize ride records at start before actual processing data
        initializeRideRecords: function () {
            var $this = this;

            var deferred = $q.defer();
            $http.get('api/RideInfoes').success(function (data) {
                $this.rideData = data;
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
                console.log(savedRecord.Id);
                growl.success("Congratulations! Your booking confirmation number is : " + savedRecord.Id);
                deferred.resolve(true);
            }).error(function () {
                deferred.$$reject(false);
            });
            return deferred.promise;
        },

        //save method create a new Ride records if not already exists
        //else update the existing Ride record
        saveRide: function (record) {

            var $this = this;

            var deferred = $q.defer();

            $http.post('api/RideInfoes', record).success(function (savedRecord) {
                $this.rideData.push(savedRecord);
                console.log(savedRecord.Id);
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
