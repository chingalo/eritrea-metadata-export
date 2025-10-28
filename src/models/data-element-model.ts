export interface DataElementModel {
  name: string;
  id: string;
  code: string;
  categoryCombo: {
    name: string;
    id: string;
    categoryOptionCombos: Array<{
      code: string;
      name: string;
      id: string;
    }>;
  };
}
