import { AppUtil, HttpUtil, LogsUtil } from '.';
import { sourceConfig } from '../configs';
import { DataElementModel } from '../models';

export class DataElementUtil {
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

  async getDataElements(dataElementCodes: string[]) {
    let dataElements: DataElementModel[] = [];
    try {
      await new LogsUtil().addLogs(
        'info',
        `Fetching data elements from the system`,
        'data-element-util'
      );
      const filterParms = dataElementCodes.join(',');
      const fields = `fields=id,name,code,categoryCombo[id,name,categoryOptionCombos[id,name,code]]`;
      const url = `${this._baseUrl}/api/dataElements?filter=code:in:[${filterParms}]&${fields}&paging=false`;
      const response = await HttpUtil.getHttp(this._headers, url);
      dataElements = response?.dataElements ?? [];
    } catch (error) {
      await new LogsUtil().addLogs(
        'error',
        `Error fetching data elements \n${error}`,
        'data-element-util'
      );
    }
    return dataElements;
  }
}
