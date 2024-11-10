"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aitable = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class Aitable {
    constructor() {
        this.description = {
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
                        { name: 'Get List of Spaces', value: 'getSpaces', action: 'Get list of spaces' },
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
                    displayName: 'Space ID',
                    name: 'spaceId',
                    type: 'string',
                    default: '',
                    required: true,
                    displayOptions: {
                        show: {
                            resource: ['node'],
                        },
                    },
                    description: 'The ID of the space',
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
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        for (let i = 0; i < items.length; i++) {
            try {
                let response;
                const credentials = await this.getCredentials('aitableApi');
                if (!credentials) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No credentials got returned!');
                }
                const options = {
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
                    const datasheetId = this.getNodeParameter('datasheetId', i);
                    if (operation === 'getRecords') {
                        const viewId = this.getNodeParameter('viewId', i);
                        options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records?viewId=${viewId}`;
                        const additionalFields = this.getNodeParameter('additionalFields', i);
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
                    }
                    else if (operation === 'createRecords') {
                        const records = this.getNodeParameter('records', i);
                        options.method = 'POST';
                        options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records`;
                        options.body = { records: JSON.parse(records) };
                    }
                    else if (operation === 'updateRecords') {
                        const records = this.getNodeParameter('records', i);
                        options.method = 'PATCH';
                        options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records`;
                        options.body = { records: JSON.parse(records) };
                    }
                    else if (operation === 'deleteRecords') {
                        const recordIds = this.getNodeParameter('recordIds', i);
                        options.method = 'DELETE';
                        options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records`;
                        options.body = { recordIds: recordIds.split(',') };
                    }
                }
                else if (resource === 'view') {
                    const datasheetId = this.getNodeParameter('datasheetId', i);
                    if (operation === 'getView') {
                        options.url = `https://aitable.ai/fusion/v1/datasheets/${datasheetId}/views`;
                    }
                }
                else if (resource === 'space') {
                    if (operation === 'getSpaces') {
                        options.url = 'https://aitable.ai/fusion/v1/spaces';
                    }
                }
                else if (resource === 'node') {
                    const spaceId = this.getNodeParameter('spaceId', i);
                    if (operation === 'getNodes') {
                        options.url = `https://aitable.ai/fusion/v1/spaces/${spaceId}/nodes`;
                    }
                    else if (operation === 'searchNodes') {
                        options.url = `https://aitable.ai/fusion/v2/spaces/${spaceId}/nodes?type=Datasheet&permissions=0,1`;
                    }
                }
                if (!options.url) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
                }
                try {
                    response = await this.helpers.request(options);
                }
                catch (error) {
                    throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                }
                returnData.push({ json: response });
            }
            catch (error) {
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
exports.Aitable = Aitable;
//# sourceMappingURL=Aitable.node.js.map