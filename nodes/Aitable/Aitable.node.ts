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
          ],
          default: 'record',
        },
        {
          displayName: 'Operation',
          name: 'operation',
          type: 'options',
          noDataExpression: true,
          displayOptions: {
            show: {
              resource: ['record'],
            },
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
            show: {
              resource: ['view'],
            },
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
            show: {
              resource: ['space'],
            },
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
            show: {
              resource: ['node'],
            },
          },
          options: [
            { name: 'Get Node List', value: 'getNodes', action: 'Get node list' },
            { name: 'Search Nodes', value: 'searchNodes', action: 'Search nodes' },
          ],
          default: 'getNodes',
        },
        {
          displayName: 'Datasheet ID',
          name: 'datasheetId',
          type: 'string',
          default: '',
          required: true,
          displayOptions: {
            show: {
              resource: ['record', 'view'],
            },
          },
          description: 'The ID of the datasheet',
        },
        {
          displayName: 'View ID',
          name: 'viewId',
          type: 'string',
          default: '',
          required: true,
          displayOptions: {
            show: {
              resource: ['record'],
              operation: ['getRecords'],
            },
          },
          description: 'The ID of the view',
        },
        {
          displayName: 'Records',
          name: 'records',
          type: 'json',
          default: '',
          required: true,
          displayOptions: {
            show: {
              resource: ['record'],
              operation: ['createRecords', 'updateRecords'],
            },
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
            show: {
              resource: ['record'],
              operation: ['deleteRecords'],
            },
          },
          description: 'Comma-separated list of record IDs to delete',
        },
        {
          displayName: 'Space Name',
          name: 'spaceName',
          type: 'options',
          typeOptions: {
            loadOptionsMethod: 'getSpaceName',
          },
          default: '',
          required: true,
          displayOptions: {
            show: {
              resource: ['node'],
              operation: ['getNodes', 'searchNodes'],
            },
          },
          description: 'The name of the space',
        },
        {
          displayName: 'Additional Fields',
          name: 'additionalFields',
          type: 'collection',
          placeholder: 'Add Field',
          default: {},
          displayOptions: {
            show: {
              resource: ['record'],
              operation: ['getRecords'],
            },
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
        async getSpaceName(this: ILoadOptionsFunctions) {
          const credentials = await this.getCredentials('aitableApi');
          if (!credentials) {
            throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
          }
  
          const options: IHttpRequestOptions = {
            headers: {
              'Authorization': `Bearer ${credentials.apiToken}`,
              'Accept': 'application/json',
            },
            method: 'GET',
            url: 'https://aitable.ai/fusion/v1/spaces',
            json: true,
          };
  
          try {
            const response = await this.helpers.request!(options);
            return response.data.spaces.map((space: { id: string; name: string }) => ({
              name: space.name,
              value: space.name,
            }));
          } catch (error) {
            throw new NodeApiError(this.getNode(), error as JsonObject);
          }
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
            throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
          }
  
          const options: IHttpRequestOptions = {
            headers: {
              'Authorization': `Bearer ${credentials.apiToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            method: 'GET',
            url: '',
            json: true,
          };
  
          if (resource === 'record') {
            const datasheetId = this.getNodeParameter('datasheetId', i) as string;
  
            if (operation === 'getRecords') {
              const viewId = this.getNodeParameter('viewId', i) as string;
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
            } else if (operation === 'createRecords') {
              const records = this.getNodeParameter('records', i) as string;
              options.method = 'POST';
              options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records`;
              options.body = { records: JSON.parse(records) };
            } else if (operation === 'updateRecords') {
              const records = this.getNodeParameter('records', i) as string;
              options.method = 'PATCH';
              options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records`;
              options.body = { records: JSON.parse(records) };
            } else if (operation === 'deleteRecords') {
              const recordIds = this.getNodeParameter('recordIds', i) as string;
              options.method = 'DELETE';
              options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records?recordIds=${recordIds}`;
            }
          } else if (resource === 'view') {
            const datasheetId = this.getNodeParameter('datasheetId', i) as string;
            if (operation === 'getView') {
              options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/views`;
            }
          } else if (resource === 'space') {
            if (operation === 'getSpaces') {
              options.url = 'https://aitable.ai/fusion/v1/spaces';
            }
          } else if (resource === 'node') {
            if (operation === 'getNodes' || operation === 'searchNodes') {
              // First, get the list of spaces
              options.url = 'https://aitable.ai/fusion/v1/spaces';
              const spacesResponse = await this.helpers.request!(options);
              const spaceName = this.getNodeParameter('spaceName', i) as string;
              const space = spacesResponse.data.spaces.find((s: any) => s.name === spaceName);
              if (!space) {
                throw new NodeOperationError(this.getNode(), `Space with name "${spaceName}" not found`);
              }
              const spaceId = space.id;
  
              if (operation === 'getNodes') {
                options.url = `https://aitable.ai/fusion/v1/spaces/${spaceId}/nodes`;
              } else if (operation === 'searchNodes') {
                options.url = `https://aitable.ai/fusion/v2/spaces/${spaceId}/nodes?type=Datasheet&permissions=0,1`;
              }
            }
          }
  
          if (!options.url) {
            throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
          }
  
          try {
            response = await this.helpers.request!(options);
          } catch (error) {
            throw new NodeApiError(this.getNode(), error as JsonObject);
          }
  
          if (resource === 'record' && operation === 'deleteRecords') {
            if (response.success && response.code === 200) {
              returnData.push({
                json: { success: true, message: 'Records deleted successfully' },
              });
            } else {
              throw new NodeApiError(this.getNode(), response as JsonObject, { message: 'Failed to delete records' });
            }
          } else {
            returnData.push({ json: response });
          }
        } catch (error) {
          if (this.continueOnFail()) {
            returnData.push({ json: { error: (error as Error).message } });
            continue;
          }
          throw error;
        }
      }
  
      return [returnData];
    }
  }