import _ from 'lodash';
import 'ui/paginated_table';
import nameHtml from 'plugins/kibana/management/sections/indices/_field_name.html';
import typeHtml from 'plugins/kibana/management/sections/indices/_field_type.html';
import controlsHtml from 'plugins/kibana/management/sections/indices/_field_controls.html';
import uiModules from 'ui/modules';
import indexedFieldsTemplate from 'plugins/kibana/management/sections/indices/_indexed_fields.html';

uiModules.get('apps/management')
.directive('indexedFields', function ($filter) {
  const yesTemplate = '<i class="fa fa-check" aria-label="yes"></i>';
  const noTemplate = '';
  const filter = $filter('filter');

  return {
    restrict: 'E',
    template: indexedFieldsTemplate,
    scope: true,
    link: function ($scope) {
      const rowScopes = []; // track row scopes, so they can be destroyed as needed
      $scope.perPage = 25;
      $scope.columns = [
        { title: 'name' },
        { title: 'type' },
        { title: 'format' },
        { title: 'searchable', info: 'These fields can be used in the filter bar' },
        { title: 'aggregatable' , info: 'These fields can be used in visualization aggregations' },
        { title: 'analyzed', info: 'Analyzed fields may require extra memory to visualize' },
        { title: 'controls', sortable: false }
      ];

      $scope.$watchMulti(['[]indexPattern.fields', 'fieldFilter'], refreshRows);

      function refreshRows() {
        // clear and destroy row scopes
        _.invoke(rowScopes.splice(0), '$destroy');

        const fields = filter($scope.indexPattern.getNonScriptedFields(), $scope.fieldFilter);
        _.find($scope.fieldTypes, {index: 'indexedFields'}).count = fields.length; // Update the tab count

        $scope.rows = fields.map(function (field) {
          const childScope = _.assign($scope.$new(), { field: field });
          rowScopes.push(childScope);

          return [
            {
              markup: nameHtml,
              scope: childScope,
              value: field.displayName
            },
            {
              markup: typeHtml,
              scope: childScope,
              value: field.type
            },
            _.get($scope.indexPattern, ['fieldFormatMap', field.name, 'type', 'title']),
            {
              markup: field.searchable ? yesTemplate : noTemplate,
              value: field.searchable
            },
            {
              markup: field.aggregatable ? yesTemplate : noTemplate,
              value: field.aggregatable
            },
            {
              markup: field.analyzed ? yesTemplate : noTemplate,
              value: field.analyzed
            },
            {
              markup: controlsHtml,
              scope: childScope
            }
          ];
        });
      }
    }
  };
});
