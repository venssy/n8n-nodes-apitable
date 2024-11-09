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
                        {
                            name: 'Space',
                            value: 'space',
                        },
                        {
                            name: 'Node',
                            value: 'node',
                        },
                    ],
                    default: 'space',
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
                        {
                            name: 'Get List of Spaces',
                            value: 'getSpaces',
                            action: 'Get list of spaces',
                        },
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
                        {
                            name: 'Get Node List',
                            value: 'getNodes',
                            action: 'Get node list',
                        },
                        {
                            name: 'Search Nodes',
                            value: 'searchNodes',
                            action: 'Search nodes',
                        },
                    ],
                    default: 'getNodes',
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
                    displayName: 'Type',
                    name: 'type',
                    type: 'string',
                    default: '',
                    displayOptions: {
                        show: {
                            resource: ['node'],
                            operation: ['searchNodes'],
                        },
                    },
                    description: 'The type of node to search for',
                },
                {
                    displayName: 'Permissions',
                    name: 'permissions',
                    type: 'string',
                    default: '',
                    displayOptions: {
                        show: {
                            resource: ['node'],
                            operation: ['searchNodes'],
                        },
                    },
                    description: 'Comma-separated list of permissions',
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
                    },
                    method: 'GET',
                    uri: '',
                    json: true,
                };
                if (resource === 'space') {
                    if (operation === 'getSpaces') {
                        options.uri = 'https://aitable.ai/fusion/v1/spaces';
                    }
                }
                else if (resource === 'node') {
                    const spaceId = this.getNodeParameter('spaceId', i);
                    if (operation === 'getNodes') {
                        options.uri = `https://aitable.ai/fusion/v1/spaces/${spaceId}/nodes`;
                    }
                    else if (operation === 'searchNodes') {
                        const type = this.getNodeParameter('type', i);
                        const permissions = this.getNodeParameter('permissions', i);
                        const queryParams = new URLSearchParams();
                        if (type)
                            queryParams.append('type', type);
                        if (permissions)
                            queryParams.append('permissions', permissions);
                        options.uri = `https://aitable.ai/fusion/v2/spaces/${spaceId}/nodes?${queryParams.toString()}`;
                    }
                }
                if (!options.uri) {
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