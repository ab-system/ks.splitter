angular.module('ks.splitter', [])
    .directive('ksSplitter', function() {
      return {
        restrict: 'AE',

        scope: false,
        compile: function(element, attributes){
          return {
            pre: function(scope, element, attrs){

              element.addClass('split-panes ' + attrs.orientation);
              scope.panes = [];
              angular.element(element)
                  .children('[ks-pane]')
                  .each(function(index, pane) {
                    var $pane = $(pane);
                    $pane.children('[ks-pane-container]').addClass('pane-container');
                    $pane.addClass('split-pane' + (index + 1));
                    scope.panes.push({elem: $pane, minSize: parseInt($pane.attr('min-size'))});
                  });

              if (scope.panes.length != 2) {
                throw 'splitter must have two panes';
              }

              scope.panes[0].size = parseInt(scope.panes[0].elem.attr('size'));

            },

            post: function(scope, element, attrs){

              var handler = $('<div class="split-handler"></div>');
              var pane1 = scope.panes[0];
              var pane2 = scope.panes[1];
              var vertical = attrs.orientation == 'vertical';
              var pane1Min = pane1.minSize || 0;
              var pane2Min = pane2.minSize || 0;
              var drag = false;

              pane1.elem.after(handler);

              function setPosition(params){
                if (vertical) {

                  var height = params.bounds.bottom - params.bounds.top;
                  if (params.position < pane1Min) return;
                  if (height - params.position < pane2Min) return;

                  handler.css('top', params.position + 'px');
                  pane1.elem.css('height', params.position + 'px');
                  pane2.elem.css('top', params.position + 'px');

                } else {
                  var width = params.bounds.right - params.bounds.left;
                  if (params.position < pane1Min) return;
                  if (width - params.position < pane2Min) return;

                  handler.css('left', params.position + 'px');
                  pane1.elem.css('width', params.position + 'px');
                  pane2.elem.css('left', params.position + 'px');
                }
              }

              function mousemoveHandler(ev) {
                if (!drag) return;

                var bounds = element[0].getBoundingClientRect();
                var params = {
                  position: 0,
                  bounds: bounds
              };

                if (vertical) {
                  params.position = ev.clientY - bounds.top;
                } else {
                  params.position = ev.clientX - bounds.left;
                }
                setPosition(params);
              };

              function mouseupHandler (ev) {
                drag = false;
              };

              function mousedownHandler (ev) {
                ev.preventDefault();
                drag = true;
              }


              if(pane1.size){
                setPosition({ position: pane1.size, bounds: element[0].getBoundingClientRect() });
              }

              element.on('mousemove', mousemoveHandler);

              handler.on('mousedown', mousedownHandler);

              var doc = angular.element(document);
              doc.on('mouseup', mouseupHandler);

              scope.$on('$destroy', function(){
                element.off('mousemove', mousemoveHandler);
                handler.off('mousedown', mousedownHandler);
                doc.off('mouseup', mouseupHandler);
              });


            }
          }
        }
      };
    });
