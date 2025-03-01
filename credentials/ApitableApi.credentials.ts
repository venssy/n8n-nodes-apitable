import {
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class ApitableApi implements ICredentialType {
    name = 'aitableApi';
    displayName = 'Apitable API';
    documentationUrl = 'https://developers.aitable.ai/api/quick-start';
    properties: INodeProperties[] = [
        {
          displayName: "Server URL",
          name: "url",
          placeholder: "https://aitable.ai",
          type: "string",
          default: "https://aitable.ai",
          required: true,
        },
        {
            displayName: 'API Token',
            name: 'apiToken',
            type: 'string',
												typeOptions: { password: true },
            default: '',
            required: true,
        },
    ];
}