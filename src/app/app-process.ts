import { map, filter, keys, flattenDeep, first, uniq } from 'lodash';
import {
  DashboardUtil,
  DataElementUtil,
  ExcelUtil,
  FileUtil,
  LogsUtil,
  ProgramIndicatorUtil
} from '../utils';
import { sourceConfig } from '../configs';
import { ProgramIndicatorModel } from '../models';

export class AppProcess {
  constructor() {}

  async startProcess() {
    try {
      await new LogsUtil().addLogs('info', `Starting up the process`, 'app');
      await this._DiscoverAndSaveDataExchangeConfig();
      const dashboardIds = await new DashboardUtil().getDashboardIds();
      for (const dashboardId of dashboardIds) {
        await this._DiscoverAndSaveDahboardConfig(dashboardId);
      }
      await new LogsUtil().addLogs(
        'info',
        `Process completed successfully`,
        'app'
      );
    } catch (error: any) {
      await new LogsUtil().addLogs('error', error.message || error, 'app');
    }
  }

  async _DiscoverAndSaveDataExchangeConfig() {
    await new LogsUtil().addLogs(
      'info',
      `Discovering program indicators for data exchange config`,
      'app'
    );
    const programIndicators =
      await new ProgramIndicatorUtil().getProgramIndicators(
        sourceConfig.dataExportAttribute
      );

    await new LogsUtil().addLogs(
      'info',
      `Discovering  associated data elements for data exchange config`,
      'app'
    );
    const dataElements = await new DataElementUtil().getDataElements(
      uniq(
        flattenDeep(
          map(programIndicators, (programIndicator) =>
            this._getDataElementCodeFormProgramIndicator(programIndicator)
          )
        )
      )
    );
    await new LogsUtil().addLogs('info', `Saving data exchange config`, 'app');
    await new ExcelUtil('data-exchange-config').writeToSingleSheetExcelFile(
      map(programIndicators, (programIndicator) => {
        const dataElementCode =
          this._getDataElementCodeFormProgramIndicator(programIndicator);
        const dataElement = dataElements.find(
          (dataElement) => dataElement.code === dataElementCode
        );
        const {
          id: programIndicatorId,
          name: programIndicatorName,
          aggregateExportCategoryOptionCombo,
          expression,
          filter
        } = programIndicator;
        const { id: dataElementId, name: dataElementName } = dataElement || {};
        return {
          programIndicatorId,
          programIndicatorName,
          expression,
          filter,
          dataElementCode,
          aggregateExportCategoryOptionCombo,
          dataElementId,
          dataElementName
        };
      })
    );
  }

  _getDataElementCodeFormProgramIndicator(
    programIndicator: ProgramIndicatorModel
  ) {
    const { attributeValues } = programIndicator;
    const dataElementAttribute = filter(
      attributeValues,
      (attributeValue) =>
        attributeValue.attribute &&
        attributeValue.attribute.id === sourceConfig.dataExportAttribute
    );
    return dataElementAttribute.length > 0
      ? (first(dataElementAttribute)?.value ?? '')
      : '';
  }

  async _DiscoverAndSaveDahboardConfig(dashboardId: string) {
    const dashboardConfig = await new DashboardUtil().getDashboardConfig(
      dashboardId
    );
    if (keys(dashboardConfig).length > 0) {
      const dashboardItems = dashboardConfig.dashboardItems ?? [];
      const dashboardName = dashboardConfig.name ?? 'dashboard_export';
      const visualizations =
        await new DashboardUtil().getDashboardVisualizations(
          flattenDeep(
            map(
              filter(dashboardItems ?? [], (dashboardItem: any) =>
                keys(dashboardItem).includes('visualization')
              ),
              (dashboardItem: any) => dashboardItem.visualization.id ?? ''
            )
          )
        );

      const data = {
        dashboards: [dashboardConfig],
        visualizations: map(visualizations, (visualization) => {
          return {
            ...visualization,
            userOrganisationUnit: true,
            organisationUnits: []
          };
        })
      };
      await new LogsUtil().addLogs(
        'info',
        `Saving dashboard configurations for ${dashboardName}`,
        'app'
      );
      await new FileUtil(
        `dashboaord-exports`,
        `${dashboardName}`,
        'json'
      ).writeToFile(data);
    }
  }
}
