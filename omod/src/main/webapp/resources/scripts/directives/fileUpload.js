angular.module('vdui.widget.fileUpload', [])
  
  .directive('dropzoneDirective',
    function () {
      return function (scope, element, attrs) {
        var config, dropzone;

        config = scope[attrs.dropzoneDirective];

        // create a Dropzone for the element with the given options
        dropzone = new Dropzone(element[0], config.options);

        scope.processDropzone = function() {
          dropzone.processQueue();
        };

        scope.removeAllFiles = function() {
          dropzone.removeAllFiles();
        };

        scope.setMaxFilesize = function(maxFilesize) {
          dropzone.options.maxFilesize = maxFilesize;
        };

        // bind the given event handlers
        angular.forEach(config.eventHandlers, function(handler, event) {
          dropzone.on(event, handler);
        });
      };
    })

  .directive('vduiFileUpload', ['SessionInfo', 'ObsService', function(sessionInfo, obsService) {
    return {

      restrict: 'E',
      scope: {
        config: '='
      },
      templateUrl: '/' + module.getPath(OPENMRS_CONTEXT_PATH) + '/templates/fileUpload.page',

      controller: function($scope, $rootScope) {

        var msgs = [
          module.getProvider() + ".fileUpload.success",
          module.getProvider() + ".fileUpload.error"
        ]
        emr.loadMessages(msgs.toString());

        var providerUuid = "";
        $scope.visitUuid = "";  // In scope for toggling ng-show

        $scope.init = function() {
          Dropzone.options.visitDocumentsDropzone = false;

          sessionInfo.get().$promise.then(function(info) {
            providerUuid = info.currentProvider.uuid;
          });
          if (config.visit) {
            $scope.visitUuid = config.visit.uuid;
          }
        }

        $scope.dropzoneConfig = {
          
          'options': // passed into the Dropzone constructor
          { 
            'url': config.uploadUrl,
            'thumbnailHeight': 100,
            'thumbnailWidth': 100,
            'maxFiles': 1,
            'autoProcessQueue': false
          },
          'eventHandlers':
          {
            'addedfile': function(file) {
              $scope.file = file;
              setMaxFileSizeOption(file.type); // Setting the max upload file size depending on whether the file can be compressed on the backend.
              if (this.files[1] != null) {
                this.removeFile(this.files[0]);
              }
              $scope.$apply(function() {
                $scope.fileAdded = true;
              });
            },
            'sending': function (file, xhr, formData) {
              formData.append('patient', config.patient.uuid);
              formData.append('visit', $scope.visitUuid);
              formData.append('provider', providerUuid);
              formData.append('fileCaption', ($scope.fileCaption == null) ? "" : $scope.fileCaption );
            },
            'success': function (file, response) {
              $rootScope.$emit(module.eventNewFile, response);
              $().toastmessage('showToast', { type: 'success', position: 'top-right', text: emr.message(module.getProvider() + ".fileUpload.success") });
              $scope.clearForms();
            },
            'error': function (file, response, xhr) {
              $().toastmessage('showToast', { type: 'error', position: 'top-right', text: emr.message(module.getProvider() + ".fileUpload.error") });
              console.log(response);
            }
          }
        };

        var setMaxFileSizeOption = function(mimeType) {
          if (!mimeType) {
            $scope.setMaxFilesize(config.maxFileSize);
            return;
          }
          
          var contentFamily = config.contentFamilyMap[mimeType];
          switch (contentFamily) {
            case module.family.IMAGE:
              $scope.setMaxFilesize(config.maxFileSize * config.maxCompression);
              break;

            default:
              $scope.setMaxFilesize(config.maxFileSize);
              break;
          }
        };

        $scope.uploadFile = function() {
          $scope.processDropzone();
        };

        $scope.clearForms = function() {
          $scope.removeAllFiles();
          $scope.fileCaption = "";
          $scope.$apply();  // Not sure why we need this?
        }

        $scope.isUploadBtnDisabled = function() {
          return !($scope.fileCaption || config.allowNoCaption);
        }        

      }
    };
  }]);