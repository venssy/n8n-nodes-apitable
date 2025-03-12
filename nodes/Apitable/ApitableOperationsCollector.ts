import { INodeProperties } from "n8n-workflow";
import { OpenAPIV3 } from 'openapi-types';
import { OperationsCollector, OperationContext } from '@devlikeapro/n8n-openapi-node';

export class ApitableOperationsCollector extends OperationsCollector {
	protected parseOperation(operation: OpenAPIV3.OperationObject, context: OperationContext): { option: { name: string; value: string; action: string; description: string; routing: { request: { method: string; url: string; }; }; }; fields: INodeProperties[]; } {
    // fix parameter schema type error
    operation.parameters?.forEach(_param => {
      const param = _param as any
      if (!param["schema"]) {
        param["schema"] = {}
      }
      if (param["type"]) {
        if (param["type"] == "file") {
          param["schema"]["type"] = "string"
          param["schema"]["format"] = "binary"
        } else {
          param["schema"]["type"] = param["type"]
        }
        if (param["enum"]) {
          param["schema"]["enum"] = param["enum"]
        }
      }
    })

    // fix requestBody
    if (!operation.requestBody) {
      let bodyParams = operation.parameters?.filter(param => (param as any).in == "body" || (param as any).in == "formData" )
      if (bodyParams && bodyParams.length > 0) {
        operation.requestBody = {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": bodyParams.reduce((acc: any, item: any) => {
                  acc[item["name"]] = item
                  return acc
                }, {}),
                "required": bodyParams.filter((item: any) => item["required"] == true).map((item: any) => item["name"])
              }
            }
          }
        }
        operation.parameters = operation.parameters?.filter(param => (param as any).in != "body" && (param as any).in != "formData" )
      }
    }
    
    let operation1 = super.parseOperation(operation, context);

    // get apitable result property
    let output = 'data';
    if (operation1.option.routing.request.method != "DELETE") {
      if (operation1.option.routing.request.url.endsWith("/spaces")) {
        output = 'data.spaces'
      }else if (operation1.option.routing.request.url.endsWith("/records")) {
        output = 'data.records'
      }else if (operation1.option.routing.request.url.endsWith("/fields")) {
        output = 'data.fields'
      }else if (operation1.option.routing.request.url.endsWith("/views")) {
        output = 'data.views'
      }else if (operation1.option.routing.request.url.endsWith("/nodes")) {
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

    // set apitable option methods
    operation1.fields.forEach(field => {
      if (field.name === "spaceId") {
        field.type = "options"
        field.typeOptions = {
          loadOptionsMethod: 'getSpaces',
        }
      }else if (field.name === "datasheetId") {
        field.type = "options"
        field.typeOptions = {
          loadOptionsMethod: 'getDatasheets',
        }
      }else if (field.name === "viewId") {
        field.type = "options"
        field.typeOptions = {
          loadOptionsMethod: 'getViews',
          loadOptionsDependsOn: [ 'datasheetId' ],
        }
      }
    })

    // fix fill in default value
    operation1.fields.forEach(field => {
      const param = operation.parameters?.find(param => (param as any).name == field.name) as any | undefined
      if (param && param.default != undefined) {
        field.default = param.default
      }
    })
      
    // turn requiredless fields into additional fields
    const additionalFields = operation1.fields.filter(field => field.required != true && field.routing?.send?.type != "body" && field.name != 'operation').map(field => {
      field.displayOptions = undefined
      return field
    })

    if (additionalFields.length > 0) {
      let additionalFieldsProp: INodeProperties = {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          ... additionalFields
        ]
      }
      operation1.fields = operation1.fields.filter(field => field.required || field.routing?.send?.type == "body" || field.name == 'operation');
      operation1.fields.push(additionalFieldsProp)
    }

    return operation1;
  }
}