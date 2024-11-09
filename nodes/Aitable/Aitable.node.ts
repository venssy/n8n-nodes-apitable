import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

export class Aitable implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Aitable',
    name: 'Aitable',
    icon: 'file:aitable.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Get data from Aitable API',
    defaults: {
      name: 'Aitable',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'StraicoApi',
        required: true,
      },
    ],
    requestDefaults: {
      baseURL: 'https://api.aitable.com',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'User',
            value: 'user',
          },
          {
            name: 'Models',
            value: 'models',
          },
          {
            name: 'Prompt',
            value: 'prompt',
          },
          {
            name: 'Image',
            value: 'image',
          },
        ],
        default: 'prompt',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['user'],
          },
        },
        options: [
          {
            name: 'Get Info',
            value: 'get',
            action: 'Get user information',
            routing: {
              request: {
                method: 'GET',
                url: '/v0/user',
              },
            },
          },
        ],
        default: 'get',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['models'],
          },
        },
        options: [
          {
            name: 'Get All',
            value: 'getAll',
            action: 'Get all models information',
            routing: {
              request: {
                method: 'GET',
                url: '/v1/models',
              },
            },
          },
        ],
        default: 'getAll',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['prompt'],
          },
        },
        options: [
          {
            name: 'Completion',
            value: 'completion',
            action: 'Create a completion',
            routing: {
              request: {
                method: 'POST',
                url: '/v1/prompt/completion',
              },
            },
          },
        ],
        default: 'completion',
      },
      {
        displayName: 'Models',
        name: 'models',
        type: 'multiOptions',
        typeOptions: {
					loadOptionsMethod: 'getModels',
				},
        default: ['anthropic/claude-3-haiku:beta'],
        required: true,
        displayOptions: {
          show: {
            resource: ['prompt'],
            operation: ['completion'],
          },
        },

        routing: {
          request: {
            body: {
              models: '={{ $value }}',
            },
          },
        },
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['prompt'],
            operation: ['completion'],
          },
        },
        routing: {
          request: {
            body: {
              message: '={{ $value }}',
            },
          },
        },
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['prompt'],
            operation: ['completion'],
          },
        },
        options: [
          {
            displayName: 'File URLs',
            name: 'file_urls',
            type: 'string',
            default: '',
            description: 'Comma-separated list of file URLs to analyze',
            routing: {
              request: {
                body: {
                  file_urls: '={{ $value.split(",").map(url => url.trim()) }}',
                },
              },
            },
          },
          {
            displayName: 'YouTube URLs',
            name: 'youtube_urls',
            type: 'string',
            default: '',
            description: 'Comma-separated list of YouTube URLs to analyze',
            routing: {
              request: {
                body: {
                  youtube_urls: '={{ $value.split(",").map(url => url.trim()) }}',
                },
              },
            },
          },
          {
            displayName: 'Temperature',
            name: 'temperature',
            type: 'number',
            default: 0.7,
            description: 'Controls creativity and diversity of generated text',
            typeOptions: {
              minValue: 0,
              maxValue: 2,
            },
            routing: {
              request: {
                body: {
                  temperature: '={{ $value }}',
                },
              },
            },
          },
          {
            displayName: 'Max Tokens',
            name: 'max_tokens',
            type: 'number',
            default: 100,
            description: 'Maximum tokens to generate',
            typeOptions: {
              minValue: 1,
              maxValue: 2048,
            },
            routing: {
              request: {
                body: {
                  max_tokens: '={{ $value }}',
                },
              },
            },
          },
        ],
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['image'],
          },
        },
        options: [
          {
            name: 'Generate Image',
            value: 'generate',
            action: 'Generate an image',
            routing: {
              request: {
                method: 'POST',
                url: '/v0/image/generation',
              },
            },
          },
        ],
        default: 'generate',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'string',
        default: 'openai/dall-e-3',
        required: true,
        displayOptions: {
          show: {
            resource: ['image'],
            operation: ['generate'],
          },
        },
        routing: {
          request: {
            body: {
              model: '={{ $value }}',
            },
          },
        },
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['image'],
            operation: ['generate'],
          },
        },
        routing: {
          request: {
            body: {
              description: '={{ $value }}',
            },
          },
        },
      },
      {
        displayName: 'Size',
        name: 'size',
        type: 'options',
        options: [
          {
            name: 'Square',
            value: 'square',
          },
          {
            name: 'Landscape',
            value: 'landscape',
          },
          {
            name: 'Portrait',
            value: 'portrait',
          },
        ],
        default: 'landscape',
        required: true,
        displayOptions: {
          show: {
            resource: ['image'],
            operation: ['generate'],
          },
        },
        routing: {
          request: {
            body: {
              size: '={{ $value }}',
            },
          },
        },
      },
      {
        displayName: 'Variations',
        name: 'variations',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 4,
        },
        default: 1,
        required: true,
        displayOptions: {
          show: {
            resource: ['image'],
            operation: ['generate'],
          },
        },
        routing: {
          request: {
            body: {
              variations: '={{ $value }}',
            },
          },
        },
      },
    ],
  };


  methods = {
    loadOptions: {
        async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
            try {
                const credentials = await this.getCredentials('StraicoApi');
                
                if (!credentials?.apiKey) {
                    throw new Error('No API key provided in credentials');
                }

                const response = await this.helpers.request({
                    method: 'GET',
                    url: 'https://api.aitable.com/v1/models',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${credentials.apiKey}`,
                    },
                    json: true,
                });

                if (!response?.success || !response?.data?.chat) {
                    throw new Error('Invalid response format from the API');
                }

                // Map the chat models from the response
                return response.data.chat.map((model: any) => ({
                    name: model.name,
                    value: model.model,
                    description: `Max tokens: ${model.max_output}, Price: ${model.pricing.coins} coins per ${model.pricing.words} words`,
                }));

            } catch (error) {
                console.error('Error loading models:', error);
                throw new Error(`Failed to load models: ${error.message}`);
            }
        },
    },
};


}
