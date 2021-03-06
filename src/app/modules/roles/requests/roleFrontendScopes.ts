import { ThunkExtra } from '../../../store';
import arrayToMap from '../../../infrastructure/arrayToMap';
import {
    STATE_KEY,
    RoleModuleState
} from '../common';
import {
    RoleFrontendScopeMap,
    RoleFrontendScope,
    MapType, IdType
} from '../../../api/Api';
import GetEntityMapRequest from '../../../infrastructure/Requests/GetEntityMapRequest';
import RequestAction, { RequestConfig } from '../../../infrastructure/Requests/RequestActionBase';
import CreateOrUpdateEntitiesRequest from '../../../infrastructure/Requests/CreateOrUpdateEntitiesRequest';
import CreateEntityRequest from '../../../infrastructure/Requests/CreateEntityRequest';
import UpdateEntityRequest from '../../../infrastructure/Requests/UpdateEntityRequest';
import { ShiftModuleState } from '../../shifts/common';
import { shiftMapRequest } from '../../shifts/requests';
import { AssignmentModuleState } from '../../assignments/common';
import { assignmentMapRequest } from '../../assignments/requests/assignments';
// import toTitleCase from '../../infrastructure/toTitleCase';

// Get the Map
class RoleFrontendScopeMapRequest extends GetEntityMapRequest<void, RoleFrontendScope, RoleModuleState> {
    constructor(config?: RequestConfig<MapType<RoleFrontendScope>>) {
        super({
            namespace: STATE_KEY,
            actionName: 'roleFrontendScopeMap',
            ...config
        });
    }
    public async doWork(request: void, { api }: ThunkExtra): Promise<RoleFrontendScopeMap> {
        let data = await api.getRoleFrontendScopes();
        return arrayToMap(data, t => t.id);
    }
}

export const roleFrontendScopeMapRequest = new RoleFrontendScopeMapRequest();

// Create RoleFrontendScope
class CreateRoleFrontendScopeRequest extends CreateEntityRequest<RoleFrontendScope, RoleModuleState> {
    constructor() {
        super(
            {
                namespace: STATE_KEY,
                actionName: 'createRoleFrontendScope',
                toasts: {
                    success: (s) => (
                        `Created a new role frontend scope`
                    ),
                    error: (err) => (
                        `Problem encountered while adding new role scope: ${err ? err.toString() : 'Unknown Error'}`
                    )
                }
            },
            roleFrontendScopeMapRequest
        );
    }
    public async doWork(role: Partial<RoleFrontendScope>, { api }: ThunkExtra): Promise<RoleFrontendScope> {
        let newRoleFrontendScope = await api.createRoleFrontendScope(role as RoleFrontendScope);
        return newRoleFrontendScope;
    }
}

export const createRoleFrontendScopeRequest = new CreateRoleFrontendScopeRequest();

// RoleFrontendScope Edit
class UpdateRoleFrontendScopeRequest extends UpdateEntityRequest<RoleFrontendScope, RoleModuleState> {
    constructor() {
        super(
            {
                namespace: STATE_KEY,
                actionName: 'updateRoleFrontendScope',
                toasts: {
                    success: (s) => `Updated the role frontend scope`,
                    // tslint:disable-next-line:max-line-length
                    error: (err) => `Problem encountered while updating role scope: ${err ? err.toString() : 'Unknown Error'}`
                }
            },
            roleFrontendScopeMapRequest
        );
    }
    public async doWork(role: Partial<RoleFrontendScope>, { api }: ThunkExtra): Promise<RoleFrontendScope> {
        let newRoleFrontendScope = await api.updateRoleFrontendScope(role as RoleFrontendScope);
        return newRoleFrontendScope;
    }
}

export const updateRoleFrontendScopeRequest = new UpdateRoleFrontendScopeRequest();

class CreateOrUpdateRoleFrontendScopesRequest extends CreateOrUpdateEntitiesRequest<RoleFrontendScope, RoleModuleState>{
    createEntity(entity: Partial<RoleFrontendScope>, { api }: ThunkExtra): Promise<RoleFrontendScope> {
        return api.createRoleFrontendScope(entity);
    }
    updateEntity(entity: Partial<RoleFrontendScope>, { api }: ThunkExtra): Promise<RoleFrontendScope> {
        return api.updateRoleFrontendScope(entity as RoleFrontendScope);
    }
    constructor(config?: RequestConfig<RoleFrontendScope[]>) {
        super(
            {
                namespace: STATE_KEY,
                actionName: 'createOrUpdateRoleFrontendScope',
                toasts: {
                    success: (s) => `Created/updated role scopes`,
                    error: (err: any) => `Couldn't create/update role scopes: ${err.message}`
                },
                ...config
            },
            roleFrontendScopeMapRequest
        );
    }
}

export const createOrUpdateRoleFrontendScopesRequest = new CreateOrUpdateRoleFrontendScopesRequest();

class DeleteRoleFrontendScopesRequest extends RequestAction<IdType[], IdType[], RoleModuleState> {
    constructor() {
        super({
            namespace: STATE_KEY,
            actionName: 'deleteRoleFrontendScopes',
            toasts: {
                success: (ids) => `${ids.length} role scopes(s) deleted`,
                error: (err) => `Problem encountered while deleting role scopes: ${err ? err.toString() : 'Unknown Error'}`
            }
        });
    }
    public async doWork(request: IdType[], { api }: ThunkExtra): Promise<IdType[]> {
        await api.deleteRoleFrontendScopes(request);
        return request;
    }

    setRequestData(moduleState: RoleModuleState, roleScopeIds: IdType[]) {
        const newMap = { ...roleFrontendScopeMapRequest.getRequestData(moduleState) };
        roleScopeIds.forEach(id => delete newMap[id]);
        return roleFrontendScopeMapRequest.setRequestData(moduleState, newMap);
    }
}

export const deleteRoleFrontendScopesRequest = new DeleteRoleFrontendScopesRequest();
