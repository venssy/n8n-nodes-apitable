import { IAuthenticateGeneric, ICredentialType, INodeProperties, } from 'n8n-workflow';

export class AitableApi implements ICredentialType {
  name = 'AitableApi';
  displayName = 'Aitable API Token';
  documentationUrl = 'https://help.aitable.ai/docs/guide/user-center#developer-tab';

  properties: INodeProperties[] = [
    {
      displayName: 'API Token',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };
}