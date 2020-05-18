import { RequestActionState } from '../../infrastructure/Requests/RequestActionBase';
import {
    AssignmentDutyMap,
    Assignment,
    AssignmentMap,
    AssignmentDuty,
    AlternateAssignmentMap,
    CourtRoleMap,
    CourtroomMap,
    JailRoleMap,
    RunMap
} from '../../api/Api';
import { ErrorMap } from '../roles/common';

export interface AssignmentModuleState {
    // Assignments
    assignmentMap?: RequestActionState<AssignmentMap>;
    createAssignment?: RequestActionState<Assignment>;
    updateAssignment?: RequestActionState<Assignment>;
    deleteAssignmentDutyRecurrence?: RequestActionState<void>;

    alternateAssignmentMap?: RequestActionState<AlternateAssignmentMap>;
    courtRoleMap?: RequestActionState<CourtRoleMap>;
    courtroomMap?: RequestActionState<CourtroomMap>;
    jailRoleMap?: RequestActionState<JailRoleMap>;
    runMap?: RequestActionState<RunMap>;

    // Duties
    assignmentDutyMap?: RequestActionState<AssignmentDutyMap>;
    createAssignmentDuty?: RequestActionState<AssignmentDuty>;
    updateAssignmentDuty?: RequestActionState<AssignmentDuty>;
    deleteAssignmentDuty?: RequestActionState<void>;
    createDefaultDuties?: RequestActionState<AssignmentDuty[]>;

    // Sheriff Duties
    deleteSheriffDuty?: RequestActionState<void>;

    selectedSection?: string;
    pluginSubmitErrors?: ErrorMap;
    pluginFilters?: {}; // TODO: We could type this a bit better...
}
export const STATE_KEY: string = 'assignments';
