import {
  ILoadOptionsFunctions,
  INodeType,
  INodeTypeDescription,
  NodeApiError,
  NodeOperationError,
  IHttpRequestOptions,
  JsonObject,
  INodePropertyOptions,
  NodeConnectionType,
} from "n8n-workflow";
import {
  N8NPropertiesBuilder,
  N8NPropertiesBuilderConfig,
} from "@devlikeapro/n8n-openapi-node";
import { fixOpenApi } from "../utils";
import * as doc from "./openapi.json";
import { ApitableOperationsCollector } from "./utils";

fixOpenApi(doc);

const config: N8NPropertiesBuilderConfig = { OperationsCollector: ApitableOperationsCollector };
const parser = new N8NPropertiesBuilder(doc, config);
const properties = parser.build();

async function getSpaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
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
    url: `${credentials.url}/fusion/v1/spaces`,
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
}

export class Apitable implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Apitable',
    name: 'apitable',
    icon: 'file:apitable.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Apitable API',
    defaults: {
      name: 'Apitable',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'aitableApi',
        required: true,
      },
    ],
    requestDefaults: {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      baseURL: "={{$credentials.url}}/fusion/v1",
    },
    properties: properties,
  };

  methods = {
    loadOptions: {
      getSpaces,

      async getDatasheets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const returnData: INodePropertyOptions[] = [];
        const credentials = await this.getCredentials('aitableApi');
        if (!credentials) {
          throw new NodeOperationError(this.getNode(), "No credentials got returned!");
        }

        let spaceId = this.getCurrentNodeParameter('spaceId') as string;

        if (spaceId === undefined) {
          spaceId = (await getSpaces.call(this))[0].value as string
        }

        const options: IHttpRequestOptions = {
          headers: {
            Authorization: `Bearer ${credentials.apiToken}`,
            Accept: "application/json",
          },
          method: "GET",
          url: `${credentials.url}/fusion/v1/spaces/${spaceId}/nodes`,
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

        const datasheetId = this.getCurrentNodeParameter('datasheetId') as string | undefined;

        if (!datasheetId) {
          throw new NodeOperationError(this.getNode(), "No datasheet got returned!");
        }

        const options: IHttpRequestOptions = {
          headers: {
            Authorization: `Bearer ${credentials.apiToken}`,
            Accept: "application/json",
          },
          method: "GET",
          url: `${credentials.url}/fusion/v1/datasheets/${datasheetId}/views`,
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
}