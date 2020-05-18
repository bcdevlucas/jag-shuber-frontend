import moment from 'moment';

import { RootState } from '../../store';
import { createSelector } from 'reselect';
import * as leaveRequests from './requests';

import {
    LeaveMap,
    LeaveSubCode,
    IdType,
    LEAVE_CODE_PERSONAL,
    LEAVE_CODE_TRAINING,
    DateType
} from '../../api/Api';

import mapToArray from '../../infrastructure/mapToArray';
import arrayToMap from '../../infrastructure/arrayToMap';

import { CodeSelector, defaultSortBySortOrder } from '../../infrastructure/CodeSelector';
import { mapExpiry } from '../../infrastructure/EffectiveSelector';
import { func as selectorFunctions } from '../common';
import { allCourtRoles, allEffectiveCourtRoles } from '../assignments/selectors';

export const cancelReasonCodesMap = leaveRequests.leaveCancelCodeMapRequest.getData;

export const allLeaves = createSelector(
    leaveRequests.leaveMapRequest.getData,
    (map) => {
        const leaveMap = mapToArray(map)
            .filter(l => moment(l.startDate).isSameOrAfter(moment().subtract(1, 'year'), 'day'));
        return leaveMap
            .sort((a, b) => `${moment(a.startDate).toISOString()}`
            .localeCompare(`${moment(b.startDate).toISOString()}`));
    }
);

export const getAllPersonalLeaves = (state: RootState) => {
    if (state) {
        return allLeaves(state)
            .filter(l => l.leaveCode === LEAVE_CODE_PERSONAL)
            .sort(defaultSortBySortOrder);
    }
    return undefined;
};

export const getAllTrainingLeaves = (state: RootState) => {
    if (state) {
        return allLeaves(state)
            .filter(l => l.leaveCode === LEAVE_CODE_TRAINING)
            .sort(defaultSortBySortOrder);
    }
    return undefined;
};

export const getLeave = (id?: IdType) => (state: RootState) => {
    if (state && id) {
        const map: LeaveMap = leaveRequests.leaveMapRequest.getData(state);
        return map[id];
    }
    return undefined;
};

export const getSheriffLeaves = (sheriffId?: IdType) => (state: RootState) => {
    if (state && sheriffId !== null) {
        return allLeaves(state).filter(l => l.sheriffId === sheriffId);
    }
    return [];
};

export const getPartialDayLeaves = (state: RootState) => {
    if (state !== null) {
        return allLeaves(state).filter(l => l.isPartial);
    }
    return [];
};

export const getFullDayLeaves = (state: RootState) => {
    if (state !== null) {
        return allLeaves(state).filter(l => !l.isPartial);
    }
    return [];
};

export const getAllSheriffPartialLeaves = (sheriffId?: IdType) => (state: RootState) => {
    if (state && sheriffId !== null) {
        return getPartialDayLeaves(state).filter(l => l.sheriffId === sheriffId);
    }
    return [];
};

export const getAllSheriffFullDayLeaves = (sheriffId?: IdType) => (state: RootState) => {
    if (state && sheriffId !== null) {
        return getFullDayLeaves(state).filter(l => l.sheriffId === sheriffId);
    }
    return [];
};

export const getSheriffPartialPersonalLeaves = (sheriffId?: IdType) => (state: RootState) => {
    if (state && sheriffId !== null) {
        return getPartialDayLeaves(state)
            .filter(l => l.sheriffId === sheriffId)
            .filter(sl => sl.leaveCode === LEAVE_CODE_PERSONAL);
    }
    return [];
};

export const getSheriffFullDayPersonalLeaves = (sheriffId?: IdType) => (state: RootState) => {
    if (state && sheriffId !== null) {
        return getFullDayLeaves(state)
            .filter(l => l.sheriffId === sheriffId)
            .filter(sl => sl.leaveCode === LEAVE_CODE_PERSONAL);
    }
    return [];
};

export const getSheriffPartialTrainingLeaves = (sheriffId?: IdType) => (state: RootState) => {
    if (state && sheriffId !== null) {
        return getPartialDayLeaves(state)
            .filter(l => l.sheriffId === sheriffId)
            .filter(sl => sl.leaveCode === LEAVE_CODE_TRAINING);
    }
    return [];
};

export const getSheriffFullDayTrainingLeaves = (sheriffId?: IdType) => (state: RootState) => {
    if (state && sheriffId !== null) {
        return getFullDayLeaves(state)
            .filter(l => l.sheriffId === sheriffId)
            .filter(sl => sl.leaveCode === LEAVE_CODE_TRAINING);
    }
    return [];
};

