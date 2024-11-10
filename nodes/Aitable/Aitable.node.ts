import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeApiError,
  NodeOperationError,
  IHttpRequestOptions,
  JsonObject,
  INodePropertyOptions,
} from 'n8n-workflow';

export class Aitable implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Aitable',
    name: 'aitable',
    icon: 'file:aitable.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Aitable API',
    defaults: {
      name: 'Aitable',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'aitableApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Record', value: 'record' },
          { name: 'View', value: 'view' },
          { name: 'Space', value: 'space' },
          { name: 'Node', value: 'node' },
          { name: 'Field', value: 'field' },
        ],
        default: 'record',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['record'] },
        },
        options: [
          { name: 'Get Records', value: 'getRecords', action: 'Get records from a datasheet' },
          { name: 'Create Records', value: 'createRecords', action: 'Create records in a datasheet' },
          { name: 'Update Records', value: 'updateRecords', action: 'Update records in a datasheet' },
          { name: 'Delete Records', value: 'deleteRecords', action: 'Delete records from a datasheet' },
        ],
        default: 'getRecords',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['view'] },
        },
        options: [
          { name: 'Get View', value: 'getView', action: 'Get view of a datasheet' },
        ],
        default: 'getView',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['space'] },
        },
        options: [
          { name: 'Get Spaces', value: 'getSpaces', action: 'Get list of spaces' },
        ],
        default: 'getSpaces',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['node'] },
        },
        options: [
          { name: 'Get Node List', value: 'getNodes', action: 'Get node list' },
          { name: 'Search Nodes', value: 'searchNodes', action: 'Search nodes' },
        ],
        default: 'getNodes',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['field'] },
        },
        options: [
          { name: 'Get Fields', value: 'getFields', action: 'Get fields of a datasheet' },
        ],
        default: 'getFields',
      },
      {
        displayName: 'Use Dropdown',
        name: 'useDropdown',
        type: 'boolean',
        default: true,
        description: 'Whether to use dropdown lists for Space and Datasheet selection',
        displayOptions: {
          show: { resource: ['field'], operation: ['getFields'] },
        },
      },
      {
        displayName: 'Space',
        name: 'space',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getSpaces',
        },
        default: '',
        required: true,
        displayOptions: {
          show: { 
            resource: ['record', 'view', 'node', 'field'],
            operation: ['getFields'],
            useDropdown: [true],
          },
        },
        description: 'The space to use',
      },
      {
        displayName: 'Space ID',
        name: 'spaceId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: { 
            resource: ['field'],
            operation: ['getFields'],
            useDropdown: [false],
          },
        },
        description: 'The ID of the space to use',
      },
      {
        displayName: 'Datasheet',
        name: 'datasheetId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getDatasheets',
          loadOptionsDependsOn: ['space'],
        },
        default: '',
        required: true,
        displayOptions: {
          show: { 
            resource: ['record', 'view', 'field'],
            operation: ['getFields'],
            useDropdown: [true],
          },
        },
        description: 'The datasheet to use',
      },
      {
        displayName: 'Datasheet ID',
        name: 'datasheetIdManual',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: { 
            resource: ['field'],
            operation: ['getFields'],
            useDropdown: [false],
          },
        },
        description: 'The ID of the datasheet to use',
      },
      {
        displayName: 'View',
        name: 'view',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getViews',
          loadOptionsDependsOn: ['datasheetId'],
        },
        default: '',
        required: true,
        displayOptions: {
          show: { resource: ['record'], operation: ['getRecords'] },
        },
        description: 'The view to use',
      },
      {
        displayName: 'Records',
        name: 'records',
        type: 'json',
        default: '',
        required: true,
        displayOptions: {
          show: { resource: ['record'], operation: ['createRecords', 'updateRecords'] },
        },
        description: 'Records to be created or updated in JSON format',
      },
      {
        displayName: 'Record IDs',
        name: 'recordIds',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: { resource: ['record'], operation: ['deleteRecords'] },
        },
        description: 'Comma-separated list of record IDs to delete',
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: { resource: ['record'], operation: ['getRecords'] },
        },
        options: [
          {
            displayName: 'Fields',
            name: 'fields',
            type: 'string',
            default: '',
            description: 'Comma-separated list of field names to return',
          },
          {
            displayName: 'Sort',
            name: 'sort',
            type: 'string',
            default: '',
            description: 'Sorting rules, e.g., [{"field":"field1","order":"desc"}]',
          },
          {
            displayName: 'Page Size',
            name: 'pageSize',
            type: 'number',
            typeOptions: {
              minValue: 1,
              maxValue: 1000,
            },
            default: 100,
            description: 'Number of records to return per page',
          },
          {
            displayName: 'Page Number',
            name: 'pageNum',
            type: 'number',
            typeOptions: {
              minValue: 1,
            },
            default: 1,
            description: 'Page number to return',
          },
        ],
      },
    ],
  };
  methods = {
    loadOptions: {
      async getSpaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const returnData: INodePropertyOptions[] = [];
        const credentials = await this.getCredentials('aitableApi');
        if (!credentials) {
          throw new NodeOperationError(this.getNode(), "No credentials got returned!");
        }

        const options: IHttpRequestOptions = {
          headers: {
            Authorization: `Bearer ${credentials.apiToken}`,
            Accept: "application/json",
          },
          method: "GET",
          url: "https://aitable.ai/fusion/v1/spaces",
          json: true,
        };

        const response = await this.helpers.request!(options);

        if (response.success && response.code === 200) {
          for (const space of response.data.spaces) {
            returnData.push({
              name: space.name,
              value: space.id,
            });
          }
        } else {
          throw new NodeApiError(this.getNode(), response as JsonObject);
        }

        return returnData;
      },

      async getDatasheets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const returnData: INodePropertyOptions[] = [];
        const credentials = await this.getCredentials('aitableApi');
        if (!credentials) {
          throw new NodeOperationError(this.getNode(), "No credentials got returned!");
        }

        const spaceId = this.getCurrentNodeParameter('space') as string;

        const options: IHttpRequestOptions = {
          headers: {
            Authorization: `Bearer ${credentials.apiToken}`,
            Accept: "application/json",
          },
          method: "GET",
          url: `https://aitable.ai/fusion/v1/spaces/${spaceId}/nodes`,
          json: true,
        };

        const response = await this.helpers.request!(options);

        if (response.success && response.code === 200) {
          for (const node of response.data.nodes) {
            if (node.type === 'Datasheet') {
              returnData.push({
                name: node.name,
                value: node.id,
              });
            }
          }
        } else {
          throw new NodeApiError(this.getNode(), response as JsonObject);
        }

        return returnData;
      },

      async getViews(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const returnData: INodePropertyOptions[] = [];
        const credentials = await this.getCredentials('aitableApi');
        if (!credentials) {
          throw new NodeOperationError(this.getNode(), "No credentials got returned!");
        }

        const datasheetId = this.getCurrentNodeParameter('datasheetId') as string;

        const options: IHttpRequestOptions = {
          headers: {
            Authorization: `Bearer ${credentials.apiToken}`,
            Accept: "application/json",
          },
          method: "GET",
          url: `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/views`,
          json: true,
        };

        const response = await this.helpers.request!(options);

        if (response.success && response.code === 200) {
          for (const view of response.data.views) {
            returnData.push({
              name: view.name,
              value: view.id,
            });
          }
        } else {
          throw new NodeApiError(this.getNode(), response as JsonObject);
        }

        return returnData;
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let response;
        const credentials = await this.getCredentials('aitableApi');
        if (!credentials) {
          throw new NodeOperationError(this.getNode(), "No credentials got returned!");
        }

        const options: IHttpRequestOptions = {
          headers: {
            Authorization: `Bearer ${credentials.apiToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "GET",
          url: "",
          json: true,
        };

        if (resource === "field") {
          if (operation === "getFields") {
            const useDropdown = this.getNodeParameter('useDropdown', i) as boolean;
            let datasheetId: string;

            if (useDropdown) {
              datasheetId = this.getNodeParameter('datasheetId', i) as string;
            } else {
              datasheetId = this.getNodeParameter('datasheetIdManual', i) as string;
            }

            options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/fields`;
          }
        } else if (resource === "record") {
          const datasheetId = this.getNodeParameter('datasheetId', i) as string;
          if (operation === "getRecords") {
            const viewId = this.getNodeParameter('view', i) as string;
            options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records?viewId=${viewId}`;
            const additionalFields = this.getNodeParameter('additionalFields', i) as {
              fields?: string;
              sort?: string;
              pageSize?: number;
              pageNum?: number;
            };
            if (additionalFields.fields) {
              options.url += `&fields=${encodeURIComponent(additionalFields.fields)}`;
            }
            if (additionalFields.sort) {
              options.url += `&sort=${encodeURIComponent(additionalFields.sort)}`;
            }
            if (additionalFields.pageSize) {
              options.url += `&pageSize=${additionalFields.pageSize}`;
            }
            if (additionalFields.pageNum) {
              options.url += `&pageNum=${additionalFields.pageNum}`;
            }
          } else if (operation === "createRecords") {
            const records = this.getNodeParameter('records', i) as string;
            options.method = "POST";
            options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records`;
            options.body = { records: JSON.parse(records) };
          } else if (operation === "updateRecords") {
            const records = this.getNodeParameter('records', i) as string;
            options.method = "PATCH";
            options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records`;
            options.body = { records: JSON.parse(records) };
          } else if (operation === "deleteRecords") {
            const recordIds = this.getNodeParameter('recordIds', i) as string;
            options.method = "DELETE";
            options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records?recordIds=${recordIds}`;
          }
        } else if (resource === "view") {
          const datasheetId = this.getNodeParameter('datasheetId', i) as string;
          if (operation === "getView") {
            options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/views`;
          }
        } else if (resource === "space") {
          if (operation === "getSpaces") {
            options.url = "https://aitable.ai/fusion/v1/spaces";
          }
        } else if (resource === "node") {
          const spaceId = this.getNodeParameter('space', i) as string;
          if (operation === "getNodes") {
            options.url = `https://aitable.ai/fusion/v1/spaces/${spaceId}/nodes`;
          } else if (operation === "searchNodes") {
            options.url = `https://aitable.ai/fusion/v1/spaces/${spaceId}/nodes/search`;
            options.method = "POST";
            options.body = {
              keyword: this.getNodeParameter('keyword', i) as string,
              type: this.getNodeParameter('nodeType', i) as string,
            };
          }
        }

        response = await this.helpers.request!(options);

        if (response.success && response.code === 200) {
          returnData.push({ json: response.data });
        } else {
          throw new NodeApiError(this.getNode(), response as JsonObject, {
            message: 'Error in API response',
            description: response.message || 'Unknown error occurred',
          });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}