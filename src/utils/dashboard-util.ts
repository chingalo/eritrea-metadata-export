import { AppUtil, HttpUtil, LogsUtil } from '.';
import { sourceConfig } from '../configs';

export class DashboardUtil {
  private _headers: {
    Authorization: string;
    'Content-Type': string;
  };
  private _baseUrl: string;

  constructor() {
    this._baseUrl = sourceConfig.baseUrl;
    this._headers = AppUtil.getHttpAuthorizationHeader(
      sourceConfig.username,
      sourceConfig.password
    );
  }

  async getDashboardIds() {
    const dashboardIds: string[] = [];
    try {
      await new LogsUtil().addLogs(
        'info',
        `Fetching all dashboard IDs from the system`,
        'dashboard-util'
      );
      const response = await HttpUtil.getHttp(
        this._headers,
        `${this._baseUrl}/api/dashboards?fields=id&paging=false`
      );
      const dashboards = response?.dashboards ?? [];
      for (const dashboard of dashboards) {
        dashboardIds.push(dashboard.id);
      }
    } catch (error) {
      await new LogsUtil().addLogs(
        'error',
        `Error fetching dashboard IDs \n${error}`,
        'dashboard-util'
      );
    }

    return dashboardIds;
  }

  async getDashboardConfig(dashboardId: string) {
    let dashboardConfig: any = {};
    try {
      await new LogsUtil().addLogs(
        'info',
        `Fetching dashboard config for ID: ${dashboardId}`,
        'dashboard-util'
      );
      const url = `${this._baseUrl}/api/dashboards/${dashboardId}?fields=*,dashboardItems[*]`;
      dashboardConfig = await HttpUtil.getHttp(this._headers, url);
    } catch (error) {
      await new LogsUtil().addLogs(
        'error',
        `Error fetching dashboard config for ID: ${dashboardId}\n${error}`,
        'dashboard-util'
      );
    }
    return dashboardConfig;
  }

  async getDashboardVisualizations(visualizationIds: string[]) {
    const visualizations: any[] = [];
    try {
      for (const visualizationId of visualizationIds) {
        await new LogsUtil().addLogs(
          'info',
          `Fetching configuration of visualization with ID:${visualizationId} `,
          'dashboard-util'
        );
        const url = `${this._baseUrl}/api/visualizations/${visualizationId}?fields=*`;
        const visualizationConfig = await HttpUtil.getHttp(this._headers, url);
        visualizations.push(visualizationConfig);
      }
    } catch (error) {
      await new LogsUtil().addLogs(
        'error',
        `Error fetching visualizations \n${error}`,
        'dashboard-util'
      );
    }
    return visualizations;
  }
}
