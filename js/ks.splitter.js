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
                    var minSize = $pane.attr('min-size');
                    scope.panes.push({elem: $pane, minSize: parseInt(minSize)});
                  });

              if (scope.panes.length != 2) {
                throw 'splitter must have two panes';
              }

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

              function mousemoveHandler(ev) {
                if (!drag) return;

                var bounds = element[0].getBoundingClientRect();
                var pos = 0;

                if (vertical) {

                  var height = bounds.bottom - bounds.top;
                  pos = ev.clientY - bounds.top;

                  if (pos < pane1Min) return;
                  if (height - pos < pane2Min) return;

                  handler.css('top', pos + 'px');
                  pane1.elem.css('height', pos + 'px');
                  pane2.elem.css('top', pos + 'px');

                } else {

                  var width = bounds.right - bounds.left;
                  pos = ev.clientX - bounds.left;

                  if (pos < pane1Min) return;
                  if (width - pos < pane2Min) return;

                  handler.css('left', pos + 'px');
                  pane1.elem.css('width', pos + 'px');
                  pane2.elem.css('left', pos + 'px');
                }
              };

              function mouseupHandler (ev) {
                drag = false;
              };

              function mousedownHandler (ev) {
                ev.preventDefault();
                drag = true;
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
