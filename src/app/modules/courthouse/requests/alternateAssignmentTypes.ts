import { ThunkExtra } from '../../../store';
import arrayToMap from '../../../infrastructure/arrayToMap';
import {
    STATE_KEY,
    CourthouseModuleState
} from '../common';
import {
 AlternateAssignment
} from '../../../api/index';
import GetEntityMapRequest from '../../../infrastructure/Requests/GetEntityMapRequest';

class AlternateAssignmentTypeMapRequest
    extends GetEntityMapRequest<void, AlternateAssignment, CourthouseModuleState> {
    constructor() {
        super(STATE_KEY, 'alternateAssignmentMap');
    }
    public async doWork(request: void, { api }: ThunkExtra){
        let alternateAssignmentTypes = await api.getAlternateAssignmentTypes();
        return arrayToMap(alternateAssignmentTypes, a => a.code);
    }
}

export const alternateAssignmentTypeMapRequest = new AlternateAssignmentTypeMapRequest();