export interface ProgramIndicatorModel {
  id: string;
  name: string;
  code: string;
  aggregateExportCategoryOptionCombo: string;
  expression: string;
  filter: string;
  attributeValues: Array<{
    attribute: {
      code: string;
      name: string;
      id: string;
    };
    value: string;
  }>;
}
