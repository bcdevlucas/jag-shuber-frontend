import RequestAction, { RequestConfig } from './RequestActionBase';
import FormRequestAction from './FormRequestAction';

export default abstract class CreateEntityRequest<TEntity extends { id?: any }, TModuleState>
    extends FormRequestAction<Partial<TEntity>, TEntity, TModuleState> {

    constructor(config: RequestConfig<TEntity>,
                protected mapRequest: RequestAction<any, { [key: string]: TEntity }, TModuleState>) {
        super(config);
    }

    setRequestData(moduleState: TModuleState, data: TEntity) {
        const newMap = { ...this.mapRequest.getRequestData(moduleState) };
        newMap[data.id] = data;
        return this.mapRequest.setRequestData(moduleState, newMap);
    }
}
