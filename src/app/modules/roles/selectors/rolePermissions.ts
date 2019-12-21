import { createSelector } from 'reselect';
import * as rolePermissionRequests from '../requests/rolePermissions';
import mapToArray from '../../../infrastructure/mapToArray';
import { RootState } from '../../../store';
import { IdType, RolePermission } from '../../../api';
import { groupByKey } from './index';

const groupByRole = (arr: any[]) => groupByKey('roleId', arr);
const groupByRoleFrontendScope = (arr: any[]) => groupByKey('roleFrontendScopeId', arr);
const groupByRoleApiScope = (arr: any[]) => groupByKey('roleApiScopeId', arr);

export const getRolePermissions = createSelector(
    rolePermissionRequests.rolePermissionMapRequest.getData,
    (map) => {
        const result = mapToArray(map);
        return result;
    }
);

export const getRoleFrontendPermissions = createSelector(
   getRolePermissions,
   (rolePermissions) => {
       return rolePermissions.filter((i: RolePermission) => !!i.roleFrontendScopeId);
   }
);

export const getRoleApiPermissions = createSelector(
   getRolePermissions,
   (rolePermissions) => {
       return rolePermissions.filter((i: RolePermission) => !!i.roleApiScopeId);
   }
);

export const getRoleFrontendPermissionsGroupedByRole = createSelector(
   getRoleFrontendPermissions,
   (rolePermissions) => {
       return groupByRole(rolePermissions);
   }
);

export const getRoleApiPermissionsGroupedByRole = createSelector(
   getRoleApiPermissions,
   (rolePermissions) => {
       return groupByRole(rolePermissions);
   }
);

export const getRoleFrontendPermissionsGroupedByRoleScope = createSelector(
    getRoleFrontendPermissionsGroupedByRole,
    (rolePermissions) => {
        const result = Object.keys(rolePermissions)
            .reduce((acc, cur) => {
                const permissions = acc[cur];
                acc[cur] = groupByRoleFrontendScope(permissions);
                return acc;
            }, rolePermissions);
        return result;
    }
);

export const getRoleApiPermissionsGroupedByRoleScope = createSelector(
    getRoleApiPermissionsGroupedByRole,
    (rolePermissions) => {
        const result = Object.keys(rolePermissions)
            .reduce((acc, cur) => {
                const permissions = acc[cur];
                acc[cur] = groupByRoleApiScope(permissions);
                return acc;
            }, rolePermissions);
        return result;
    }
);

export const getAllRolePermissions = (state: RootState) => {
    if (state) {
        return getRolePermissions(state);
    }
    return undefined;
};

export const getRolePermissionsById = (id?: IdType) => (state: RootState) => {
    if (state) {
        return getRolePermissions(state).filter(item => item.id === id);
    }
    return undefined;
};

export const getRoleFrontendPermissionsGroupedByScopeId = (state: RootState) => {
    if (state) {
        return getRoleFrontendPermissionsGroupedByRoleScope(state);
    }
    return undefined;
};

export const getRoleApiPermissionsGroupedByScopeId = (state: RootState) => {
    if (state) {
        return getRoleApiPermissionsGroupedByRoleScope(state);
    }
    return undefined;
};