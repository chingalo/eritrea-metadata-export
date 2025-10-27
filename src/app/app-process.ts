import { map, filter, keys, flattenDeep } from 'lodash';
import { DashboardUtil, FileUtil, LogsUtil } from '../utils';

export class AppProcess {
  constructor() {}

  async startProcess() {
    try {
      await new LogsUtil().addLogs('info', `Starting up the process`, 'app');
      const dashboardIds = await new DashboardUtil().getDashboardIds();
      for (const dashboardId of dashboardIds) {
        await this.DiscoverAndSaveDahboardConfig(dashboardId);
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

  private async DiscoverAndSaveDahboardConfig(dashboardId: string) {
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
