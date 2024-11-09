import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeApiError,
    NodeOperationError,
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
        ],
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
                } else if (resource === 'node') {
                    const spaceId = this.getNodeParameter('spaceId', i) as string;

                    if (operation === 'getNodes') {
                        options.uri = `https://aitable.ai/fusion/v1/spaces/${spaceId}/nodes`;
                    } else if (operation === 'searchNodes') {
                        options.uri = `https://aitable.ai/fusion/v2/spaces/${spaceId}/nodes?type=Datasheet&permissions=0,1`;
                    }
                }

                if (!options.uri) {
                    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
                }

                try {
                    response = await this.helpers.request(options);
                } catch (error) {
                    throw new NodeApiError(this.getNode(), error);
                }

                returnData.push({ json: response });
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