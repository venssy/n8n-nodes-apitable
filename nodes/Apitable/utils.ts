import { INodeProperties } from "n8n-workflow";

import { OpenAPIV3 } from 'openapi-types';
import { OperationsCollector, OperationContext } from '@devlikeapro/n8n-openapi-node';

export class ApitableOperationsCollector extends OperationsCollector {
	protected parseOperation(operation: OpenAPIV3.OperationObject, context: OperationContext): { option: { name: string; value: string; action: string; description: string; routing: { request: { method: string; url: string; }; }; }; fields: INodeProperties[]; } {
    let operation1 = super.parseOperation(operation, context);

    let output = 'data';
    if (!operation1.option.name.includes("DELETE")) {
      if (operation1.option.name.endsWith("/spaces")) {
        output = 'data.spaces'
      }else if (operation1.option.name.endsWith("/records")) {
        output = 'data.records'
      }else if (operation1.option.name.endsWith("/fields")) {
        output = 'data.fields'
      }else if (operation1.option.name.endsWith("/views")) {
        output = 'data.views'
      }else if (operation1.option.name.endsWith("/nodes")) {
        output = 'data.nodes'
      }
    }

    (operation1 as any).option.routing.output = {
      postReceive: [
        {
          type: 'rootProperty',
          properties: {
            property: output,
          },
        },
      ],
    }

    operation1.fields.forEach(field => {
      if (field.name === "spaceId") {
        field.type = "options"
        field.typeOptions = { loadOptionsMethod: 'getSpaces', }
      }
    })

    return operation1;
  }
}