export const getActiveSheriffPartialLeaves = (sheriffId?: IdType) => (state: RootState) => {
    return getAllSheriffPartialLeaves(sheriffId)(state).filter(l => !l.cancelDate);
};

export const getActiveSheriffFullDayLeaves = (sheriffId?: IdType) => (state: RootState) => {
    return getAllSheriffFullDayLeaves(sheriffId)(state).filter(l => !l.cancelDate);
};

// Leave Cancel Reason Codes
const leaveCancelCodeSelector = new CodeSelector(
    leaveRequests.leaveCancelCodeMapRequest.getData
);

export const allLeaveCancelCodes = leaveCancelCodeSelector.all;

export const allEffectiveLeaveCancelCodes = leaveCancelCodeSelector.effective;

// Leave Sub Codes
export const allLeavesSubCodeMap = createSelector(
    leaveRequests.leaveTypeMapRequest.getData,
    (leaveTypes) => {
        let allSubCodes = leaveTypes[LEAVE_CODE_PERSONAL].concat(leaveTypes[LEAVE_CODE_TRAINING]);

        return arrayToMap(allSubCodes, lt => lt.subCode);
    }
);

export const getAllPersonalLeaveSubCodes = createSelector(
    leaveRequests.leaveTypeMapRequest.getData,
    (leaveTypes) => {
        let personalLeaveTypes = leaveTypes[LEAVE_CODE_PERSONAL] || [];

        return personalLeaveTypes
            .sort(defaultSortBySortOrder) || [];
            // .sort((a, b) => `${a.description}`
            // .localeCompare(`${b.description}`)) || [];
    }
);

export const getAllEffectivePersonalLeaveSubCodes = (date?: DateType) => (state: RootState) => {
    let allPersonalLeaveCodes = getAllPersonalLeaveSubCodes(state);

    allPersonalLeaveCodes = mapExpiry(allPersonalLeaveCodes) as LeaveSubCode[];

    if (allPersonalLeaveCodes) {
        return allPersonalLeaveCodes
            .filter(pl => !pl.expiryDate || moment(pl.expiryDate).isAfter(moment(date)));
    }
    return [];
};

export const findAllPersonalLeaveSubCodes = (filters: any) => (state: RootState) => {
    if (state) {
        let allPersonalLeaveCodes = getAllPersonalLeaveSubCodes(state);
        return selectorFunctions.filterByKeys(allPersonalLeaveCodes, filters);
    }
    return undefined;
};

export const findAllEffectivePersonalLeaveSubCodes = (filters: any) => (state: RootState) => {
    if (state) {
        let allPersonalLeaveCodes = getAllEffectivePersonalLeaveSubCodes()(state);
        return selectorFunctions.filterByKeys(allPersonalLeaveCodes, filters);
    }
    return undefined;
};

export const getAllTrainingLeaveSubCodes = createSelector(
    leaveRequests.leaveTypeMapRequest.getData,
    (leaveTypes) => {
        let trainingLeaveTypes = leaveTypes[LEAVE_CODE_TRAINING] || [];

        return trainingLeaveTypes
            .sort(defaultSortBySortOrder) || [];
            // .sort((a, b) => `${a.description}`
            // .localeCompare(`${b.description}`)) || [];
    }
);

export const getAllEffectiveTrainingLeaveSubCodes = (date?: DateType) => (state: RootState) => {
    let allTrainingLeaveCodes = getAllTrainingLeaveSubCodes(state);

    allTrainingLeaveCodes = mapExpiry(allTrainingLeaveCodes) as LeaveSubCode[];

    if (allTrainingLeaveCodes) {
        return allTrainingLeaveCodes
            .filter(pl => !pl.expiryDate || moment(pl.expiryDate).isAfter(moment(date)));
    }
    return [];
};

export const findAllTrainingLeaveSubCodes = (filters: any) => (state: RootState) => {
    if (state) {
        let allTrainingLeaveCodes = getAllTrainingLeaveSubCodes(state);
        return selectorFunctions.filterByKeys(allTrainingLeaveCodes, filters);
    }
    return undefined;
};

export const findAllEffectiveTrainingLeaveSubCodes = (filters: any) => (state: RootState) => {
    if (state) {
        let allTrainingLeaveCodes = getAllEffectiveTrainingLeaveSubCodes()(state);
        return selectorFunctions.filterByKeys(allTrainingLeaveCodes, filters);
    }
    return undefined;
};

export const selectedAdminLeaveTypesSection = (state: RootState) => {
    const { leaves: { selectedSection = undefined } = {} } = state;
    return selectedSection;
};
