import {
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from "n8n-workflow";
import {
  N8NPropertiesBuilder,
  N8NPropertiesBuilderConfig,
} from "@devlikeapro/n8n-openapi-node";
import * as doc from "./openapi.json";
import { ApitableOperationsCollector } from "./ApitableOperationsCollector";
import { getDatasheets, getSpaces, getViews } from "./LoadOptions";

const config: N8NPropertiesBuilderConfig = { OperationsCollector: ApitableOperationsCollector };
const parser = new N8NPropertiesBuilder(doc, config);
const properties = parser.build();

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
      getDatasheets,
      getViews,
    }
  };
}