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

            },

            post: function(scope, element, attrs) {

              /*
              var collapseBtn = '<button type="button" class="collapse">' +
                  '<span class="fa fa-caret-left" aria-hidden="true"></span>' +
                  '</button>';
*/

              var collapseBtn = '<span class="collapse-btn fa fa-caret-left" aria-hidden="true"></span>';
              var splitHandler = '<div class="split-handler">' + collapseBtn + '</div>';
              
              
              var isCollapsed = false;
              var initSize = parseInt(attrs.initSize);

              var $handler = $(splitHandler);
              var pane1 = scope.panes[0];
              var pane2 = scope.panes[1];
              var vertical = attrs.orientation == 'vertical';
              var pane1Min = pane1.minSize || 0;
              var pane2Min = pane2.minSize || 0;
              var drag = false;

              pane1.elem.after($handler);

              function setPosition(params) {
                if (vertical) {
                  var height = params.bounds.bottom - params.bounds.top;
                  if (params.position < pane1Min) return;
                  if (height - params.position < pane2Min) return;

                  $handler.css('top', params.position + 'px');
                  pane1.elem.css('height', params.position + 'px');
                  pane2.elem.css('top', params.position + 'px');

                } else {
                  var width = params.bounds.right - params.bounds.left;
                  if (params.position < pane1Min) return;
                  if (width - params.position < pane2Min) return;

                  $handler.css('left', params.position + 'px');
                  pane1.elem.css('width', params.position + 'px');
                  pane2.elem.css('left', params.position + 'px');
                }
                $(document).trigger('resize')
              }

              function mousemoveHandler(ev) {
                if (!drag || isCollapsed) return;

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

              function mouseupHandler(ev) {
                drag = false;
              };

              function mousedownHandler(ev) {
                ev.preventDefault();
                drag = true;
              }

              function collpseClick(){
                var width = pane1.elem.css('width');
                if(isCollapsed){
                  element.removeClass('split-collapsed')
                  pane1.elem.css('left', '');
                  pane2.elem.css('left', width);
                  $handler.css('left', width);
                  $collapseBtn.addClass('fa-caret-left');
                  $collapseBtn.removeClass('fa-caret-right');
                } else {
                  element.addClass('split-collapsed');
                  pane1.elem.css('left', '-' + width);
                  pane2.elem.css('left', '');
                  $handler.css('left', '');
                  $collapseBtn.removeClass('fa-caret-left');
                  $collapseBtn.addClass('fa-caret-right');
                }
                isCollapsed = !isCollapsed;
              }

              if (!isNaN(initSize)) {
                setPosition({ position: initSize, bounds: element[0].getBoundingClientRect() });
              }
              else {
                $handler.css('left', '50%');
                pane2.elem.css('left', '50%');
              }

              var $collapseBtn = $handler.children('.collapse-btn');
              $collapseBtn.on('click', collpseClick)
              
              element.on('mousemove', mousemoveHandler);

              $handler.on('mousedown', mousedownHandler);

              var doc = angular.element(document);
              doc.on('mouseup', mouseupHandler);

              scope.$on('$destroy', function () {
                element.off('mousemove', mousemoveHandler);
                $handler.off('mousedown', mousedownHandler);
                $collapseBtn.off('click', collpseClick)
                doc.off('mouseup', mouseupHandler);
              });


            }
          }
        }
      };
    });
