import { IExecuteFunctions, ILoadOptionsFunctions, INodeExecutionData, INodeType, INodeTypeDescription, INodePropertyOptions } from 'n8n-workflow';
export declare class Aitable implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getSpaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getDatasheets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getViews(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
