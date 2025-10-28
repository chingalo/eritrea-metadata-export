import { AppUtil, HttpUtil, LogsUtil } from '.';
import { sourceConfig } from '../configs';
import { ProgramIndicatorModel } from '../models';

export class ProgramIndicatorUtil {
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

  async getProgramIndicators(
    attributeId = ''
  ): Promise<ProgramIndicatorModel[]> {
    let programIndicators: ProgramIndicatorModel[] = [];
    try {
      await new LogsUtil().addLogs(
        'info',
        `Fetching program indicators from the system`,
        'program-indicator-util'
      );
      const fields = `fields=aggregateExportCategoryOptionCombo,id,name,code,expression,filter,attributeValues[*,value]`;
      const filter =
        attributeId.trim() === ''
          ? ''
          : `filter=attributeValues.attribute.id:eq:${attributeId}`;
      const url = `${this._baseUrl}/api/programIndicators?${fields}&paging=false&${filter}`;
      const response = await HttpUtil.getHttp(this._headers, url);
      programIndicators = response.programIndicators ?? [];
    } catch (error) {
      await new LogsUtil().addLogs(
        'error',
        `Error fetching program indicators \n${error}`,
        'program-indicator-util'
      );
    }
    return programIndicators;
  }
}
