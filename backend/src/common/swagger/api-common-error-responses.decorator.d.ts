type SupportedErrorStatus = 400 | 401 | 403 | 404 | 409;
export declare function ApiCommonErrorResponses(...statuses: SupportedErrorStatus[]): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export {};
